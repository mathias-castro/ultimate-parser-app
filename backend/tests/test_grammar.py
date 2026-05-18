from app.domain.grammar import parse_grammar

EXPR_GRAMMAR = """
E -> T E'
E' -> + T E' | epsilon
T -> F T'
T' -> * F T' | epsilon
F -> ( E ) | id
"""


def test_start_symbol_is_first_left_hand_side():
    grammar = parse_grammar(EXPR_GRAMMAR)
    assert grammar.start_symbol == "E"


def test_non_terminals_and_terminals():
    grammar = parse_grammar(EXPR_GRAMMAR)
    assert grammar.non_terminals == {"E", "E'", "T", "T'", "F"}
    assert grammar.terminals == {"+", "*", "(", ")", "id"}


def test_epsilon_production_has_empty_right_side():
    grammar = parse_grammar(EXPR_GRAMMAR)
    ep_productions = grammar.productions_for("E'")
    assert any(p.right == tuple() for p in ep_productions)


def test_missing_arrow_raises_value_error():
    try:
        parse_grammar("E T E'")
        assert False, "se esperaba ValueError"
    except ValueError as error:
        assert "->" in str(error)


def test_empty_grammar_raises_value_error():
    try:
        parse_grammar("   ")
        assert False, "se esperaba ValueError"
    except ValueError:
        pass
