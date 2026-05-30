"""Math equation solver using SymPy."""

import sympy as sp
from typing import Any


def solve_equation(equation_str: str, variables: list[str] | None = None) -> dict[str, Any]:
    """Solve a mathematical equation.

    Args:
        equation_str: Equation string like "x**2 + 2*x + 1 = 0"
        variables: Variable names to solve for, e.g. ["x"]

    Returns:
        dict with solution results
    """
    try:
        if variables is None:
            variables = ["x"]

        symbols = sp.symbols(variables)

        # Parse equation - handle "=" separator
        if "=" in equation_str:
            left_str, right_str = equation_str.split("=", 1)
            expr = sp.sympify(left_str.strip()) - sp.sympify(right_str.strip())
        else:
            expr = sp.sympify(equation_str)

        solutions = sp.solve(expr, symbols[0] if len(symbols) == 1 else symbols)

        return {
            "success": True,
            "solutions": [str(s) for s in (solutions if isinstance(solutions, list) else [solutions])],
            "latex": sp.latex(expr),
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def simplify_expression(expr_str: str) -> dict[str, Any]:
    """Simplify a mathematical expression.

    Args:
        expr_str: Expression string like "x**2 + 2*x + 1 - x**2"

    Returns:
        dict with simplified result
    """
    try:
        expr = sp.sympify(expr_str)
        simplified = sp.simplify(expr)
        return {
            "success": True,
            "original": expr_str,
            "simplified": str(simplified),
            "latex": sp.latex(simplified),
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
