import os
import subprocess
import datetime
import logging
from typing import Optional

# Setup local logging for archive actions
logging.basicConfig(level=logging.INFO, format='[GalacticArchive] %(message)s')

class GalacticArchive:
    """
    Automated Git Archival System for eCy OS.
    Executes 'Liquid Glass' commits: Atomic, Descriptive, and Immediate.
    """

    def __init__(self, repo_path: str = "."):
        self.repo_path = repo_path
        self._ensure_git_initialized()

    def _ensure_git_initialized(self):
        if not os.path.exists(os.path.join(self.repo_path, ".git")):
            logging.warning("Git not initialized. Initializing...")
            self._run_git(["init"])

    def _run_git(self, args: list) -> str:
        try:
            result = subprocess.run(
                ["git"] + args,
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                check=False
            )
            if result.returncode != 0:
                logging.error(f"Git Error ({args}): {result.stderr.strip()}")
            return result.stdout.strip()
        except Exception as e:
            logging.error(f"Subprocess Error: {e}")
            return ""

    def snapshot(self, message: str, author: str = "eCy OS <archivist@ecy.os>"):
        """
        Creates an atomic commit of the current state.
        Format: [LIQUID GLASS] <Timestamp> - <Message>
        """
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        commit_msg = f"[LIQUID GLASS] {timestamp} - {message}"
        
        logging.info(f"Archiving state: {message}")
        
        # 1. Add all changes
        self._run_git(["add", "."])
        
        # 2. Commit
        # Note: 'author' flag might need config, using -m for simplicity first env
        output = self._run_git(["commit", "-m", commit_msg])
        
        if "clean" in output:
            logging.info("Nothing to archive (Clean tree).")
        else:
            logging.info(f"Snapshot secured: {output}")

    def sync_to_cloud(self, remote_name: str = "origin", branch: str = "main"):
        """
        Pushes local archives to the Galactic Core (GitHub).
        """
        logging.info(f"Beaming to Galactic Core ({remote_name}/{branch})...")
        output = self._run_git(["push", remote_name, branch])
        if "error" in output.lower() or "fatal" in output.lower():
             logging.error(f"Transmission failed: {output}")
        else:
             logging.info("Transmission successful.")

if __name__ == "__main__":
    # Test
    archive = GalacticArchive()
    archive.snapshot("Manual test of Galactic Archive")
