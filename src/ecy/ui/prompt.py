
from prompt_toolkit import PromptSession
from prompt_toolkit.styles import Style
import os
import subprocess
import shlex

class Prompt:
    def __init__(self):
        self.style = Style.from_dict({
            "prompt": "ansicyan bold",
            "path": "ansigreen",
            "arrow": "ansiyellow",
        })
        self.session = PromptSession(style=self.style)

    def get_prompt_tokens(self):
        cwd = os.getcwd()
        return [("class:prompt", "[eCy] "), ("class:path", cwd + " "), ("class:arrow", "λ ")]

    def run(self):
        while True:
            try:
                text = self.session.prompt(self.get_prompt_tokens())
                text = text.strip()
                if not text:
                    continue
                if text in {"exit", "quit"}:
                    break
                
                # Simple execution
                # In a real app, this would be delegated to a CommandExecutor or similar
                try:
                    subprocess.run(shlex.split(text), check=False)
                except FileNotFoundError:
                    print(f"Command not found: {text}")
                except Exception as e:
                    print(f"Error: {e}")
                    
            except KeyboardInterrupt:
                continue
            except EOFError:
                break

def main():
    p = Prompt()
    p.run()

if __name__ == "__main__":
    main()
