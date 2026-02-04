import os
from src.ecy.intelligence.unified_provider import UnifiedIntelligenceProvider

def main():
    # Initialise provider (will also initialise VectorMemory)
    provider = UnifiedIntelligenceProvider()
    
    # Verify VectorMemory attribute
    if not hasattr(provider, "vector_memory"):
        print("[FAIL] UnifiedIntelligenceProvider missing vector_memory")
        return
    
    vm = provider.vector_memory
    try:
        indexes = vm.list_indexes()
        print("[PASS] VectorMemory initialized. Existing indexes:", indexes)
    except Exception as e:
        print("[WARN] VectorMemory operation failed:", e)
        print("  • Ensure PINECONE_API_KEY is set in the environment.")

if __name__ == "__main__":
    main()
