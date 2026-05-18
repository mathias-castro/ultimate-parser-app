from __future__ import annotations

from app.core.config import SUPPORTED_ALGORITHMS
from app.domain.grammar import grammar_to_dict, parse_grammar
from app.domain.models import AnalyzeRequest, AnalyzeResponse
from app.parsers import (
    diagnostics,
    first_follow,
    lalr_parser,
    ll1_parser,
    lr0_parser,
    lr1_parser,
    recursive_descent,
    slr_parser,
)
from app.utils import formatters
from app.utils.explanations import explain_result
from app.utils.tokenizer import tokenize_input


def _empty_response(algorithm: str, message: str) -> AnalyzeResponse:
    return AnalyzeResponse(
        accepted=False,
        algorithm=algorithm,
        message=message,
        grammar={},
        ast=None,
        first={},
        follow={},
        ll1_table=formatters.empty_table(),
        action_table=formatters.empty_table(),
        goto_table=formatters.empty_table(),
        states=[],
        transitions=[],
        steps=[],
        conflicts=[],
        explanation=message,
    )


def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    algorithm = request.algorithm.strip().upper()

    if algorithm not in SUPPORTED_ALGORITHMS:
        return _empty_response(
            algorithm,
            f"Algoritmo no soportado: «{request.algorithm}». "
            f"Opciones válidas: {', '.join(SUPPORTED_ALGORITHMS)}.",
        )

    try:
        grammar = parse_grammar(request.grammar_text)
    except ValueError as error:
        return _empty_response(algorithm, f"Error en la gramática: {error}")

    try:
        tokens = tokenize_input(request.input_string, grammar.terminals)
    except ValueError as error:
        return _empty_response(algorithm, f"Error en la cadena: {error}")

    first_sets = first_follow.compute_first(grammar)
    follow_sets = first_follow.compute_follow(grammar, first_sets)

    grammar_view = grammar_to_dict(grammar)
    grammar_view["analysis"] = diagnostics.analyze_grammar(grammar)

    first_view = {nt: first_sets[nt] for nt in sorted(grammar.non_terminals)}
    follow_view = {nt: follow_sets[nt] for nt in sorted(grammar.non_terminals)}

    response = AnalyzeResponse(
        accepted=False,
        algorithm=algorithm,
        message="",
        grammar=grammar_view,
        ast=None,
        first=formatters.sets_to_dict(first_view),
        follow=formatters.sets_to_dict(follow_view),
        ll1_table=formatters.empty_table(),
        action_table=formatters.empty_table(),
        goto_table=formatters.empty_table(),
        states=[],
        transitions=[],
        steps=[],
        conflicts=[],
        explanation="",
    )

    try:
        if algorithm == "RECURSIVE_DESCENT":
            _run_recursive_descent(
                grammar, tokens, first_sets, follow_sets, response
            )
        elif algorithm == "LL1":
            _run_ll1(grammar, tokens, first_sets, follow_sets, response)
        elif algorithm == "LR0":
            _run_lr0(grammar, tokens, response)
        elif algorithm == "SLR1":
            _run_slr(grammar, tokens, follow_sets, response)
        elif algorithm == "LR1":
            _run_lr1(grammar, tokens, first_sets, response)
        elif algorithm == "LALR1":
            _run_lalr(grammar, tokens, first_sets, response)
    except Exception as error:
        return _empty_response(
            algorithm, f"Error interno ejecutando {algorithm}: {error}"
        )

    response.explanation = explain_result(
        algorithm,
        response.accepted,
        response.conflicts,
        None if response.accepted else response.message,
    )
    return response


def _run_recursive_descent(
    grammar, tokens, first_sets, follow_sets, response: AnalyzeResponse
) -> None:
    result = recursive_descent.parse_recursive_descent(
        grammar, tokens, first_sets, follow_sets
    )
    response.accepted = result["accepted"]
    response.message = result["message"]
    response.conflicts = result["conflicts"]
    response.ast = result.get("tree")
    response.steps = formatters.steps_to_list(result["steps"])


