const express = require('express');
const fs = require('fs/promises');
const fsSync = require('fs');
const multer = require('multer');
const os = require('os');
const path = require('path');
const router = express.Router();
const store = require('../services/storeService');
const groq = require('../services/groqService');
const transcription = require('../services/transcriptionService');
const vector = require('../services/vectorService');

const MAX_AUDIO_FILE_MB = Number.parseInt(process.env.MAX_AUDIO_FILE_MB || '', 10) || 200;
const AUDIO_FILE_LIMIT_BYTES = MAX_AUDIO_FILE_MB * 1024 * 1024;
const UPLOAD_DIR = path.join(os.tmpdir(), 'meetmind-audio');
const SUPPORTED_AUDIO_EXTENSIONS = new Set([
  'flac',
  'mp3',
  'mp4',
  'mpeg',
  'mpga',
  'm4a',
  'ogg',
  'wav',
  'webm',
]);

if (!fsSync.existsSync(UPLOAD_DIR)) {
  fsSync.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const audioUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const safeExt = SUPPORTED_AUDIO_EXTENSIONS.has(ext.replace('.', '')) ? ext : '.webm';
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`);
    },
  }),
  limits: { fileSize: AUDIO_FILE_LIMIT_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext = (file.originalname.split('.').pop() || '').toLowerCase();
    const isAudioMime = (file.mimetype || '').startsWith('audio/') || file.mimetype === 'video/mp4';
    if (SUPPORTED_AUDIO_EXTENSIONS.has(ext) || isAudioMime) return cb(null, true);

    const err = new Error('Unsupported audio file type. Upload flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, or webm.');
    err.statusCode = 400;
    return cb(err);
  },
});

function sendAIError(res, err, operation = 'MOM generation') {
  const status = err.statusCode || err.status || 500;
  return res.status(status).json({ error: `${operation} failed: ${err.message}` });
}

function handleAudioUpload(req, res, next) {
  audioUpload.single('audio')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: `Audio file is too large. Maximum upload size is ${MAX_AUDIO_FILE_MB} MB.` });
    }

    return res.status(err.statusCode || 400).json({ error: err.message });
  });
}

async function cleanupUploadedFile(file) {
  if (!file?.path) return;
  try {
    await fs.unlink(file.path);
  } catch {
    // ignore cleanup errors
  }
}

function sanitizeFileName(name) {
  return String(name || 'meeting')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'meeting';
}

function listToMarkdown(items) {
  if (!Array.isArray(items) || items.length === 0) return '- None';
  return items.map(item => `- ${String(item || '').trim()}`).join('\n');
}

function actionItemsToMarkdown(actionItems) {
  if (!Array.isArray(actionItems) || actionItems.length === 0) return '- None';

  return actionItems.map((item) => {
    const task = item?.task || 'Untitled task';
    const responsible = item?.responsible || 'Not specified';
    const deadline = item?.deadline || 'Not specified';
    const status = item?.status || 'pending';
    return `- [${status === 'completed' ? 'x' : ' '}] ${task} (Owner: ${responsible}; Deadline: ${deadline})`;
  }).join('\n');
}

function momToMarkdown(meeting) {
  const mom = meeting?.mom || {};
  const date = meeting?.date ? new Date(meeting.date).toLocaleString() : new Date().toLocaleString();

  return [
    '# Minutes of Meeting (MOM)',
    '',
    `**Meeting:** ${meeting?.title || 'Untitled meeting'}`,
    `**Date:** ${date}`,
    '',
    '## Summary',
    mom.summary || 'No summary was generated.',
    '',
    '## Key Discussion Points',
    listToMarkdown(mom.keyDiscussionPoints),
    '',
    '## Decisions Taken',
    listToMarkdown(mom.decisionsTaken),
    '',
    '## Action Items',
    actionItemsToMarkdown(meeting?.actionItems || mom.actionItems),
    '',
    '## Risks and Concerns',
    listToMarkdown(mom.risks),
    '',
    '## Next Meeting Agenda',
    listToMarkdown(mom.nextMeetingAgenda),
    '',
  ].join('\n');
}

async function createMeetingWithTranscript({ eventId, title, date, transcript }) {
  const mom = await groq.generateMOM(transcript);
  const meeting = store.createMeeting({
    eventId,
    title,
    date: date || new Date().toISOString(),
    transcript,
  });

  store.updateMeetingMOM(meeting.id, mom);
  vector.indexMeeting(meeting.id, eventId, title, transcript);

  return store.getMeetingById(meeting.id);
}

// POST /meeting/create — create meeting and auto-generate MOM
router.post('/create', async (req, res) => {
  try {
    const { eventId, title, date, transcript } = req.body;
    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    const cleanTranscript = typeof transcript === 'string' ? transcript.trim() : '';

    if (!eventId) return res.status(400).json({ error: 'eventId is required' });
    if (!cleanTitle) return res.status(400).json({ error: 'title is required' });
    if (cleanTranscript.length < 20) {
      return res.status(400).json({ error: 'Transcript must be at least 20 characters' });
    }

    const event = store.getEventById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const updatedMeeting = await createMeetingWithTranscript({
      eventId,
      title: cleanTitle,
      date,
      transcript: cleanTranscript,
    });

    res.status(201).json(updatedMeeting);
  } catch (err) {
    console.error('[Create Meeting Error]', err.message);
    if (err.statusCode || err.status) return sendAIError(res, err);
    res.status(500).json({ error: err.message });
  }
});

// POST /meeting/create-from-audio — transcribe audio and auto-generate MOM
router.post('/create-from-audio', handleAudioUpload, async (req, res) => {
  try {
    const { eventId, title, date, language } = req.body;
    const cleanTitle = typeof title === 'string' ? title.trim() : '';

    if (!eventId) return res.status(400).json({ error: 'eventId is required' });
    if (!cleanTitle) return res.status(400).json({ error: 'title is required' });
    if (!req.file) return res.status(400).json({ error: 'audio file is required' });

    const event = store.getEventById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const transcript = await transcription.transcribeAudioFile(req.file, { language });
    if (transcript.length < 20) {
      return res.status(400).json({ error: 'Transcribed audio was too short to generate MOM' });
    }

    const updatedMeeting = await createMeetingWithTranscript({
      eventId,
      title: cleanTitle,
      date,
      transcript,
    });

    res.status(201).json({
      ...updatedMeeting,
      transcription: {
        text: transcript,
        sourceFile: req.file.originalname,
      },
    });
  } catch (err) {
    console.error('[Create Meeting From Audio Error]', err.message);
    if (err.statusCode || err.status) return sendAIError(res, err, 'Audio transcription or MOM generation');
    res.status(500).json({ error: err.message });
  } finally {
    await cleanupUploadedFile(req.file);
  }
});

// GET /meeting/:id/mom/download?format=markdown|json — download MOM
router.get('/:id/mom/download', (req, res) => {
  try {
    const meeting = store.getMeetingById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (!meeting.mom) return res.status(400).json({ error: 'MOM not generated yet' });

    const format = String(req.query.format || 'markdown').toLowerCase();
    const safeTitle = sanitizeFileName(meeting.title);
    const datePart = new Date(meeting.date || Date.now()).toISOString().slice(0, 10);

    if (format === 'json') {
      const fileName = `${safeTitle}-mom-${datePart}.json`;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.status(200).send(JSON.stringify({
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        date: meeting.date,
        mom: meeting.mom,
        actionItems: meeting.actionItems || [],
      }, null, 2));
    }

    if (format !== 'markdown' && format !== 'md') {
      return res.status(400).json({ error: 'format must be markdown or json' });
    }

    const fileName = `${safeTitle}-mom-${datePart}.md`;
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(momToMarkdown(meeting));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /meeting/:id — get a specific meeting
router.get('/:id', (req, res) => {
  try {
    const meeting = store.getMeetingById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /meeting/:id/generate-mom — regenerate MOM
router.post('/:id/generate-mom', async (req, res) => {
  try {
    const meeting = store.getMeetingById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    const mom = await groq.generateMOM(meeting.transcript);
    const updated = store.updateMeetingMOM(meeting.id, mom);
    res.json(updated);
  } catch (err) {
    console.error('[Regen MOM Error]', err.message);
    sendAIError(res, err, 'MOM generation');
  }
});

// POST /meeting/:id/chat — chat with a specific meeting
router.post('/:id/chat', async (req, res) => {
  try {
    const meeting = store.getMeetingById(req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    const { question, history = [] } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const answer = await groq.chatWithMeeting(
      meeting.transcript,
      meeting.mom,
      history,
      question
    );
    res.json({ answer });
  } catch (err) {
    console.error('[Meeting Chat Error]', err.message);
    res.status(500).json({ error: 'AI service error: ' + err.message });
  }
});

// PATCH /meeting/:id/action-item/:actionId — toggle action item status
router.patch('/:id/action-item/:actionId', (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Status must be pending or completed' });
    }
    const meeting = store.updateActionItemStatus(req.params.id, req.params.actionId, status);
    if (!meeting) return res.status(404).json({ error: 'Meeting or action item not found' });
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /search — semantic search across meetings
router.post('/search', async (req, res) => {
  try {
    const { query, eventId, event_id } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    const results = await vector.searchTranscripts(query, eventId || event_id || null);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
