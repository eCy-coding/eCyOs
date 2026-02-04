import os
from .supabase_client import GalacticArchive

class MemoryAdapter:
    """High‑level interface for persistent storage used by eCy OS.

    It delegates to :class:`GalacticArchive` which handles the actual
    Supabase connection or falls back to local JSON logging when the
    service is unavailable.
    """

    def __init__(self):
        # Initialise the archive – it will read environment variables
        # SUPABASE_URL and SUPABASE_KEY if present.
        self.archive = GalacticArchive()

    # ---------------------------------------------------------------------
    # Debate persistence
    # ---------------------------------------------------------------------
    def store_debate(self, query: str, final_answer: str, history: list) -> bool:
        """Store a completed debate.

        Returns ``True`` on success, ``False`` otherwise.
        """
        return self.archive.store_debate(query, final_answer, history)

    # ---------------------------------------------------------------------
    # Generic logging
    # ---------------------------------------------------------------------
    def log(self, level: str, message: str, source: str = "System") -> bool:
        """Write a log entry to the archive.

        ``level`` should be one of ``INFO``, ``WARN``, ``ERROR``.
        """
        return self.archive.store_log(level, message, source)

    # ---------------------------------------------------------------------
    # Retrieval helpers (future work)
    # ---------------------------------------------------------------------
    def get_recent_debates(self, limit: int = 10):
        """Placeholder for fetching recent debates.

        Currently returns an empty list – implementation will be added
        once Supabase tables are confirmed.
        """
        return []
