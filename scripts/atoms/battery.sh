#!/bin/bash
# Atom: battery
# Description: Checks battery status and power source
# Usage: atom run battery

set -e

# Get info
SOURCE=$(pmset -g batt | head -n 1 | cut -d "'" -f 2)
# Parsing second line like: " -InternalBattery-0 (id=...): 100%; charged; 0:00 remaining present: true"
DETAILS=$(pmset -g batt | tail -n 1 | perl -ne 'print "$1" if /(\d+%);/')
STATE=$(pmset -g batt | tail -n 1 | perl -ne 'print "$1" if /; (\w+);/')

echo "{\"status\": \"success\", \"power_source\": \"$SOURCE\", \"percentage\": \"$DETAILS\", \"state\": \"$STATE\"}"
