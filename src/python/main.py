#!/usr/bin/env python3
"""Antigravity Python Cortex Entry Point.

This module acts as the bridge between the Electron/Node.js orchestrator
and the Python computational layer. It reads JSON commands from stdin
and writes JSON responses to stdout.

Copyright 2026 Antigravity Project.
"""

import sys
import json
import logging
from typing import Dict, Any, Optional

# Configure logging to stderr to not corrupt stdout JSON stream
logging.basicConfig(stream=sys.stderr, level=logging.INFO)

def process_command(command: Dict[str, Any]) -> Dict[str, Any]:
    """Processes a single command from the orchestrator.

    Args:
        command: A dictionary containing 'action' and 'payload'.

    Returns:
        A dictionary containing 'status', 'result', or 'error'.
    """
    action = command.get('action')
    payload = command.get('payload', {})
    request_id = command.get('id')

    logging.info(f"Received action: {action}")

    try:
        if action == 'PING':
            return {'id': request_id, 'status': 'ok', 'result': 'PONG'}
        
        if action == 'MATH_HEAVY':
            # Lazy import to speed up startup
            from cortex.math_ops import perform_heavy_calc
            result = perform_heavy_calc(payload.get('matrix', []))
            return {'id': request_id, 'status': 'ok', 'result': result}

        if action == 'ANALYZE_TEXT':
            from cortex.analyzer import analyze_text
            result = analyze_text(payload.get('text', ''))
            return {'id': request_id, 'status': 'ok', 'result': result}

        if action == 'PREDICT_TREND':
            from cortex.data_science import predict_trend
            result = predict_trend(payload.get('data', []))
            return {'id': request_id, 'status': 'ok', 'result': result}

        if action == 'AUDIT_CODE':
            from cortex.auditor import audit_directory
            result = audit_directory(payload.get('path', '.'))
            return {'id': request_id, 'status': 'ok', 'result': result}

        if action == 'AUTO_CORRECT':
            from cortex.corrector import apply_fixes
            result = apply_fixes(payload.get('path', '.'))
            return {'id': request_id, 'status': 'ok', 'result': result}

        # [PHASE 46/47] Nexus Routing
        if action in ['OLLAMA_INFERENCE', 'OS_AUTOMATION', 'NEXUS_SYNC', 'POLYGLOT_EXEC', 'MATH_EXEC', 'ACADEMIC_ANALYZE', 'ACADEMIC_LOOP', 'W3C_ANALYZE', 'W3C_SCAN']:
            from cortex.nexus import NexusCore
            nexus = NexusCore() 
            response = nexus.dispatch(action, payload)
            response['id'] = request_id
            return response

        return {'id': request_id, 'status': 'error', 'error': f"Unknown action: {action}"}

    except Exception as e:
        logging.error(f"Error processing {action}: {e}")
        return {'id': request_id, 'status': 'error', 'error': str(e)}

def main() -> None:
    """Main event loop listening on stdin."""
    logging.info("Python Cortex Started. Waiting for input...")
    
    for line in sys.stdin:
        try:
            line = line.strip()
            if not line:
                continue
            
            command = json.loads(line)
            response = process_command(command)
            
            # Print JSON response followed by newline
            print(json.dumps(response))
            sys.stdout.flush()
            
        except json.JSONDecodeError:
            logging.error("Failed to decode JSON input.")
            print(json.dumps({'status': 'error', 'error': 'Invalid JSON'}))
            sys.stdout.flush()

if __name__ == '__main__':
    main()
