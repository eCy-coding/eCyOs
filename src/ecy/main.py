
import sys
import argparse
import os
import subprocess
import webbrowser
from typing import List

# Ensure src is in path
sys.path.append(os.path.join(os.getcwd(), 'src'))

# Import Phase 1 & 2 Modules
# Import Phase 1 & 2 Modules
from ecy.ui.prompt import Prompt
from ecy.session_manager import SessionManager
from ecy.intelligence import DebateCoordinator, UnifiedIntelligenceProvider
from ecy.memory import GalacticArchive

def start_terminal(args):
    """Launch the interactive eCy Terminal."""
    session_mgr = SessionManager()
    profile = session_mgr.load_profile(args.profile)
    print(f"[eCy] Loading profile: {args.profile}")
    print("[eCy] Omni-Intelligence modules active.")
    
    prompt = Prompt()
    print("[eCy] UI Initialized. (Type 'exit' to quit)")
    try:
        prompt.run()
    except KeyboardInterrupt:
        print("\n[eCy] Shutting down...")

def run_think(args):
    """Execute the 'think' command using the Council of Wisdom."""
    query = " ".join(args.query)
    print(f"[eCy] Connecting to Council of Wisdom via OpenRouter...")
    print(f"[eCy] Query: {query}")
    
    # Initialize Brain & Memory
    brain = UnifiedIntelligenceProvider()
    memory = GalacticArchive()
    council = DebateCoordinator(provider=brain)
    
    # Run Debate
    result = council.conduct_debate(query, max_turns=args.turns)
    
    # Store in Memory
    saved = memory.store_debate(result['query'], result['final_answer'], result['history'])
    
    print("\n" + "="*40)
    print(f"FINAL ANSWER (Verified by {len(result['history'])} turns):")
    print(result['final_answer'])
    print("="*40)
    
    if saved:
        print("[eCy] Debate archived in Galactic Memory.")
    else:
        print("[eCy] Warning: Failed to archive debate.")

def launch_portal(args):
    """Launch the Liquid Glass Web Portal."""
    portal_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../website"))
    print(f"[eCy] Launching Portal from: {portal_path}")
    
    # Check if built
    if not os.path.exists(os.path.join(portal_path, "dist")):
        print("[eCy] Portal build not found. Please run 'npm run build' in website/ first.")
        return

    print("[eCy] Opening Neural Interface...")
    # Open browser
    webbrowser.open("http://localhost:4173") # Default Vite preview port
    
    # Run Vite Preview
    try:
        subprocess.run(["npm", "run", "preview", "--", "--port", "4173"], cwd=portal_path)
    except KeyboardInterrupt:
        print("\n[eCy] Portal closed.")

def run_construct(args):
    """Execute the 'construct' command to build a feature end-to-end."""
    import asyncio
    from ecy.orchestrator import Orchestrator
    
    goal = " ".join(args.goal)
    print(f"[eCy] Initializing Ouroboros Loop...")
    print(f"[eCy] GOAL: {goal}")
    
    orch = Orchestrator()
    try:
        asyncio.run(orch.construct_feature(goal))
    except KeyboardInterrupt:
        print("\n[eCy] Construction aborted.")

def main():
    parser = argparse.ArgumentParser(description="eCy OS v1005.0: The Omni-Intelligence System")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Command: start (Default)
    parser_start = subparsers.add_parser("start", help="Start the interactive terminal session")
    parser_start.add_argument("--profile", type=str, default="default", help="Profile to load")
    parser_start.set_defaults(func=start_terminal)

    # Command: think
    parser_think = subparsers.add_parser("think", help="Consult the AI Council of Wisdom")
    parser_think.add_argument("query", nargs="+", help="The question to ponder")
    parser_think.add_argument("--turns", type=int, default=3, help="Number of debate turns")
    parser_think.set_defaults(func=run_think)

    # Command: portal
    parser_portal = subparsers.add_parser("portal", help="Launch the Liquid Glass Web UI")
    parser_portal.set_defaults(func=launch_portal)

    # Command: construct
    parser_construct = subparsers.add_parser("construct", help="Build a feature autonomously")
    parser_construct.add_argument("goal", nargs="+", help="The feature to build")
    parser_construct.set_defaults(func=run_construct)

    args = parser.parse_args()

    # Default to start if no command provided
    if not args.command:
        start_terminal(args)
    else:
        args.func(args)

if __name__ == "__main__":
    main()
