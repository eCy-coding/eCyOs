from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import random
import sys
import os

# Ensure src modules are found
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from src.bridge.brain_adapter import BrainAdapter
from src.ecy.vision.vision_adapter import VisionAdapter

app = FastAPI()

# Allow connections from the Frontend (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()
adapter = BrainAdapter(manager)
vision = VisionAdapter()

class PromptRequest(BaseModel):
    prompt: str

@app.get("/")
def read_root():
    return {"status": "online", "system": "eCy OS"}

@app.get("/api/ping")
def ping():
    return {"pong": True}

@app.websocket("/ws/brain")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await manager.broadcast({
            "type": "log", 
            "content": "[BRIDGE] Connected to eCy OS Neural Core (Active Mode)."
        })
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/api/prompt")
async def trigger_brain(request: PromptRequest, background_tasks: BackgroundTasks):
    """
    Receives a prompt from the Portal and triggers the Brain in the background.
    """
    # Run the debate in the background so we don't block the API response
    background_tasks.add_task(adapter.process_prompt, request.prompt)
    return {"status": "accepted", "message": "Brain processing started."}

@app.post("/api/vision")
async def trigger_vision(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Receives an image, analyzes it (mock VLM), and then triggers a debate on the finding.
    """
    file_bytes = await file.read()
    
    async def process_visual_input(bytes_data, name):
        # 1. Broadast "Seeing" state
        await manager.broadcast({
            "type": "log",
            "content": f"[VISION] Analyzing {name}..."
        })
        
        # 2. VLM Analysis
        description = await vision.analyze_image(bytes_data, name)
        
        await manager.broadcast({
            "type": "log",
            "content": f"[VISION] Identification: {description}"
        })
        
        # 3. Trigger Debate
        prompt = f"I have analyzed an image named '{name}'. {description}. Please analyze the implications of this finding and propose next steps."
        await adapter.process_prompt(prompt)

    background_tasks.add_task(process_visual_input, file_bytes, file.filename)
    return {"status": "accepted", "message": "Vision processing started."}

# Real System Telemetry Loop
async def telemetry_loop():
    while True:
        await asyncio.sleep(5)
        # In a real system, we'd read `psutil` here
        await manager.broadcast({
            "type": "telemetry",
            "cpu": random.randint(15, 60), # fluctuating stats
            "memory": "14.4GB",
            "agents": 3 # Proposer, Critic, Judge
        })

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(telemetry_loop())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
