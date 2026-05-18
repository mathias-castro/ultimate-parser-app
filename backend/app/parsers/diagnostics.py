from __future__ import annotations

from app.domain.models import Grammar


def _nullable(grammar: Grammar) -> set[str]:
    nullable: set[str] = set()
    changed = True
    while changed:
        changed = False
        for production in grammar.productions:
            if production.left in nullable:
                continue
            if not production.right or all(
                symbol in nullable for symbol in production.right
            ):
                nullable.add(production.left)
                changed = True
    return nullable


def analyze_grammar(grammar: Grammar) -> dict:

    left_recursion: list[str] = []
    for non_terminal in grammar.non_terminals:
        for production in grammar.productions_for(non_terminal):
            if production.right and production.right[0] == non_terminal:
                left_recursion.append(str(production))

    common_prefixes: list[str] = []
    for non_terminal in grammar.non_terminals:
        productions = grammar.productions_for(non_terminal)
        for i in range(len(productions)):
            for j in range(i + 1, len(productions)):
                a, b = productions[i].right, productions[j].right
                if a and b and a[0] == b[0]:
                    common_prefixes.append(
                        f"{non_terminal}: «{a[0]} …» aparece en dos alternativas"
                    )

    nullable = sorted(_nullable(grammar))

    notes: list[str] = []
    if left_recursion:
        notes.append(
            "Hay recursión por la izquierda: no es LL(1) ni apta para "
            "descenso recursivo (sí puede ser LR/SLR/LALR)."
        )
    if common_prefixes:
        notes.append(
            "Hay alternativas con prefijo común: aplica factorización por "
            "la izquierda para que pueda ser LL(1)."
        )
    if not notes:
        notes.append(
            "No se detectó recursión por la izquierda directa ni prefijos "
            "comunes; la gramática es buena candidata para LL(1)."
        )

    return {
        "left_recursion": left_recursion,
        "common_prefixes": sorted(set(common_prefixes)),
        "nullable": nullable,
        "notes": notes,
    }
