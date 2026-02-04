#!/bin/bash
# Atom: deploy-maestro
# Created: 2026-01-11T18:20:05.794Z
# Description: <Add Description>

set -e # Exit on error
set -u # Treat unset vars as error

# --- Logic ---
# Usage: orchestra atom run deploy-maestro "App Name" "Command to Run"

APP_NAME="${1:-}"
COMMAND="${2:-}"

if [ -z "$APP_NAME" ] || [ -z "$COMMAND" ]; then
    echo '{"status": "error", "message": "Usage: deploy-maestro <AppName> <Command>"}'
    exit 1
fi

PROJECT_ROOT="$(pwd)"
TEMPLATE_PATH="$PROJECT_ROOT/scripts/wrappers/maestro_bridge.js"
APPS_DIR="$PROJECT_ROOT/dist/apps"
mkdir -p "$APPS_DIR"

TARGET_APP="$APPS_DIR/$APP_NAME.app"
TEMP_SCRIPT="/tmp/maestro_temp_$$.js"

# Read Template
if [ ! -f "$TEMPLATE_PATH" ]; then
    echo "{\"status\": \"error\", \"message\": \"Template not found at $TEMPLATE_PATH\"}"
    exit 1
fi

# Inject Command (Escape double quotes in command)
# We use sed to replace COMMAND_PLACEHOLDER
# Note: This is simple replacement, might be fragile with complex quotes.
# Better: Use a JS script to do the replacement if available, or careful sed.
ESCAPED_COMMAND=$(echo "$COMMAND" | sed 's/"/\\"/g')
sed "s|COMMAND_PLACEHOLDER|$ESCAPED_COMMAND|g" "$TEMPLATE_PATH" > "$TEMP_SCRIPT"

# Compile
# osacompile -l JavaScript -o "Target.app" "source.js"
osacompile -l JavaScript -o "$TARGET_APP" "$TEMP_SCRIPT"

# Cleanup
rm "$TEMP_SCRIPT"

echo "{\"status\": \"success\", \"atom\": \"deploy-maestro\", \"message\": \"Created $TARGET_APP\", \"path\": \"$TARGET_APP\"}"
