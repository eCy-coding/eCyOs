
"""
GPU Accelerator Module for eCy OS.
Leverages Metal (macOS) or CUDA (Linux/Windows) via PyTorch if available.
Falls back to NumPy or pure Python.
"""
import sys
import time

try:
    import torch
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False

class GPUAccelerator:
    def __init__(self):
        self.device = self._get_device()
        print(f"[eCy GPU] Accelerator initialized on: {self.device}")

    def _get_device(self):
        if not HAS_TORCH:
            return "cpu (no torch)"
        
        if torch.backends.mps.is_available():
            return "mps"  # macOS Metal Performance Shaders
        elif torch.cuda.is_available():
            return "cuda"
        else:
            return "cpu"

    def matrix_multiply(self, size=1000):
        """Perform a matrix multiplication benchmark."""
        if not HAS_TORCH and not HAS_NUMPY:
            return self._cpu_fallback_matmul(size)

        if HAS_TORCH:
            return self._torch_matmul(size)
        else:
            return self._numpy_matmul(size)

    def _torch_matmul(self, size):
        try:
            device = torch.device(self.device)
            a = torch.randn(size, size, device=device)
            b = torch.randn(size, size, device=device)
            start = time.perf_counter()
            c = torch.matmul(a, b)
            # Synchronize for accurate timing on GPU
            if self.device == "mps":
                torch.mps.synchronize()
            elif self.device == "cuda":
                torch.cuda.synchronize()
            end = time.perf_counter()
            return (end - start) * 1000  # ms
        except Exception as e:
            print(f"[eCy GPU] Error: {e}")
            return -1

    def _numpy_matmul(self, size):
        a = np.random.rand(size, size)
        b = np.random.rand(size, size)
        start = time.perf_counter()
        c = np.dot(a, b)
        end = time.perf_counter()
        return (end - start) * 1000

    def _cpu_fallback_matmul(self, size):
        # Very slow, just for fallback demonstration
        # Reduce size to avoid hanging
        size = min(size, 100) 
        import random
        a = [[random.random() for _ in range(size)] for _ in range(size)]
        b = [[random.random() for _ in range(size)] for _ in range(size)]
        
        start = time.perf_counter()
        # Simple O(N^3) multiplication
        c = [[sum(a[i][k] * b[k][j] for k in range(size)) 
              for j in range(size)] for i in range(size)]
        end = time.perf_counter()
        return (end - start) * 1000
