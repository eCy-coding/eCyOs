import sys
import os

sys.path.append(os.getcwd())

from src.ecy.security.immune_system import ImmuneSystem

def verify_immune_system():
    print("\n--- Testing Phase 6: Cyber-Defense (Immune System) ---")
    
    # Initialize pointing at src
    defense = ImmuneSystem(target_dir="src")
    
    print("[Test] Running Integrity Scan...")
    defense.analyze_health()
    
    print("\n✅ Immune System: OPERATIONAL")

if __name__ == "__main__":
    try:
        verify_immune_system()
    except Exception as e:
        print(f"\n❌ IMMUNE SYSTEM VERIFICATION FAILED: {e}")
        import traceback
        traceback.print_exc()
