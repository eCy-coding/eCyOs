import os
from typing import List, Dict, Any

# Safe Import for Pinecone
try:
    import pinecone
    HAS_PINECONE = True
except ImportError:
    HAS_PINECONE = False
    print("[VectorMemory] Warning: 'pinecone-client' not specified (pip install pinecone-client). Running in Mock Mode.")

class VectorMemory:
    """Simple wrapper around Pinecone for long‑term vector memory.
    
    The class handles initialization, upserting embeddings, and similarity search.
    It is deliberately lightweight – the heavy lifting (embedding generation) is
    expected to be performed by the caller (e.g., an LLM or a local model).
    """

    def __init__(self, api_key: str = None, index_name: str = "ecy-memory", environment: str = "us-west1-gcp"):
        self.mock_mode = not HAS_PINECONE
        self.api_key = api_key or os.getenv("PINECONE_API_KEY")
        
        if not self.mock_mode:
            if not self.api_key:
                print("[VectorMemory] No API Key. Switching to Mock Mode.")
                self.mock_mode = True
            else:
                try:
                    # Initialise Pinecone client
                    pinecone.init(api_key=self.api_key, environment=environment)
                    # Create index if it does not exist
                    if index_name not in pinecone.list_indexes():
                        pinecone.create_index(name=index_name, dimension=1536, metric="cosine")
                    self.index = pinecone.Index(index_name)
                    print(f"[VectorMemory] Connected to Pinecone Index: {index_name}")
                except Exception as e:
                    print(f"[VectorMemory] Connection failed ({e}). Switching to Mock Mode.")
                    self.mock_mode = True

    def upsert(self, ids: List[str], embeddings: List[List[float]], metadatas: List[Dict[str, Any]] = None) -> None:
        """Insert or update vectors."""
        if self.mock_mode:
            print(f"[VectorMemory MOCK] Upserted {len(ids)} vectors.")
            return

        if metadatas is None:
            metadatas = [{} for _ in ids]
        to_upsert = [{"id": _id, "values": vec, "metadata": meta} for _id, vec, meta in zip(ids, embeddings, metadatas)]
        self.index.upsert(vectors=to_upsert)

    def query(self, embedding: List[float], top_k: int = 5, include_metadata: bool = True) -> List[Dict[str, Any]]:
        """Perform a similarity search."""
        if self.mock_mode:
            print(f"[VectorMemory MOCK] Querying vector...")
            return []

        results = self.index.query(vector=embedding, top_k=top_k, include_metadata=include_metadata)
        return results.get("matches", [])

    def delete(self, ids: List[str]) -> None:
        """Delete vectors by their IDs."""
        if self.mock_mode:
            print(f"[VectorMemory MOCK] Deleted {len(ids)} vectors.")
            return
        self.index.delete(ids=ids)

    def list_indexes(self) -> List[str]:
        """Utility to list all Pinecone indexes for debugging."""
        if self.mock_mode:
            return ["mock-index"]
        return pinecone.list_indexes()
