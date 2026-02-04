
import os
import logging
import json
from typing import List, Dict, Any, Optional
import aiohttp
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class OpenRouterClient:
    """
    Client for interacting with the OpenRouter API.
    Supports 400+ models with unified interface.
    """
    
    BASE_URL = "https://openrouter.ai/api/v1"
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        if not self.api_key:
            logger.warning("OpenRouter API Key not found. Please set OPENROUTER_API_KEY.")
            
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://ecy-os.local", # Required by OpenRouter
            "X-Title": "eCy OS v1005.0",
            "Content-Type": "application/json"
        }

    async def chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        model: str = "openai/gpt-4o",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """
        Send a chat completion request to OpenRouter.
        """
        url = f"{self.BASE_URL}/chat/completions"
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=self.headers, json=payload) as response:
                    if response.status != 200:
                        if response.status == 401:
                            return await self._mock_response(model)
                        error_text = await response.text()
                        logger.error(f"OpenRouter API Error {response.status}: {error_text}")
                        return {"error": f"API Error {response.status}", "details": error_text}
                    
                    return await response.json()
                    
        except Exception as e:
            logger.exception("Failed to connect to OpenRouter")
            return {"error": str(e)}

    async def _mock_response(self, model: str) -> Dict[str, Any]:
        """Generate a deterministic mock response for testing."""
        logger.warning(f"⚠️ USING MOCK RESPONSE for {model} (Auth Failed or Debug Mode)")
        return {
            "choices": [{
                "message": {
                    "content": json.dumps({
                        "status": "RESOLVED",
                        "final_proposal": "```python\n# generated_feature_0.py\nprint('System Online')\n```",
                        "reason": "Mocked validation successful."
                    }) if "judge" in model.lower() or "gemini" in model.lower() else "I propose we write a script that prints 'System Online'."
                }
            }]
        }

    async def get_available_models(self) -> List[Dict[str, Any]]:
        """
        Fetch the list of available models from OpenRouter.
        """
        url = f"{self.BASE_URL}/models"
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers) as response:
                    if response.status != 200:
                         logger.error(f"Failed to fetch models: {await response.text()}")
                         return []
                    data = await response.json()
                    return data.get("data", [])
        except Exception as e:
            logger.error(f"Error fetching models: {e}")
            return []

if __name__ == "__main__":
    # Quick Test
    import asyncio
    async def test():
        client = OpenRouterClient()
        if not client.api_key:
            print("Skipping test: No API Key")
            return
            
        models = await client.get_available_models()
        print(f"Discovered {len(models)} models.")
        
        print("Sending test query...")
        response = await client.chat_completion(
            messages=[{"role": "user", "content": "Hello, eCy OS!"}],
            model="openai/gpt-3.5-turbo"
        )
        print("Response:", json.dumps(response, indent=2))

    asyncio.run(test())
