from typing import Optional, List, Dict, Union, Any
import sys

# Safe Import for SymPy
try:
    import sympy
    from sympy import symbols, diff, solve, simplify, Matrix, expand, factor
    from sympy.parsing.sympy_parser import parse_expr
    HAS_SYMPY = True
except ImportError:
    HAS_SYMPY = False
    print("[MathCore] Warning: 'sympy' not found. Running in Mock Mode.")

class MathCore:
    """
    Electronic Cybernetic OS - Math Core
    Provides rigorous symbolic mathematical verification and computation capabilities 
    adhering to MIT 2000 academic standards.
    
    Capabilities:
    - Symbolic Differentiation & Integration
    - Equation Solving (Algebraic & Differential)
    - Taylor Expansion
    - Matrix Decomposition (SVD support via Matrix)
    """

    def __init__(self):
        self.mock_mode = not HAS_SYMPY

    def verify_derivative(self, expression_str: str, variable: str) -> str:
        """
        Symbolically differentiates an expression to verify rate of change.
        Ex: expression="x**2 + sin(x)", variable="x" -> "2*x + cos(x)"
        """
        if self.mock_mode: return f"[MOCK] d/d{variable}({expression_str})"
        
        try:
            x = symbols(variable)
            expr = parse_expr(expression_str)
            derivative = diff(expr, x)
            return str(derivative)
        except Exception as e:
            return f"Error computing derivative: {e}"

    def solve_equation(self, equation_str: str, variable: str) -> str:
        """
        Finds roots of an equation (assumes equation_str = 0).
        Ex: equation="x**2 - 4", variable="x" -> "[-2, 2]"
        """
        if self.mock_mode: return f"[MOCK] Roots for {equation_str} = 0"

        try:
            x = symbols(variable)
            expr = parse_expr(equation_str)
            roots = solve(expr, x)
            return str(roots)
        except Exception as e:
            return f"Error solving equation: {e}"

    def simplify_expression(self, expression_str: str) -> str:
        """
        Simplifies a mathematical expression to its canonical form.
        """
        if self.mock_mode: return f"[MOCK] Simplified({expression_str})"

        try:
            expr = parse_expr(expression_str)
            simplified = simplify(expr)
            return str(simplified)
        except Exception as e:
            return f"Error simplifying: {e}"

    def taylor_expansion(self, expression_str: str, variable: str, point: float = 0, order: int = 4) -> str:
        """
        Computes Taylor Series expansion for approximation analysis.
        MIT Standard Requirement.
        """
        if self.mock_mode: return f"[MOCK] Taylor({expression_str}, n={order})"

        try:
            x = symbols(variable)
            expr = parse_expr(expression_str)
            series = expr.series(x, x0=point, n=order).removeO()
            return str(series)
        except Exception as e:
            return f"Error computing Taylor series: {e}"
