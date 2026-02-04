#!/usr/bin/env bash
set -euo pipefail

# -------------------------------------------------
# eCy OS Full Automated Build & Verification Script
# -------------------------------------------------
# 1. Environment checks
if [[ -z "${SUPABASE_URL:-}" ]] || [[ -z "${SUPABASE_KEY:-}" ]]; then
  echo "[WARN] Supabase env vars not set – memory will fallback to local JSON."
fi

# 2. Activate virtual environment
VENV="$(pwd)/venv"
if [[ ! -d "$VENV" ]]; then
  echo "[INFO] Creating virtual environment..."
  python3 -m venv "$VENV"
fi
source "$VENV/bin/activate"

# 3. Ensure required Python packages
pip install -U pip setuptools wheel
pip install -r requirements.txt || true
pip install aiofiles pydantic supabase openai sympy pytest

# 4. Run unit tests for Hive Mind & Memory Core
echo "[INFO] Running Hive Mind tests..."
pytest -q tests/hive_test.py

echo "[INFO] Running Memory Core tests..."
pytest -q tests/memory_test.py

# 5. Build the Vite React portal
cd website
npm ci
npm run build
cd ..

# 6. Start the dev server (background) for e2e checks
npm run dev -- --host &
DEV_PID=$!
# Give it a moment to start
sleep 5

# 7. Run Playwright e2e tests (install if needed)
if ! command -v npx >/dev/null; then
  echo "[ERROR] npx not found – cannot run Playwright"
  exit 1
fi
npm i -D @playwright/test
npx playwright install
npx playwright test tests/e2e_portal.spec.ts || {
  echo "[FAIL] Playwright tests failed – invoking healer"
  python - <<'PY'
import subprocess, sys
subprocess.run([sys.executable, 'src/ecy/healer_v2.py'])
PY
  exit 1
}

# 8. Stop dev server
kill $DEV_PID || true

# 9. Deploy to GitHub Pages (CI will also run on push)
git add .
git commit -m "Automated full build & verification" || true
git push

# 10. Archive release (optional)
if [[ -x "./scripts/archive.sh" ]]; then
  ./scripts/archive.sh
fi

echo "[SUCCESS] Full e2e build, verification, and deployment completed."
