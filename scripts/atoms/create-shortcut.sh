#!/bin/bash
# Atom: create-shortcut
# Description: Creates a native macOS .app wrapper for an atom to enable Spotlight access.
# Usage: atom run create-shortcut <atom_name> ["App Name"]

set -e

ATOM_NAME=$1
APP_NAME="${2:-$ATOM_NAME}" # Default to atom name if no app name provided

if [ -z "$ATOM_NAME" ]; then
    echo '{"status": "error", "message": "Usage: create-shortcut <atom_name> [App Name]"}'
    exit 1
fi

# Paths
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CLI_PATH="$REPO_ROOT/dist/cli.js"
OUTPUT_DIR="$REPO_ROOT/shortcuts"
mkdir -p "$OUTPUT_DIR"

APP_PATH="$OUTPUT_DIR/$APP_NAME.app"

# AppleScript Content
# We use 'do shell script' to call our CLI.
# We must source ~/.bash_profile or export PATH to find node if needed, 
# but absolute path to node is safer.
# However, for portability on this machine, we assume standard env or just absolute path to cli.

# Getting Node Path
NODE_BIN=$(which node)
if [ -z "$NODE_BIN" ]; then
    # Fallback for common locations if not in path (e.g. executed from a weird shell)
    if [ -f "/usr/local/bin/node" ]; then NODE_BIN="/usr/local/bin/node"; fi
    if [ -f "/opt/homebrew/bin/node" ]; then NODE_BIN="/opt/homebrew/bin/node"; fi
    # User specific nvm
    if [ -f "$HOME/.nvm/versions/node/v20.0.0/bin/node" ]; then NODE_BIN="$HOME/.nvm/versions/node/v20.0.0/bin/node"; fi
fi

# The AppleScript
# Note: quoting is tricky.
# We want to run: /path/to/node /path/to/cli.js atom run <atom_name>
SCRIPT="do shell script \"$NODE_BIN $CLI_PATH atom run $ATOM_NAME\""

# Compile
echo "Compiling $APP_NAME.app for atom '$ATOM_NAME'..."
osacompile -o "$APP_PATH" -e "$SCRIPT"

# Add icon if we can (Later)

echo "{\"status\": \"success\", \"atom\": \"create-shortcut\", \"app_path\": \"$APP_PATH\", \"message\": \"Created $APP_NAME.app. Move to /Applications to index in Spotlight.\"}"
