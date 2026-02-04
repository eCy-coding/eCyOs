#!/bin/bash
# Atom: img-resize
# Description: Resize an image to a specific width (maintaining aspect ratio)
# Usage: atom run img-resize <file_path> <width_px>

set -e
FILE=$1
WIDTH=$2

if [ -z "$FILE" ] || [ -z "$WIDTH" ]; then
    echo "{\"status\": \"error\", \"message\": \"Usage: img-resize <file> <width>\"}"
    exit 1
fi

if [ ! -f "$FILE" ]; then
    echo "{\"status\": \"error\", \"message\": \"File not found: $FILE\"}"
    exit 1
fi

# Resize using sips
sips -Z "$WIDTH" "$FILE" > /dev/null

echo "{\"status\": \"success\", \"message\": \"Resized $FILE to max dimension $WIDTH\"}"
