from __future__ import annotations

from app.domain.grammar import END_MARKER, EPSILON
from app.domain.models import Grammar, LR1Item
from app.parsers.first_follow import first_of_sequence
from app.parsers.lr0_parser import (
    _production_index,
    _set_action,
    augmented_start,
    numbered_productions,
    run_lr_parser,
)


def closure_lr1(
    items: set[LR1Item],
    grammar: Grammar,
    first_sets: dict[str, set[str]],
) -> frozenset[LR1Item]:

    closure = set(items)
    changed = True
    while changed:
        changed = False
        for item in list(closure):
            symbol = item.next_symbol()
            if symbol is None or symbol not in grammar.non_terminals:
                continue

            beta = item.right[item.dot + 1:]
            lookahead_source = first_of_sequence(
                tuple(beta) + (item.lookahead,), first_sets
            )
            lookaheads = lookahead_source - {EPSILON}

            for production in grammar.productions_for(symbol):
                for lookahead in lookaheads:
                    new_item = LR1Item(
                        production.left, production.right, 0, lookahead
                    )
                    if new_item not in closure:
                        closure.add(new_item)
                        changed = True
    return frozenset(closure)


def goto_lr1(
    items: frozenset[LR1Item],
    symbol: str,
    grammar: Grammar,
    first_sets: dict[str, set[str]],
) -> frozenset[LR1Item]:
    moved = {
        LR1Item(it.left, it.right, it.dot + 1, it.lookahead)
        for it in items
        if it.next_symbol() == symbol
    }
    if not moved:
        return frozenset()
    return closure_lr1(moved, grammar, first_sets)


def canonical_collection_lr1(
    grammar: Grammar,
    first_sets: dict[str, set[str]],
) -> tuple[list[frozenset[LR1Item]], dict[tuple[int, str], int]]:
    start_prime = augmented_start(grammar)
    start_item = LR1Item(start_prime, (grammar.start_symbol,), 0, END_MARKER)
    initial = closure_lr1({start_item}, grammar, first_sets)

    states: list[frozenset[LR1Item]] = [initial]
    state_index: dict[frozenset[LR1Item], int] = {initial: 0}
    transitions: dict[tuple[int, str], int] = {}

    symbols = sorted(grammar.non_terminals) + sorted(grammar.terminals)

    pending = [initial]
    while pending:
        current = pending.pop(0)
        i = state_index[current]
        for symbol in symbols:
            target = goto_lr1(current, symbol, grammar, first_sets)
            if not target:
                continue
            if target not in state_index:
                state_index[target] = len(states)
                states.append(target)
                pending.append(target)
            transitions[(i, symbol)] = state_index[target]

    return states, transitions


def build_lr1_table(
    grammar: Grammar,
    states: list[frozenset[LR1Item]],
    transitions: dict[tuple[int, str], int],
) -> tuple[dict, dict, list[dict]]:
    productions = numbered_productions(grammar)
    start_prime = productions[0].left

    action: dict[tuple[int, str], str] = {}
    goto: dict[tuple[int, str], int] = {}
    conflicts: list[dict] = []

    for i, state in enumerate(states):
        for symbol in sorted(grammar.terminals):
            if (i, symbol) in transitions:
                _set_action(action, conflicts, i, symbol, f"s{transitions[(i, symbol)]}")
        for symbol in sorted(grammar.non_terminals):
            if (i, symbol) in transitions:
                goto[(i, symbol)] = transitions[(i, symbol)]

        for item in state:
            if not item.is_complete():
                continue
            if item.left == start_prime and item.lookahead == END_MARKER:
                _set_action(action, conflicts, i, END_MARKER, "acc")
                continue
            prod_index = _production_index(productions, item)
            _set_action(action, conflicts, i, item.lookahead, f"r{prod_index}")

    return action, goto, conflicts


def parse_lr1(
    grammar: Grammar,
    input_tokens: list[str],
    action_table: dict[tuple[int, str], str],
    goto_table: dict[tuple[int, str], int],
) -> dict:
    return run_lr_parser(grammar, input_tokens, action_table, goto_table)
