from __future__ import annotations

from app.domain.grammar import END_MARKER, EPSILON
from app.domain.models import Grammar


def compute_first(grammar: Grammar) -> dict[str, set[str]]:
    first: dict[str, set[str]] = {}

    for terminal in grammar.terminals:
        first[terminal] = {terminal}
    for non_terminal in grammar.non_terminals:
        first[non_terminal] = set()

    changed = True
    while changed:
        changed = False
        for production in grammar.productions:
            left = production.left

            if not production.right:  # left -> epsilon
                if EPSILON not in first[left]:
                    first[left].add(EPSILON)
                    changed = True
                continue

            for symbol in production.right:
                symbol_first = first.get(symbol, {symbol})
                before = len(first[left])
                first[left].update(symbol_first - {EPSILON})
                if len(first[left]) != before:
                    changed = True
                if EPSILON not in symbol_first:
                    break
            else:
                if EPSILON not in first[left]:
                    first[left].add(EPSILON)
                    changed = True

    return first


def first_of_sequence(
    sequence: tuple[str, ...] | list[str],
    first_sets: dict[str, set[str]],
) -> set[str]:

    result: set[str] = set()
    if not sequence:
        result.add(EPSILON)
        return result

    for symbol in sequence:
        symbol_first = first_sets.get(symbol, {symbol})
        result.update(symbol_first - {EPSILON})
        if EPSILON not in symbol_first:
            break
    else:
        result.add(EPSILON)

    return result


def compute_follow(
    grammar: Grammar,
    first_sets: dict[str, set[str]],
) -> dict[str, set[str]]:

    follow: dict[str, set[str]] = {nt: set() for nt in grammar.non_terminals}
    follow[grammar.start_symbol].add(END_MARKER)

    changed = True
    while changed:
        changed = False
        for production in grammar.productions:
            for index, symbol in enumerate(production.right):
                if symbol not in grammar.non_terminals:
                    continue

                rest = production.right[index + 1:]
                first_rest = first_of_sequence(rest, first_sets)

                before = len(follow[symbol])
                follow[symbol].update(first_rest - {EPSILON})

                if EPSILON in first_rest or not rest:
                    follow[symbol].update(follow[production.left])

                if len(follow[symbol]) != before:
                    changed = True

    return follow
