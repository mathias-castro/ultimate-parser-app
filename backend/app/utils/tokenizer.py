from __future__ import annotations

from app.domain.grammar import END_MARKER


def tokenize_input(input_string: str, terminals: set[str]) -> list[str]:
    if input_string is None or input_string.strip() == "":
        raise ValueError("La cadena de entrada está vacía. Escribe algo para analizar.")

    text = input_string
    length = len(text)

    sorted_terminals = sorted(
        (t for t in terminals if t), key=len, reverse=True
    )

    tokens: list[str] = []
    position = 0

    while position < length:
        char = text[position]

        if char.isspace():
            position += 1
            continue

        if text.startswith(END_MARKER, position):
            tokens.append(END_MARKER)
            position += len(END_MARKER)
            continue

        matched: str | None = None
        for terminal in sorted_terminals:
            if text.startswith(terminal, position):
                matched = terminal
                break

        if matched is None:
            snippet = text[position : position + 12]
            raise ValueError(
                f"No se reconoce un token en la posición {position}: "
                f"«{snippet}». Usa solo los terminales de la gramática: "
                f"{sorted(terminals)} (puedes escribirlos con o sin espacios)."
            )

        tokens.append(matched)
        position += len(matched)

    if not tokens:
        raise ValueError("La cadena de entrada no contiene tokens válidos.")

    if tokens[-1] != END_MARKER:
        tokens.append(END_MARKER)

    return tokens
