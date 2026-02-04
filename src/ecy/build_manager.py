// build_manager.py – orchestrates end‑to‑end build, test, and deployment for eCy OS
import subprocess
import sys
import os
from pathlib import Path

def run_cmd(command, cwd=None, env=None):
    result = subprocess.run(command, shell=True, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    print(result.stdout)
    return result.returncode

def main():
    # 1. Run backend tests
    print("Running backend tests (pytest)...")
    if run_cmd("pytest") != 0:
        print("Backend tests failed. Invoking healer_v2.py...")
        run_cmd("python src/ecy/healer_v2.py")
        sys.exit(1)
    # 2. Run frontend tests
    print("Running frontend tests (npm test)...")
    if run_cmd("npm test --silent") != 0:
        print("Frontend tests failed. Invoking healer_v2.py...")
        run_cmd("python src/ecy/healer_v2.py")
        sys.exit(1)
    # 3. Build frontend
    print("Building frontend (npm run build)...")
    if run_cmd("npm run build") != 0:
        print("Build failed. Invoking healer_v2.py...")
        run_cmd("python src/ecy/healer_v2.py")
        sys.exit(1)
    # 4. Package artifacts
    dist_path = Path("dist")
    archive = Path("build") / f"ecy_os_build_{os.getenv('GITHUB_SHA','dev')}.zip"
    print(f"Packaging build into {archive}...")
    run_cmd(f"zip -r {archive} {dist_path}")
    print("Build and packaging completed successfully.")

if __name__ == "__main__":
    main()
