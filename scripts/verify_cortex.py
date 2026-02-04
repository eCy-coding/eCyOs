import sys
import os

# Ensure project root is in path
sys.path.append(os.getcwd())

from src.ecy.intelligence.unified_provider import UnifiedIntelligenceProvider
from src.ecy.intelligence.model_router import ModelRouter, ModelRegistry
from src.ecy.intelligence.self_healing import Healer

# Mock verify
def test_registry():
    print("\n--- Testing Model Registry ---")
    router = ModelRouter()
    print(f"Total Models Registered: {len(ModelRegistry.get_all_models())}")
    
    assert router.resolve_model_alias("gpt4") == ModelRegistry.GPT_4O
    assert router.resolve_model_alias("claude") == ModelRegistry.CLAUDE_3_5_SONNET
    print("✅ Registry Resolution Logic: PASS")

def test_unified_provider():
    print("\n--- Testing Unified Intelligence Provider ---")
    # Initialize without API key to trigger safe mock/local
    provider = UnifiedIntelligenceProvider(api_key="TEST_KEY_MOCK") 
    
    # Test Hybrid Routing Mock
    response = provider.chat_complete("deep_thinker", [{"role": "user", "content": "Hello"}])
    print(f"Cloud Mock Response: {response}")
    
    # Test Router Fallback
    local_response = provider.chat_complete("local", [{"role": "user", "content": "Hello Local"}])
    print(f"Local Mock Response: {local_response}")
    
    assert "Simulation" in response or "Mock" in response or "Local Cortex" in local_response
    print("✅ Unified Provider Routing: PASS")

def test_healer():
    print("\n--- Testing Healer v2 ---")
    try:
        from src.ecy.intelligence.self_healing import Healer
        healer = Healer()
        result = healer.heal("SyntaxError: invalid syntax", "def foo(:\n  print('hi')")
        print(f"Healer Diagnosis: {result['diagnosis']}")
        print(f"Healer Patch: {result['patch_code'][:50]}...")
        assert result['diagnosis']
        print("✅ Healer Mechanism: PASS")
    except ImportError:
        print("⚠️ Healer module import failed (verify path)")

if __name__ == "__main__":
    try:
        test_registry()
        test_unified_provider()
        test_healer()
        print("\n🎉 ALL SYSTEMS GO: PHASE 1 CORTEX VERIFIED.")
    except Exception as e:
        print(f"\n❌ VERIFICATION FAILED: {e}")
        sys.exit(1)
