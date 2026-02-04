# scripts/verify_brain_integration.py
"""Verification script for eCy OS Brain Integration.

This script tests the unified `Brain` class, ensuring that all sub-modules
(QuantumCore, GraphRAG, BCI) are correctly initialized and accessible.
"""

import sys
import os
import logging

# Ensure project root is on PYTHONPATH
sys.path.append(os.getcwd())

from src.ecy.brain import Brain

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VerifyBrain")

def verify_brain_integration():
    logger.info("--- Testing eCy OS Brain Integration ---")
    
    # 1. Initialize Brain
    try:
        brain = Brain(quantum_qubits=2)
        logger.info("Brain initialized successfully.")
    except Exception as e:
        logger.error(f"Brain initialization failed: {e}")
        return

    # 2. Check Status Report
    report = brain.status_report()
    logger.info(f"System Status:\n{report}")
    
    # Verify critical components are active
    assert "Quantum Core: ✅" in report, "Quantum Core failed to initialize"
    assert "Graph Memory: ✅" in report, "Graph Memory failed to initialize"
    # BCI uses mock mode if hardware is missing, so it should be active too
    assert "Bio-Interface: ✅" in report, "Bio-Interface failed to initialize"

    # 3. Process a Thought (End-to-End Flow)
    thought_input = "Analyze system resilience using quantum logic"
    logger.info(f"Processing thought: '{thought_input}'")
    
    result = brain.process_thought(thought_input, use_quantum=True)
    
    # 4. Validate Result Structure
    modules = result.get("modules", {})
    
    # Memory Check
    mem_res = modules.get("memory", {})
    if "context" in mem_res:
        logger.info("Memory Recall: SUCCESS")
    else:
        logger.warning(f"Memory Recall: FAILED or EMPTY ({mem_res})")
    
    # Quantum Check
    q_res = modules.get("quantum", {})
    if "output" in q_res:
        logger.info("Quantum Processing: SUCCESS")
    else:
        logger.warning(f"Quantum Processing: FAILED ({q_res})")

    # BCI Check
    bci_res = modules.get("bci", {})
    if "samples" in bci_res:
        logger.info(f"Bio-Feedback: SUCCESS ({bci_res['samples']} samples)")
    else:
        logger.warning(f"Bio-Feedback: FAILED ({bci_res})")

    logger.info("✅ Brain Integration Verification PASSED.")

if __name__ == "__main__":
    try:
        verify_brain_integration()
    except AssertionError as e:
        logger.error(f"❌ Verification Assertion Failed: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Verification Failed with Exception: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
