
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import random
import psutil
import os
import sys
import pty
import fcntl
import struct
import termios
import signal
import select 
from typing import List, Dict

# Import the Brain
# Ensure src modules are found
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from src.ecy.orchestrator import Orchestrator

app = FastAPI()

# Enable CORS for React Frontend (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify "http://localhost:5173"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    """
    Manages active WebSocket connections (Neural Synapses).
    Broadcasts telemetry and thought streams to all connected clients.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[Neural Link] Synapse connected: {websocket.client}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"[Neural Link] Synapse disconnected: {websocket.client}")

    async def broadcast(self, message: Dict):
        """Send a JSON message to all connected clients."""
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"[Neural Link] Error broadcasting: {e}")

manager = ConnectionManager()
orchestrator = None # Will be initialized on startup

# --- Telemetry Loop ---
async def telemetry_loop():
    """
    Background task to stream hardware stats (CPU/RAM) every 1s.
    """
    while True:
        try:
            cpu_usage = psutil.cpu_percent(interval=None)
            ram_usage = psutil.virtual_memory().percent
            
            # Mock "Agent Activity" score based on CPU load
            agent_activity = min(100, int(cpu_usage * 1.5))
            
            packet = {
                "type": "TELEMETRY",
                "cpu": cpu_usage,
                "ram": ram_usage,
                "agents": 3, # Mock for now (Proposer, Critic, Judge)
                "activity_score": agent_activity
            }
            
            if manager.active_connections:
                 await manager.broadcast(packet)
                 
        except Exception as e:
            print(f"[Telemtry] Error: {e}")
            
        await asyncio.sleep(1)

@app.on_event("startup")
async def startup_event():
    # Start the telemetry background task
    asyncio.create_task(telemetry_loop())
    
    # Initialize the Orchestrator (The Brain)
    global orchestrator
    orchestrator = Orchestrator()
    print("[Neural Link] Orchestrator attached to Cortex.")

@app.websocket("/ws/brain")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive raw text
            data = await websocket.receive_text()
            try:
                # Parse JSON signal
                message = json.loads(data)
                
                # ROUTING Logic
                if message.get("type") == "CODE_CONTEXT":
                    # Forward to Orchestrator for analysis
                    if orchestrator:
                        response = await orchestrator.process_code_context(message.get("payload", {}))
                        if response:
                             # Send Ghost Text back to editor
                             await websocket.send_json(response)
                             
                elif message.get("type") == "EXECUTE_PROMPT":
                     # Trigger full execution loop
                     prompt = message.get("payload", {}).get("prompt")
                     if orchestrator and prompt:
                         await orchestrator.construct_feature(prompt)

            except json.JSONDecodeError:
                # Fallback for plain strings
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- TERMINAL BRIDGE (The Hands) ---
@app.websocket("/ws/terminal")
async def terminal_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("[Terminal] Client connected")

    # Spawn PTY
    # Use 'zsh' as default shell, fallback to 'bash' or 'sh'
    shell = os.environ.get('SHELL', 'sh')
    master_fd, slave_fd = pty.openpty()
    
    # Create child process
    pid = os.fork()
    
    if pid == 0:
        # Child process: Set up session leader and file descriptors
        os.setsid()
        os.dup2(slave_fd, 0)
        os.dup2(slave_fd, 1)
        os.dup2(slave_fd, 2)
        
        # Don't need slave_fd anymore in child
        if slave_fd > 2:
            os.close(slave_fd)
            
        # Execute Shell
        # Set TERM to xterm-256color for nice formatting
        os.environ['TERM'] = 'xterm-256color'
        os.execv(shell, [shell])
    
    else:
        # Parent process: Bridge WebSocket <-> PTY
        os.close(slave_fd) # Close slave fd in parent
        
        loop = asyncio.get_running_loop()

        # Reading from PTY and sending to WebSocket
        async def read_from_pty():
            while True:
                try:
                    # Non-blocking read from PTY
                    data = await loop.run_in_executor(None, os.read, master_fd, 1024)
                    if not data:
                        break
                    # Send binary or text to WS
                    await websocket.send_text(data.decode('utf-8', errors='ignore'))
                except OSError:
                    break
                except Exception as e:
                    print(f"[Terminal] Read Error: {e}")
                    break
        
        # Reading from WebSocket and writing to PTY
        async def write_to_pty():
            try:
                while True:
                    data = await websocket.receive_text()
                    
                    # Handle Resizing Protocol: {"cols": 80, "rows": 24}
                    if data.startswith('{') and '"cols"' in data:
                        try:
                            resize_cmd = json.loads(data)
                            if "cols" in resize_cmd and "rows" in resize_cmd:
                                # Set Terminal Size
                                rows, cols = resize_cmd["rows"], resize_cmd["cols"]
                                # struct winsize { unsigned short ws_row; unsigned short ws_col; ... }
                                winsize = struct.pack("HHHH", rows, cols, 0, 0)
                                fcntl.ioctl(master_fd, termios.TIOCSWINSZ, winsize)
                                continue
                        except:
                            pass # If not valid json, treat as input (risky but okay for now)

                    # Write input to PTY
                    os.write(master_fd, data.encode())
            except WebSocketDisconnect:
                print("[Terminal] Client disconnected")
            except Exception as e:
                print(f"[Terminal] Write Error: {e}")
        
        # Run reader and writer concurrently
        ptemp_reader = asyncio.create_task(read_from_pty())
        ptemp_writer = asyncio.create_task(write_to_pty())

        # Wait for either to finish (likely WebSocket disconnect or Shell exit)
        done, pending = await asyncio.wait(
            [ptemp_reader, ptemp_writer], 
            return_when=asyncio.FIRST_COMPLETED
        )

        for task in pending:
            task.cancel()

        # Cleanup
        os.close(master_fd)
        try:
             os.kill(pid, signal.SIGTERM)
        except:
             pass
        print("[Terminal] Session closed")


# --- API Endpoints to Inject Thoughts ---
# The Python Brain (UnifiedIntelligenceProvider) will POST here 
# to broadcast its internal monologue to the frontend.

from pydantic import BaseModel

class ThoughtSignal(BaseModel):
    agent: str
    content: str
    role: str = "assistant"

@app.post("/api/inject_thought")
async def inject_thought(signal: ThoughtSignal):
    """
    Called by the AI Brain to stream thoughts to the UI.
    """
    packet = {
        "type": "THOUGHT",
        "agent": signal.agent,
        "content": signal.content,
        "timestamp": psutil.time.time()
    }
    await manager.broadcast(packet)
    return {"status": "broadcasted"}

if __name__ == "__main__":
    import uvicorn
    # Run on 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
