
import logging
import json
from .ollama_client import OllamaClient
from .automator import AutomatorBridge
from .polyglot import PolyglotEngine
from .math_engine import MathEngine
from .academic import AcademicEngine
from .w3c_validator import W3CValidator
from .w3c_automator import W3CAutomator

class NexusCore:
    """
    The Nexus: Central Intelligence & Orchestration.
    Routes intents between LLM (Ollama), OS (Automator), Polyglot, Math, Academic, and W3C.
    """
    def __init__(self):
        self.ollama = OllamaClient()
        self.automator = AutomatorBridge()
        self.polyglot = PolyglotEngine()
        self.math = MathEngine()
        self.academic = AcademicEngine()
        self.w3c = W3CValidator()
        self.w3c_auto = W3CAutomator()
        self.logger = logging.getLogger("Nexus")

    def dispatch(self, action: str, payload: dict) -> dict:
        """
        Main Dispatcher.
        """
        self.logger.info(f"Nexus Dispatch: {action}")
        
        if action == "OLLAMA_INFERENCE":
            return self.handle_inference(payload)
        
        if action == "OS_AUTOMATION":
            return self.handle_automation(payload)
        
        if action == "POLYGLOT_EXEC":
            return self.polyglot.execute(payload.get("language"), payload.get("code"))
            
        if action == "MATH_EXEC":
            return self.math.execute(payload.get("library"), payload.get("function"), payload.get("args", []))

        if action == "ACADEMIC_ANALYZE":
            return self.academic.analyze_paper(payload.get("content"))

        if action == "ACADEMIC_LOOP":
            return self.academic.run_dynamicist_loop(payload.get("problem"))

        if action == "W3C_SCAN":
            return self.w3c_auto.run_compliance_scan(payload.get("base_url", "http://localhost:3000"))

        if action == "W3C_ANALYZE":
            return self.w3c.analyze_url(payload.get("url"))
        
        if action == "NEXUS_SYNC":
             return self.handle_sync()

        return {"status": "error", "error": f"Unknown Nexus Action: {action}"}

    def handle_inference(self, payload: dict) -> dict:
        model = payload.get("model", "qwen2.5:7b") # Default to Qwen as per Phase 36
        prompt = payload.get("prompt", "")
        system = payload.get("system_prompt")
        
        # Check if chat or generate
        if "messages" in payload:
            return self.ollama.chat(model, payload["messages"])
        else:
            return self.ollama.generate(model, prompt, system)

    def handle_automation(self, payload: dict) -> dict:
        type_ = payload.get("type", "applescript") # applescript, jxa, workflow
        script = payload.get("script")
        path = payload.get("path")
        
        if type_ == "applescript" and script:
            return self.automator.run_applescript(script)
        elif type_ == "jxa" and script:
            return self.automator.run_jxa(script)
        elif type_ == "workflow" and path:
             return self.automator.run_workflow(path, payload.get("input"))
        
        return {"status": "error", "error": "Invalid Automation Payload"}

    def handle_sync(self) -> dict:
        return {
            "status": "online",
            "capabilities": ["ollama", "automator", "nexus_core"],
            "version": "1.0.0"
        }
