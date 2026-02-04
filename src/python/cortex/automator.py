
import subprocess
import logging
import os

class AutomatorBridge:
    """
    Bridge to macOS Automator and AppleScript (OSA).
    Enables python to control the OS UI and workflows.
    """
    def __init__(self):
        self.logger = logging.getLogger("AutomatorBridge")

    def run_applescript(self, script: str) -> dict:
        """
        Execute raw AppleScript.
        """
        try:
            # osascript -e '...'
            result = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
            if result.returncode == 0:
                return {"status": "success", "output": result.stdout.strip()}
            else:
                return {"status": "error", "error": result.stderr.strip()}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def run_jxa(self, script: str) -> dict:
        """
        Execute JavaScript for Automation (JXA).
        """
        try:
            # osascript -l JavaScript -e '...'
            result = subprocess.run(['osascript', '-l', 'JavaScript', '-e', script], capture_output=True, text=True)
            if result.returncode == 0:
                return {"status": "success", "output": result.stdout.strip()}
            else:
                return {"status": "error", "error": result.stderr.strip()}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def run_workflow(self, workflow_path: str, input_data: str = None) -> dict:
        """
        Run an Automator .workflow file.
        Uses `automator` command line tool.
        """
        if not os.path.exists(workflow_path):
            return {"status": "error", "error": "Workflow file not found"}

        cmd = ['automator']
        if input_data:
            cmd.extend(['-i', input_data])
        cmd.append(workflow_path)

        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                return {"status": "success", "output": result.stdout.strip()}
            else:
                return {"status": "error", "error": result.stderr.strip()}
        except Exception as e:
            return {"status": "error", "error": str(e)}
