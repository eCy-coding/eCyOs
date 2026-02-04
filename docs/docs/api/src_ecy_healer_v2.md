---
title: src.ecy.healer_v2
sidebar_label: healer_v2.py
---

# src.ecy.healer_v2

No module description provided.

## Source Code
```python
# Path: src/ecy/healer_v2.py
# (See source file for full implementation)
```

## Functions & Classes

### Class: `ReflexionLoop`

Implements the "Reflexion" pattern with CONTEXT-AWARE PATCHING:
1. Detect Error
2. Extract Filename (Regex)
3. Read Content
4. Generate Patch (Ask 'How?') -> Return JSON &#123;file, search, replace&#125;
5. Apply Patch (Executor)

---
### Class: `HealerDaemon`

*No documentation.*

---
