# src/ecy/memory/graph_rag.py
"""GraphRAG module (Advanced Memory - LGM)

Provides a simple in‑memory graph‑based retrieval‑augmented generation (RAG) interface.
The full production implementation will later integrate Supabase for persistence and
Pinecone (or another vector DB) for similarity search. For now we implement a
lightweight fallback that stores documents, computes embeddings using a placeholder
function, and performs cosine similarity search.

The design follows the MIT/Google engineering standards:
- Type‑annotated public API
- Clear docstrings
- Minimal external dependencies (only `numpy` and `torch` which are already used
  elsewhere in the project)
"""

from __future__ import annotations

import numpy as np
import torch
from typing import List, Tuple, Any

# Placeholder embedding function – in production replace with a real model.
def _embed(text: str) -> np.ndarray:
    """Return a deterministic pseudo‑embedding for *text*.

    The function creates a 128‑dimensional vector by hashing the text and
    normalising it. This is sufficient for the verification script and keeps the
    module self‑contained.
    """
    # Simple deterministic hash → float array
    rng = np.random.default_rng(abs(hash(text)) % (2**32))
    vec = rng.random(128).astype(np.float32)
    # L2 normalise for cosine similarity
    norm = np.linalg.norm(vec) + 1e-10
    return vec / norm


class GraphRAG:
    """In‑memory Graph‑based Retrieval‑Augmented Generation.

    Attributes
    ----------
    _documents: List[Tuple[str, np.ndarray]]
        Stored documents together with their embeddings.
    """

    def __init__(self) -> None:
        self._documents: List[Tuple[str, np.ndarray]] = []

    def ingest(self, docs: List[str]) -> None:
        """Ingest a list of *docs* into the memory store.

        Each document is embedded with :func:`_embed` and stored alongside the
        original text.
        """
        for doc in docs:
            embedding = _embed(doc)
            self._documents.append((doc, embedding))

    def _similarity(self, query_vec: np.ndarray) -> List[Tuple[str, float]]:
        """Return a list of ``(document, score)`` sorted by descending similarity.
        """
        results: List[Tuple[str, float]] = []
        for doc, emb in self._documents:
            # Cosine similarity (vectors are L2‑normalised)
            score = float(np.dot(query_vec, emb))
            results.append((doc, score))
        results.sort(key=lambda x: x[1], reverse=True)
        return results

    def query(self, query: str, top_k: int = 3) -> List[Tuple[str, float]]:
        """Query the memory store and return the *top_k* most similar documents.
        """
        if not self._documents:
            raise RuntimeError("GraphRAG store is empty – ingest documents first.")
        q_vec = _embed(query)
        return self._similarity(q_vec)[:top_k]

    # Future extension points -------------------------------------------------
    # - integrate Supabase for persistent storage
    # - replace _embed with a real transformer‑based encoder (e.g. sentence‑bert)
    # - add metadata handling, graph edges, and reasoning utilities

if __name__ == "__main__":
    # Simple manual demo when the module is executed directly.
    rag = GraphRAG()
    rag.ingest(["The quick brown fox jumps over the lazy dog.",
                "Quantum computing combines physics and computer science.",
                "GraphRAG enables semantic search over knowledge bases."])
    for doc, score in rag.query("What does GraphRAG do?"):
        print(f"Score: {score:.4f} | Doc: {doc}")
