
import asyncio
import json
from src.ecy.intelligence.openrouter import OpenRouterClient

class SwarmNode:
    def __init__(self, role: str, model: str):
        self.role = role
        self.model = model
        self.ai = OpenRouterClient()

    async def think(self, context: str) -> str:
        prompt = f"You are the {self.role}. {context}"
        response = await self.ai.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            model=self.model
        )
        if "error" in response:
            return f"Error: {response['error']}"
        try:
            return response["choices"][0]["message"]["content"]
        except (KeyError, IndexError):
            return "Error: Invalid response format from AI."

class DebateLoop:
    def __init__(self):
        # Using OpenRouter models
        self.proposer = SwarmNode("Proposer", "openai/gpt-4o")
        self.critic = SwarmNode("Critic", "anthropic/claude-3.5-sonnet")
        self.judge = SwarmNode("Judge", "google/gemini-pro-1.5")
    
    async def run_debate(self, topic: str, max_rounds=3):
        history = []
        print(f"[SWARM] Initiating Debate on: {topic}")
        
        # Round 1: Proposer
        proposal = await self.proposer.think(f"Propose a comprehensive solution for: {topic}")
        history.append({"role": "Proposer", "content": proposal})
        print(f"[SWARM] Proposer: {proposal[:100]}...")

        for i in range(max_rounds):
            # Critic
            critique = await self.critic.think(
                f"Critique this proposal strictly. Identify flaws.\nProposal: {proposal}"
            )
            history.append({"role": "Critic", "content": critique})
            print(f"[SWARM] Critic (Round {i+1}): {critique[:100]}...")
            
            # Judge Check
            verdict = await self.judge.think(
                f"Review the proposal and critique. Is the proposal solid? Respond with JSON {{'status': 'RESOLVED' | 'DEBATE', 'reason': '...'}}\nProposal: {proposal}\nCritique: {critique}"
            )
            try:
                # Safer cleanup: Only remove starting ```json and ending ```
                import re
                clean_verdict = re.sub(r'^```json\s*', '', verdict.strip())
                clean_verdict = re.sub(r'^```\s*', '', clean_verdict)
                clean_verdict = re.sub(r'\s*```$', '', clean_verdict)
                
                decision = json.loads(clean_verdict)
                print(f"[SWARM] Judge: {decision['status']}")
                
                if decision['status'] == 'RESOLVED':
                    return decision
            except:
                print(f"[SWARM] Judge raw output: {verdict}")

            # Re-Propose based on critique
            proposal = await self.proposer.think(
                f"Refine your proposal based on this critique: {critique}"
            )
            
        return {"status": "TIMEOUT", "final_proposal": proposal}

if __name__ == "__main__":
    loop = DebateLoop()
    asyncio.run(loop.run_debate("How to implement a self-healing python script?"))
