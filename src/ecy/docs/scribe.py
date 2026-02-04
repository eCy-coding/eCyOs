import os
import ast
import sys
import glob

DOCS_DIR = os.path.join(os.getcwd(), "docs", "docs", "api")

class Scribe:
    """
    The Scribe Agent.
    Responsible for:
    1. Scanning codebase for Python files.
    2. Calculating Docstring Coverage.
    3. Generating API Documentation (Markdown) for Docusaurus.
    """
    def __init__(self, src_dir="src"):
        self.src_dir = src_dir
        self.files = []
        self.stats = {"total_nodes": 0, "documented_nodes": 0}

    def scan(self):
        """Finds all python files."""
        pattern = os.path.join(self.src_dir, "**", "*.py")
        self.files = glob.glob(pattern, recursive=True)
        print(f"[Scribe] Found {len(self.files)} Python files in {self.src_dir}.")

    def check_coverage(self):
        """Parses AST to check for docstrings."""
        for file in self.files:
            try:
                with open(file, "r", encoding="utf-8") as f:
                    tree = ast.parse(f.read())
                
                for node in ast.walk(tree):
                    if isinstance(node, (ast.FunctionDef, ast.ClassDef, ast.Module)):
                        self.stats["total_nodes"] += 1
                        if ast.get_docstring(node):
                            self.stats["documented_nodes"] += 1
            except Exception as e:
                print(f"[Scribe] Error parsing {file}: {e}")

        coverage = 0
        if self.stats["total_nodes"] > 0:
            coverage = (self.stats["documented_nodes"] / self.stats["total_nodes"]) * 100
            
        print(f"[Scribe] Documentation Coverage: {coverage:.2f}% ({self.stats['documented_nodes']}/{self.stats['total_nodes']})")
        return coverage

    def generate_api_docs(self):
        """Generates MDX files for Docusaurus."""
        if not os.path.exists(DOCS_DIR):
            os.makedirs(DOCS_DIR, exist_ok=True)
            
        for file in self.files:
            try:
                rel_path = os.path.relpath(file, os.getcwd())
                module_name = rel_path.replace("/", ".").replace(".py", "")
                
                # Check coverage for this specific file to decide if we generate docs
                with open(file, "r") as f:
                    node = ast.parse(f.read())
                
                docstring = ast.get_docstring(node) or "No module description provided."
                # MDX Sanitization
                docstring = docstring.replace("{", "&#123;").replace("}", "&#125;")
                
                # Create MDX content
                md_content = f"""---
title: {module_name}
sidebar_label: {os.path.basename(file)}
---

# {module_name}

{docstring}

## Source Code
```python
# Path: {rel_path}
# (See source file for full implementation)
```

## Functions & Classes

"""
                for item in node.body:
                    if isinstance(item, (ast.FunctionDef, ast.ClassDef)):
                        name = item.name
                        item_doc = ast.get_docstring(item) or "*No documentation.*"
                        # MDX Sanitization
                        item_doc = item_doc.replace("{", "&#123;").replace("}", "&#125;")
                        type_label = "Class" if isinstance(item, ast.ClassDef) else "Function"
                        
                        md_content += f"### {type_label}: `{name}`\n\n{item_doc}\n\n---\n"

                # Write to docs/docs/api/
                # We flatten the structure for simplicity in V1, or keep hierarchy?
                # Let's flatten: src_ecy_core.md
                safe_name = module_name.replace(".", "_") + ".md"
                out_path = os.path.join(DOCS_DIR, safe_name)
                
                with open(out_path, "w") as f:
                    f.write(md_content)
                    
            except Exception as e:
                print(f"[Scribe] Failed to generate docs for {file}: {e}")

        print(f"[Scribe] Generated API docs in {DOCS_DIR}")

if __name__ == "__main__":
    scribe = Scribe()
    scribe.scan()
    scribe.check_coverage()
    
    if "--generate" in sys.argv:
        scribe.generate_api_docs()
