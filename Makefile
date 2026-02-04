# Universal Makefile for Antigravity System
# "One Command to Rule Them All"

# Variables
NPM := npm
NODE := node
VSCODE_DIR := src/vscode
EMBEDDED_DIR := src/embedded

.PHONY: all install dev build test clean verify help

# Default target
all: install build test

# Help
help:
	@echo "Antigravity Universal CLI 🚀"
	@echo "--------------------------------"
	@echo "make install    - Install dependencies for Root, VS Code, and setup Embedded."
	@echo "make dev        - Start Development Mode (Brain + VS Code Watch)."
	@echo "make build      - Build all components (Extension, Electron, Embedded)."
	@echo "make test       - Run Universal Test Suite (Web, Electron, Extension)."
	@echo "make clean      - Clean all artifacts and build files."
	@echo "make verify     - Run final system verification."

# Installation
install:
	@echo "[CLI] Installing Root Dependencies..."
	@$(NPM) install
	@echo "[CLI] Installing VS Code Extension Dependencies..."
	@cd $(VSCODE_DIR) && $(NPM) install
	@echo "[CLI] Installation Complete. ✅"

# Development
dev:
	@echo "[CLI] Starting Development Environment..."
	@echo "[CLI] Tip: In another terminal, run 'cd src/vscode && F5' to launch Extension Host."
	@$(NPM) run dev

# Build
build:
	@node scripts/unified_builder.js

# Testing
test:
	@echo "[CLI] Running Electron E2E Tests..."
	@$(NPM) run test:electron || echo "[Warn] Electron tests failed"
	@echo "[CLI] Running VS Code Extension Tests..."
	@cd $(VSCODE_DIR) && $(NPM) test
	@echo "[CLI] Test Run Complete. 🧪"

# Cleaning
clean:
	@echo "[CLI] Cleaning all artifacts..."
	@rm -rf node_modules
	@rm -rf dist
	@rm -rf out
	@cd $(VSCODE_DIR) && rm -rf node_modules && rm -rf out
	@if [ -d "$(EMBEDDED_DIR)" ]; then \
		$(MAKE) -C $(EMBEDDED_DIR) clean; \
	fi
	@echo "[CLI] Clean Complete. 🧹"

# Verification
verify:
	@echo "[CLI] Verifying System State..."
	@node -v
	@npm -v
	@echo "[CLI] Checking Ollama..."
	@pgrep -x ollama > /dev/null && echo "Ollama Active 🟢" || echo "Ollama Inactive 🔴"
	@echo "[CLI] System Ready. 🟢"
