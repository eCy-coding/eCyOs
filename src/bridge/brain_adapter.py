import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from src.ecy.intelligence.debate_coordinator import DebateCoordinator

class BrainAdapter:
    def __init__(self, connection_manager):
        self.manager = connection_manager
        self.coordinator = DebateCoordinator()

    async def logger_callback(self, role: str, content: str):
        """
        Adapts internal Debate logs to WebSocket messages.
        """
        # Distinguish log types based on content or role
        msg_type = "thought" if role in ["Proposer", "Critic", "Judge", "Executor"] else "log"
        
        # Color coding via tags
        formatted_content = f"[{role.upper()}] {content}"
        
        # Special terminal output
        if role == "Executor" and "Result:" in content:
             await self.manager.broadcast({
                "type": "terminal",
                "line": content.replace("Result: ", "")
            })
        
        await self.manager.broadcast({
            "type": msg_type,
            "content": formatted_content,
            "agent": role
        })
        
        # If it's a code block, we might want to split it out (simplified for now)
        if "```" in content:
             await self.manager.broadcast({
                "type": "code",
                "content": content
            })

    async def process_prompt(self, prompt: str):
        """
        Triggers the debate with the given prompt.
        """
        await self.manager.broadcast({
            "type": "log",
            "content": f"[SYSTEM] Received prompt: {prompt}"
        })
        
        result = await self.coordinator.conduct_debate(
            query=prompt,
            max_turns=2, # Shorter for demo
            callback=self.logger_callback
        )
        
        await self.manager.broadcast({
             "type": "log",
             "content": f"[SYSTEM] Debate Concluded. Final Answer: {result['final_answer']}"
        })
        
        return result
