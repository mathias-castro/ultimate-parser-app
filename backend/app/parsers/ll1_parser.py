from __future__ import annotations

from app.domain.grammar import END_MARKER, EPSILON
from app.domain.models import Grammar, ParseStep, Production
from app.parsers.first_follow import first_of_sequence


def build_ll1_table(
    grammar: Grammar,
    first_sets: dict[str, set[str]],
    follow_sets: dict[str, set[str]],
) -> tuple[dict[tuple[str, str], str], list[dict]]:
    table: dict[tuple[str, str], str] = {}
    productions_at: dict[tuple[str, str], Production] = {}
    conflicts: list[dict] = []

    for production in grammar.productions:
        first_rhs = first_of_sequence(production.right, first_sets)

        for terminal in first_rhs - {EPSILON}:
            _assign(table, productions_at, conflicts, production, terminal)

        if EPSILON in first_rhs:
            for terminal in follow_sets[production.left]:
                _assign(table, productions_at, conflicts, production, terminal)

    return table, conflicts


def _assign(
    table: dict[tuple[str, str], str],
    productions_at: dict[tuple[str, str], Production],
    conflicts: list[dict],
    production: Production,
    terminal: str,
) -> None:
    key = (production.left, terminal)
    if key in table and table[key] != str(production):
        conflicts.append(
            {
                "type": "LL1",
                "cell": f"M[{production.left}, {terminal}]",
                "existing": table[key],
                "new": str(production),
            }
        )
        return
    table[key] = str(production)
    productions_at[key] = production


def parse_ll1(
    grammar: Grammar,
    input_tokens: list[str],
    table: dict[tuple[str, str], str],
) -> dict:
    production_by_str = {str(p): p for p in grammar.productions}

    stack: list[str] = [END_MARKER, grammar.start_symbol]
    position = 0
    steps: list[ParseStep] = []

    def snapshot(action: str) -> None:
        steps.append(
            ParseStep(
                stack=" ".join(stack),
                symbols="",
                input=" ".join(input_tokens[position:]),
                action=action,
            )
        )

    while stack:
        top = stack[-1]
        current = input_tokens[position]

        if top == END_MARKER and current == END_MARKER:
            snapshot("Aceptar")
            return {
                "accepted": True,
                "steps": steps,
                "message": "Cadena aceptada por el parser LL(1).",
            }

        if top in grammar.terminals or top == END_MARKER:
            if top == current:
                snapshot(f"Match «{top}»")
                stack.pop()
                position += 1
            else:
                snapshot(
                    f"Error: se esperaba «{top}» pero se encontró «{current}»"
                )
                return {
                    "accepted": False,
                    "steps": steps,
                    "message": f"Cadena rechazada: se esperaba «{top}».",
                }
        else:
            entry = table.get((top, current))
            if entry is None:
                snapshot(
                    f"Error: no hay producción en M[{top}, {current}]"
                )
                return {
                    "accepted": False,
                    "steps": steps,
                    "message": (
                        f"Cadena rechazada: no existe entrada para "
                        f"M[{top}, {current}]."
                    ),
                }

            production = production_by_str[entry]
            snapshot(f"Aplicar {entry}")
            stack.pop()
            for symbol in reversed(production.right):
                stack.append(symbol)

    return {
        "accepted": False,
        "steps": steps,
        "message": "Cadena rechazada: la pila se vació antes de tiempo.",
    }
