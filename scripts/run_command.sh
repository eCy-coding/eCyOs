#!/usr/bin/env bash
# run_command.sh
# Ankara Protocol: Universal Perfection Standard
# Executes a command in a strictly isolated environment and returns deterministic JSON.

set -u

# Ensure we have a command
if [ $# -eq 0 ]; then
  echo '{"stdout": "", "stderr": "Error: No command provided", "code": 1}'
  exit 1
fi

CMD="$@"

# 1. Isolation: Create temporary home
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

# 2. Execution: Run in clean environment (env -i)
# Wewhitelist only PATH and TERM to ensure basic POSIX compliance without host contamination.
# We capture stdout and stderr mixed (2>&1) to ensure we get all feedback.
OUTPUT=$(env -i \
  PATH="/bin:/usr/bin:/usr/local/bin:/usr/sbin:/sbin" \
  TERM="dumb" \
  HOME="$TMPDIR" \
  /opt/homebrew/bin/timeout 10s bash -c "$CMD" 2>&1) || EXIT_CODE=$?

EXIT_CODE=${EXIT_CODE:-0}

# 3. Output: Strict JSON generation
# Using python3 for reliable JSON string escaping.
# This ensures that even binary data or quotes in output don't break the JSON structure.
JSON_OUTPUT=$(python3 -c '
import json, sys, os
try:
    stdout_content = sys.argv[1]
    exit_code = int(sys.argv[2])
    print(json.dumps({"stdout": stdout_content, "stderr": "", "code": exit_code}))
except Exception as e:
    # Fallback for catastrophic failure
    print(json.dumps({"stdout": "", "stderr": str(e), "code": 1}))
' "$OUTPUT" "$EXIT_CODE")

echo "$JSON_OUTPUT"

