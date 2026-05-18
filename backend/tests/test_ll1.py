from app.domain.models import AnalyzeRequest
from app.services.parser_service import analyze

EXPR_GRAMMAR = (
    "E -> T E'\n"
    "E' -> + T E' | epsilon\n"
    "T -> F T'\n"
    "T' -> * F T' | epsilon\n"
    "F -> ( E ) | id"
)


def _analyze(input_string: str, algorithm: str = "LL1"):
    return analyze(
        AnalyzeRequest(
            grammar_text=EXPR_GRAMMAR,
            input_string=input_string,
            algorithm=algorithm,
        )
    )


def test_ll1_accepts_valid_string():
    result = _analyze("id + id * id")
    assert result.accepted is True
    assert result.conflicts == []


def test_ll1_accepts_parenthesized_string():
    result = _analyze("( id + id ) * id")
    assert result.accepted is True


def test_ll1_rejects_invalid_string():
    result = _analyze("id + * id")
    assert result.accepted is False


def test_ll1_rejects_unbalanced_parentheses():
    result = _analyze("( id + id")
    assert result.accepted is False


def test_recursive_descent_accepts():
    result = _analyze("id + id * id", algorithm="RECURSIVE_DESCENT")
    assert result.accepted is True


def test_recursive_descent_works_on_other_ll1_grammar():
    # Generic recursive descent must handle any LL(1) grammar now.
    result = analyze(
        AnalyzeRequest(
            grammar_text="S -> C C\nC -> c C | d",
            input_string="c d d",
            algorithm="RECURSIVE_DESCENT",
        )
    )
    assert result.accepted is True


def test_recursive_descent_rejects_left_recursion_clearly():
    result = analyze(
        AnalyzeRequest(
            grammar_text="E -> E + T | T\nT -> id",
            input_string="id + id",
            algorithm="RECURSIVE_DESCENT",
        )
    )
    assert result.accepted is False
    assert "recursión por la izquierda" in result.message


def test_tokenizer_without_spaces():
    # Maximal munch: input without spaces must tokenize correctly.
    result = _analyze("id+id*id")
    assert result.accepted is True


def test_tokenizer_without_spaces_parentheses():
    result = _analyze("(id+id)*id")
    assert result.accepted is True


def test_slr_simple_grammar_accepts():
    result = analyze(
        AnalyzeRequest(
            grammar_text="S -> C C\nC -> c C | d",
            input_string="c d d",
            algorithm="SLR1",
        )
    )
    assert result.accepted is True
    assert result.conflicts == []


def test_lalr_simple_grammar_accepts():
    result = analyze(
        AnalyzeRequest(
            grammar_text="S -> C C\nC -> c C | d",
            input_string="c d d",
            algorithm="LALR1",
        )
    )
    assert result.accepted is True
