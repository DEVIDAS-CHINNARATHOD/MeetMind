const express = require('express');
const router = express.Router();
const store = require('../services/storeService');
const groq = require('../services/groqService');
const vector = require('../services/vectorService');

// POST /meeting/create — create meeting and auto-generate MOM
router.post('/create', async (req, res) => {
  try {
    const { eventId, title, date, transcript } = req.body;

    if (!eventId) return res.status(400).json({ error: 'eventId is required' });
    if (!title || !title.trim()) return res.status(400).json({ error: 'title is required' });
    if (!transcript || transcript.trim().length < 20) {
      return res.status(400).json({ error: 'Transcript must be at least 20 characters' });
    }

    const event = store.getEventById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Create meeting record
    const meeting = store.createMeeting({
      eventId,
      title: title.trim(),
      date: date || new Date().toISOString(),
      transcript: transcript.trim(),
    });

    // Generate MOM via Groq (async)
    let mom = null;
    try {
      mom = await groq.generateMOM(transcript.trim());
      store.updateMeetingMOM(meeting.id, mom);
    } catch (momErr) {
      console.error('[MOM Generation Error]', momErr.message);
    }

    // Index transcript in vector store (fire and forget)
    vector.indexMeeting(meeting.id, eventId, title, transcript.trim());

    const updatedMeeting = store.getMeetingById(meeting.id);
    res.status(201).json(updatedMeeting);
  } catch (err) {
    console.error('[Create Meeting Error]', err.message);
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: 'AI service error: ' + err.message });
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
    const { query, eventId } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    const results = await vector.searchTranscripts(query, eventId || null);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
