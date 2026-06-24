# MeetMind 🧠 — Meeting Intelligence Platform

An AI-powered Meeting Intelligence Platform for colleges and educational institutions.

## Features

- 📋 **Auto MOM Generation** — Upload a transcript, get a structured MOM instantly
- 💬 **Meeting Chatbot** — Ask questions about any specific meeting
- 🌐 **Event Chatbot** — Ask questions across ALL meetings in an event
- 📊 **Decision Tracker** — Aggregate all decisions across meetings
- ✅ **Action Item Tracker** — Track tasks with pending/completed status
- 🔍 **Semantic Search** — Find relevant meeting sections by meaning
- 📑 **Event Summary** — AI-generated consolidated journey report

## Quick Start

### Step 1: Set up Groq API Key

1. Get a free API key from [console.groq.com](https://console.groq.com)
2. Edit `backend/.env` and replace `your_groq_api_key_here` with your key

### Step 2: Start the Backend

```bash
cd backend
node src/index.js
```

Runs at: http://localhost:3001

### Step 3: Start the Frontend

```bash
cd frontend
npm run dev
```

Runs at: http://localhost:5173

### Step 4: (Optional) Start Vector Search Service

> Requires Python 3.10+ and pip

```bash
cd vector-service
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Runs at: http://localhost:8000

> The app works fully without the vector service — semantic search and local audio transcription won't be available.

### Local Audio Transcription (No API)

- Audio transcription now runs locally through the Python service (`faster-whisper`), not through Groq API.
- MOM generation still uses Groq API after transcription.

Optional Whisper environment variables for `vector-service`:

- `WHISPER_MODEL` (default: `small`)
- `WHISPER_DEVICE` (default: `auto`)
- `WHISPER_COMPUTE_TYPE` (default: `int8`)

Optional backend variables for large audio files:

- `MAX_AUDIO_FILE_MB` (default: `200`)
- `TRANSCRIPTION_TIMEOUT_MS` (default: `1800000`)

## Usage

1. **Create an Event** — e.g., "College Hackathon 2026"
2. **Add a Meeting** — paste transcript or upload a `.txt` file
3. **View MOM** — auto-generated instantly after adding meeting
4. **Chat** — ask questions in Meeting Chat or Event Chat
5. **Track Progress** — use Decisions and Action Items tabs

### MOM Download

- Open a meeting and go to the MOM tab.
- Use `Download MOM (.md)` or `Download MOM (.json)`.

## Sample Transcript

Use `sample-transcript.txt` to test the platform quickly.

## Project Structure

```
MeetMind/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Node.js + Express + Groq
├── vector-service/    # Python + FastAPI + FAISS
└── sample-transcript.txt
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, Groq SDK |
| AI | Groq Cloud (Llama 3 70B) |
| Vector Search + Local STT | FastAPI, FAISS, Sentence Transformers, faster-whisper |
| State | Zustand |
| Storage | In-memory (prototype) |
