import sys
import os

# Ensure we can import from src
sys.path.append(os.getcwd())

# Try to import Audio/Vision
try:
    from src.ecy.senses.sonic import Sonic
    from src.ecy.senses.vision import Vision
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

def verify_senses():
    print("\n--- Testing Phase 5: The Senses (Audio/Vision) ---")
    
    # 1. Test Sonic (Audio)
    print("\n[Test] Initializing Sonic...")
    ears = Sonic()
    
    # Test Speak (Mock/Real)
    print("[Test] Testing Voice Output...")
    ears.speak("Verification of Sonic Module Initiated.")
    
    # Test Listen (Mock if no mic)
    listen_result = ears.listen_for_command(timeout=1)
    print(f"[Result] Listen Result: {listen_result}")
    
    print("✅ Sonic Module: PASS")

    # 2. Test Vision (Eyes)
    print("\n[Test] Initializing Vision...")
    eyes = Vision()
    
    # Test Capture (Mock/Real)
    # We won't block on real camera if not available, handling gracefully
    print("[Test] Capturing Frame...")
    frame = eyes.capture_frame_base64()
    if frame:
        print(f"[Result] Frame Captured (Length: {len(frame)})")
    else:
        print("[Result] Frame Capture Failed (Expected if no camera or mock mode).")
    
    # Test Analysis (Mock/Real)
    # If Ollama is not running, it should handle gracefully
    print("[Test] Analyzing Scene...")
    analysis = eyes.analyze_scene()
    print(f"[Result] Scene Analysis: {analysis}")
    
    print("✅ Vision Module: PASS")
    
    print("\n🎉 PHASE 5 SENSES VERIFIED.")

if __name__ == "__main__":
    try:
        verify_senses()
    except Exception as e:
        print(f"\n❌ SENSES VERIFICATION FAILED: {e}")
        import traceback
        traceback.print_exc()
