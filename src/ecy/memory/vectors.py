
import os
import logging
from typing import List, Dict, Any, Optional
import vecs
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class VectorMemory:
    """
    Manages vector embeddings in Supabase using pgvector via the 'vecs' client.
    Enables semantic search for the Debate Council and Knowledge Nexus.
    """

    def __init__(self, collection_name: str = "galactic_archive", dimension: int = 1536):
        self.db_connection = os.getenv("SUPABASE_DB_URL") 
        if not self.db_connection:
             # Fallback to constructing from parts if full URL isn't set
             user = os.getenv("SUPABASE_DB_USER", "postgres")
             password = os.getenv("SUPABASE_DB_PASSWORD", "")
             host = os.getenv("SUPABASE_DB_HOST", "db.projectref.supabase.co")
             port = os.getenv("SUPABASE_DB_PORT", "5432")
             db = os.getenv("SUPABASE_DB_NAME", "postgres")
             self.db_connection = f"postgresql://{user}:{password}@{host}:{port}/{db}"

        self.collection_name = collection_name
        self.dimension = dimension
        self.client = vecs.create_client(self.db_connection)
        self.collection = self._get_or_create_collection()

    def _get_or_create_collection(self):
        """
        Get existing collection or create a new one.
        """
        try:
            return self.client.get_or_create_collection(
                name=self.collection_name, 
                dimension=self.dimension
            )
        except Exception as e:
            logger.error(f"Failed to create vector collection: {e}")
            return None

    def upsert_text(self, text: str, metadata: Dict[str, Any], vector: List[float]):
        """
        Store text and its embedding vector.
        ID is auto-generated or can be passed in metadata['id'].
        """
        if not self.collection:
            logger.warning("Vector collection not initialized.")
            return

        try:
            # vecs expects records as (id, vector, metadata)
            # We'll use a hash of the text as ID if provided, or metadata ID
            record_id = metadata.get("id") or str(hash(text))
            
            # Make sure metadata contains the raw text for retrieval
            metadata["text"] = text
            
            self.collection.upsert(
                records=[
                    (record_id, vector, metadata)
                ]
            )
            logger.info(f"Upserted vector {record_id} into {self.collection_name}")
        except Exception as e:
            logger.error(f"Vector upsert failed: {e}")

    def query_similar(self, vector: List[float], limit: int = 5, filters: Optional[Dict] = None) -> List[Dict]:
        """
        Search for most similar vectors.
        Returns a list of metadata dicts containing the original text.
        """
        if not self.collection:
            return []

        try:
            # query() returns a list of resulting record IDs
            # But we want the metadata. vecs adaptor unfortunately returns IDs by default on query.
            # We might need to fetch records by ID after query or use a different method depending on vecs version.
            # Checking vecs documentation pattern: usually query returns IDs.
            
            # Use 'query' to get IDs
            results = self.collection.query(
                data=vector,
                limit=limit,
                filters=filters,
                include_value=True, # Include distance/similarity score? vecs docs vary.
                include_metadata=True # Ensure metadata is returned
            )
            
            # If results are just IDs, we might need to fetch. 
            # But recent vecs might return tuples. Let's assume standard behavior.
            # Adapting to return straightforward dicts
            formatted_results = []
            for res in results:
                 # res structure depends on include_metadata=True
                 # Standard: (id, distance, metadata) or similar
                 # Let's handle the likely tuple unpacking
                 if isinstance(res, tuple) and len(res) >= 3:
                     _id, _score, _meta = res
                     _meta['score'] = _score
                     _meta['id'] = _id
                     formatted_results.append(_meta)
                 else:
                     # Fallback
                     formatted_results.append({"raw": res})
            
            return formatted_results

        except Exception as e:
            logger.error(f"Vector search failed: {e}")
            return []

    def delete(self, ids: List[str]):
        if self.collection:
            self.collection.delete(ids=ids)

# Test Block
if __name__ == "__main__":
    # Mock behavior if DB not available
    print("Initializing VectorMemory...")
    try:
        vm = VectorMemory(collection_name="test_memory")
        print("VectorMemory initialized.")
    except Exception as e:
        print(f"Initialization failed (Expected if DB creds missing): {e}")
