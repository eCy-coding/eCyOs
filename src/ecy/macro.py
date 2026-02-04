
import os
from pathlib import Path

class MacroManager:
    def __init__(self, rc_path=None):
        if rc_path:
            self.rc_path = Path(rc_path)
        else:
            self.rc_path = Path.home() / ".ecyrc"
            
    def load_aliases(self):
        aliases = {}
        if not self.rc_path.exists():
            return aliases
            
        with open(self.rc_path, "r") as f:
            for line in f:
                line = line.strip()
                if line.startswith("alias "):
                    # alias name='command'
                    parts = line[6:].split("=", 1)
                    if len(parts) == 2:
                        name = parts[0].strip()
                        cmd = parts[1].strip().strip("'").strip('"')
                        aliases[name] = cmd
        return aliases

    def resolve_alias(self, command):
        aliases = self.load_aliases()
        parts = command.split(" ", 1)
        base = parts[0]
        if base in aliases:
            resolved = aliases[base]
            if len(parts) > 1:
                return f"{resolved} {parts[1]}"
            return resolved
        return command
