#!/bin/bash
# Atom: wifi
# Description: Controls WiFi power state
# Usage: atom run wifi [on|off]

set -e
ACTION=$1

# Detect WiFi Device (usually en0, but we try to be smart)
DEVICE=$(networksetup -listallhardwareports | grep -A 1 "Wi-Fi" | tail -n 1 | awk '{print $2}')

if [ -z "$DEVICE" ]; then
    # Fallback to en0
    DEVICE="en0"
fi

if [ "$ACTION" == "on" ]; then
    networksetup -setairportpower "$DEVICE" on
    echo "{\"status\": \"success\", \"message\": \"WiFi turned ON for $DEVICE\"}"
elif [ "$ACTION" == "off" ]; then
    networksetup -setairportpower "$DEVICE" off
    echo "{\"status\": \"success\", \"message\": \"WiFi turned OFF for $DEVICE\"}"
else
    # Status
    STATUS=$(networksetup -getairportpower "$DEVICE" | awk '{print $4}')
    echo "{\"status\": \"success\", \"device\": \"$DEVICE\", \"power\": \"$STATUS\"}"
fi