def _run_ll1(grammar, tokens, first_sets, follow_sets, response: AnalyzeResponse) -> None:
    table, conflicts = ll1_parser.build_ll1_table(grammar, first_sets, follow_sets)
    response.conflicts = conflicts
    response.ll1_table = formatters.ll1_table_to_dict(
        table,
        sorted(grammar.non_terminals),
        sorted(grammar.terminals) + ["$"],
    )

    if conflicts:
        response.message = (
            "La gramática no es LL(1): la tabla predictiva tiene conflictos."
        )
        return

    result = ll1_parser.parse_ll1(grammar, tokens, table)
    response.accepted = result["accepted"]
    response.message = result["message"]
    response.ast = result.get("tree")
    response.steps = formatters.steps_to_list(result["steps"])


def _fill_lr_tables(grammar, states, transitions, action, goto, response) -> None:
    response.states = lr0_parser.states_to_list(states)
    response.transitions = lr0_parser.transitions_to_list(transitions)
    action_table, goto_table = formatters.lr_tables_to_dict(
        action,
        goto,
        len(states),
        sorted(grammar.terminals) + ["$"],
        sorted(grammar.non_terminals),
    )
    response.action_table = action_table
    response.goto_table = goto_table


def _run_lr0(grammar, tokens, response: AnalyzeResponse) -> None:
    states, transitions = lr0_parser.canonical_collection_lr0(grammar)
    action, goto, conflicts = lr0_parser.build_lr0_table(grammar, states, transitions)
    response.conflicts = conflicts
    _fill_lr_tables(grammar, states, transitions, action, goto, response)

    if conflicts:
        response.message = "La gramática no es LR(0): la tabla tiene conflictos."
        return

    result = lr0_parser.parse_lr0(grammar, tokens, action, goto)
    response.accepted = result["accepted"]
    response.message = result["message"]
    response.ast = result.get("tree")
    response.steps = formatters.steps_to_list(result["steps"])


def _run_slr(grammar, tokens, follow_sets, response: AnalyzeResponse) -> None:
    states, transitions = lr0_parser.canonical_collection_lr0(grammar)
    action, goto, conflicts = slr_parser.build_slr_table(
        grammar, states, transitions, follow_sets
    )
    response.conflicts = conflicts
    _fill_lr_tables(grammar, states, transitions, action, goto, response)

    if conflicts:
        response.message = "La gramática no es SLR(1): la tabla tiene conflictos."
        return

    result = slr_parser.parse_slr(grammar, tokens, action, goto)
    response.accepted = result["accepted"]
    response.message = result["message"]
    response.ast = result.get("tree")
    response.steps = formatters.steps_to_list(result["steps"])


def _run_lr1(grammar, tokens, first_sets, response: AnalyzeResponse) -> None:
    states, transitions = lr1_parser.canonical_collection_lr1(grammar, first_sets)
    action, goto, conflicts = lr1_parser.build_lr1_table(grammar, states, transitions)
    response.conflicts = conflicts
    _fill_lr_tables(grammar, states, transitions, action, goto, response)

    if conflicts:
        response.message = "La gramática no es LR(1): la tabla tiene conflictos."
        return

    result = lr1_parser.parse_lr1(grammar, tokens, action, goto)
    response.accepted = result["accepted"]
    response.message = result["message"]
    response.ast = result.get("tree")
    response.steps = formatters.steps_to_list(result["steps"])


def _run_lalr(grammar, tokens, first_sets, response: AnalyzeResponse) -> None:
    lr1_states, lr1_transitions = lr1_parser.canonical_collection_lr1(
        grammar, first_sets
    )
    states, transitions = lalr_parser.build_lalr_states_from_lr1(
        lr1_states, lr1_transitions
    )
    action, goto, conflicts = lalr_parser.build_lalr_table(
        grammar, states, transitions
    )
    response.conflicts = conflicts
    _fill_lr_tables(grammar, states, transitions, action, goto, response)

    if conflicts:
        response.message = "La gramática no es LALR(1): la tabla tiene conflictos."
        return

    result = lalr_parser.parse_lalr(grammar, tokens, action, goto)
    response.accepted = result["accepted"]
    response.message = result["message"]
    response.ast = result.get("tree")
    response.steps = formatters.steps_to_list(result["steps"])
