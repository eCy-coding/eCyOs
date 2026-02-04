# src/ecy/brain.py
"""Central 'Brain' Façade for eCy OS.

This module unifies the high‑level cognitive functions of the system, integrating:
- Quantum Intelligence (QuantumCore) for hybrid processing.
- Advanced Memory (GraphRAG) for semantic retrieval.
- Bio‑Digital Interface (BCI) for sensory feedback.
- Self‑Healing (Healer) for autonomous error correction.

It acts as the single entry point for complex reasoning tasks.
"""

from __future__ import annotations

import logging
from typing import Optional, Dict, Any, List

# Core Modules
from .quantum.core import QuantumCore
from .memory.graph_rag import GraphRAG
from .senses.bci import BCI
# from .memory.healer import Healer  # Assuming Healer is ready or will be integrated

# Configure logging
logging.basicConfig(level=logging.INFO, format="[%(name)s] %(message)s")
logger = logging.getLogger("Brain")

class Brain:
    """The central nervous system of eCy OS."""

    def __init__(self, quantum_qubits: int = 2):
        logger.info("Initializing eCy OS Brain...")
        
        # 1. Quantum Cortex
        try:
            self.quantum = QuantumCore(n_qubits=quantum_qubits)
            logger.info("Quantum Cortex: ONLINE (Hybrid Mode)")
        except Exception as e:
            logger.error(f"Quantum Cortex: FAILED ({e})")
            self.quantum = None

        # 2. Graph Memory (LGM)
        try:
            self.memory = GraphRAG()
            logger.info("Graph Memory: ONLINE")
        except Exception as e:
            logger.error(f"Graph Memory: FAILED ({e})")
            self.memory = None

        # 3. Bio-Digital Interface (BCI)
        try:
            self.bci = BCI()
            logger.info("Bio-Digital Interface: ONLINE")
        except Exception as e:
            logger.error(f"Bio-Digital Interface: FAILED ({e})")
            self.bci = None

        # 4. State
        self.state: Dict[str, Any] = {
            "version": "1005.0",
            "mode": "OMNI_INTELLIGENCE",
            "status": "IDLE"
        }

    def process_thought(self, input_text: str, use_quantum: bool = False) -> Dict[str, Any]:
        """Process a thought through the integrated brain modules.

        Args:
            input_text: The query or thought to process.
            use_quantum: Whether to engage the quantum coprocessor.

        Returns:
            A dictionary containing the results from memory, quantum, and bio-feedback.
        """
        logger.info(f"Processing thought: '{input_text}'")
        result: Dict[str, Any] = {"input": input_text, "modules": {}}

        # A. Recall Memory
        if self.memory:
            try:
                # Ingest the thought itself to keep a stream of consciousness
                self.memory.ingest([input_text])
                # Query relevant context
                context = self.memory.query(input_text, top_k=1)
                result["modules"]["memory"] = {"context": context}
            except Exception as e:
                 result["modules"]["memory"] = {"error": str(e)}

        # B. Quantum Processing (Symbolic/Hybrid)
        if self.quantum and use_quantum:
            try:
                # For demo, we transform the text length into a dummy tensor
                # In a real scenario, we'd use embeddings
                import torch
                import numpy as np
                val = len(input_text) / 100.0
                dummy_input = torch.tensor([[val, val]], dtype=torch.float32)
                q_out = self.quantum.process_hybrid_data(dummy_input)
                result["modules"]["quantum"] = {"output": q_out.tolist()}
            except Exception as e:
                result["modules"]["quantum"] = {"error": str(e)}

        # C. Bio-Feedback (Current State)
        if self.bci:
            try:
                # Capture a snapshot of the user's/operator's state
                self.bci.start(duration_sec=1)
                data = self.bci.get_data()
                result["modules"]["bci"] = {"samples": len(data)}
            except Exception as e:
                result["modules"]["bci"] = {"error": str(e)}

        return result

    def status_report(self) -> str:
        """Return a system status report."""
        return f"""
        eCy OS Brain Status:
        --------------------
        Quantum Core: {'✅' if self.quantum else '❌'}
        Graph Memory: {'✅' if self.memory else '❌'}
        Bio-Interface: {'✅' if self.bci else '❌'}
        """

if __name__ == "__main__":
    # Test execution
    brain = Brain()
    print(brain.status_report())
    thought_result = brain.process_thought("Verify system integrity", use_quantum=True)
    print("Thought Result:", thought_result)
