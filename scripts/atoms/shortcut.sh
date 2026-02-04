#!/bin/bash
# Atom: shortcut
# Description: Wrapper for native 'shortcuts' command
# Usage: atom run shortcut [run|list] [name]

set -e

COMMAND=$1
NAME=$2

if ! command -v shortcuts &> /dev/null; then
     echo "{\"status\": \"error\", \"message\": \"'shortcuts' command not found. macOS Monterey+ required.\"}"
     exit 1
fi

case "$COMMAND" in
    list)
        LIST=$(shortcuts list)
        # Convert newline list to JSON array safely
        JSON_LIST=$(echo "$LIST" | jq -R -s -c 'split("\n")[:-1]')
        echo "{\"status\": \"success\", \"shortcuts\": $JSON_LIST}"
        ;;
    run)
        if [ -z "$NAME" ]; then
            echo "{\"status\": \"error\", \"message\": \"Shortcut name required\"}"
            exit 1
        fi
        shortcuts run "$NAME"
        echo "{\"status\": \"success\", \"message\": \"Ran shortcut: $NAME\"}"
        ;;
    *)
        echo "{\"status\": \"error\", \"message\": \"Unknown command: $COMMAND\"}"
        exit 1
        ;;
esac
