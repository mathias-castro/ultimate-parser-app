from __future__ import annotations

from app.domain.grammar import END_MARKER
from app.domain.models import LR1Item, Grammar
from app.parsers.lr0_parser import (
    _production_index,
    _set_action,
    numbered_productions,
    run_lr_parser,
)


def _core(state: frozenset[LR1Item]) -> frozenset[tuple]:

    return frozenset((it.left, it.right, it.dot) for it in state)


def build_lalr_states_from_lr1(
    lr1_states: list[frozenset[LR1Item]],
    lr1_transitions: dict[tuple[int, str], int],
) -> tuple[list[frozenset[LR1Item]], dict[tuple[int, str], int]]:

    core_to_new: dict[frozenset[tuple], int] = {}
    old_to_new: dict[int, int] = {}
    merged_items: list[set[LR1Item]] = []

    for old_index, state in enumerate(lr1_states):
        core = _core(state)
        if core not in core_to_new:
            core_to_new[core] = len(merged_items)
            merged_items.append(set())
        new_index = core_to_new[core]
        old_to_new[old_index] = new_index
        merged_items[new_index].update(state)

    merged_states = [frozenset(items) for items in merged_items]

    merged_transitions: dict[tuple[int, str], int] = {}
    for (src, symbol), dst in lr1_transitions.items():
        merged_transitions[(old_to_new[src], symbol)] = old_to_new[dst]

    return merged_states, merged_transitions


def build_lalr_table(
    grammar: Grammar,
    lalr_states: list[frozenset[LR1Item]],
    transitions: dict[tuple[int, str], int],
) -> tuple[dict, dict, list[dict]]:
    productions = numbered_productions(grammar)
    start_prime = productions[0].left

    action: dict[tuple[int, str], str] = {}
    goto: dict[tuple[int, str], int] = {}
    conflicts: list[dict] = []

    for i, state in enumerate(lalr_states):
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


def parse_lalr(
    grammar: Grammar,
    input_tokens: list[str],
    action_table: dict[tuple[int, str], str],
    goto_table: dict[tuple[int, str], int],
) -> dict:
    return run_lr_parser(grammar, input_tokens, action_table, goto_table)
