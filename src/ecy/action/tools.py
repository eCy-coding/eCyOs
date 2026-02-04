from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field

try:
    from pydantic import BaseModel, Field
    HAS_PYDANTIC = True
    
    class TerminalCommand(BaseModel):
        command: str = Field(..., description="The terminal command to execute (e.g., 'ls -la', 'python3 script.py').")
        cwd: Optional[str] = Field(None, description="The directory to execute the command in.")

    class FileWrite(BaseModel):
        filepath: str = Field(..., description="The absolute path to the file to write.")
        content: str = Field(..., description="The content to write to the file.")
        mode: str = Field("w", description="Write mode ('w' for write, 'a' for append).")

    class ToolCall(BaseModel):
        tool_name: str = Field(..., description="Name of the tool to call ('run_terminal', 'write_file').")
        args: dict = Field(..., description="Arguments for the tool.")

except ImportError:
    HAS_PYDANTIC = False
    
    # Fallback to Dataclasses
    @dataclass
    class TerminalCommand:
        command: str
        cwd: Optional[str] = None

    @dataclass
    class FileWrite:
        filepath: str
        content: str
        mode: str = "w"

    @dataclass
    class ToolCall:
        tool_name: str
        args: Dict[str, Any]
