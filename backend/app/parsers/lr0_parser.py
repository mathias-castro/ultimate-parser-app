from __future__ import annotations

from app.domain.grammar import END_MARKER
from app.domain.models import Grammar, LR0Item, ParseStep, Production


def augmented_start(grammar: Grammar) -> str:

    candidate = grammar.start_symbol + "'"
    while candidate in grammar.non_terminals or candidate in grammar.terminals:
        candidate += "'"
    return candidate


def numbered_productions(grammar: Grammar) -> list[Production]:

    start_prime = augmented_start(grammar)
    augmented = Production(left=start_prime, right=(grammar.start_symbol,))
    return [augmented, *grammar.productions]


def closure_lr0(items: set[LR0Item], grammar: Grammar) -> frozenset[LR0Item]:

    closure = set(items)
    changed = True
    while changed:
        changed = False
        for item in list(closure):
            symbol = item.next_symbol()
            if symbol is None or symbol not in grammar.non_terminals:
                continue
            for production in grammar.productions_for(symbol):
                new_item = LR0Item(production.left, production.right, 0)
                if new_item not in closure:
                    closure.add(new_item)
                    changed = True
    return frozenset(closure)


def goto_lr0(
    items: frozenset[LR0Item],
    symbol: str,
    grammar: Grammar,
) -> frozenset[LR0Item]:

    moved = {
        LR0Item(it.left, it.right, it.dot + 1)
        for it in items
        if it.next_symbol() == symbol
    }
    if not moved:
        return frozenset()
    return closure_lr0(moved, grammar)


def canonical_collection_lr0(
    grammar: Grammar,
) -> tuple[list[frozenset[LR0Item]], dict[tuple[int, str], int]]:

    start_prime = augmented_start(grammar)
    start_item = LR0Item(start_prime, (grammar.start_symbol,), 0)
    initial = closure_lr0({start_item}, grammar)

    states: list[frozenset[LR0Item]] = [initial]
    state_index: dict[frozenset[LR0Item], int] = {initial: 0}
    transitions: dict[tuple[int, str], int] = {}

    symbols = sorted(grammar.non_terminals) + sorted(grammar.terminals)

    pending = [initial]
    while pending:
        current = pending.pop(0)
        i = state_index[current]
        for symbol in symbols:
            target = goto_lr0(current, symbol, grammar)
            if not target:
                continue
            if target not in state_index:
                state_index[target] = len(states)
                states.append(target)
                pending.append(target)
            transitions[(i, symbol)] = state_index[target]

    return states, transitions


def build_lr0_table(
    grammar: Grammar,
    states: list[frozenset[LR0Item]],
    transitions: dict[tuple[int, str], int],
) -> tuple[dict, dict, list[dict]]:

    productions = numbered_productions(grammar)
    start_prime = productions[0].left

    action: dict[tuple[int, str], str] = {}
    goto: dict[tuple[int, str], int] = {}
    conflicts: list[dict] = []
    all_terminals = sorted(grammar.terminals) + [END_MARKER]

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
                _set_action(action, conflicts, i, END_MARKER, "acc")
                continue
            prod_index = _production_index(productions, item)
            for terminal in all_terminals:
                _set_action(action, conflicts, i, terminal, f"r{prod_index}")

    return action, goto, conflicts


def _production_index(productions: list[Production], item) -> int:
    for index, production in enumerate(productions):
        if production.left == item.left and production.right == item.right:
            return index
    raise ValueError(f"Producción no encontrada para el item {item}.")


def _set_action(
    action: dict[tuple[int, str], str],
    conflicts: list[dict],
    state: int,
    symbol: str,
    value: str,
) -> None:
    key = (state, symbol)
    if key in action and action[key] != value:
        existing = action[key]
        ctype = _conflict_type(existing, value)
        conflicts.append(
            {
                "type": ctype,
                "cell": f"ACTION[I{state}, {symbol}]",
                "existing": existing,
                "new": value,
            }
        )
        return
    action[key] = value


def _conflict_type(existing: str, new: str) -> str:
    kinds = {existing[0], new[0]}
    if kinds == {"s", "r"}:
        return "shift/reduce"
    if kinds == {"r"}:
        return "reduce/reduce"
    return "shift/reduce"


def run_lr_parser(
    grammar: Grammar,
    input_tokens: list[str],
    action_table: dict[tuple[int, str], str],
    goto_table: dict[tuple[int, str], int],
) -> dict:

    productions = numbered_productions(grammar)
    state_stack: list[int] = [0]
    symbol_stack: list[str] = []
    position = 0
    steps: list[ParseStep] = []

    def snapshot(action_text: str) -> None:
        steps.append(
            ParseStep(
                stack=" ".join(str(s) for s in state_stack),
                symbols=" ".join(symbol_stack),
                input=" ".join(input_tokens[position:]),
                action=action_text,
            )
        )

    guard = 0
    max_steps = 10000
    while True:
        guard += 1
        if guard > max_steps:
            snapshot("Error: demasiados pasos (posible bucle)")
            return {
                "accepted": False,
                "steps": steps,
                "message": "Cadena rechazada: el análisis no terminó.",
            }

        state = state_stack[-1]
        current = input_tokens[position]
        entry = action_table.get((state, current))

        if entry is None:
            snapshot(f"Error: ACTION[I{state}, {current}] está vacío")
            return {
                "accepted": False,
                "steps": steps,
                "message": (
                    f"Cadena rechazada: no hay acción para «{current}» "
                    f"en el estado I{state}."
                ),
            }

        if entry == "acc":
            snapshot("Aceptar")
            return {
                "accepted": True,
                "steps": steps,
                "message": "Cadena aceptada por el parser.",
            }

        if entry.startswith("s"):
            target = int(entry[1:])
            snapshot(f"Shift «{current}», ir a I{target}")
            symbol_stack.append(current)
            state_stack.append(target)
            position += 1
        elif entry.startswith("r"):
            prod_index = int(entry[1:])
            production = productions[prod_index]
            rhs_len = len(production.right)
            snapshot(f"Reduce por {production}")
            for _ in range(rhs_len):
                state_stack.pop()
                symbol_stack.pop()
            exposed = state_stack[-1]
            goto_target = goto_table.get((exposed, production.left))
            if goto_target is None:
                snapshot(
                    f"Error: GOTO[I{exposed}, {production.left}] está vacío"
                )
                return {
                    "accepted": False,
                    "steps": steps,
                    "message": "Cadena rechazada: GOTO indefinido.",
                }
            symbol_stack.append(production.left)
            state_stack.append(goto_target)
        else:
            snapshot(f"Error: acción desconocida «{entry}»")
            return {
                "accepted": False,
                "steps": steps,
                "message": "Cadena rechazada: acción inválida en la tabla.",
            }


def states_to_list(states: list) -> list[dict]:

    result = []
    for i, state in enumerate(states):
        items = sorted(str(item) for item in state)
        result.append({"name": f"I{i}", "items": items})
    return result


def transitions_to_list(transitions: dict[tuple[int, str], int]) -> list[dict]:
    return [
        {"from": f"I{src}", "symbol": symbol, "to": f"I{dst}"}
        for (src, symbol), dst in sorted(transitions.items())
    ]


def parse_lr0(
    grammar: Grammar,
    input_tokens: list[str],
    action_table: dict[tuple[int, str], str],
    goto_table: dict[tuple[int, str], int],
) -> dict:
    return run_lr_parser(grammar, input_tokens, action_table, goto_table)
