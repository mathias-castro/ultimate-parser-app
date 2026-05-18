from __future__ import annotations

from app.domain.models import Grammar
from app.parsers.lr0_parser import (
    _production_index,
    _set_action,
    numbered_productions,
    run_lr_parser,
)


def build_slr_table(
    grammar: Grammar,
    states: list,
    transitions: dict[tuple[int, str], int],
    follow_sets: dict[str, set[str]],
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
            if item.left == start_prime:
                _set_action(action, conflicts, i, "$", "acc")
                continue
            prod_index = _production_index(productions, item)
            for terminal in sorted(follow_sets.get(item.left, set())):
                _set_action(action, conflicts, i, terminal, f"r{prod_index}")

    return action, goto, conflicts


def parse_slr(
    grammar: Grammar,
    input_tokens: list[str],
    action_table: dict[tuple[int, str], str],
    goto_table: dict[tuple[int, str], int],
) -> dict:
    return run_lr_parser(grammar, input_tokens, action_table, goto_table)
