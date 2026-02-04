import requests
import json
from typing import List, Dict, Optional, Any

class LocalProvider:
    """
    Interface for the M4 Max Neural Engine via Ollama.
    Provides local, offline, and private inference capabilities.
    """
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.active_model = "llama3" # Default, can be changed via pull

    def is_alive(self) -> bool:
        """Checks if the local Ollama server is running."""
        try:
            response = requests.get(f"{self.base_url}/")
            return response.status_code == 200
        except requests.exceptions.ConnectionError:
            return False

    def list_models(self) -> List[str]:
        """Lists available local models."""
        try:
            response = requests.get(f"{self.base_url}/api/tags")
            if response.status_code == 200:
                data = response.json()
                return [model['name'] for model in data.get('models', [])]
            return []
        except Exception as e:
            print(f"[Local Cortex] Error listing models: {e}")
            return []

    def chat_complete(self, messages: List[Dict[str, str]], model: Optional[str] = None, temperature: float = 0.7) -> str:
        """
        Generates a chat completion using the local NPU.
        """
        target_model = model or self.active_model
        payload = {
            "model": target_model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/chat", json=payload)
            if response.status_code == 200:
                response_json = response.json()
                return response_json.get('message', {}).get('content', '')
            else:
                return f"[Error] Local Cortex returned status {response.status_code}: {response.text}"
        except Exception as e:
            return f"[Error] Failed to connect to Local Cortex: {e}"

    def pull_model(self, model_name: str) -> bool:
        """
        Pulls a model from the Ollama library.
        Note: This is a blocking operation and might take time.
        """
        print(f"[Local Cortex] Pulling model {model_name}...")
        payload = {"name": model_name}
        try:
            response = requests.post(f"{self.base_url}/api/pull", json=payload, stream=True)
            for line in response.iter_lines():
                if line:
                    data = json.loads(line)
                    status = data.get('status')
                    if status == 'success':
                        print(f"[Local Cortex] Successfully pulled {model_name}")
                        return True
            return True # Assumed success if stream finishes without error
        except Exception as e:
            print(f"[Local Cortex] Failed to pull model: {e}")
            return False
