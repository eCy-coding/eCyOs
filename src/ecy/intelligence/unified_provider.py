import os
import json
import subprocess
import requests
import threading
from typing import List, Dict, Optional, Any
from .model_router import ModelRouter, ModelRegistry
from .local_provider import LocalProvider
from .vector_memory import VectorMemory

# Try importing openai, handle if missing
try:
    from openai import OpenAI
    from openai import APIError
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False
    APIError = Exception

class UnifiedIntelligenceProvider:
    """
    Universal Router for accessing 400+ AI models via OpenRouter OR Local NPU via Ollama.
    Implements a Hybrid Logic:
    1. Check if 'local' is requested -> Use Ollama.
    2. Check if 'Cloud' is available -> Use OpenRouter.
    3. Fallback -> Use Mock / Simulation.
    """
    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://openrouter.ai/api/v1"):
        self.api_key = api_key or os.environ.get("OPENROUTER_API_KEY") or os.environ.get("OPENAI_API_KEY")
        self.base_url = base_url
        self.client = None
        self.router = ModelRouter()
        self.local_brain = LocalProvider()
        
        # Initialize Memory
        try:
            self.vector_memory = VectorMemory()
        except Exception as e:
            print(f"[Brain] VectorMemory init error: {e}")
            self.vector_memory = None
        
        # Connect to Cloud
        if self.api_key and HAS_OPENAI:
            print(f"[Brain] Connecting to Hive Mind via {self.base_url}...")
            # OpenRouter-specific headers for ranking/analytics
            extra_headers = {
                "HTTP-Referer": "https://antigravity.google", # Site URL
                "X-Title": "eCy OS v1005.0", # Site Name
            }
            try:
                self.client = OpenAI(
                    base_url=self.base_url,
                    api_key=self.api_key,
                    default_headers=extra_headers
                )
                print("[Brain] Connection established.")
            except Exception as e:
                print(f"[Brain] Cloud connection failed: {e}")
        else:
             print("[Brain] Running in Offline / Local-Only Mode (No API Key found).")

        # Check Local Cortex
        if self.local_brain.is_alive():
            print("[Brain] Local Cortex (Ollama) detected on M4 Max.")
        else:
            print("[Brain] Warning: Local Cortex (Ollama) not reachable.")

    def _broadcast_thought(self, agent: str, content: str):
        """
        Transmits a 'Thought Token' to the Neural Link (WebSocket).
        Fire-and-forget to avoid blocking.
        """
        def send():
            try:
                requests.post(
                    "http://localhost:8000/api/inject_thought",
                    json={"agent": agent, "content": content},
                    timeout=0.2
                )
            except Exception: pass
        
        threading.Thread(target=send, daemon=True).start()

    def chat_complete(self, model_alias: str, messages: List[Dict[str, str]], temperature: float = 0.7) -> str:
        """
        Send a chat completion request with Hybrid Routing.
        Resolves aliases (e.g., 'deep_thinker') to real IDs (e.g., 'openai/gpt-4o').
        """
        # Resolve Alias
        model_id = self.router.resolve_model_alias(model_alias)
        
        # Broadcast the "Thinking" state
        last_msg = messages[-1]['content']
        self._broadcast_thought("System", f"[THINK] Routing '{model_alias}' -> '{model_id}'")
        
        # --- LOCAL ROUTING ---
        # If explicitly local or falls into local family
        if model_id == "local" or any(m in model_id for m in ["phi", "mistral", "llama", "gemma"]):
            # Strip 'local/' prefix if present for clean Ollama mapping
            local_model_name = model_id.replace("local/", "") if "/" in model_id else None
            
            if self.local_brain.is_alive():
                print(f"[Brain] Routing to Local Cortex (Model: {model_id})...")
                # Force low temp for code
                final_temp = 0.1 if "code" in model_id else temperature
                response = self.local_brain.chat_complete(messages, local_model_name, final_temp)
                self._broadcast_thought("Local Cortex", response[:100] + "...")
                return response
            else:
                print("[Brain] Local Cortex unavailable. Attempting Cloud Fallback...")
                # Fallback to Cloud if intended model was something like 'llama-3-70b' which exists on cloud too
                if "llama" in model_id:
                     model_id = ModelRegistry.LLAMA_3_70B
        
        # --- CLOUD ROUTING ---
        if self.client:
            try:
                print(f"[Brain] Routing to Cloud Hive Mind (Model: {model_id})...")
                response = self.client.chat.completions.create(
                    model=model_id,
                    messages=messages,
                    temperature=temperature,
                )
                content = response.choices[0].message.content
                self._broadcast_thought("Hive Mind", "Response received.")
                return content
            except APIError as e:
                print(f"[Brain] API Error: {e}")
            except Exception as e:
                print(f"[Brain] Unexpected Cloud Error: {e}")

        # --- MOCK / FALLBACK ---
        print(f"[Brain] Fallback to Mock Simulation for {model_id}")
        return self._mock_response(model_id, messages)

    def _mock_response(self, model: str, messages: List[Dict[str, str]]) -> str:
        """
        Mock response for testing or when API is unavailable.
        Uses heuristics to trigger Executor actions for demo purposes.
        """
        last_msg = messages[-1]['content'].lower()
        
        # Heuristic for "Judge" to trigger actions
        is_judge = "judge" in model.lower() or "gemini" in model.lower()
        
        if is_judge:
            if "genesis" in last_msg or "create a file" in last_msg:
                return "The Council has spoken.\nCREATE FILE: genesis.txt\nCONTENT:\nLight."
            if "calc" in last_msg:
                 return "Calculation ordered.\nCREATE FILE: calc.py\nCONTENT:\nprint(21*2)"

        return f"[MOCK {model}] Simulation: I agree with the logic presented. The path is clear."

    def list_models(self) -> List[str]:
        return ModelRegistry.get_all_models()
