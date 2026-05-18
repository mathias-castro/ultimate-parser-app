from __future__ import annotations

from typing import Any

from app.domain.models import ParseStep


def empty_table() -> dict[str, Any]:
    return {"columns": [], "rows": []}


def sets_to_dict(sets: dict[str, set[str]]) -> dict[str, list[str]]:
    return {key: sorted(value) for key, value in sets.items()}


def first_follow_table(sets: dict[str, set[str]]) -> dict[str, Any]:
    columns = ["No terminal", "Conjunto"]
    rows = [
        {"No terminal": nt, "Conjunto": "{ " + ", ".join(sorted(values)) + " }"}
        for nt, values in sets.items()
    ]
    return {"columns": columns, "rows": rows}


def ll1_table_to_dict(
    table: dict[tuple[str, str], str],
    non_terminals: list[str],
    terminals: list[str],
) -> dict[str, Any]:

    columns = ["No terminal", *terminals]
    rows: list[dict[str, str]] = []
    for nt in non_terminals:
        row: dict[str, str] = {"No terminal": nt}
        for terminal in terminals:
            row[terminal] = table.get((nt, terminal), "")
        rows.append(row)
    return {"columns": columns, "rows": rows}


def lr_tables_to_dict(
    action: dict[tuple[int, str], str],
    goto: dict[tuple[int, str], int],
    state_count: int,
    terminals: list[str],
    non_terminals: list[str],
) -> tuple[dict[str, Any], dict[str, Any]]:

    action_columns = ["Estado", *terminals]
    action_rows: list[dict[str, str]] = []
    for state in range(state_count):
        row: dict[str, str] = {"Estado": f"I{state}"}
        for terminal in terminals:
            row[terminal] = action.get((state, terminal), "")
        action_rows.append(row)

    goto_columns = ["Estado", *non_terminals]
    goto_rows: list[dict[str, str]] = []
    for state in range(state_count):
        row = {"Estado": f"I{state}"}
        for nt in non_terminals:
            target = goto.get((state, nt))
            row[nt] = f"I{target}" if target is not None else ""
        goto_rows.append(row)

    return (
        {"columns": action_columns, "rows": action_rows},
        {"columns": goto_columns, "rows": goto_rows},
    )


def steps_to_list(steps: list[ParseStep]) -> list[dict[str, str]]:
    return [step.as_dict() for step in steps]
