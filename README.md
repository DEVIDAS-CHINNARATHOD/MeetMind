# MeetMind 🧠 — AI Meeting Intelligence Platform

Transform meeting transcripts into structured Minutes of Meeting (MOM) with AI-powered insights, chat, and semantic search.

## ✨ Features

- 📋 **Auto MOM Generation** — Upload transcript, get structured minutes instantly
- 💬 **AI Chat** — Ask questions about meetings with context-aware responses
- 🌐 **Event Management** — Organize meetings into events
- 🎤 **Audio Transcription** — Local Whisper-based transcription (100+ MB files)
- 📊 **Decision Tracking** — Aggregate decisions across all meetings
- ✅ **Action Items** — Track tasks with pending/completed status
- 🔍 **Semantic Search** — Find relevant content by meaning, not just keywords
- 📄 **Multiple Export Formats** — Download as **PDF**, Markdown, or JSON

## 🚀 Quick Start

### Local Development (5 minutes)

#### Option 1: Docker (Recommended)

```bash
# 1. Clone repository
git clone <your-repo-url>
cd meetmind

# 2. Create .env file and add GROQ API key
cp .env.example .env
nano .env  # Add GROQ_API_KEY=your_key_here

# 3. Start all services
docker compose up --build

# 4. Open http://localhost:8080
```

#### Option 2: Manual Setup

**Backend:**
```bash
cd backend
cp .env.example .env
# Add GROQ_API_KEY to .env
npm install
npm start
```

**Frontend (new terminal):**
```bash
cd frontend
npm install
npm run dev
```

**Vector Service (new terminal - optional):**
```bash
cd vector-service
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

Visit: http://localhost:5173

### Get Groq API Key (Free)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Create API key
4. Add to `.env` file

---

## 🎯 Usage

### 1. Create Event
Click "Create Event" → Name it (e.g., "Sprint Planning")

### 2. Add Meeting

**From Text:**
- Click "Add Meeting"
- Paste transcript or upload `.txt` file
- Click "Generate MOM"

**From Audio:**
- Upload audio file (MP3, WAV, etc.)
- Wait for transcription
- MOM auto-generates

**Try Sample:**
Use `sample-transcript.txt` included in the project

### 3. View MOM

Auto-generated minutes include:
- **Summary** — High-level overview
- **Key Discussion Points** — Main topics
- **Decisions Taken** — Important decisions
- **Action Items** — Tasks with owners and deadlines
- **Risks & Concerns** — Identified issues
- **Next Meeting Agenda** — Future topics

### 4. Download

Export as:
- **PDF** — Professional formatted document
- **Markdown** — Developer-friendly format
- **JSON** — For programmatic access

### 5. Chat with Meetings

**Meeting Chat:**
- "What were the main action items?"
- "Who is responsible for the API integration?"

**Event Chat:**
- Ask questions across ALL meetings
- "Show me all decisions from all meetings"

---

## 🚀 Deployment

### Deploy to Hugging Face (Easiest!)

See **[HF-DEPLOYMENT-GUIDE.md](./HF-DEPLOYMENT-GUIDE.md)** for detailed step-by-step guide with screenshots.

**Quick Steps:**
1. Push code to GitHub
2. Create Space on huggingface.co/spaces
3. Select **Docker SDK**
4. Connect GitHub or upload files
5. Add GROQ_API_KEY in Settings
6. Wait 10-15 minutes
7. Your app is live! 🎉

**No Docker knowledge needed** - HF handles everything!

**Result:** `https://YOUR_USERNAME-meetmind.hf.space`

---

## 🏗 Architecture

