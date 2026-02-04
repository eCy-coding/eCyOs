
import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime

# Try importing supabase
try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False

class GalacticArchive:
    """
    Interface for the 'Galactic Archive' (Supabase PostgreSQL).
    Handles persistence of debates, logs, and artifacts.
    Falls back to local JSON logging if Supabase is unavailable.
    """
    def __init__(self, url: Optional[str] = None, key: Optional[str] = None):
        self.url = url or os.environ.get("SUPABASE_URL")
        self.key = key or os.environ.get("SUPABASE_KEY")
        self.client: Optional[Client] = None
        
        if self.url and self.key and HAS_SUPABASE:
            try:
                self.client = create_client(self.url, self.key)
                print("[Memory] Connected to Galactic Archive (Supabase).")
            except Exception as e:
                print(f"[Memory] Connection failed: {e}. Switching to Local Mode.")
        else:
            print("[Memory] Supabase credentials missing or package not found. Running in Local Mode.")

    def store_debate(self, query: str, final_answer: str, history: List[Dict]) -> bool:
        """
        Store a completed debate in the archive.
        """
        data = {
            "query": query,
            "final_answer": final_answer,
            "debate_history": history,
            "timestamp": datetime.utcnow().isoformat()
        }

        if self.client:
            try:
                # Assuming a 'debates' table exists
                self.client.table("debates").insert(data).execute()
                return True
            except Exception as e:
                print(f"[Memory] DB Insert Error: {e}")
                return False
        else:
            # Local Fallback
            return self._log_to_file("debates.jsonl", data)

    def store_log(self, level: str, message: str, source: str = "System") -> bool:
        """
        Store a system log.
        """
        data = {
            "level": level,
            "message": message,
            "source": source,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if self.client:
            try:
                self.client.table("system_logs").insert(data).execute()
                return True
            except Exception:
                return False
        else:
            return self._log_to_file("system.log", data)

    def _log_to_file(self, filename: str, data: Dict) -> bool:
        try:
            with open(filename, "a") as f:
                f.write(json.dumps(data) + "\n")
            return True
        except Exception as e:
            print(f"[Memory] Local Write Error: {e}")
        return False

# --- Phase 32: Self‑Improvement Extensions ---

async def create_improvement_cycle(topic: str, start_time: str) -> int:
    """Create a new improvement cycle record.

    Returns the inserted row ID (or -1 on failure).
    """
    if not self.client:
        print("[Memory] Supabase not available – cannot record improvement cycle.")
        return -1
    data = {"topic": topic, "start_time": start_time}
    try:
        resp = self.client.table("improvement_cycles").insert(data).execute()
        # Assuming response contains 'id'
        return resp.data[0].get("id", -1) if resp.data else -1
    except Exception as e:
        print(f"[Memory] Failed to create improvement cycle: {e}")
        return -1

async def log_patch(cycle_id: int, patch: str, success: bool) -> bool:
    """Log a generated patch for a given improvement cycle.

    Returns True on successful insert.
    """
    if not self.client:
        print("[Memory] Supabase not available – cannot log patch.")
        return False
    data = {"cycle_id": cycle_id, "patch": patch, "success": success}
    try:
        self.client.table("patch_logs").insert(data).execute()
        return True
    except Exception as e:
        print(f"[Memory] Failed to log patch: {e}")
        return False
