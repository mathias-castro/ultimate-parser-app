from __future__ import annotations

from app.domain.models import Grammar, Production

EPSILON = "epsilon"
END_MARKER = "$"


def parse_grammar(grammar_text: str) -> Grammar:

    if grammar_text is None or grammar_text.strip() == "":
        raise ValueError("La gramática está vacía. Escribe al menos una producción.")

    productions: list[Production] = []
    non_terminals: list[str] = []  # keep insertion order, dedupe later

    for line_number, raw_line in enumerate(grammar_text.splitlines(), start=1):
        line = raw_line.strip()
        if line == "":
            continue

        if "->" not in line:
            raise ValueError(
                f"Línea {line_number}: falta el separador '->' en la producción «{line}»."
            )

        left_part, right_part = line.split("->", 1)
        left = left_part.strip()

        if left == "":
            raise ValueError(
                f"Línea {line_number}: el lado izquierdo de la producción está vacío."
            )
        if " " in left:
            raise ValueError(
                f"Línea {line_number}: el lado izquierdo debe ser un único no terminal, "
                f"se encontró «{left}»."
            )

        if left not in non_terminals:
            non_terminals.append(left)

        alternatives = right_part.split("|")
        for alternative in alternatives:
            symbols = alternative.split()

            if not symbols:
                raise ValueError(
                    f"Línea {line_number}: hay una alternativa vacía. "
                    f"Usa 'epsilon' si quieres una producción vacía."
                )

            if symbols == [EPSILON]:
                productions.append(Production(left=left, right=tuple()))
            else:
                if EPSILON in symbols:
                    raise ValueError(
                        f"Línea {line_number}: 'epsilon' no puede mezclarse con otros símbolos."
                    )
                productions.append(Production(left=left, right=tuple(symbols)))

    if not productions:
        raise ValueError("La gramática no contiene producciones válidas.")

    non_terminal_set = set(non_terminals)
    start_symbol = productions[0].left

    terminals: set[str] = set()
    for production in productions:
        for symbol in production.right:
            if symbol == EPSILON:
                continue
            if symbol not in non_terminal_set:
                terminals.add(symbol)

    return Grammar(
        start_symbol=start_symbol,
        non_terminals=non_terminal_set,
        terminals=terminals,
        productions=productions,
    )


def grammar_to_dict(grammar: Grammar) -> dict:

    return {
        "start_symbol": grammar.start_symbol,
        "non_terminals": sorted(grammar.non_terminals),
        "terminals": sorted(grammar.terminals),
        "productions": [str(p) for p in grammar.productions],
    }
