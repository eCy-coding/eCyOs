---
title: srcthon.cortex.corrector
sidebar_label: corrector.py
---

# srcthon.cortex.corrector

Auto-Corrector module for Antigravity Cortex.

PROGRAMMATICALLY fixes violations found by the Auditor.
- Replaces 'var' with 'let'.
- Comments out 'console.log'.
- Replaces ': any' with ': unknown' (Conservative).

## Source Code
```python
# Path: src/python/cortex/corrector.py
# (See source file for full implementation)
```

## Functions & Classes

### Function: `apply_fixes`

Scans and fixes files in the directory.

Args:
    path: Root directory to scan.
    
Returns:
    Report of fixed violations.

---
### Function: `fix_file`

Reads, patches, and writes a single file.

---
