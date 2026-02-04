from .unified_provider import UnifiedIntelligenceProvider
from .model_router import ModelRouter
from ..action.executor import Executor
from ..action.tools import ToolCall
import hashlib
import uuid
import json
import re

class DebateCoordinator:
    """
    Orchestrates a Multi-Agent Debate (MAD) to find the 'Ultimate Truth'.
    Roles:
    - Proposer: Generates initial solution.
    - Critic: Challenges assumptions using logic/math.
    - Judge: Evaluates and synthesizes the final answer.
    - Executor: Acts upon the final decision if tools are needed.
    """
    def __init__(self, provider: Optional[UnifiedIntelligenceProvider] = None):
        self.provider = provider or UnifiedIntelligenceProvider()
        self.router = ModelRouter()
        self.executor = Executor()
        
        # Dynamic Model Assignment via Router
        self.proposer_model = self.router.get_model_for_role("Proposer")
        self.critic_model = self.router.get_model_for_role("Critic")
        self.judge_model = self.router.get_model_for_role("Judge")

    async def conduct_debate(self, query: str, max_turns: int = 2, callback=None) -> Dict[str, str]:
        """
        Run the debate loop with streaming callbacks.
        callback(agent_name, content)
        """
        history = []
        
        async def log_thought(role, content):
            entry = {"role": role, "content": content}
            history.append(entry)
            if callback:
                await callback(role, content)
            print(f"[Debate] {role}: {content[:50]}...")

        # System Prompts for Roles
        PROPOSER_SYS = """You are the PROPOSER (Deep Thinker). 
        Your goal: Generate a comprehensive, innovative solution to the user's query. 
        Style: Academic, rigorous, and exhaustive. Use MIT-standard math/logic where applicable.
        Output: Clear, structured proposal."""

        CRITIC_SYS = """You are the CRITIC (Harsh Skeptic). 
        Your goal: Tear down the Proposer's solution. Find logical fallacies, security risks, and missing edge cases.
        Style: Ruthless, direct, and analytical. Do not be polite. Focus on failure modes.
        Output: Bulleted list of flaws."""

        JUDGE_SYS = """You are the JUDGE (Council Chair). 
        Your goal: Synthesize the 'Ultimate Truth' from the Proposal and Critique. 
        Style: Wise, decisive, and final. discard noise, keep signal.
        Action: If code/files are needed, interpret the consensus into specific actions.
        Output: Final Verdict + Action Plan."""

        # 1. Proposal
        await log_thought("System", f"Initiating Council of Wisdom for: {query}")
        await log_thought("Proposer", f"Generating initial hypothesis using {self.proposer_model}...")
        
        proposal = self.provider.chat_complete(
            self.proposer_model, 
            [
                {"role": "system", "content": PROPOSER_SYS},
                {"role": "user", "content": f"Query: {query}\nPropose a detailed solution."}
            ]
        )
        await log_thought("Proposer", proposal)
        current_solution = proposal
        
        # 2. Debate Loop
        for i in range(max_turns):
            await log_thought("System", f"--- Council Session {i+1} ---")
            
            # Critic
            await log_thought("Critic", f"Analyzing solution for flaws ({self.critic_model})...")
            critique = self.provider.chat_complete(
                self.critic_model,
                [
                    {"role": "system", "content": CRITIC_SYS},
                    {"role": "user", "content": f"Original Query: {query}\nCurrent Solution: {current_solution}\nCritique this solution."}
                ]
            )
            await log_thought("Critic", critique)
            
            # Proposer Refinement
            await log_thought("Proposer", f"Refining solution based on critique...")
            refinement = self.provider.chat_complete(
                self.proposer_model,
                [
                    {"role": "system", "content": PROPOSER_SYS},
                    {"role": "user", "content": f"Original Query: {query}\nPrevious Solution: {current_solution}\nCritique: {critique}\nRefine your solution based on this critique."}
                ]
            )
            await log_thought("Proposer", refinement)
            current_solution = refinement

        # 3. Final Judgment
        await log_thought("Judge", f"Synthesizing final truth ({self.judge_model})...")
        verdict = self.provider.chat_complete(
            self.judge_model,
            [
                {"role": "system", "content": JUDGE_SYS},
                {"role": "user", "content": f"Query: {query}\nFinal Proposal: {current_solution}\nCritique History: {history}\nProvide the absolute truth."}
            ]
        )
        # Store the final verdict in vector memory for future recall
        if hasattr(self.provider, "vector_memory"):
            try:
                # Simple deterministic ID based on query hash
                mem_id = hashlib.sha256(query.encode()).hexdigest()
                # Placeholder embedding (zeros) – in real use, generate via embedding model
                dummy_embedding = [0.0] * 1536
                self.provider.vector_memory.upsert(
                    ids=[mem_id],
                    embeddings=[dummy_embedding],
                    metadatas=[{"query": query, "verdict": verdict}]
                )
                print(f"[Debate] Stored verdict in VectorMemory with id {mem_id[:8]}")
            except Exception as e:
                print(f"[Debate] VectorMemory store error: {e}")
        await log_thought("Judge", verdict)
        
        # 4. Action Phase (The Executor)
        # Parse output for Intent: "CREATE FILE: <path>" / "RUN COMMAND: <cmd>"
        create_file_match = re.search(r"CREATE FILE: ([\w\./\-_]+)\nCONTENT:\n(.*)", verdict, re.DOTALL)
        cmd_match = re.search(r"RUN COMMAND: (.*)", verdict)
        
        if create_file_match:
            path = create_file_match.group(1).strip()
            content = create_file_match.group(2).strip()
            await log_thought("Executor", f"Detected file creation intent for {path}...")
            
            tool_call = ToolCall(tool_name="write_file", args={"filepath": path, "content": content})
            result = await self.executor.execute_tool(tool_call)
            await log_thought("Executor", f"Result: {result}")
            
        elif cmd_match:
            cmd = cmd_match.group(1).strip()
            await log_thought("Executor", f"Detected command execution intent: {cmd}...")
            
            tool_call = ToolCall(tool_name="run_terminal", args={"command": cmd})
            result = await self.executor.execute_tool(tool_call)
            await log_thought("Executor", f"Result: {result}")
        
        return {
            "query": query,
            "final_answer": verdict,
            "history": history
        }
