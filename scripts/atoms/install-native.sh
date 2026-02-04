#!/bin/bash
# Atom: install-native
# Description: Installs Native Integrations (LaunchAgent & Zsh Completion).
# Usage: atom run install-native

set -e

# 1. Install LaunchAgent
PLIST_SRC="$(cd "$(dirname "$0")/../../src/native" && pwd)/com.antigravity.pulse.plist"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
DEST_PLIST="$LAUNCH_AGENTS_DIR/com.antigravity.pulse.plist"

echo "Installing LaunchAgent..."
mkdir -p "$LAUNCH_AGENTS_DIR"
cp "$PLIST_SRC" "$DEST_PLIST"

# Unload if exists (to reload)
if launchctl list | grep -q "com.antigravity.pulse"; then
    launchctl unload "$DEST_PLIST" 2>/dev/null || true
fi

launchctl load "$DEST_PLIST"
echo "LaunchAgent loaded: com.antigravity.pulse"

# 2. Install Zsh Completion
COMPLETION_SCRIPT="$(cd "$(dirname "$0")/../zsh" && pwd)/completion.zsh"
ZSHRC="$HOME/.zshrc"

echo "Installing Zsh Completion..."
if grep -q "source.*antigravity.*completion.zsh" "$ZSHRC"; then
    echo "Zsh completion already installed in $ZSHRC"
else
    echo "" >> "$ZSHRC"
    echo "# Antigravity Completion" >> "$ZSHRC"
    echo "source \"$COMPLETION_SCRIPT\"" >> "$ZSHRC"
    echo "Added completion to $ZSHRC"
fi

echo "{\"status\": \"success\", \"atom\": \"install-native\", \"message\": \"Native integrations installed. Please restart your terminal for completion to take effect.\"}"
