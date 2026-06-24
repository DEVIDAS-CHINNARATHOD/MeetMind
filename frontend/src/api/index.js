import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 min for AI calls
  headers: { 'Content-Type': 'application/json' },
});

// ── Events ────────────────────────────────────────────────
export const getEvents = () => api.get('/events').then(r => r.data);
export const getEvent = (id) => api.get(`/event/${id}`).then(r => r.data);
export const createEvent = (data) => api.post('/event/create', data).then(r => r.data);
export const deleteEvent = (id) => api.delete(`/event/${id}`).then(r => r.data);
export const chatWithEvent = (id, question, history) =>
  api.post(`/event/${id}/chat`, { question, history }).then(r => r.data);
export const generateEventSummary = (id) =>
  api.post(`/event/${id}/summary`).then(r => r.data);
export const getEventDecisions = (id) =>
  api.get(`/event/${id}/decisions`).then(r => r.data);
export const getEventActionItems = (id) =>
  api.get(`/event/${id}/action-items`).then(r => r.data);

// ── Meetings ──────────────────────────────────────────────
export const getMeeting = (id) => api.get(`/meeting/${id}`).then(r => r.data);
export const createMeeting = (data) => api.post('/meeting/create', data).then(r => r.data);
export const regenerateMOM = (id) =>
  api.post(`/meeting/${id}/generate-mom`).then(r => r.data);
export const chatWithMeeting = (id, question, history) =>
  api.post(`/meeting/${id}/chat`, { question, history }).then(r => r.data);
export const toggleActionItem = (meetingId, actionId, status) =>
  api.patch(`/meeting/${meetingId}/action-item/${actionId}`, { status }).then(r => r.data);
export const searchMeetings = (query, eventId) =>
  api.post('/meeting/search', { query, event_id: eventId }).then(r => r.data);

export default api;
