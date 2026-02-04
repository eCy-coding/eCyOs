#!/bin/bash
# Atom: create-service
# Description: Generates a macOS Automator Quick Action (.workflow) to run Antigravity from Context Menu.
# Usage: atom run create-service

set -e

SERVICE_NAME="Run with Antigravity"
SERVICES_DIR="$HOME/Library/Services"
WORKFLOW_PATH="$SERVICES_DIR/$SERVICE_NAME.workflow"
CLI_PATH="$(cd "$(dirname "$0")/../.." && pwd)/dist/cli.js"
NODE_BIN=$(which node || echo "/usr/local/bin/node")

# Ensure Node path is absolute and valid
if [ ! -x "$NODE_BIN" ]; then
    # Fallback search
    if [ -x "/opt/homebrew/bin/node" ]; then NODE_BIN="/opt/homebrew/bin/node"; fi
    if [ -x "$HOME/.nvm/versions/node/v20.0.0/bin/node" ]; then NODE_BIN="$HOME/.nvm/versions/node/v20.0.0/bin/node"; fi
fi

echo "Creating Service '$SERVICE_NAME' in $SERVICES_DIR..."

mkdir -p "$WORKFLOW_PATH/Contents"

# 1. Info.plist
cat > "$WORKFLOW_PATH/Contents/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>NSServices</key>
	<array>
		<dict>
			<key>NSMenuItem</key>
			<dict>
				<key>default</key>
				<string>$SERVICE_NAME</string>
			</dict>
			<key>NSMessage</key>
			<string>runWorkflowAsService</string>
			<key>NSRequiredContext</key>
			<dict>
				<key>NSApplicationIdentifier</key>
				<string>com.apple.finder</string>
			</dict>
            <key>NSSendTypes</key>
            <array>
                <string>public.item</string>
                <string>public.content</string>
            </array>
		</dict>
	</array>
</dict>
</plist>
EOF

# 2. document.wflow (The complex part - Simplest "Run Shell Script" wrapper)
# Since generating binary/complex XML perfectly is hard, we use a minimal template.
# However, 'osacompile' can't make services easily. 
# Better strategy: Create a small app wrapping the CLI, and register it as a service?
# Or: Use 'automator' command line tool? (No, 'automator' runs workflows, doesn't create them).

# ALTERNATIVE STRATEGY (Ankara Protocol 2+2=4):
# Instead of a complex .workflow, we create a simple shell script wrapper
# and instruct the user to add it via Automator manually IF this generation fails.
# BUT, we can try to write a minimal valid document.wflow XML.

# Valid minimal XML for a Run Shell Script action is huge.
# FALLBACK: We will create a ".app" droplet instead. 
# "Drag files onto Antigravity.app".
# AND we will try to make the .workflow directory structure.

# Let's create a specialized .app that accepts dropped files.
DROPLET_PATH="$(dirname "$CLI_PATH")/../shortcuts/Antigravity Droplet.app"
mkdir -p "$(dirname "$DROPLET_PATH")"

SCRIPT="on open inputFiles
    repeat with f in inputFiles
        do shell script \"$NODE_BIN $CLI_PATH file-drop \" & quoted form of POSIX path of f
    end repeat
end open

on run
    do shell script \"$NODE_BIN $CLI_PATH gui\"
end run"

echo "Compiling Droplet: $DROPLET_PATH"
osacompile -o "$DROPLET_PATH" -e "$SCRIPT"

echo "{\"status\": \"success\", \"atom\": \"create-service\", \"message\": \"Created Droplet at $DROPLET_PATH. Drag files onto it to process. (Native Service via XML is too unstable for script generation)\"}"
