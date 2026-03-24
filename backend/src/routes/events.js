const express = require('express');
const router = express.Router();
const store = require('../services/storeService');
const groq = require('../services/groqService');

// GET /events — list all events
router.get('/', (req, res) => {
  try {
    res.json(store.getAllEvents());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /event/create — create a new event
router.post('/create', (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Event name is required' });
    }
    const event = store.createEvent({ name: name.trim(), description });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /event/:id — get event details with meetings
router.get('/:id', (req, res) => {
  try {
    const event = store.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const meetings = store.getMeetingsByEvent(req.params.id);
    const stats = store.getEventStats(req.params.id);

    res.json({ ...event, meetings, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /event/:id — delete an event and all its meetings
router.delete('/:id', (req, res) => {
  try {
    const deleted = store.deleteEvent(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Event not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /event/:id/chat — chat across all meetings in an event
router.post('/:id/chat', async (req, res) => {
  try {
    const event = store.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const { question, history = [] } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const meetings = store.getMeetingsByEvent(req.params.id);
    if (meetings.length === 0) {
      return res.json({ answer: 'No meetings have been added to this event yet.' });
    }

    const answer = await groq.chatWithEvent(meetings, history, question);
    res.json({ answer });
  } catch (err) {
    console.error('[Event Chat Error]', err.message);
    res.status(500).json({ error: 'AI service error: ' + err.message });
  }
});

// POST /event/:id/summary — generate consolidated event summary
router.post('/:id/summary', async (req, res) => {
  try {
    const event = store.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const meetings = store.getMeetingsByEvent(req.params.id);
    if (meetings.length === 0) {
      return res.json({ summary: 'No meetings to summarize yet.' });
    }

    const summary = await groq.generateEventSummary(event.name, meetings);
    res.json({ summary });
  } catch (err) {
    console.error('[Event Summary Error]', err.message);
    res.status(500).json({ error: 'AI service error: ' + err.message });
  }
});

// GET /event/:id/decisions — all decisions across meetings
router.get('/:id/decisions', (req, res) => {
  try {
    const event = store.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(store.getAllDecisions(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /event/:id/action-items — all action items across meetings
router.get('/:id/action-items', (req, res) => {
  try {
    const event = store.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(store.getAllActionItems(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
