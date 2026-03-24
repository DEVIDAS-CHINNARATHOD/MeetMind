import faiss
import numpy as np
from typing import Optional
import uuid

# FAISS index (Inner Product = cosine sim on normalized vectors)
_index: Optional[faiss.IndexFlatIP] = None
_dim = 384  # all-MiniLM-L6-v2 output dimension

# Metadata store: int_id → dict
_metadata: dict[int, dict] = {}
_next_id: int = 0

def get_index() -> faiss.IndexFlatIP:
    global _index
    if _index is None:
        _index = faiss.IndexFlatIP(_dim)
    return _index

def add_vectors(vectors: np.ndarray, meta_list: list[dict]) -> list[int]:
    """Add vectors with metadata. Returns list of assigned int IDs."""
    global _next_id
    index = get_index()
    ids = []
    for i, vec in enumerate(vectors):
        vid = _next_id
        _next_id += 1
        index.add(vec.reshape(1, -1))
        _metadata[vid] = meta_list[i]
        ids.append(vid)
    return ids

def search_vectors(query_vec: np.ndarray, top_k: int = 5, event_id: Optional[str] = None) -> list[dict]:
    """Search for top_k similar vectors, optionally filtered by event_id."""
    index = get_index()
    if index.ntotal == 0:
        return []

    k = min(top_k * 5, index.ntotal)  # oversample for filtering
    scores, int_ids = index.search(query_vec.reshape(1, -1), k)

    results = []
    for score, vid in zip(scores[0], int_ids[0]):
        if vid < 0 or vid not in _metadata:
            continue
        meta = _metadata[vid]
        if event_id and meta.get("event_id") != event_id:
            continue
        results.append({
            "score": float(score),
            "text": meta.get("text", ""),
            "meeting_id": meta.get("meeting_id"),
            "event_id": meta.get("event_id"),
            "meeting_title": meta.get("meeting_title", ""),
        })
        if len(results) >= top_k:
            break

    return sorted(results, key=lambda x: x["score"], reverse=True)

def delete_by_meeting(meeting_id: str):
    """Remove all vectors associated with a meeting_id."""
    to_delete = [vid for vid, m in _metadata.items() if m.get("meeting_id") == meeting_id]
    for vid in to_delete:
        del _metadata[vid]
    # Note: FAISS IndexFlatIP doesn't support true deletion; we just remove metadata
    # A full rebuild would be needed for production; for prototype this is fine
    print(f"[Store] Removed {len(to_delete)} metadata entries for meeting {meeting_id}")
