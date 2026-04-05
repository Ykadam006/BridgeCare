"""
Health documents → text → overlapping chunks → local embeddings (no API cost).
Embedding model: sentence-transformers all-MiniLM-L6-v2 (open source, 384 dims, runs on CPU).
"""

import io
import re
from functools import lru_cache
from typing import Optional

from pypdf import PdfReader

CHUNK_WORDS = 150  # MiniLM reads ~256 word-pieces; 150 words stays under that
OVERLAP_WORDS = 25  # so a sentence cut at a boundary still appears whole in one chunk


@lru_cache(maxsize=1)
def _model():
    from sentence_transformers import SentenceTransformer  # heavy import: only when first needed
    return SentenceTransformer("all-MiniLM-L6-v2")


def embed(texts: list[str]) -> list[list[float]]:
    """Unit-length vectors, so cosine distance in pgvector is meaningful."""
    return _model().encode(texts, normalize_embeddings=True, batch_size=32, show_progress_bar=False).tolist()


def extract_pages(data: bytes, filename: str) -> list[tuple[Optional[int], str]]:
    """[(page number or None, text)]. Raises ValueError for unsupported or unreadable files."""
    if data[:5] == b"%PDF-":
        try:
            reader = PdfReader(io.BytesIO(data))
            return [(i + 1, page.extract_text() or "") for i, page in enumerate(reader.pages)]
        except Exception as e:
            raise ValueError(f"Couldn't read this PDF ({e.__class__.__name__})")
    if filename.lower().endswith((".txt", ".md")):
        try:
            return [(None, data.decode("utf-8"))]
        except UnicodeDecodeError:
            raise ValueError("Text files must be UTF-8")
    raise ValueError("Upload a PDF, .txt or .md file")


def chunk_pages(pages: list[tuple[Optional[int], str]]) -> list[dict]:
    """Word-window chunks that never cross a page, so every chunk cites one page."""
    chunks = []
    step = CHUNK_WORDS - OVERLAP_WORDS
    for page, text in pages:
        words = re.sub(r"\s+", " ", text).strip().split(" ")
        if words == [""]:
            continue
        for start in range(0, max(len(words) - OVERLAP_WORDS, 1), step):
            chunks.append({"page": page, "content": " ".join(words[start:start + CHUNK_WORDS])})
    return chunks
