---
title: srcthon.main
sidebar_label: main.py
---

# srcthon.main

Antigravity Python Cortex Entry Point.

This module acts as the bridge between the Electron/Node.js orchestrator
and the Python computational layer. It reads JSON commands from stdin
and writes JSON responses to stdout.

Copyright 2026 Antigravity Project.

## Source Code
```python
# Path: src/python/main.py
# (See source file for full implementation)
```

## Functions & Classes

### Function: `process_command`

Processes a single command from the orchestrator.

Args:
    command: A dictionary containing 'action' and 'payload'.

Returns:
    A dictionary containing 'status', 'result', or 'error'.

---
### Function: `main`

Main event loop listening on stdin.

---
