import os
import time
import base64
import json
import requests
from typing import Optional, Dict, Any

# Safe Import for OpenCV
try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False
    print("[Vision] Warning: 'opencv-python' not found. Camera disabled.")

class Vision:
    """
    eCy OS Sensory Module: Vision (Eyes)
    Input: OpenCV (Camera Capture)
    Processing: Local VLM (Ollama/LLaVA)
    """

    def __init__(self, ollama_url: str = "http://localhost:11434"):
        self.ollama_url = ollama_url
        self.camera_index = 0
        self.mock_mode = not HAS_CV2

    def capture_frame_base64(self) -> Optional[str]:
        """
        Captures a single frame from the camera and returns it as a Base64 string.
        """
        if self.mock_mode:
            print("[Vision] Mock Mode: No camera available.")
            return None

        cap = cv2.VideoCapture(self.camera_index)
        if not cap.isOpened():
            print("[Vision] Error: Could not open camera.")
            return None

        ret, frame = cap.read()
        cap.release()

        if not ret:
            print("[Vision] Error: Failed to capture frame.")
            return None

        # Encode to JPEG
        _, buffer = cv2.imencode('.jpg', frame)
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')
        return jpg_as_text

    def analyze_scene(self, prompt: str = "Describe what you see in this image in detail.") -> str:
        """
        Captures an image and sends it to the local VLM (LLaVA) for analysis.
        """
        if self.mock_mode:
            return "[Mock Vision] I see a simulated testing environment."

        print("[Vision] Opening Eyelid (Capturing Frame)...")
        image_b64 = self.capture_frame_base64()
        
        if not image_b64:
            return "Error: Empty visual buffer."

        print("[Vision] Sending visual data to Visual Cortex (Ollama/LLaVA)...")
        try:
            payload = {
                "model": "llava",
                "prompt": prompt,
                "images": [image_b64],
                "stream": False
            }
            response = requests.post(f"{self.ollama_url}/api/generate", json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                description = result.get('response', 'No response from VLM.')
                print(f"[Vision] Analysis: {description[:100]}...")
                return description
            else:
                return f"VLM Error: {response.status_code} - {response.text}"

        except requests.exceptions.ConnectionError:
            return "Error: Could not connect to Ollama (Is it running?)."
        except Exception as e:
            return f"Vision Error: {e}"

if __name__ == "__main__":
    # Test
    eye = Vision()
    print("Testing Vision Module...")
    # NOTE: This requires Ollama running with 'llava' model pulled.
    # result = eye.analyze_scene()
    # print(result)
