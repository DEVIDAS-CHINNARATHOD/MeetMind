const { v4: uuidv4 } = require('uuid');

// In-memory storage
const events = new Map();
const meetings = new Map();

// ── Events ────────────────────────────────────────────────

function createEvent({ name, description }) {
  const id = uuidv4();
  const event = {
    id,
    name,
    description: description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  events.set(id, event);
  return event;
}

function getAllEvents() {
  return Array.from(events.values())
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map(event => ({
      ...event,
      meetingCount: getMeetingsByEvent(event.id).length,
      lastUpdated: event.updatedAt,
    }));
}

function getEventById(id) {
  return events.get(id) || null;
}

function deleteEvent(id) {
  if (!events.has(id)) return false;
  events.delete(id);
  // Also delete all meetings for this event
  for (const [mid, meeting] of meetings.entries()) {
    if (meeting.eventId === id) meetings.delete(mid);
  }
  return true;
}

function touchEvent(id) {
  const event = events.get(id);
  if (event) {
    event.updatedAt = new Date().toISOString();
    events.set(id, event);
  }
}

// ── Meetings ──────────────────────────────────────────────

function createMeeting({ eventId, title, date, transcript }) {
  const id = uuidv4();
  const meeting = {
    id,
    eventId,
    title,
    date: date || new Date().toISOString(),
    transcript,
    mom: null,
    actionItems: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  meetings.set(id, meeting);
  touchEvent(eventId);
  return meeting;
}

function getMeetingById(id) {
  return meetings.get(id) || null;
}

function getMeetingsByEvent(eventId) {
  return Array.from(meetings.values())
    .filter(m => m.eventId === eventId)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function updateMeetingMOM(id, mom) {
  const meeting = meetings.get(id);
  if (!meeting) return null;
  meeting.mom = mom;
  meeting.actionItems = (mom.actionItems || []).map(item => ({
    ...item,
    status: 'pending',
    id: uuidv4(),
  }));
  meeting.updatedAt = new Date().toISOString();
  meetings.set(id, meeting);
  touchEvent(meeting.eventId);
  return meeting;
}

function updateActionItemStatus(meetingId, actionItemId, status) {
  const meeting = meetings.get(meetingId);
  if (!meeting) return null;
  meeting.actionItems = meeting.actionItems.map(item =>
    item.id === actionItemId ? { ...item, status } : item
  );
  meetings.set(meetingId, meeting);
  return meeting;
}

// ── Aggregated Stats ──────────────────────────────────────

function getEventStats(eventId) {
  const eventMeetings = getMeetingsByEvent(eventId);
  const allActions = eventMeetings.flatMap(m => m.actionItems);
  const allDecisions = eventMeetings.flatMap(m =>
    m.mom ? m.mom.decisionsTaken || [] : []
  );

  return {
    totalMeetings: eventMeetings.length,
    totalActionItems: allActions.length,
    pendingTasks: allActions.filter(a => a.status === 'pending').length,
    completedTasks: allActions.filter(a => a.status === 'completed').length,
    totalDecisions: allDecisions.length,
  };
}

function getAllActionItems(eventId) {
  return getMeetingsByEvent(eventId).flatMap(m =>
    m.actionItems.map(a => ({ ...a, meetingTitle: m.title, meetingId: m.id }))
  );
}

function getAllDecisions(eventId) {
  return getMeetingsByEvent(eventId).flatMap(m =>
    (m.mom?.decisionsTaken || []).map(d => ({
      decision: d,
      meetingTitle: m.title,
      meetingId: m.id,
      date: m.date,
    }))
  );
}

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  deleteEvent,
  createMeeting,
  getMeetingById,
  getMeetingsByEvent,
  updateMeetingMOM,
  updateActionItemStatus,
  getEventStats,
  getAllActionItems,
  getAllDecisions,
};
