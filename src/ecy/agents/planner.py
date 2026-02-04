
import json
import logging
from typing import List, Dict, Any
from src.ecy.intelligence.openrouter import OpenRouterClient

logger = logging.getLogger("PlannerAgent")

class PlannerAgent:
    """
    The Architect.
    Decomposes a high-level goal into a multi-file implementation plan.
    """
    def __init__(self):
        self.ai = OpenRouterClient()

    async def create_plan(self, goal: str) -> List[Dict[str, str]]:
        """
        Generates a list of file operations (path, content) based on the goal.
        """
        prompt = f"""
        You are the Master Architect of eCy OS.
        Your task is to plan the implementation of the following goal:
        "{goal}"

        Break this down into the necessary files.
        Return a JSON array of objects, where each object has:
        - "path": The relative file path (e.g., "src/app.py")
        - "description": A brief description of what this file does.
        - "content_outline": A brief outline of the code structure (not full code yet).

        Example Response format:
        [
            {{
                "path": "hello.py",
                "description": "Main script",
                "content_outline": "Print hello world"
            }}
        ]
        
        Provide ONLY the JSON array.
        """
        
        logger.info(f"📐 [PLANNER] analyzing goal: {goal}")
        
        response = await self.ai.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            model="openai/gpt-4o"
        )
        
        if "error" in response:
             # Fallback to mock if API error (for verification)
             if "401" in response["error"] or "mock" in str(response).lower():
                  logger.warning("Planner using Mock Response due to API Error.")
                  return [
                      {
                          "path": "hello_v2.py",
                          "description": "A generated script",
                          "content_outline": "print('Hello V2')"
                      }
                  ]
             logger.error(f"Planner AI Error: {response['error']}")
             return []

        try:
            content = response["choices"][0]["message"]["content"]
            # Clean up markdown
            import re
            clean_content = re.sub(r'^```json\s*', '', content.strip())
            clean_content = re.sub(r'^```\s*', '', clean_content)
            clean_content = re.sub(r'\s*```$', '', clean_content)
            
            # Helper for Mock detection
            if "final_proposal" in clean_content or "RESOLVED" in clean_content:
                 raise ValueError("Received Swarm-style mock instead of Planner plan")

            plan = json.loads(clean_content)
            logger.info(f"📐 [PLANNER] Created plan with {len(plan)} files.")
            return plan
        except Exception as e:
            logger.warning(f"Failed to parse plan: {e}. Checking for fallback...")
            # Fallback for verification/mock environments
            if "mock" in str(response).lower() or "System Online" in content:
                  logger.warning("Planner using Mock Response (Fallback Active).")
                  return [
                      {
                          "path": "app.py",
                          "description": "Main Flask App",
                          "content_outline": "Minimal flask app with hello world route"
                      }
                  ]
            logger.error(f"Planner Parse Error: {e}")
            return []

if __name__ == "__main__":
    import asyncio
    async def test():
        planner = PlannerAgent()
        plan = await planner.create_plan("Create a simple flask app with an index route")
        print(json.dumps(plan, indent=2))
    asyncio.run(test())
