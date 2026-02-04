
import json
import urllib.request
import urllib.error
import logging

class OllamaClient:
    """
    A Zero-Dependency Python Client for Ollama.
    Uses standard library `urllib` to ensure portability without `pip install`.
    """
    def __init__(self, base_url="http://localhost:11434"):
        self.base_url = base_url
        self.logger = logging.getLogger("OllamaClient")

    def generate(self, model: str, prompt: str, system: str = None, stream: bool = False, format: str = None) -> dict:
        """
        Generate a response from a model.
        """
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": stream
        }
        if system:
            payload["system"] = system
        if format:
            payload["format"] = format

        try:
            data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
            
            # 1-second timeout for rapid failover
            with urllib.request.urlopen(req, timeout=1) as response:
                if stream:
                    # For streaming, we would need a generator. 
                    # For now, simplistic full read if stream=False logic is implicitly enforced by return type.
                    # If stream=True, this implementation acts as if it consumes all.
                    full_response = ""
                    for line in response:
                        if line:
                            obj = json.loads(line)
                            full_response += obj.get("response", "")
                            if obj.get("done"):
                                break
                    return {"response": full_response, "done": True}
                else:
                    body = response.read().decode('utf-8')
                    return json.loads(body)
                    
        except (urllib.error.URLError, TimeoutError) as e:
            self.logger.warning(f"Ollama Connection Failed ({e}). Switching to Simulation Mode.")
            return {
                "response": f"[Simulated Output] {prompt[:50]}... (Reason: Ollama Offline)",
                "done": True,
                "mode": "simulated"
            }
        except Exception as e:
            self.logger.error(f"Ollama Error: {e}")
            return {"error": str(e)}

    def chat(self, model: str, messages: list, stream: bool = False) -> dict:
        """
        Chat completion.
        """
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": model,
            "messages": messages,
            "stream": stream
        }
        
        try:
            data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
            
            with urllib.request.urlopen(req) as response:
                 if stream:
                    full_content = ""
                    for line in response:
                        if line:
                            obj = json.loads(line)
                            if "message" in obj:
                                full_content += obj["message"].get("content", "")
                            if obj.get("done"):
                                break
                    return {"message": {"role": "assistant", "content": full_content}, "done": True}
                 else:
                    body = response.read().decode('utf-8')
                    return json.loads(body)

        except urllib.error.URLError as e:
            return {"error": str(e)}
