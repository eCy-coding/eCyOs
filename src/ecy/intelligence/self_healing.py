from typing import Optional, Dict
from .unified_provider import UnifiedIntelligenceProvider
from .model_router import ModelRegistry, ModelRouter
import re

class Healer:
    """
    Autonomous Self-Healing Module (Healer v2).
    Analyzes error logs and code context to generate 'Patches'.
    """
    def __init__(self, provider: Optional[UnifiedIntelligenceProvider] = None):
        self.provider = provider or UnifiedIntelligenceProvider()
        self.router = ModelRouter()
        self.model = self.router.get_model_for_role("Executor") # Use the Expert Coder

    def heal(self, error_log: str, broken_code: str) -> Dict[str, str]:
        """
        Analyzes the error and generates a fix.
        Returns:
            {"diagnosis": str, "patch_code": str}
        """
        print(f"[Healer] Diagnostic initiated for error: {error_log[:50]}...")
        
        SYSTEM_PROMPT = """You are the HEALER (Expert Debugger).
        Your goal: Diagnose fatal errors and generate a surgically precise Python patch.
        Input: Error Log + Broken Code.
        Output:
        1. Diagnosis (1 sentence).
        2. FIX CODE (The complete corrected function or file).
        """
        
        USER_PROMPT = f"""
        ERROR LOG:
        {error_log}
        
        BROKEN CODE:
        {broken_code}
        
        Generate the fixed code block now.
        """
        
        response = self.provider.chat_complete(
            self.model,
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": USER_PROMPT}
            ]
        )
        
        # Simple parsing logic (in a real system, use structured output or a parser)
        diagnosis = "Automated Fix"
        code = response
        
        # Try to extract code block
        code_match = re.search(r"```python(.*?)```", response, re.DOTALL)
        if code_match:
            code = code_match.group(1).strip()
            
        return {
            "diagnosis": diagnosis,
            "patch_code": code,
            "raw_response": response
        }
