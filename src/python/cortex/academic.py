
import logging
from .ollama_client import OllamaClient

class AcademicEngine:
    """
    The Academic Engine (The Dynamicist).
    Implements the recursive self-improvement loop inspired by 25 academic papers.
    Roles:
    - The Analyst (Paper Analysis)
    - The Skeptic (Criticism)
    - The Architect (Planning)
    """
    def __init__(self):
        self.ollama = OllamaClient()
        self.logger = logging.getLogger("AcademicEngine")
    
    def analyze_paper(self, paper_content: str) -> dict:
        """
        [E2E Analysis] detailed analysis of a research paper.
        """
        prompt = f"Act as an Expert Reviewer. Analyze this paper E2E:\n\n{paper_content[:2000]}..." # Truncated for token limit mock
        response = self.ollama.generate("llama3", prompt)
        return {"status": "success", "analysis": response}

    def run_dynamicist_loop(self, problem_statement: str) -> dict:
        """
        Executes the 'The Dynamicist' loop: Plan -> Critique -> Refine.
        """
        self.logger.info("Starting Dynamicist Loop...")
        
        # 1. The Architect (Initial Plan)
        plan_prompt = f"Act as The Architect. Create a high-level plan for: {problem_statement}"
        plan = self.ollama.generate("llama3", plan_prompt)
        
        # 2. The Skeptic (Critique)
        critique_prompt = f"Act as The Skeptic. Find flaws in this plan:\n{plan}"
        critique = self.ollama.generate("llama3", critique_prompt)
        
        # 3. The Analyst (Refined Solution)
        refine_prompt = f"Act as The Analyst. Refine the plan based on critique:\nPlan: {plan}\nCritique: {critique}"
        final_solution = self.ollama.generate("llama3", refine_prompt)
        
        return {
            "status": "success",
            "cycle": {
                "initial_plan": plan,
                "critique": critique,
                "final_solution": final_solution
            }
        }
