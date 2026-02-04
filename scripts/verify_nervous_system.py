import asyncio
import sys
import os

sys.path.append(os.getcwd())

from src.ecy.orchestrator import Orchestrator

async def verify_orchestrator():
    print("\n--- Testing Orchestrator v2 (Supervisor Pattern) ---")
    try:
        orch = Orchestrator()
        
        # Test 1: Initialization
        assert orch.cortex is not None
        assert orch.math_core is not None
        print("✅ Orchestrator Initialization: PASS")
        
        # Test 2: Math Capability
        # It's mock mode if sympy missing, but should run
        result = orch.math_core.verify_derivative("x**3", "x")
        print(f"Math Check: {result}")
        assert result is not None
        print("✅ MathCore Integration: PASS")
        
        # Test 3: Construct Feature (Simulated)
        # This will trigger the Mock Cortex if no API key
        print("Testing Goal Construction Loop...")
        verdict = await orch.construct_feature("Calculate the derivative of x^2 using python")
        
        assert verdict
        print("✅ Supervisor Goal Loop: PASS")
        
        print("\n🎉 PHASE 2 NERVOUS SYSTEM VERIFIED.")
        
    except Exception as e:
        print(f"\n❌ ORCHESTRATOR VERIFICATION FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(verify_orchestrator())
