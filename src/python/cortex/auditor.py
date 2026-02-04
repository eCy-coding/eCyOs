"""Code Auditor module for Antigravity Cortex.

Scans the codebase for violations of Global Coding Standards (2025).
- Google TS: No 'any'.
- Airbnb JS: No 'var'.
"""

import os
import re
from typing import Dict, Any, List

# Rules Definition
RULES = [
    {'id': 'no-any', 'pattern': r':\s*any\b', 'severity': 'error', 'msg': "Avoid 'any'. Use 'unknown' or specific types."},
    {'id': 'no-var', 'pattern': r'\bvar\b', 'severity': 'error', 'msg': "Avoid 'var'. Use 'const' or 'let'."},
    {'id': 'no-console', 'pattern': r'console\.log\(', 'severity': 'warning', 'msg': "Production code should use structured logging."},
    {'id': 'todo-comment', 'pattern': r'//\s*TODO', 'severity': 'info', 'msg': "Tracked technical debt."}
]

def audit_directory(path: str) -> Dict[str, Any]:
    """Recursively scans a directory for TS/JS files and checks rules.
    
    Args:
        path: The root directory to scan.
        
    Returns:
        Structured report of violations.
    """
    report = {
        'files_scanned': 0,
        'errors': 0,
        'warnings': 0,
        'violations': []
    }
    
    if not os.path.exists(path):
        return {'status': 'error', 'msg': 'Path not found'}
        
    for root, _, files in os.walk(path):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js')):
                file_path = os.path.join(root, file)
                scan_file(file_path, report)
                
    return report

def scan_file(file_path: str, report: Dict[str, Any]) -> None:
    """Scans a single file against defined Rules."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        report['files_scanned'] += 1
        
        for i, line in enumerate(lines):
            line_num = i + 1
            # Skip comments-only lines for naive regex? (MVP: No, regex might catch code)
            
            for rule in RULES:
                if re.search(rule['pattern'], line):
                    # Filter out legit uses if needed? (MVP: Strict)
                    violation = {
                        'file': file_path,
                        'line': line_num,
                        'rule': rule['id'],
                        'severity': rule['severity'],
                        'message': rule['msg'],
                        'code': line.strip()
                    }
                    report['violations'].append(violation)
                    
                    if rule['severity'] == 'error':
                        report['errors'] += 1
                    elif rule['severity'] == 'warning':
                        report['warnings'] += 1
                        
    except Exception as e:
        # File read error
        pass
