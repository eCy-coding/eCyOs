#!/usr/bin/env bash

# Performance optimisation utilities for eCy OS

# 1. Python profiling with pyinstrument
# Usage: ./scripts/performance.sh py <script.py>
if [ "$1" == "py" ]; then
  shift
  pyinstrument "$@" | tee pyprofile.txt
  exit 0
fi

# 2. Node.js profiling (Vite build)
# Usage: ./scripts/performance.sh node
if [ "$1" == "node" ]; then
  npm run build --profile > nodeprofile.txt
  echo "Node build profile saved to nodeprofile.txt"
  exit 0
fi

# 3. Tailwind JIT size check
# Usage: ./scripts/performance.sh tailwind
if [ "$1" == "tailwind" ]; then
  npx tailwindcss -i ./src/index.css -o ./dist/tailwind.css --minify --jit
  echo "Tailwind JIT output generated at ./dist/tailwind.css"
  wc -c < ./dist/tailwind.css
  exit 0
fi

# Default help
cat <<EOF
Usage: $0 <command> [args]
Commands:
  py <script.py>   Profile a Python script with pyinstrument
  node             Profile Vite build (npm run build --profile)
  tailwind         Generate minified Tailwind JIT CSS and show size
EOF
