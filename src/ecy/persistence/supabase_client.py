import os
import datetime
from typing import Dict, Any, Optional

# Safe Import for Supabase
try:
    from supabase import create_client, Client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False
    print("[Persistence] Warning: 'supabase' lib not found. Running in Mock Mode.")

class SupabaseClient:
    """
    Supabase Integration for eCy OS.
    Handles persistent storage of logs and 'Truth Verdicts' to PostgreSQL.
    Environment Variables: SUPABASE_URL, SUPABASE_KEY
    """

    def __init__(self):
        self.mock_mode = not HAS_SUPABASE
        self.url = os.environ.get("SUPABASE_URL")
        self.key = os.environ.get("SUPABASE_KEY")
        self.client: Optional[Client] = None

        if HAS_SUPABASE and self.url and self.key:
            try:
                self.client = create_client(self.url, self.key)
                print(f"[Persistence] Connected to Supabase: {self.url}")
            except Exception as e:
                print(f"[Persistence] Connection failed: {e}. Switching to Mock Mode.")
                self.mock_mode = True
        else:
            if not self.mock_mode:
                print("[Persistence] Missing Credentials. Switching to Mock Mode.")
            self.mock_mode = True

    def log_event(self, source: str, level: str, message: str, meta: Dict[str, Any] = None):
        """
        Logs a system event to 'application_logs' table.
        """
        payload = {
            "timestamp": datetime.datetime.now().isoformat(),
            "source": source,
            "level": level,
            "message": message,
            "metadata": meta or {}
        }

        if self.mock_mode:
            print(f"[Supabase MOCK] Logged: {payload}")
            return

        try:
            self.client.table("application_logs").insert(payload).execute()
        except Exception as e:
            # Fallback to local print on error
            print(f"[Persistence Error] {e} | Payload: {payload}")

    def store_verdict(self, query: str, verdict: str, agent_history: list):
        """
        Stores a final Council Verdict.
        """
        if self.mock_mode:
            print(f"[Supabase MOCK] Stored Verdict for '{query}': {verdict[:50]}...")
            return

        try:
            data = {
                "query": query,
                "final_verdict": verdict,
                "debate_history": agent_history,
                "created_at": datetime.datetime.now().isoformat()
            }
            self.client.table("verdicts").insert(data).execute()
        except Exception as e:
            print(f"[Persistence Error] Failed to store verdict: {e}")
