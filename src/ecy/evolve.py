import os
import ast
import difflib
import time
import shutil
from typing import List, Dict, Optional, Tuple
from ecy.intelligence.unified_provider import UnifiedIntelligenceProvider

class SelfEvolutionEngine:
    """
    The Ouroboros Protocol Engine.
    Autonomous capabilities:
    1. Scan codebase for high-complexity files.
    2. Propose refactoring via Hive Mind.
    3. Apply atomic updates with rollback capability.
    """
    def __init__(self, project_root: str = "."):
        self.project_root = os.path.abspath(project_root)
        self.brain = UnifiedIntelligenceProvider()
        self.complexity_threshold = 10  # Cyclomatic complexity threshold

    def scan_codebase(self) -> List[Dict[str, Any]]:
        """
        Scans .py files and calculates complexity.
        Returns a list of 'hotspot' files needing evolution.
        """
        hotspots = []
        print(f"[Ouroboros] Scanning {self.project_root}...")
        
        for root, dirs, files in os.walk(self.project_root):
            if "venv" in root or "node_modules" in root or ".git" in root:
                continue
                
            for file in files:
                if file.endswith(".py"):
                    full_path = os.path.join(root, file)
                    try:
                        complexity = self._calculate_complexity(full_path)
                        if complexity > self.complexity_threshold:
                            print(f"[Ouroboros] Hotspot detected: {file} (Complexity: {complexity})")
                            hotspots.append({
                                "path": full_path,
                                "complexity": complexity,
                                "name": file
                            })
                    except Exception as e:
                        print(f"[Ouroboros] Error scanning {file}: {e}")
                        
        return sorted(hotspots, key=lambda x: x['complexity'], reverse=True)

    def _calculate_complexity(self, file_path: str) -> int:
        """
        Simple AST-based Cyclomatic Complexity calculator.
        """
        with open(file_path, "r", encoding="utf-8") as f:
            code = f.read()
            
        tree = ast.parse(code)
        complexity = 1
        for node in ast.walk(tree):
            if isinstance(node, (ast.If, ast.While, ast.For, ast.Assert, ast.ExceptHandler, ast.With, ast.Try)):
                complexity += 1
            elif isinstance(node, ast.BoolOp):
                complexity += len(node.values) - 1
        return complexity

    def propose_evolution(self, file_path: str) -> str:
        """
        Asks the Hive Mind to refactor the code.
        """
        with open(file_path, "r", encoding="utf-8") as f:
            code = f.read()

        print(f"[Ouroboros] Consult Hive Mind for {os.path.basename(file_path)}...")
        
        prompt = f"""
        ROLE: Master Software Architect (Python Expert).
        TASK: Refactor the following code to reduce McCabe Complexity and improve readability.
        CONSTRAINT: Output ONLY the full valid Python code. No markdown fences, no explanations.
        
        CODE:
        {code}
        """
        
        # Use a "coding" model if available, otherwise default
        refactored_code = self.brain.chat_complete(
            model="openai/gpt-4o", 
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Strip potential markdown if the model ignores checking
        if refactored_code.startswith("```python"):
            refactored_code = refactored_code.split("\n", 1)[1]
        if refactored_code.endswith("```"):
            refactored_code = refactored_code.rsplit("\n", 1)[0]
            
        return refactored_code.strip()

    def apply_evolution(self, file_path: str, new_code: str) -> bool:
        """
        Applies changes atomically: Backup -> Write -> Test -> Commit/Rollback.
        """
        backup_path = file_path + ".bak"
        print(f"[Ouroboros] Evolving {os.path.basename(file_path)}...")
        
        # 1. Backup
        shutil.copy2(file_path, backup_path)
        
        try:
            # 2. Write New Code
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_code)
                
            # 3. Verify (Syntax Check)
            with open(file_path, "r", encoding="utf-8") as f:
                ast.parse(f.read())
            
            print(f"[Ouroboros] Mutation successful. Syntax Verified.")
            return True
            
        except SyntaxError as e:
            print(f"[Ouroboros] ❌ Mutation Failed (Syntax Error): {e}")
            print(f"[Ouroboros] Rolling back...")
            shutil.copy2(backup_path, file_path)
            return False
        except Exception as e:
            print(f"[Ouroboros] ❌ Mutation Failed (Unknown): {e}")
            shutil.copy2(backup_path, file_path)
            return False

if __name__ == "__main__":
    engine = SelfEvolutionEngine()
    targets = engine.scan_codebase()
    
    if targets:
        target = targets[0] # Pick the worst offender
        print(f"[Ouroboros] Selected Target: {target['name']}")
        
        new_code = engine.propose_evolution(target['path'])
        if new_code:
            engine.apply_evolution(target['path'], new_code)
    else:
        print("[Ouroboros] System Entropy Nominal. No evolution required.")
