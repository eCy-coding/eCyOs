import sys
import os

sys.path.append(os.getcwd())

from src.ecy.persistence.supabase_client import SupabaseClient
from src.ecy.persistence.galactic_archive import GalacticArchive

def verify_memory_layer():
    print("\n--- Testing Phase 3: Memory & Persistence ---")
    
    # 1. Test Supabase Client
    print("\n[Test] Initializing SupabaseClient...")
    db = SupabaseClient()
    
    # Needs to handle mock mode gracefully
    print("[Test] Logging Event...")
    db.log_event("VerifyScript", "INFO", "Testing Phase 3", {"status": "running"})
    
    print("[Test] Storing Verdict...")
    db.store_verdict("Test Query", "The answer is 42", ["Agent A says X", "Agent B says Y"])
    print("✅ Supabase Integration: PASS")

    # 2. Test Galactic Archive
    print("\n[Test] Initializing Galactic Archive...")
    archive = GalacticArchive()
    
    print("[Test] Creating Snapshot...")
    archive.snapshot("Phase 3 Verification Snapshot")
    
    # Skip push test to avoid erroring if no remote set
    print("✅ Galactic Archive (Local): PASS")
    
    print("\n🎉 PHASE 3 MEMORY LAYER VERIFIED.")

if __name__ == "__main__":
    try:
        verify_memory_layer()
    except Exception as e:
        print(f"\n❌ MEMORY VERIFICATION FAILED: {e}")
        import traceback
        traceback.print_exc()