```
┌─────────────┐      ┌─────────────┐      ┌──────────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│ Vector Service   │
│   (React)   │      │  (Node.js)  │      │    (Python)      │
│   Port 80   │      │  Port 3001  │      │   Port 8000      │
└─────────────┘      └─────────────┘      └──────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js 20, Express 5, Groq SDK, PDFKit |
| Vector Service | Python 3.11, FastAPI, FAISS, faster-whisper |
| AI | Groq Cloud (Llama 3 70B) |
| State | Zustand |
| Deployment | Docker, Vercel, Render, HF Spaces |

---

## 📦 Project Structure

```
meetmind/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── api/          # API client
│   │   └── store/        # State management
│   └── package.json
│
├── backend/              # Node.js API
│   ├── src/
│   │   ├── routes/      # API routes
│   │   └── services/    # Business logic
│   └── package.json
│
├── vector-service/       # Python ML service
│   ├── main.py          # FastAPI app
│   ├── embedder.py      # Text embeddings
│   └── store.py         # Vector store
│
├── deploy/              # Deployment configs
├── scripts/             # Deployment scripts
├── docker-compose.yml   # Local development
├── Dockerfile.all-in-one # HF all-in-one
├── DEPLOYMENT.md        # Deployment guide
└── README.md           # This file
```

---

## 🔧 Configuration

### Environment Variables

**Backend (`.env`):**
```bash
GROQ_API_KEY=your_key_here              # Required
PORT=3001                                # Optional
MAX_AUDIO_FILE_MB=100                   # Max audio size
TRANSCRIPTION_TIMEOUT_MS=1800000        # 30 min timeout
VECTOR_SERVICE_URL=http://localhost:8000
```

**Vector Service:**
```bash
WHISPER_MODEL=small         # tiny, base, small, medium, large
WHISPER_DEVICE=auto         # auto, cpu, cuda
WHISPER_COMPUTE_TYPE=int8   # int8, float16, float32
```

**Frontend:**
```bash
VITE_API_URL=/api          # Local: /api, Production: backend URL
```

---

## 🎤 Audio Support

### Supported Formats
- FLAC, MP3, MP4, MPEG, MPGA
- M4A, OGG, WAV, WebM

### Limits
- **Max Size**: 100 MB
- **Processing**: Local (faster-whisper)
- **Timeout**: 30 minutes for large files

---

## 🧪 Testing

### Test with Sample Data

1. Create event: "Test Event"
2. Add meeting
3. Upload `sample-transcript.txt`
4. Verify MOM generation
5. Test PDF download
6. Try chat: "What were the decisions?"

### Docker Testing

```bash
# Build and test locally
docker compose up --build

# Check health
curl http://localhost:3001/health  # Backend
curl http://localhost:8000/health  # Vector service

# Access app
open http://localhost:8080
```

---

## 📊 Use Cases

### Team Standups
- Record daily meetings
- Auto-generate action items
- Track progress over time

### Sprint Planning
- Document sprint goals
- Track feature decisions
- Export as PDF for records

### Client Meetings
- Professional MOM generation
- Share PDF with stakeholders
- Track commitments

### Board Meetings
- Formal minutes
- Decision tracking
- Compliance documentation

---

## 💰 Cost (Free Tier)

| Service | Platform | Cost |
|---------|----------|------|
| Frontend | Vercel | $0 (100GB bandwidth) |
| Backend | Render | $0 (750 hrs/month) |
| Vector | HF Spaces | $0 (CPU) |
| AI | Groq | $0 (30 req/min) |
| **Total** | | **$0/month** |

### Upgrade Options

- **Render Starter**: $7/mo (no sleep, always fast)
- **HF GPU**: $0.60/hr (10x faster transcription)
- **Vercel Pro**: $20/mo (team features)

---

## 🐛 Troubleshooting

### Common Issues

**"Network Error" in Frontend**
- Check backend is running
- Verify `VITE_API_URL` is set correctly
- Check CORS configuration

**"GROQ_API_KEY not configured"**
- Verify API key in `.env`
- Check for typos or extra spaces
- Confirm key is valid at console.groq.com

**MOM Generation Fails**
- Check Groq API rate limits (30 req/min free)
- Ensure transcript is at least 20 characters
- Verify API key is valid

**Audio Transcription Fails**
- Verify vector service is running
- Check file size < 100 MB
- Confirm supported format
- Review vector service logs

**Docker Issues**
```bash
# View logs
docker compose logs

# Rebuild from scratch
docker compose down -v
docker compose up --build
```

---

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Complete deployment guide
- **[DEPLOY-ALL-HF.md](./DEPLOY-ALL-HF.md)** — All-in-one HF guide

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

Built with:
- [Groq AI](https://groq.com) — Fast AI inference
- [Hugging Face](https://huggingface.co) — ML hosting
- [Vercel](https://vercel.com) — Frontend hosting
- [Render](https://render.com) — Backend hosting

---

## 🆘 Support

- **Documentation**: Check DEPLOYMENT.md
- **Issues**: Create GitHub issue
- **Logs**: Check deployment platform dashboards

---

**Made with ❤️ for better meetings**
