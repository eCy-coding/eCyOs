
import asyncio
import os
import ast
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from src.ecy.intelligence.openrouter import OpenRouterClient

class DocGenerator:
    """Uses LLM to generate docstrings for python files."""
    def __init__(self):
        self.ai = OpenRouterClient()

    async def generate_docstring(self, source_code: str, object_name: str) -> str:
        prompt = f"""
        You are The Scribe, an elite technical writer.
        Generate a concise, Google-style docstring for the following Python code object '{object_name}'.
        Return ONLY the docstring text, no quotes or snippets.
        
        Code:
        {source_code}
        """
        response = await self.ai.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            model="openai/gpt-4o"
        )
        if "error" in response:
            return f"Error: {response['error']}"
        try:
            return response["choices"][0]["message"]["content"]
        except (KeyError, IndexError):
            return "Error: Invalid response format."

class ScribeHandler(FileSystemEventHandler):
    """Watches for file changes and triggers documentation updates."""
    def __init__(self, doc_gen: DocGenerator):
        self.doc_gen = doc_gen
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)

    def on_modified(self, event):
        if event.src_path.endswith(".py"):
            print(f"[SCRIBE] Detected change in {event.src_path}")
            self.loop.run_until_complete(self.process_file(event.src_path))

    async def process_file(self, filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        try:
            tree = ast.parse(content)
            # Simple logic: If a function has no docstring, print a warning (simulating doc generation trigger)
            # In a full implementation, this would rewrite the file.
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    if not ast.get_docstring(node):
                        print(f"[SCRIBE] ⚠️ Missing docstring for function '{node.name}'. Queuing generation...")
                        # doc = await self.doc_gen.generate_docstring(ast.unparse(node), node.name)
                        # print(f"[SCRIBE] Generated: {doc}")
        except Exception as e:
            print(f"[SCRIBE] Error parsing {filepath}: {e}")

class ScribeAgent:
    def __init__(self, watch_dir="src"):
        self.watch_dir = watch_dir
        self.observer = Observer()
    
    def start(self):
        print(f"[SCRIBE] Watching {self.watch_dir} for changes...")
        handler = ScribeHandler(DocGenerator())
        self.observer.schedule(handler, self.watch_dir, recursive=True)
        self.observer.start()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.observer.stop()
        self.observer.join()

if __name__ == "__main__":
    agent = ScribeAgent()
    agent.start()
