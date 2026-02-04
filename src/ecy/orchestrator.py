import asyncio
import aiohttp
import json
from typing import Optional, Dict
from src.ecy.intelligence.unified_provider import UnifiedIntelligenceProvider
from src.ecy.intelligence.debate_coordinator import DebateCoordinator
from src.ecy.intelligence.self_healing import Healer
from src.ecy.math_core import MathCore
from src.ecy.action.executor import Executor

class Orchestrator:
    """
    eCy OS Supervisor Agent (Manager).
    Coordinates the Nervous System:
    Input (CLI) -> Cortex (Debate/Router) -> Verification (MathCore) -> Action (Executor)
    """

    def __init__(self):
        print("[Orchestrator] Initializing Nervous System...")
        # 1. Initialize Cortex
        self.cortex = UnifiedIntelligenceProvider()
        
        # 2. Initialize Council
        self.council = DebateCoordinator(provider=self.cortex)
        
        # 3. Initialize Verification Engine
        self.math_core = MathCore()
        
        # 4. Initialize Tools
        self.executor = Executor()
        
        # 5. Initialize Healer
        # 5. Initialize Healer
        self.healer = Healer(provider=self.cortex)

    async def broadcast_thought(self, agent: str, content: str):
        """
        Stream internal monologue to the Neural Uplink (WebSocket Server).
        """
        try:
            async with aiohttp.ClientSession() as session:
                payload = {"agent": agent, "content": content, "role": "assistant"}
                # Fire and forget - don't block main thread too long
                await session.post("http://localhost:8000/api/inject_thought", json=payload)
        except Exception as e:
            # Silent fail if server is offline, don't crash the brain
            print(f"[Orchestrator] Uplink failed: {e}")

    async def construct_feature(self, goal: str):
        """
        Main Execution Loop: "The Supervisor Pattern".
        1. PLAN: Debate the best approach.
        2. VERIFY: Check logic with MathCore (if applicable).
        3. EXECUTE: Perform actions.
        4. REVIEW: Feedback loop.
        """
        print(f"\n[Orchestrator] Received Directive: '{goal}'")
        
        # Step 1: Seek Wisdom (Debate)
        # Step 1: Seek Wisdom (Debate)
        print("[Orchestrator] Convening Council of Wisdom...")
        await self.broadcast_thought("Orchestrator", f"Convening Council for goal: {goal}")
        
        debate_result = await self.council.conduct_debate(goal, max_turns=2)
        final_verdict = debate_result["final_answer"]
        
        await self.broadcast_thought("Council Judge", f"Verdict Reached: {final_verdict[:100]}...")
        print(f"\n[Orchestrator] Council Verdict: {final_verdict[:100]}...")

        # Step 2: Formal Verification (Optional Math Check)
        # Heuristic: If directive involves "calculate", "optimize", "prove"
        if any(k in goal.lower() for k in ["calc", "math", "verify", "proof", "optimize"]):
            print("[Orchestrator] Invoking MathCore for Verification...")
            await self.broadcast_thought("Orchestrator", "Invoking MathCore for symbolic verification...")
            
            # Demo: Verify a derivative just to prove capability if relevant
            # In a real scenario, the 'Proposer' would output a formula to verify
            proof = self.math_core.verify_derivative("x**2", "x")
            await self.broadcast_thought("MathCore", f"Verification Result: {proof}")
            print(f"[Orchestrator] MathCore Sanity Check (d/dx x^2): {proof}")

        # Step 3: Execution is handled implicitly by DebateCoordinator calling Executor
        # But we can add a post-execution check here
        
        print("[Orchestrator] Goal Construction Cycle Complete.")
        return final_verdict

    async def process_code_context(self, context: dict) -> Dict:
        """
        Analyze code context from Agentic Editor and return 'Ghost Text'.
        Currently uses a heuristic/mock model for speed, but can call Cortex.
        """
        content = context.get("content", "")
        # cursor = context.get("cursor", {})
        
        # Simple heuristic for demo:
        # If user types 'def ', suggest a function based on previous lines
        if content.strip().endswith("def"):
             return {"type": "GHOST_TEXT", "content": " active_process(self):\n        pass"}
             
        if "@optimize" in content and "def" in content.splitlines()[-1]:
             return {"type": "GHOST_TEXT", "content": "(target='npu_v1'):\n    pass"}

        # In a real implementation, we would call:
        # response = await self.cortex.chat(content[-500:])
        # return {"type": "GHOST_TEXT", "content": response}
        
        return None

    async def self_improve_loop(self):
        """
        Trigger autonomous self-improvement.
        """
        # Placeholder for Phase 3
        print("[Orchestrator] Creating Recursive Improvement Patch...")
        pass
