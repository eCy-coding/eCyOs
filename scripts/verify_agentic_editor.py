
import asyncio
import websockets
import json

async def test_agentic_editor_backend():
    uri = "ws://localhost:8000/ws/brain"
    async with websockets.connect(uri) as websocket:
        print("[Test] Connected to Neural Link")

        # 1. Send Code Context
        payload = {
            "type": "CODE_CONTEXT",
            "payload": {
                "content": "def calculate_orbit():\n    pass\n\ndef ", # Should trigger ghost text
                "cursor": {"lineNumber": 4, "column": 5}
            }
        }
        await websocket.send(json.dumps(payload))
        print(f"[Test] Sent: {json.dumps(payload)}")

        # 2. Receive Ghost Text
        try:
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            data = json.loads(response)
            
            if data.get("type") == "GHOST_TEXT":
                print(f"[Test] Success! Received Ghost Text: {data.get('content')}")
            else:
                print(f"[Test] Received unexpected message: {data}")
                
        except asyncio.TimeoutError:
            print("[Test] Timeout waiting for Ghost Text")
        except Exception as e:
            print(f"[Test] Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_agentic_editor_backend())
