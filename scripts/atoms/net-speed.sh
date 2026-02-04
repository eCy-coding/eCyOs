#!/bin/bash
# Atom: net-speed
# Description: Measures internet download/upload capacity using macOS native 'networkQuality'
# Usage: atom run net-speed

set -e

if ! command -v networkQuality &> /dev/null; then
    echo "{\"status\": \"error\", \"message\": \"networkQuality not found (macOS Monterey+ required)\"}"
    exit 1
fi

echo "Running network quality test... (this may take a moment)" >&2

# Run networkQuality and parse output
# -c means computer readable JSON
OUTPUT=$(networkQuality -c)

# echo raw JSON
echo "$OUTPUT"
