#!/bin/bash
# Atom: morning-brief
# Description: Generates a daily briefing (Weather + Reminders)
# Usage: atom run morning-brief

set -e
CLI="node ./dist/cli.js"

echo "Good morning, Commander."
echo "Here is your briefing:"
echo "--------------------------"

# 1. Weather
# Try running a "Weather" shortcut if it exists, otherwise curl wttr.in
if ./scripts/atoms/shortcut.sh list | grep -q "Weather"; then
    ./scripts/atoms/shortcut.sh run "Weather"
else
    # Fallback to simple console weather
    echo "Weather (Istanbul):"
    curl -s "wttr.in/Istanbul?format=3" || echo "Weather unavailable."
fi

echo ""
echo "--------------------------"

# 2. Reminders
echo "Pending Tasks:"
$CLI atom run reminders list | jq -r '.reminders[]' 2>/dev/null || echo "No reminders available."

echo "--------------------------"
echo "System Status:"
$CLI atom run check-system | jq -r '. | "Load: " + .load + " | Mem: " + .memory_load'

echo ""
echo "Ready to evolve."
