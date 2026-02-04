---
title: srcthon.cortex.math_ops
sidebar_label: math_ops.py
---

# srcthon.cortex.math_ops

Mathematical operations module for the Cortex.

Designed to handle heavy computational tasks that are inefficient in Node.js.

## Source Code
```python
# Path: src/python/cortex/math_ops.py
# (See source file for full implementation)
```

## Functions & Classes

### Function: `perform_heavy_calc`

Calculates the determinant or specific property of a matrix.

For this MVP, we simulate a heavy calculation by summing elements
to demonstrate valid E2E integration without requiring immediate 
compilation of C-extensions (NumPy) in the CI environment if dependencies fail.

Args:
    matrix: A 2D list of floats.
    
Returns:
    A dictionary with the calculation result.

---
