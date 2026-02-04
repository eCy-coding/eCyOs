import argparse
import asyncio
import sys
import os

# Ensure project root is in PYTHONPATH
sys.path.append(os.getcwd())

from src.ecy.orchestrator import Orchestrator

def main():
    parser = argparse.ArgumentParser(prog='ecy', description='eCy OS command line interface')
    subparsers = parser.add_subparsers(dest='command')

    # ecy:start - launch full system (placeholder)
    start_parser = subparsers.add_parser('start', help='Launch the full eCy OS system')

    # ecy:run <goal> - run orchestrator to build a feature
    run_parser = subparsers.add_parser('run', help='Run orchestrator with a natural language goal')
    run_parser.add_argument('goal', type=str, help='Goal description for the orchestrator')

    # ecy:self-improve - trigger self‑improvement loop (placeholder)
    improve_parser = subparsers.add_parser('self-improve', help='Trigger self‑improvement loop')

    args = parser.parse_args()

    if args.command == 'start':
        print('[eCy] Starting full system...')
        # Placeholder: could start services, UI, etc.
        # For now just instantiate orchestrator and exit.
        orchestrator = Orchestrator()
        print('[eCy] System initialized. Use ecy run <goal> to build features.')
    elif args.command == 'run':
        orchestrator = Orchestrator()
        print(f'[eCy] Running orchestrator for goal: {args.goal}')
        asyncio.run(orchestrator.construct_feature(args.goal))
    elif args.command == 'self-improve':
        print('[eCy] Self‑improvement loop triggered (not yet implemented).')
        # Placeholder for future self‑improvement integration.
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
