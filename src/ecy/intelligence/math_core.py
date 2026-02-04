
import sys

try:
    from sympy import sympify, simplify, N
    HAS_SYMPY = True
except ImportError:
    HAS_SYMPY = False

class MathCore:
    """
    Core Mathematical Engine using SymPy for rigorous verification (MIT 2000 Standards).
    Used to verify AI-generated math solutions.
    """
    def __init__(self):
        if not HAS_SYMPY:
            print("[MathCore] Warning: 'sympy' not found. Rigorous verification disabled.")

    def verify_equation(self, equation_str: str) -> bool:
        """
        Verify if an equation holds true.
        Input format: "lhs = rhs"
        """
        if not HAS_SYMPY:
            return False
            
        try:
            lhs_str, rhs_str = equation_str.split("=")
            lhs = sympify(lhs_str)
            rhs = sympify(rhs_str)
            
            # Check if lhs - rhs simplifies to 0
            diff = simplify(lhs - rhs)
            return diff == 0
        except Exception as e:
            print(f"[MathCore] Verification Error: {e}")
            return False

    def calculate(self, expression: str, precision: int = 15) -> str:
        """
        Calculate expression with high precision.
        """
        if not HAS_SYMPY:
            return "Error: SymPy missing"
            
        try:
            expr = sympify(expression)
            result = N(expr, precision)
            return str(result)
        except Exception as e:
            return f"Error: {e}"
