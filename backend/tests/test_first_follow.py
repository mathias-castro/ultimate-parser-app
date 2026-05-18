from app.domain.grammar import parse_grammar
from app.parsers.first_follow import compute_first, compute_follow

EXPR_GRAMMAR = """
E -> T E'
E' -> + T E' | epsilon
T -> F T'
T' -> * F T' | epsilon
F -> ( E ) | id
"""


def test_first_of_E():
    grammar = parse_grammar(EXPR_GRAMMAR)
    first = compute_first(grammar)
    assert first["E"] == {"(", "id"}
    assert first["E'"] == {"+", "epsilon"}
    assert first["T'"] == {"*", "epsilon"}


def test_follow_of_E():
    grammar = parse_grammar(EXPR_GRAMMAR)
    first = compute_first(grammar)
    follow = compute_follow(grammar, first)
    assert follow["E"] == {")", "$"}
    assert follow["F"] == {"+", "*", ")", "$"}
