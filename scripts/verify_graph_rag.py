# scripts/verify_graph_rag.py
"""Verification script for the GraphRAG (Advanced Memory) module.
It creates a GraphRAG instance, ingests a few sample documents, performs a query,
and checks that the returned results are sensible.
"""

import sys
import os

# Ensure project root is on PYTHONPATH
sys.path.append(os.getcwd())

from src.ecy.memory.graph_rag import GraphRAG

def verify_graph_rag():
    print("--- Testing GraphRAG Module ---")
    rag = GraphRAG()
    docs = [
        "The quick brown fox jumps over the lazy dog.",
        "Quantum computing combines physics and computer science.",
        "GraphRAG enables semantic search over knowledge bases.",
        "Machine learning models can be fine‑tuned for specific tasks."
    ]
    rag.ingest(docs)
    query = "What is GraphRAG?"
    results = rag.query(query, top_k=2)
    print(f"Query: {query}")
    for doc, score in results:
        print(f"Score: {score:.4f} | Doc: {doc}")
    # Simple sanity check: ensure we got at least one result and scores are between 0 and 1
    assert results, "No results returned"
    for _, score in results:
        assert 0.0 <= score <= 1.0, "Score out of expected range"
    print("✅ GraphRAG verification passed.")

if __name__ == "__main__":
    try:
        verify_graph_rag()
    except Exception as e:
        print(f"❌ GraphRAG verification failed: {e}")
        raise
