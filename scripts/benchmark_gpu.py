
import sys
import os
import time

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../src")))

from ecy.gpu.accelerator import GPUAccelerator

def main():
    print("--- eCy OS GPU Benchmark ---")
    
    acc = GPUAccelerator()
    print(f"Device: {acc.device}")
    
    sizes = [100, 500, 1000]
    for size in sizes:
        print(f"Benchmarking Matrix Multiply ({size}x{size})...")
        try:
            duration = acc.matrix_multiply(size)
            print(f"  Time: {duration:.2f} ms")
        except Exception as e:
            print(f"  Failed: {e}")

if __name__ == "__main__":
    main()
