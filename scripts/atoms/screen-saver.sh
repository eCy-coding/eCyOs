#!/bin/bash
# Atom: screen-saver
# Description: Launches the system screensaver immediately
# Usage: atom run screen-saver

set -e

open -a ScreenSaverEngine
echo "{\"status\": \"success\", \"message\": \"Screensaver launched\"}"
