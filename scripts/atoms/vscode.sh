#!/bin/bash
# Atom: vscode
# Description: Bridge to VS Code CLI (code).
# Usage: atom run vscode [open|new-window] [path]

set -e

COMMAND=$1
TARGET=${2:-"."}

# Helper to find 'code' binary if not in PATH
if ! command -v code &> /dev/null; then
    if [ -f "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" ]; then
        export PATH="$PATH:/Applications/Visual Studio Code.app/Contents/Resources/app/bin"
    elif [ -f "/usr/local/bin/code" ]; then
        # It should be in path, but explicit check
        :
    else
        echo "{\"status\": \"error\", \"message\": \"VS Code CLI 'code' not found. Please install 'code' command in PATH.\"}"
        exit 1
    fi
fi

case "$COMMAND" in
    open)
        code "$TARGET"
        echo "{\"status\": \"success\", \"message\": \"Opened VS Code at $TARGET\"}"
        ;;
    new-window)
        code -n "$TARGET"
        echo "{\"status\": \"success\", \"message\": \"Opened new VS Code window at $TARGET\"}"
        ;;
    *)
        echo "{\"status\": \"error\", \"message\": \"Unknown command: $COMMAND. Usage: atom run vscode [open|new-window] [path]\"}"
        exit 1
        ;;
esac
