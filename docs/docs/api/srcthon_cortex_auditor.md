---
title: srcthon.cortex.auditor
sidebar_label: auditor.py
---

# srcthon.cortex.auditor

Code Auditor module for Antigravity Cortex.

Scans the codebase for violations of Global Coding Standards (2025).
- Google TS: No 'any'.
- Airbnb JS: No 'var'.

## Source Code
```python
# Path: src/python/cortex/auditor.py
# (See source file for full implementation)
```

## Functions & Classes

### Function: `audit_directory`

Recursively scans a directory for TS/JS files and checks rules.

Args:
    path: The root directory to scan.
    
Returns:
    Structured report of violations.

---
### Function: `scan_file`

Scans a single file against defined Rules.

---
