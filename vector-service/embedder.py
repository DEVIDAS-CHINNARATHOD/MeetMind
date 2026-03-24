import re
from sentence_transformers import SentenceTransformer
import numpy as np

_model = None

def get_model():
    global _model
    if _model is None:
        print("[Embedder] Loading all-MiniLM-L6-v2 model...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("[Embedder] Model loaded.")
    return _model

def chunk_text(text: str, chunk_size: int = 200, overlap: int = 50) -> list[str]:
    """Split text into overlapping word-based chunks."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        if end == len(words):
            break
        start += chunk_size - overlap
    return chunks

def embed(texts: list[str]) -> np.ndarray:
    """Embed a list of texts and return L2-normalized vectors."""
    model = get_model()
    embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
    return embeddings.astype("float32")
