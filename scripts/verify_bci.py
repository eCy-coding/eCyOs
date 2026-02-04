# scripts/verify_bci.py
"""Verification script for the Bio‑Digital Interface (BCI) module.
It instantiates the BCI class, starts a short acquisition (mock mode), and
prints the collected data summary.
"""

import sys
import os

# Ensure project root is on PYTHONPATH
sys.path.append(os.getcwd())

from src.ecy.senses.bci import BCI

def verify_bci():
    print("--- Testing BCI Module ---")
    bci = BCI()
    print(bci)
    # Acquire 2 seconds of data (mock mode will generate synthetic data)
    bci.start(duration_sec=2)
    data = bci.get_data()
    print(f"Data points collected: {len(data)}")
    # Simple sanity check: data should not be empty and timestamps should be increasing
    assert data, "No data collected"
    timestamps = [t for t, _ in data]
    assert all(earlier <= later for earlier, later in zip(timestamps, timestamps[1:])), "Timestamps not monotonic"
    print("✅ BCI verification passed.")

if __name__ == "__main__":
    try:
        verify_bci()
    except Exception as e:
        print(f"❌ BCI verification failed: {e}")
        raise
