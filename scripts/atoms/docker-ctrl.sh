#!/bin/bash
# Atom: docker-ctrl
# Description: Simple bridge for Docker operations
# Usage: atom run docker-ctrl [up|down|status]

set -e

COMMAND=$1

# Ensure robust PATH for non-interactive shells
export PATH="$PATH:/usr/local/bin:/opt/homebrew/bin"

# Check for docker
if ! command -v docker &> /dev/null; then
     echo "{\"status\": \"error\", \"message\": \"Docker command not found.\"}"
     exit 1
fi

case "$COMMAND" in
    status)
        # JSON output of running containers
        docker ps --format '{{json .}}' | jq -s '.' > /tmp/docker_status.json
        COUNT=$(docker ps -q | wc -l | xargs)
        echo "{\"status\": \"success\", \"running_containers\": $COUNT, \"details_file\": \"/tmp/docker_status.json\"}"
        ;;
    up)
        # Assumes docker-compose in current directory or specific logic
        # For '2+2=4' generally we want to just check if docker is running
        if docker info >/dev/null 2>&1; then
             echo "{\"status\": \"success\", \"message\": \"Docker Daemon is running.\"}"
        else
             echo "{\"status\": \"error\", \"message\": \"Docker Daemon is NOT running. Please start Docker Desktop.\"}"
             open -a Docker
        fi
        ;;
    *)
        echo "{\"status\": \"error\", \"message\": \"Unknown command: $COMMAND\"}"
        exit 1
        ;;
esac
