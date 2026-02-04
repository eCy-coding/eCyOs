
import sys
import os

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../src")))

from ecy.intelligence import UnifiedIntelligenceProvider, DebateCoordinator, MathCore

def main():
    print("--- eCy OS v1005.0 Brain Verification ---")
    
    # 1. Test Router
    print("\n[1] Testing Router (UnifiedIntelligenceProvider)...")
    provider = UnifiedIntelligenceProvider()
    response = provider.chat_complete("test-model", [{"role": "user", "content": "Hello"}])
    print(f"Response: {response}")
    
    # 2. Test Debate
    print("\n[2] Testing Council of Wisdom (DebateCoordinator)...")
    coordinator = DebateCoordinator(provider)
    # Using a simple query for verifying flow
    result = coordinator.conduct_debate("What is 12 * 12?", max_turns=1)
    print(f"Final Judgment: {result['final_answer']}")
    print(f"Turns: {len(result['history'])}")
    
    # 3. Test Math Core
    print("\n[3] Testing Math Rigor (MathCore)...")
    math_core = MathCore()
    eq = "144 = 12 * 12"
    is_valid = math_core.verify_equation(eq)
    print(f"Equation '{eq}' valid? {is_valid}")
    
    calc_res = math_core.calculate("sqrt(2)")
    print(f"sqrt(2) = {calc_res}")

    if is_valid and "MOCK" in response:
        print("\n[SUCCESS] Brain is functioning (Mock Mode Active).")
    elif is_valid:
        print("\n[SUCCESS] Brain is functioning (Live Mode Active).")
    else:
        print("\n[FAIL] Math verification failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
