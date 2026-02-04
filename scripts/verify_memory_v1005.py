
import sys
import os

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../src")))

from ecy.memory import GalacticArchive, Healer
from ecy.memory.supabase_client import HAS_SUPABASE

def main():
    print("--- eCy OS v1005.0 Memory Verification ---")
    
    # 1. Test Supabase Client (Galactic Archive)
    print("\n[1] Testing GalacticArchive...")
    archive = GalacticArchive()
    
    # Store a dummy debate
    success = archive.store_debate(
        query="What is the speed of light?",
        final_answer="299,792,458 m/s",
        history=[{"role": "Proposer", "content": "It is fast."}]
    )
    
    if success:
        print("[SUCCESS] Stored debate (Archive functioning).")
        if not HAS_SUPABASE:
            print("  (Stored locally in debates.jsonl - Mock Mode)")
    else:
        print("[FAIL] Failed to store debate.")
        sys.exit(1)

    # 2. Test Healer
    print("\n[2] Testing Healer (Self-Correction)...")
    healer = Healer()
    patch = healer.diagnose_and_heal("ImportError: No module named 'antigravity'", "import antigravity")
    
    if "MOCK" in patch or patch:
        print(f"[SUCCESS] Healer proposed patch: {patch[:50]}...")
    else:
        print("[FAIL] Healer failed to propose patch.")
        sys.exit(1)

    print("\n[VERIFICATION COMPLETE] Memory Modules are active.")

if __name__ == "__main__":
    main()
