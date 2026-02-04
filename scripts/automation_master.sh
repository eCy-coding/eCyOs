#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------
# eCy OS Automation Master Script (phases 13‑18)
# ------------------------------------------------------------
# 1. Install npm dependencies (if not already installed)
# 2. Build missing components for phases 13‑18
# 3. Run lint, unit tests, and Playwright E2E suite
# 4. On failure, invoke self‑healing (healer_v2.py)
# 5. Commit and push each successful phase to the archive repo
# ------------------------------------------------------------

PROJECT_ROOT="$(pwd)"
cd "$PROJECT_ROOT"

echo "🔧 Installing npm dependencies..."
npm install

# Phase 13 – Agentic Editor (already present, ensure deps)
npm install @monaco-editor/react @ai-assistant/monaco-ai

# Phase 14 – Swarm Visualizer
npm install three @react-three/fiber @react-three/drei langgraph

# Phase 15 – Artifact Panel enhancements (react-markdown, remark-gfm)
npm install react-markdown remark-gfm

# Phase 16 – Documentation Portal (MDX)
npm install @mdx-js/react

# Phase 17 – Master Portal (three, matter-js, chart.js)
npm install three @react-three/fiber @react-three/drei matter-js chart.js react-chartjs-2

# Run lint & unit tests
npm run lint
npm test

# Run Playwright E2E suite
npx playwright test || {
  echo "❗ E2E tests failed – invoking self‑healing"
  python healer_v2.py || { echo "🚨 Healing failed – aborting"; exit 1; }
  # Retry after healing
  npm run verify:e2e
}

# If everything passed, commit & push phase artifacts
git add .
git commit -m "Automation Master: phases 13‑18 completed"
git push origin main

echo "✅ Automation master script completed successfully"
