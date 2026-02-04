"""Auto-Corrector module for Antigravity Cortex.

PROGRAMMATICALLY fixes violations found by the Auditor.
- Replaces 'var' with 'let'.
- Comments out 'console.log'.
- Replaces ': any' with ': unknown' (Conservative).
"""

import os
import re
from typing import Dict, Any, List

def apply_fixes(path: str) -> Dict[str, Any]:
    """Scans and fixes files in the directory.
    
    Args:
        path: Root directory to scan.
        
    Returns:
        Report of fixed violations.
    """
    stats = {
        'files_modified': 0,
        'fixes_applied': 0,
        'details': []
    }
    
    if not os.path.exists(path):
        return {'status': 'error', 'msg': 'Path not found'}
        
    for root, _, files in os.walk(path):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js')):
                file_path = os.path.join(root, file)
                if fix_file(file_path, stats):
                    stats['files_modified'] += 1
                    
    return stats

def fix_file(file_path: str, stats: Dict[str, Any]) -> bool:
    """Reads, patches, and writes a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        new_lines = []
        modified = False
        
        for i, line in enumerate(lines):
            original = line
            new_line = line
            
            # Rule 1: No Console (Comment it out)
            # Regex: Not already commented, contains console.log
            if 'console.log(' in new_line and not new_line.strip().startswith('//'):
                # Check if it's not inside a block comment (Simplistic check)
                new_line = new_line.replace('console.log(', '// console.log(')
                if new_line != original:
                    stats['fixes_applied'] += 1
                    stats['details'].append(f"Fixed console.log in {os.path.basename(file_path)}:{i+1}")
                    
            # Rule 2: No Var
            if re.search(r'\bvar\b', new_line):
                # Replace var with let (safest assumption for legacy code)
                new_line = re.sub(r'\bvar\b', 'let', new_line)
                if new_line != original:
                    stats['fixes_applied'] += 1
                    stats['details'].append(f"Fixed var -> let in {os.path.basename(file_path)}:{i+1}")
            
            # Rule 3: No Any (Conservative)
            # Only fix explicit ': any' or ':any' to ': unknown'
            # Avoid cleaning up imports or comments (Simplistic regex)
            if re.search(r':\s*any\b', new_line):
                new_line = re.sub(r':\s*any\b', ': unknown', new_line)
                if new_line != original:
                    stats['fixes_applied'] += 1
                    stats['details'].append(f"Fixed any -> unknown in {os.path.basename(file_path)}:{i+1}")

            new_lines.append(new_line)
            if new_line != original:
                modified = True
                
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            return True
            
    except Exception as e:
        print(f"Failed to fix {file_path}: {e}")
        
    return False
