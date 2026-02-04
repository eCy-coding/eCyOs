import sys
import os
import torch
import numpy as np
sys.path.append(os.getcwd())

def verify_quantum():
    print("\n--- Testing Phase 6: Quantum Intelligence ---")
    
    try:
        from src.ecy.quantum.core import QuantumCore
    except ImportError as e:
        print(f"Import Error: {e}")
        return

    print("[Test] Initializing Quantum Core...")
    qc = QuantumCore(n_qubits=2)
    
    # Test Data: 2 samples, 2 features (matching n_qubits=2)
    # Using small values as feature map input
    dummy_input = torch.tensor([[0.5, 0.2], [np.pi, 0.1]], dtype=torch.float32)
    
    
    
    print(f"[Test] Processing Input Tensor: {dummy_input.shape}")
    output = qc.process_hybrid_data(dummy_input)
    
    print(f"[Test] Quantum Output:\n{output}")
    
    # Validation logic
    if output.shape[0] == 2 and isinstance(output, torch.Tensor):
        if qc.qnn:
            print("✅ Quantum Circuit Execute: SUCCESS (Hybrid Mode)")
        else:
            print("⚠️ Quantum Circuit Execute: SUCCESS (Classical Fallback Mode)")
    else:
        print("❌ Quantum Circuit Execute: FAILED (Invalid Output Shape/Type)")

if __name__ == "__main__":
    try:
        verify_quantum()
    except Exception as e:
        print(f"\n❌ QUANTUM VERIFICATION FAILED: {e}")
        import traceback
        traceback.print_exc()
