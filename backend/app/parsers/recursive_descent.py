from __future__ import annotations

from app.domain.models import Grammar, ParseStep, Production
from app.parsers.diagnostics import analyze_grammar
from app.parsers.ll1_parser import build_ll1_table

_MAX_STEPS = 20000


class _RecursiveDescentParser:
    def __init__(
        self,
        grammar: Grammar,
        tokens: list[str],
        table: dict[tuple[str, str], str],
    ) -> None:
        self.grammar = grammar
        self.tokens = tokens
        self.table = table
        self.position = 0
        self.steps: list[ParseStep] = []
        self.production_by_str = {str(p): p for p in grammar.productions}
        self._budget = _MAX_STEPS

    @property
    def current(self) -> str:
        return self.tokens[self.position]

    def _remaining(self) -> str:
        return " ".join(self.tokens[self.position:])

    def _trace(self, function: str, action: str) -> None:
        self.steps.append(
            ParseStep(
                stack=function,
                symbols="",
                input=self._remaining(),
                action=action,
            )
        )

    def _spend(self) -> None:
        self._budget -= 1
        if self._budget <= 0:
            raise SyntaxError(
                "Demasiados pasos: la gramática podría tener recursión no "
                "terminada para descenso recursivo."
            )

    def _match(self, expected: str) -> None:
        self._spend()
        if self.current == expected:
            self._trace("match", f"Match «{expected}»")
            self.position += 1
        else:
            raise SyntaxError(
                f"Se esperaba «{expected}» pero se encontró «{self.current}»."
            )

    def parse_symbol(self, non_terminal: str) -> None:
        self._spend()
        entry = self.table.get((non_terminal, self.current))
        if entry is None:
            raise SyntaxError(
                f"No hay producción para «{non_terminal}» con el token "
                f"«{self.current}»."
            )

        production: Production = self.production_by_str[entry]
        function = f"parse_{non_terminal}"

        if not production.right:
            self._trace(function, f"Aplicar {non_terminal} -> epsilon")
            return

        self._trace(function, f"Aplicar {entry}")
        for symbol in production.right:
            if symbol in self.grammar.non_terminals:
                self.parse_symbol(symbol)
            else:
                self._match(symbol)


def parse_recursive_descent(
    grammar: Grammar,
    tokens: list[str],
    first_sets: dict[str, set[str]],
    follow_sets: dict[str, set[str]],
) -> dict:
    diagnostics = analyze_grammar(grammar)
    if diagnostics["left_recursion"]:
        return {
            "accepted": False,
            "steps": [],
            "conflicts": [],
            "message": (
                "El descenso recursivo predictivo no admite recursión por la "
                "izquierda (entraría en un bucle infinito). Producciones "
                f"problemáticas: {', '.join(diagnostics['left_recursion'])}. "
                "Elimina la recursión izquierda o usa un método LR."
            ),
        }

    table, conflicts = build_ll1_table(grammar, first_sets, follow_sets)
    if conflicts:
        return {
            "accepted": False,
            "steps": [],
            "conflicts": conflicts,
            "message": (
                "El descenso recursivo predictivo necesita una gramática "
                "LL(1) (sin ambigüedad en qué producción elegir). Se "
                "encontraron conflictos; aplica factorización por la "
                "izquierda o revisa los conjuntos FIRST/FOLLOW."
            ),
        }

    parser = _RecursiveDescentParser(grammar, tokens, table)
    try:
        parser.parse_symbol(grammar.start_symbol)
        if parser.current != "$":
            raise SyntaxError(
                f"Sobran tokens en la entrada, comenzando en "
                f"«{parser.current}»."
            )
        parser._trace("accept", "Entrada consumida por completo")
        return {
            "accepted": True,
            "steps": parser.steps,
            "conflicts": [],
            "message": "Cadena aceptada por descenso recursivo.",
        }
    except (SyntaxError, IndexError) as error:
        message = (
            str(error)
            if isinstance(error, SyntaxError)
            else "Fin de entrada inesperado."
        )
        parser.steps.append(
            ParseStep(
                stack="error",
                symbols="",
                input=parser._remaining(),
                action=message,
            )
        )
        return {
            "accepted": False,
            "steps": parser.steps,
            "conflicts": [],
            "message": f"Cadena rechazada: {message}",
        }
