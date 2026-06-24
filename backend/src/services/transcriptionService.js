const axios = require('axios');
const fs = require('fs');

const TRANSCRIPTION_URL = process.env.TRANSCRIPTION_SERVICE_URL || process.env.VECTOR_SERVICE_URL || 'http://localhost:8000';
const DEFAULT_LANGUAGE = process.env.TRANSCRIPTION_LANGUAGE || 'en';
const TRANSCRIPTION_TIMEOUT_MS = Number.parseInt(process.env.TRANSCRIPTION_TIMEOUT_MS || '', 10) || (30 * 60 * 1000);

function extractServiceErrorMessage(payload) {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  if (typeof payload.detail === 'string') return payload.detail;
  if (typeof payload.error === 'string') return payload.error;
  return '';
}

async function transcribeAudioFile(file, options = {}) {
  const hasBuffer = Boolean(file?.buffer?.length);
  const hasFilePath = Boolean(file?.path);
  if (!hasBuffer && !hasFilePath) {
    const err = new Error('Audio file is required for transcription.');
    err.statusCode = 400;
    throw err;
  }

  const language = options.language || DEFAULT_LANGUAGE;
  const payload = hasBuffer ? file.buffer : fs.createReadStream(file.path);
  const headers = {
    'Content-Type': file.mimetype || 'application/octet-stream',
    'X-File-Name': file.originalname || 'meeting-audio.webm',
  };

  if (typeof file.size === 'number' && Number.isFinite(file.size) && file.size > 0) {
    headers['Content-Length'] = String(file.size);
  }

  try {
    const response = await axios.post(`${TRANSCRIPTION_URL}/transcribe`, payload, {
      params: { language },
      timeout: TRANSCRIPTION_TIMEOUT_MS,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      headers,
    });

    const text = response?.data?.text?.trim();
    if (!text) {
      const err = new Error('Local transcription service returned no text.');
      err.statusCode = 502;
      throw err;
    }

    return text;
  } catch (err) {
    if (err.statusCode) throw err;

    if (err.response) {
      const serviceMessage = extractServiceErrorMessage(err.response.data);
      const wrapped = new Error(serviceMessage || `Local transcription service failed with status ${err.response.status}.`);
      wrapped.statusCode = err.response.status;
      throw wrapped;
    }

    const wrapped = new Error('Could not reach local transcription service. Start vector-service on port 8000 or set TRANSCRIPTION_SERVICE_URL.');
    wrapped.statusCode = 503;
    throw wrapped;
  }
}

module.exports = {
  transcribeAudioFile,
};
