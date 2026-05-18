from app.domain.models import AnalyzeRequest
from app.services.parser_service import analyze

EXPR_GRAMMAR = (
    "E -> T E'\n"
    "E' -> + T E' | epsilon\n"
    "T -> F T'\n"
    "T' -> * F T' | epsilon\n"
    "F -> ( E ) | id"
)


def test_ll1_returns_ast_root_and_children():
    result = analyze(
        AnalyzeRequest(
            grammar_text=EXPR_GRAMMAR,
            input_string="id + id * id",
            algorithm="LL1",
        )
    )

    assert result.accepted is True
    assert result.ast is not None
    assert result.ast.label == "E"
    assert [child.label for child in result.ast.children][:2] == ["T", "E'"]


def test_recursive_descent_returns_ast():
    result = analyze(
        AnalyzeRequest(
            grammar_text="S -> C C\nC -> c C | d",
            input_string="c d d",
            algorithm="RECURSIVE_DESCENT",
        )
    )

    assert result.accepted is True
    assert result.ast is not None
    assert result.ast.label == "S"
    assert [child.label for child in result.ast.children] == ["C", "C"]


def test_lr_family_returns_ast():
    result = analyze(
        AnalyzeRequest(
            grammar_text="S -> C C\nC -> c C | d",
            input_string="c d d",
            algorithm="SLR1",
        )
    )

    assert result.accepted is True
    assert result.ast is not None
    assert result.ast.label == "S"
    assert [child.label for child in result.ast.children] == ["C", "C"]