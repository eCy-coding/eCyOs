#!/bin/bash
# Atom: clipboard
# Description: Manage system clipboard
# Usage: atom run clipboard [show|clear|copy <text>]

set -e
ACTION=$1
DATA="${@:2}" # Everything after $1

if [ "$ACTION" == "clear" ]; then
    pbcopy < /dev/null
    echo "{\"status\": \"success\", \"message\": \"Clipboard cleared\"}"
elif [ "$ACTION" == "show" ]; then
    CONTENT=$(pbpaste)
    # JSON safe output is tricky with raw arbitrary text in bash without standard tools like python/node for escaping
    # We will use jq to encapsulate safely
    echo "{\"status\": \"success\", \"content\": $(jq -n --arg v "$CONTENT" '$v')}"
elif [ "$ACTION" == "copy" ]; then
    echo -n "$DATA" | pbcopy
    echo "{\"status\": \"success\", \"message\": \"Copied to clipboard\"}"
else
    echo "{\"status\": \"error\", \"message\": \"Unknown action\"}"
fi
