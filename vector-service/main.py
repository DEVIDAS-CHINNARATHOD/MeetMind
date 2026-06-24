from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import numpy as np

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


@app.get("/health")
def health():
    return {"status": "ok", "service": "MeetMind Vector Service"}


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
