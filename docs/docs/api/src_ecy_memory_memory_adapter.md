---
title: src.ecy.memory.memory_adapter
sidebar_label: memory_adapter.py
---

# src.ecy.memory.memory_adapter

No module description provided.

## Source Code
```python
# Path: src/ecy/memory/memory_adapter.py
# (See source file for full implementation)
```

## Functions & Classes

### Class: `MemoryAdapter`

High‑level interface for persistent storage used by eCy OS.

It delegates to :class:`GalacticArchive` which handles the actual
Supabase connection or falls back to local JSON logging when the
service is unavailable.

---
