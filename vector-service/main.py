import os
import tempfile

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from faster_whisper import WhisperModel

from embedder import chunk_text, embed
from store import add_vectors, search_vectors, delete_by_meeting

app = FastAPI(title="MeetMind Vector Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class IndexRequest(BaseModel):
    meeting_id: str
    event_id: str
    meeting_title: str
    text: str


class SearchRequest(BaseModel):
    query: str
    event_id: Optional[str] = None
    top_k: int = 5


_whisper_model = None


def get_whisper_model() -> WhisperModel:
    global _whisper_model
    if _whisper_model is None:
        model_name = os.getenv("WHISPER_MODEL", "small")
        device = os.getenv("WHISPER_DEVICE", "auto")
        compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
        print(f"[Transcription] Loading Whisper model '{model_name}' (device={device}, compute_type={compute_type})...")
        _whisper_model = WhisperModel(model_name, device=device, compute_type=compute_type)
        print("[Transcription] Whisper model loaded.")
    return _whisper_model


def transcribe_audio_path(audio_path: str, language: Optional[str] = "en") -> str:
    model = get_whisper_model()

    try:
        whisper_language = None if not language or language == "auto" else language
        segments, _info = model.transcribe(
            audio_path,
            language=whisper_language,
            vad_filter=True,
            beam_size=5,
        )
        transcript = " ".join(seg.text.strip() for seg in segments if seg.text and seg.text.strip()).strip()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {exc}")

    if not transcript:
        raise HTTPException(status_code=422, detail="No speech detected in uploaded audio")

    return transcript


def pick_audio_suffix(file_name: Optional[str]) -> str:
    if not file_name:
        return ".webm"

    allowed = {
        ".flac",
        ".mp3",
        ".mp4",
        ".mpeg",
        ".mpga",
        ".m4a",
        ".ogg",
        ".wav",
        ".webm",
    }
    ext = os.path.splitext(file_name)[1].lower()
    return ext if ext in allowed else ".webm"


@app.get("/health")
def health():
    return {"status": "ok", "service": "MeetMind Vector Service"}


@app.post("/transcribe")
async def transcribe(request: Request, language: Optional[str] = "en"):
    """Local audio transcription using faster-whisper."""
    incoming_file_name = request.headers.get("x-file-name")
    suffix = pick_audio_suffix(incoming_file_name)

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
        temp_path = tmp_file.name

    bytes_written = 0
    try:
        with open(temp_path, "wb") as audio_file:
            async for chunk in request.stream():
                if chunk:
                    audio_file.write(chunk)
                    bytes_written += len(chunk)

        if bytes_written == 0:
            raise HTTPException(status_code=400, detail="Audio bytes are required")

        text = transcribe_audio_path(temp_path, language=language)
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass

    return {"text": text, "language": language or "auto", "provider": "local-whisper"}


@app.post("/index")
def index_meeting(req: IndexRequest):
    """Chunk and embed a meeting transcript, storing in FAISS."""
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    chunks = chunk_text(req.text)
    if not chunks:
        raise HTTPException(status_code=400, detail="No chunks generated from text")

    vectors = embed(chunks)
    meta_list = [
        {
            "text": chunk,
            "meeting_id": req.meeting_id,
            "event_id": req.event_id,
            "meeting_title": req.meeting_title,
        }
        for chunk in chunks
    ]
    ids = add_vectors(vectors, meta_list)

    return {
        "success": True,
        "chunks_indexed": len(chunks),
        "meeting_id": req.meeting_id,
    }


@app.post("/search")
def search(req: SearchRequest):
    """Semantic search across indexed transcripts."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    query_vec = embed([req.query])[0]
    results = search_vectors(query_vec, top_k=req.top_k, event_id=req.event_id)

    return {"results": results, "query": req.query}


@app.delete("/index/{meeting_id}")
def delete_index(meeting_id: str):
    """Remove a meeting's chunks from the index."""
    delete_by_meeting(meeting_id)
    return {"success": True, "meeting_id": meeting_id}
