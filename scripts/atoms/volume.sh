#!/bin/bash
# Atom: volume
# Description: Set system output volume (0-100)
# Usage: atom run volume [0-100]

set -e
VOL=$1

if [ -z "$VOL" ]; then
    echo "{\"status\": \"error\", \"message\": \"Volume level (0-100) required\"}"
    exit 1
fi

osascript -e "set volume output volume $VOL"
echo "{\"status\": \"success\", \"volume\": \"$VOL\"}"
