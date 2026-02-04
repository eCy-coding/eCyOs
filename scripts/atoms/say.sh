#!/bin/bash
# Atom: say
# Description: Speak text using macOS TTS
# Usage: atom run say "Text to speak"

set -e
TEXT=$1

if [ -z "$TEXT" ]; then
    echo "{\"status\": \"error\", \"message\": \"Text required\"}"
    exit 1
fi

say "$TEXT"
echo "{\"status\": \"success\", \"message\": \"Spoken: $TEXT\"}"
