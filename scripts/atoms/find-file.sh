#!/bin/bash
# Atom: find-file
# Description: Ultra-fast file search using native 'mdfind' (Spotlight index)
# Usage: atom run find-file <query>

set -e
QUERY=$1

if [ -z "$QUERY" ]; then
    echo "{\"status\": \"error\", \"message\": \"Query required\"}"
    exit 1
fi

# Find top 10 matches
RESULTS=$(mdfind -name "$QUERY" | head -n 10)

# JSONify
JSON_LIST=$(echo "$RESULTS" | jq -R -s -c 'split("\n")[:-1]')

echo "{\"status\": \"success\", \"query\": \"$QUERY\", \"results\": $JSON_LIST}"
