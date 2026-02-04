#!/bin/bash
# Atom: new-task
# Created: 2026-01-11T18:15:08.590Z
# Description: <Add Description>

set -e # Exit on error
set -u # Treat unset vars as error

# --- Logic ---
TARGET_FILE="$(pwd)/TASK_DRAFT.md"

cat <<EOF > "$TARGET_FILE"
# Ankara Task Specification
<!-- Fill this out to ensure maximum efficiency -->

### 1. Goal 🎯
[Brief, single-sentence objective]

### 2. Context 📂
**Target Files:**
- 
**Reference Files:**
- 

### 3. Constraints 🚧
- [ ] Strict TypeScript
- [ ] No external deps
- [ ] JSON Output only

### 4. Steps 👣
1. 
2. 
3. 
EOF

echo "{\"status\": \"success\", \"atom\": \"new-task\", \"message\": \"Template created at $TARGET_FILE\"}"
