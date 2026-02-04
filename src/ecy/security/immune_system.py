import subprocess
import json
import os
import datetime
import re
from typing import Dict, Any, List

class ImmuneSystem:
    """
    eCy OS Cyber-Defense Module.
    Wraps 'bandit' (SAST) and 'safety' (Dependency Scanning) for autonomous self-checks.
    """

    def __init__(self, target_dir: str = "."):
        self.target_dir = target_dir

    def _run_tool(self, cmd: List[str]) -> Dict[str, Any]:
        """
        Executes a CLI security tool and captures JSON output.
        """
        try:
            # Run command, capture stdout/stderr
            print(f"[Debug] Executing: {' '.join(cmd)}")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=False  # Security tools often exit 1 on finding issues
            )
            
            return {
                "exit_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "timestamp": datetime.datetime.now().isoformat()
            }
        except Exception as e:
            return {"error": str(e)}

    def scan_dependencies(self) -> Dict[str, Any]:
        """
        Runs 'safety check' to find vulnerable Python dependencies.
        """
        print("[ImmuneSystem] Scanning Dependencies with Safety...")
        # Note: Safety output parsing varies by version; using text mode for broad compat
        cmd = ["safety", "check", "--full-report"]
        return self._run_tool(cmd)

    def scan_codebase(self) -> Dict[str, Any]:
        """
        Runs 'bandit' to find security issues in Python source code.
        Targeting recursive scan of the project.
        """
        print("[ImmuneSystem] Scanning Codebase with Bandit...")
        # -r for recursive, -f json for machine readable
        cmd = ["bandit", "-r", self.target_dir, "-f", "json"]
        
        raw_result = self._run_tool(cmd)
        
        try:
            # Clean output: Find first '{'
            stdout = raw_result.get("stdout", "")
            json_start = stdout.find('{')
            
            if json_start != -1:
                clean_json = stdout[json_start:]
                scan_data = json.loads(clean_json)
                return {"status": "success", "metrics": scan_data.get("metrics"), "issues": scan_data.get("results")}
            else:
                return {"status": "empty", "raw": stdout}
                
        except json.JSONDecodeError:
            return {"status": "parse_error", "raw": stdout}

    def analyze_health(self):
        """
        Aggregates scans and provides a Health Report.
        """
        print("\n--- eCy OS Immune System Report ---")
        
        # 1. Dependency Check
        dep_scan = self.scan_dependencies()
        if dep_scan.get("exit_code", 0) == 0:
             print("✅ Dependencies: Secure")
        else:
             print("⚠️ Dependencies: Vulnerabilities Found (or Scan Error)")

        # 2. Codebase Check
        code_scan = self.scan_codebase()
        if code_scan.get("status") == "success":
            issues = code_scan.get("issues", [])
            high_sev = [i for i in issues if i.get("issue_severity") == "HIGH"]
            
            if high_sev:
                print(f"❌ Codebase: {len(high_sev)} HIGH Severity Issues Found.")
                for i in high_sev[:3]:
                    print(f"   - {i.get('issue_text')} ({i.get('filename')})")
            elif issues:
                print(f"⚠️ Codebase: {len(issues)} Issues Found (Low/Medium).")
                for i in issues[:3]:
                    print(f"   - [{i.get('issue_severity')}] {i.get('issue_text')} ({i.get('filename')})")
            else:
                print("✅ Codebase: Clean.")
        else:
            print("❓ Codebase: Scan Failed to Parse.")
            
        print("-----------------------------------")

if __name__ == "__main__":
    # Test
    immune = ImmuneSystem(target_dir="src")
    immune.analyze_health()
