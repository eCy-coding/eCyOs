
#!/usr/bin/env python3
import os
import sys
import subprocess
import yaml
from pathlib import Path

POLICY_PATH = Path(__file__).resolve().parent / "policy.yaml"

def load_policy():
    with open(POLICY_PATH, "r") as f:
        return yaml.safe_load(f)

def is_allowed(cmd: str, policy: dict) -> bool:
    base = cmd.split()[0]
    return base in policy.get("privileged_commands", [])

def run_privileged(cmd: str):
    if sys.platform.startswith("darwin"):
        script = f'''
        osascript -e 'do shell script "{cmd}" with administrator privileges'
        '''
        subprocess.run(script, shell=True, check=False)
    else:
        subprocess.run(["sudo"] + cmd.split(), check=False)

def main():
    if len(sys.argv) < 2:
        print("Usage: ecy sudo <command>")
        sys.exit(1)

    cmd = " ".join(sys.argv[1:])
    policy = load_policy()

    if not is_allowed(cmd, policy):
        print(f"[ecy sudo] ERROR: Command '{cmd}' is NOT allowed by policy.")
        sys.exit(1)

    print(f"[ecy sudo] Executing privileged command: {cmd}")
    run_privileged(cmd)

if __name__ == "__main__":
    main()
