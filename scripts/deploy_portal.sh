
#!/bin/bash
set -e

echo "[Deploy] Building eCy OS Portal (v1005.0)..."
cd website
npm install
npm run build

echo "[Deploy] Build complete. Artifacts in website/dist/"
echo "[Deploy] Ready for Vercel upload."

# Optional: Preview
# npm run preview
