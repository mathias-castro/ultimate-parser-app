from __future__ import annotations

from app.domain.grammar import END_MARKER


class Scanner:
    def __init__(self, input_string: str, terminals: set[str]) -> None:
        self.input = input_string
        self.terminals = sorted(terminals, key=len, reverse=True)
        self.first = 0
        self.current = 0

    def _skip_whitespace(self) -> None:
        while self.current < len(self.input) and self.input[self.current].isspace():
            self.current += 1

    def next_token(self) -> str:
        self._skip_whitespace()

        if self.current >= len(self.input):
            return END_MARKER

        self.first = self.current

        if self.input.startswith(END_MARKER, self.current):
            self.current += len(END_MARKER)
            return END_MARKER

        for terminal in self.terminals:
            if self.input.startswith(terminal, self.current):
                self.current += len(terminal)
                return terminal

        snippet = self.input[self.current:self.current + 12]
        raise ValueError(
            f"No se reconoce un token en la posición {self.current}: "
            f"«{snippet}». Usa solo los terminales de la gramática: "
            f"{sorted(self.terminals)} (puedes escribirlos con o sin espacios)."
        )


def tokenize_input(input_string: str, terminals: set[str]) -> list[str]:
    if input_string is None or input_string.strip() == "":
        raise ValueError("La cadena de entrada está vacía. Escribe algo para analizar.")

    scanner = Scanner(input_string, terminals)
    tokens: list[str] = []

    while True:
        token = scanner.next_token()
        tokens.append(token)
        if token == END_MARKER:
            break

    if len(tokens) == 1:
        raise ValueError("La cadena de entrada no contiene tokens válidos.")

    return tokens
