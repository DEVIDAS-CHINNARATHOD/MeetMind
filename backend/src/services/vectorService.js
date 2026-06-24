const axios = require('axios');

const VECTOR_URL = process.env.VECTOR_SERVICE_URL || 'http://localhost:8000';

async function indexMeeting(meetingId, eventId, meetingTitle, transcript) {
  try {
    await axios.post(`${VECTOR_URL}/index`, {
      meeting_id: meetingId,
      event_id: eventId,
      meeting_title: meetingTitle,
      text: transcript,
    }, { timeout: 30000 });
  } catch (err) {
    console.warn('[VectorService] Index failed (non-critical):', err.message);
  }
}

async function searchTranscripts(query, eventId = null) {
  try {
    const res = await axios.post(`${VECTOR_URL}/search`, {
      query,
      event_id: eventId,
      top_k: 5,
    }, { timeout: 10000 });
    return res.data.results || [];
  } catch (err) {
    console.warn('[VectorService] Search failed (non-critical):', err.message);
    return [];
  }
}

async function deleteMeetingIndex(meetingId) {
  try {
    await axios.delete(`${VECTOR_URL}/index/${meetingId}`, { timeout: 5000 });
  } catch (err) {
    console.warn('[VectorService] Delete index failed (non-critical):', err.message);
  }
}

module.exports = { indexMeeting, searchTranscripts, deleteMeetingIndex };
