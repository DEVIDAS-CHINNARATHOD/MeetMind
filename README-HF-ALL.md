---
title: MeetMind - Meeting Intelligence Platform
emoji: 🧠
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# MeetMind 🧠 - AI Meeting Intelligence Platform

Complete meeting management solution with AI-powered Minutes of Meeting generation, intelligent chat, and semantic search - all in one Space!

## 🚀 Features

- 📋 **Auto MOM Generation** - Upload transcript, get structured minutes instantly
- 💬 **AI Chat** - Ask questions about meetings with context-aware responses
- 🌐 **Event Management** - Organize meetings into events
- 🎤 **Audio Transcription** - Local Whisper-based transcription (no API needed)
- 📊 **Decision Tracking** - Aggregate decisions across meetings
- ✅ **Action Items** - Track tasks with status toggle
- 🔍 **Semantic Search** - Find relevant content by meaning
- 📄 **Export Options** - Download MOM as PDF, Markdown, or JSON

## 🎯 Quick Start

### 1. Configure API Key

This Space requires a Groq API key for AI features.

**Get your free API key:**
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Create API key

**Set in this Space:**
1. Go to **Settings** → **Variables**
2. Add secret: `GROQ_API_KEY` = `your_key_here`
3. Space will auto-restart

### 2. Use the App

1. Click **"Create Event"** (e.g., "Sprint Planning")
2. Add a meeting with transcript or audio file
3. View auto-generated MOM
4. Chat with your meetings
5. Download MOM as PDF

## 📋 Supported Audio Formats

- FLAC, MP3, MP4, MPEG, MPGA, M4A
- OGG, WAV, WebM
- Max size: 100 MB
- Local transcription (no external API)

## 🏗 Architecture

This Space runs three services together:

```
┌─────────────────────────────────────┐
│  Nginx (Port 7860)                  │
│  ├─ Frontend (React)                │
│  ├─ Backend API (Node.js:3001)     │
│  └─ Vector Service (Python:8000)   │
└─────────────────────────────────────┘
```

**Managed by Supervisor**:
- Vector Service (FastAPI + FAISS + Whisper)
- Backend (Node.js + Express + Groq)
- Frontend (React + Vite, served by Nginx)

## 🔧 Configuration

### Environment Variables (Optional)

Set in Space Settings → Variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | - | **Required** - Your Groq API key |
| `MAX_AUDIO_FILE_MB` | 100 | Max audio upload size (MB) |
| `WHISPER_MODEL` | small | Whisper model (tiny/base/small/medium/large) |
| `WHISPER_DEVICE` | auto | Device (auto/cpu/cuda) |
| `WHISPER_COMPUTE_TYPE` | int8 | Compute type (int8/float16/float32) |

### Performance Notes

**Free CPU Tier:**
- Good for demos and light usage
- Audio transcription: ~1-2x realtime
- MOM generation: 5-10 seconds

**Recommended Upgrades:**
- **T4 GPU** ($0.60/hr): 10x faster audio transcription
- **CPU Upgrade**: Better for concurrent users

## 💡 Usage Tips

1. **Long transcripts**: Break into smaller meetings for better results
2. **Audio quality**: Clear audio = better transcription
3. **Action items**: Mention names and deadlines explicitly
4. **Multiple meetings**: Use events to group related meetings
5. **Export**: Download MOM as PDF for professional sharing

## 🧪 Try It Now

**Sample transcript available in app** - Create an event and try with sample data!

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js 20, Express 5, Groq SDK, PDFKit
- **Vector Service**: Python 3.11, FastAPI, FAISS, faster-whisper
- **AI**: Groq Cloud (Llama 3 70B)
- **Deployment**: Docker, Nginx, Supervisor

## 📖 Documentation

Full documentation: [GitHub Repository](#)

## 🐛 Troubleshooting

### "GROQ_API_KEY not configured"
- Set `GROQ_API_KEY` in Space Settings → Variables

### Audio transcription fails
- Check file size < 100 MB
- Verify format is supported
- For GPU: upgrade Space hardware

### Slow performance
- Free CPU tier is best for demos
- Consider GPU upgrade for production

### API errors
- Check Groq API key is valid
- Verify rate limits (30 req/min on free tier)

## 📄 License

MIT License

## 🙏 Credits

Built with Groq AI, Hugging Face Spaces, and open source tools.

---

**Need help?** Check the logs in Space settings or refer to the documentation.
