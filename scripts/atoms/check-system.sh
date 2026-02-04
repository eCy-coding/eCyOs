#!/bin/bash
# Atom: check-system
# Description: Reports system health status (Load, Disk, Memory)
# Usage: atom run check-system

set -e
export PATH="$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

# Gather Metrics
UPTIME=$(uptime | awk -F'( |,|:)+' '{print $6,$7", "$8}')
LOAD=$(sysctl -n vm.loadavg | awk '{print $2}')
DISK=$(df -h / | awk 'NR==2 {print $5}')
MEMORY=$(ps -A -o %mem | awk '{s+=$1} END {print s"%"}')

# JSON Output
echo "{\"status\": \"healthy\", \"atom\": \"check-system\", \"uptime\": \"$UPTIME\", \"load\": \"$LOAD\", \"disk_usage\": \"$DISK\", \"memory_load\": \"$MEMORY\", \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}"
