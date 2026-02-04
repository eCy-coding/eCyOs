#!/bin/bash
# Atom: dock-ctrl
# Description: Control macOS Dock position and state
# Usage: atom run dock-ctrl [left|bottom|right|restart]

set -e
ACTION=$1

if [ "$ACTION" == "restart" ]; then
    killall Dock
    echo "{\"status\": \"success\", \"message\": \"Dock restarted\"}"
    exit 0
fi

if [[ "$ACTION" =~ ^(left|bottom|right)$ ]]; then
    defaults write com.apple.dock orientation -string "$ACTION"
    killall Dock
    echo "{\"status\": \"success\", \"message\": \"Dock moved to $ACTION\"}"
    exit 0
fi

echo "{\"status\": \"error\", \"message\": \"Usage: dock-ctrl [left|bottom|right|restart]\"}"
exit 1
