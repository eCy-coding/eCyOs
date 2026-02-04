
from typing import Optional, Dict
from ..intelligence import UnifiedIntelligenceProvider

class Healer:
    """
    Self-Correction Module.
    Analyzes errors and attempts to generate patches using the Brain.
    """
    def __init__(self, brain: Optional[UnifiedIntelligenceProvider] = None):
        self.brain = brain or UnifiedIntelligenceProvider()

    def diagnose_and_heal(self, error_message: str, context_code: str = "") -> str:
        """
        Analyze an error and propose a fix.
        """
        prompt = [
            {"role": "system", "content": "You are an autonomous self-healing agent. Analyze the error and provide a code fix (patch)."},
            {"role": "user", "content": f"Error: {error_message}\nContext:\n{context_code}\n\nPropose a fix:"}
        ]
        
        print("[Healer] Analyzing error pattern...")
        patch = self.brain.chat_complete("expert-debugger", prompt, temperature=0.1)
        
        return patch

    def suggest_next_step(self, task_history: list) -> str:
        """
        Suggest the next logical step based on history.
        """
        return "Proceed with caution."
