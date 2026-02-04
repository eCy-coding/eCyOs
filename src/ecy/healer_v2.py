import asyncio
import websockets
import json
import sys
import os
import re
from datetime import datetime

# Use absolute import assuming run as module from root
from src.ecy.intelligence.unified_provider import UnifiedIntelligenceProvider
from src.ecy.action.executor import Executor

class ReflexionLoop:
    """
    Implements the "Reflexion" pattern with CONTEXT-AWARE PATCHING:
    1. Detect Error
    2. Extract Filename (Regex)
    3. Read Content
    4. Generate Patch (Ask 'How?') -> Return JSON {file, search, replace}
    5. Apply Patch (Executor)
    """
    def __init__(self):
        self.brain = UnifiedIntelligenceProvider()
        self.executor = Executor()
        self.project_root = os.getcwd()

    def _extract_filename(self, traceback_str: str) -> str:
        """Finds the most likely file causing the error from the traceback."""
        # Regex to find File "path", line N
        # Relaxed regex to handle potential variations or newlines
        print(f"[Healer] Parsing Traceback ({len(traceback_str)} chars)...")
        # print(f"[Healer] DEBUG RAW:\n{traceback_str}\n[Healer] END RAW") 
        
        # Standard Python Traceback: File "..."
        match = re.search(r'File\s+["\']([^"\']+)["\']', traceback_str)
        if match:
            return match.group(1)
        
        # Fallback: look for generic file paths if 'File' keyword missing (unlikely but safe)
        match_generic = re.search(r'([a-zA-Z0-9_\-\./]+\.py)', traceback_str)
        if match_generic:
             return match_generic.group(1)
             
        return None

    def _read_file_content(self, filepath: str) -> str:
        """Safely reads file content to provide context."""
        try:
            full_path = os.path.abspath(filepath)
            if not os.path.exists(full_path):
                # Try relative to root
                full_path = os.path.join(self.project_root, filepath)
            
            if os.path.exists(full_path):
                with open(full_path, 'r', encoding='utf-8') as f:
                    return f.read()
            return None
        except Exception as e:
            print(f"[Healer] Read Error: {e}")
            return None

    def reflect_and_patch(self, error_context: str) -> dict:
        """
        Orchestrates the context gathering and patching.
        """
        print(f"[Healer] Analyzing Traceback for Context...")
        
        # 1. Identify File
        target_file = self._extract_filename(error_context)
        if not target_file:
            print(f"[Healer] Could not extract filename from traceback in:\n{error_context[:200]}...")
            return None

        print(f"[Healer] Target File Identified: {target_file}")
        
        # 2. Read Content
        content = self._read_file_content(target_file)
        if not content:
            print(f"[Healer] Could not read content of {target_file}. Cannot patch safely.")
            return None

        print(f"[Healer] Read {len(content)} chars of context.")

        # 3. Prompt Patch Engineer with CONTEX
        system_prompt = """You are the Context-Aware Patch Engineer.
You will be given a FILE CONTENT and a TRACEBACK.
Output a JSON object with three keys:
1. "file": The relative path of the file to be patched.
2. "search_block": The EXACT existing code block that contains the error. Copy it character-for-character from the FILE CONTENT provided (including exact indentation).
3. "replace_block": The corrected code block.

Output ONLY the JSON object."""

        user_content = f"""FILE PATH: {target_file}
FILE CONTENT:
```python
{content}
```

TRACEBACK:
{error_context}

Provide the JSON patch."""
        
        prompt = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]
        
        print("[Healer] Asking Brain for Patch...")
        response_text = self.brain.chat_complete("llama3", prompt, temperature=0.1)
        return self._parse_json(response_text)

    def _parse_json(self, text: str) -> dict:
        """Robustly extracts JSON from LLM response."""
        try:
            clean = re.sub(r'```json\s*', '', text)
            clean = re.sub(r'```', '', clean)
            clean = clean.strip()
            start = clean.find('{')
            end = clean.rfind('}')
            if start != -1 and end != -1:
                clean = clean[start:end+1]
            return json.loads(clean)
        except json.JSONDecodeError:
            print(f"[Healer] JSON Parse Error. Raw: {text[:50]}...")
            return None

class HealerDaemon:
    def __init__(self):
        self.uri = "ws://localhost:8000/ws/brain"
        self.reflexion = ReflexionLoop()

    async def run(self):
        print(f"[Healer] Connection to Neural Link ({self.uri})...")
        
        async with websockets.connect(self.uri) as websocket:
            print("[Healer] Connected. Monitoring for Anomalies...")
            while True:
                try:
                    message = await websocket.recv()
                    data = json.loads(message)
                    
                    # Listen for thoughts that signal an error
                    if data.get("type") == "THOUGHT" and "[ERROR]" in data.get("content", ""):
                        error_msg = data.get("content")
                        print(f"[Healer] ANOMALY DETECTED. Analyzing Context...")
                        
                        # Trigger Context-Aware Patching
                        patch_data = self.reflexion.reflect_and_patch(error_msg)
                        
                        if patch_data and "file" in patch_data and "search_block" in patch_data:
                            target_file = patch_data["file"]
                            search = patch_data["search_block"]
                            replace = patch_data["replace_block"]
                            
                            print(f"[Healer] Applying Patch to {target_file}...")
                            success = self.reflexion.executor.apply_search_replace(target_file, search, replace)
                            
                            if success:
                                print(f"[Healer] ✅ Patch Applied Successfully.")
                            else:
                                print(f"[Healer] ❌ Patch Application Failed.")
                        else:
                            print(f"[Healer] Failed to generate valid patch.")

                except Exception as e:
                    print(f"[Healer] Loop Error: {e}")
                    await asyncio.sleep(1)

if __name__ == "__main__":
    daemon = HealerDaemon()
    asyncio.run(daemon.run())
