from __future__ import annotations

APP_NAME = "Ultimate Parser App API"

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

SUPPORTED_ALGORITHMS: list[str] = [
    "RECURSIVE_DESCENT",
    "LL1",
    "LR0",
    "SLR1",
    "LR1",
    "LALR1",
]

EXAMPLES = [
    {
        "name": "Descenso recursivo · Paréntesis balanceados",
        "grammar_text": "S -> ( S ) S | epsilon",
        "input_string": "( ) ( ( ) )",
        "recommended_algorithm": "RECURSIVE_DESCENT",
    },
    {
        "name": "LL(1) · Expresiones aritméticas",
        "grammar_text": (
            "E -> T E'\n"
            "E' -> + T E' | epsilon\n"
            "T -> F T'\n"
            "T' -> * F T' | epsilon\n"
            "F -> ( E ) | id"
        ),
        "input_string": "id + id * id",
        "recommended_algorithm": "LL1",
    },
    {
        "name": "LR(0) · Gramática S → C C",
        "grammar_text": "S -> C C\nC -> c C | d",
        "input_string": "c d d",
        "recommended_algorithm": "LR0",
    },
    {
        "name": "SLR(1) · Expresiones con recursión izquierda",
        "grammar_text": (
            "E -> E + T | T\n"
            "T -> T * F | F\n"
            "F -> ( E ) | id"
        ),
        "input_string": "id + id * id",
        "recommended_algorithm": "SLR1",
    },
    {
        "name": "LR(1) · Gramática LR(1) que no es SLR(1)",
        "grammar_text": (
            "S -> a A d | b B d | a B e | b A e\n"
            "A -> c\n"
            "B -> c"
        ),
        "input_string": "a c d",
        "recommended_algorithm": "LR1",
    },
    {
        "name": "LALR(1) · Expresiones (tabla compacta)",
        "grammar_text": (
            "E -> E + T | T\n"
            "T -> T * F | F\n"
            "F -> ( E ) | id"
        ),
        "input_string": "( id + id ) * id",
        "recommended_algorithm": "LALR1",
    },
]
