#!/bin/bash
# Atom: install-brain
# Description: Checks for Ollama and guides installation. Pulls the default model.

set -e

echo "🧠 Checking for Neural Engine (Ollama)..."

if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not found."
    echo "Please install Ollama from https://ollama.com/download"
    echo "After installing, run 'atom run install-brain' again."
    exit 1
fi

echo "✅ Ollama found."

MODEL="llama3"

# Check if model exists (basic check, ollama list might be better but this is simple)
echo "Downloading/Verifying model '$MODEL'..."
ollama pull $MODEL

echo "🧠 Brain is ready."
echo "{\"status\": \"success\", \"atom\": \"install-brain\", \"message\": \"Ollama and $MODEL are ready.\"}"
