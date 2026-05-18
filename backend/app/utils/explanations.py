from __future__ import annotations

from typing import Any

_ALGORITHM_NAMES = {
    "RECURSIVE_DESCENT": "Descenso recursivo",
    "LL1": "LL(1)",
    "LR0": "LR(0)",
    "SLR1": "SLR(1)",
    "LR1": "LR(1)",
    "LALR1": "LALR(1)",
}


def algorithm_name(algorithm: str) -> str:
    return _ALGORITHM_NAMES.get(algorithm, algorithm)


def explain_conflict(conflict_type: str) -> str:

    if conflict_type == "shift/reduce":
        return (
            "Un conflicto shift/reduce ocurre cuando, en el mismo estado, el "
            "parser no sabe si leer (shift) el siguiente token o reducir por una "
            "producción. Suele aparecer por ambigüedad o por falta de reglas de "
            "precedencia y asociatividad de operadores."
        )
    if conflict_type == "reduce/reduce":
        return (
            "Un conflicto reduce/reduce ocurre cuando el parser podría reducir por "
            "dos producciones diferentes en la misma situación. Normalmente indica "
            "que la gramática es ambigua o que dos reglas generan el mismo lenguaje."
        )
    if conflict_type == "LL1":
        return (
            "Un conflicto LL(1) significa que una misma celda de la tabla "
            "predictiva tendría dos producciones. Revisa recursión por la "
            "izquierda, falta de factorización por la izquierda y solapamiento "
            "entre los conjuntos FIRST/FOLLOW."
        )
    return "Se detectó un conflicto en la construcción de la tabla del parser."


def suggest_improvements(algorithm: str, conflicts: list[dict[str, Any]]) -> str:

    if not conflicts:
        return ""

    if algorithm == "LL1":
        return (
            "Sugerencias para LL(1): "
            "1) Elimina la recursión por la izquierda (A -> A α). "
            "2) Aplica factorización por la izquierda cuando dos alternativas "
            "empiezan con los mismos símbolos. "
            "3) Verifica que los conjuntos FIRST de las alternativas no se "
            "solapen y que FIRST no choque con FOLLOW cuando hay epsilon."
        )

    return (
        "Sugerencias para parsers LR: "
        "1) Revisa si la gramática es ambigua. "
        "2) Define precedencia y asociatividad de operadores. "
        "3) Si usas SLR(1), prueba con LR(1) o LALR(1), que usan lookahead más "
        "preciso y resuelven más conflictos."
    )


def explain_result(
    algorithm: str,
    accepted: bool,
    conflicts: list[dict[str, Any]],
    error_message: str | None,
) -> str:

    name = algorithm_name(algorithm)
    parts: list[str] = []

    if conflicts:
        conflict_types = sorted({c.get("type", "desconocido") for c in conflicts})
        parts.append(
            f"El método {name} encontró {len(conflicts)} conflicto(s) "
            f"({', '.join(conflict_types)}) al construir su tabla."
        )
        for ctype in conflict_types:
            parts.append(explain_conflict(ctype))
        parts.append(suggest_improvements(algorithm, conflicts))
        parts.append(
            "Cuando una tabla tiene conflictos, la gramática no pertenece a la "
            "clase requerida por este método, por lo que el análisis de la cadena "
            "puede no ser confiable."
        )
        return " ".join(p for p in parts if p)

    if accepted:
        parts.append(
            f"La cadena fue ACEPTADA por el método {name}. Esto significa que el "
            f"parser logró derivar la cadena completa siguiendo las producciones "
            f"de la gramática y consumió todos los tokens hasta el fin de entrada "
            f"($) sin errores."
        )
        if algorithm in ("LR0", "SLR1", "LR1", "LALR1"):
            parts.append(
                "En un parser bottom-up esto ocurre cuando se alcanza la acción "
                "'accept' tras reducir hasta el símbolo inicial aumentado."
            )
        else:
            parts.append(
                "En un parser top-down esto ocurre cuando la pila se vacía justo "
                "al mismo tiempo que se consume el último token."
            )
        return " ".join(parts)

    parts.append(
        f"La cadena fue RECHAZADA por el método {name}."
    )
    if error_message:
        parts.append(f"Detalle del error: {error_message}")
    parts.append(
        "Esto suele deberse a que el token actual no era esperado por el parser "
        "en ese punto, o a que la cadena terminó antes de completar una "
        "derivación válida. Revisa que la cadena use solo los terminales de la "
        "gramática y que respete la estructura de las producciones."
    )
    return " ".join(parts)
