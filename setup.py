
from setuptools import setup, find_packages, Extension
import os
import sys

# Try to use Cython if available
try:
    from Cython.Build import cythonize
    USE_CYTHON = True
except ImportError:
    USE_CYTHON = False

ext_modules = []

if USE_CYTHON:
    print("Cython found. Compiling optimized modules...")
    extensions = [
        Extension("ecy.session_manager", ["src/ecy/session_manager.py"]),
        Extension("ecy.macro", ["src/ecy/macro.py"]),
        # Add more modules here as needed
    ]
    # Use cythonize to build the extensions
    # compiler_directives={'language_level': "3"} handles Python 3 syntax
    ext_modules = cythonize(extensions, compiler_directives={'language_level': "3"})
else:
    print("Cython not found. Using pure Python.")

setup(
    name="ecy",
    version="0.2.0-perf",
    description="eCy OS - iTerm-style Terminal Environment (Optimized)",
    author="Antigravity",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    include_package_data=True,
    install_requires=[
        "prompt_toolkit>=3.0.0",
        "urwid>=2.1.0",
        "pyyaml>=6.0",
    ],
    extras_require={
        "gpu": ["torch", "numpy"],
    },
    entry_points={
        "console_scripts": [
            "ecy=ecy.main:main",
        ],
    },
    ext_modules=ext_modules,
    python_requires=">=3.8",
)
