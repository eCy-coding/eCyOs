#!/usr/bin/env bash
# scripts/interactive_bridge.sh
# Ankara Protocol: Interactive Overlay
# Uses native macOS AppleScript events to create a "Zero Dependency" GUI.

set -u
project_dir=$(dirname "$(dirname "$(realpath "$0")")")
cli_path="$project_dir/dist/cli.js"

# Helper: Show Dialog
ask_user() {
  osascript -e 'Tell application "System Events" to display dialog "Ankara Protocol Terminal:\nEnter Command or Question:" default answer "ask Türkiye'\''nin başkenti neresidir?" with title "eCy-antigravity" buttons {"Cancel", "Run"} default button "Run" with icon note' -e 'text returned of result' 2>/dev/null
}

# Helper: Show Result
show_result() {
  local content="$1"
  # Escape quotes for AppleScript
  local safe_content=$(echo "$content" | sed 's/"/\\"/g' | sed "s/'/\\'/g")
  osascript -e 'Tell application "System Events" to display dialog "'"${safe_content:0:500}"'..." with title "Execution Result" buttons {"OK"}' >/dev/null
}

# Helper: Show JSON Result (Parsed for formatting)
show_json_result() {
  local json="$1"
  # Extract fields using python to avoid jq dependency (Ankara Protocol Rule: Minimal Dependencies)
  local stdout=$(echo "$json" | python3 -c "import sys, json; print(json.load(sys.stdin).get('stdout', ''))")
  local stderr=$(echo "$json" | python3 -c "import sys, json; print(json.load(sys.stdin).get('stderr', ''))")
  local code=$(echo "$json" | python3 -c "import sys, json; print(json.load(sys.stdin).get('code', 0))")
  
  if [ "$code" -eq 0 ]; then
    osascript -e "display dialog \"SUCCESS\n\n$stdout\" with title \"Ankara Protocol: Success\" buttons {\"OK\"} with icon note" >/dev/null
  else
    osascript -e "display alert \"FAILURE (Code $code)\" message \"$stderr\" as critical" >/dev/null
  fi
}

# Main Loop
while true; do
  cmd=$(ask_user)
  
  if [ -z "$cmd" ]; then
    echo "User cancelled."
    exit 0
  fi

  echo "Executing: $cmd"
  
  # Run via Safe CLI
  # We use --json to guarantee we can parse the result safely
  output=$(node "$cli_path" --json "$cmd")
  
  # Show result in GUI
  show_json_result "$output"
done
