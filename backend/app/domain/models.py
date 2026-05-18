from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from pydantic import BaseModel, Field


@dataclass(frozen=True)
class Production:

    left: str
    right: tuple[str, ...]

    def __str__(self) -> str:
        rhs = " ".join(self.right) if self.right else "epsilon"
        return f"{self.left} -> {rhs}"


@dataclass
class Grammar:

    start_symbol: str
    non_terminals: set[str]
    terminals: set[str]
    productions: list[Production]

    def productions_for(self, non_terminal: str) -> list[Production]:
        return [p for p in self.productions if p.left == non_terminal]


@dataclass
class ParseStep:

    stack: str
    symbols: str
    input: str
    action: str

    def as_dict(self) -> dict[str, str]:
        return {
            "stack": self.stack,
            "symbols": self.symbols,
            "input": self.input,
            "action": self.action,
        }


class AstNode(BaseModel):

    label: str
    kind: str = "nonterminal"
    children: list[AstNode] = Field(default_factory=list)


@dataclass(frozen=True)
class LR0Item:

    left: str
    right: tuple[str, ...]
    dot: int

    def next_symbol(self) -> str | None:
        if self.dot < len(self.right):
            return self.right[self.dot]
        return None

    def is_complete(self) -> bool:
        return self.dot >= len(self.right)

    def __str__(self) -> str:
        parts = list(self.right)
        parts.insert(self.dot, ".")
        body = " ".join(parts) if parts != ["."] else "."
        return f"{self.left} -> {body}"


@dataclass(frozen=True)
class LR1Item:

    left: str
    right: tuple[str, ...]
    dot: int
    lookahead: str

    def next_symbol(self) -> str | None:
        if self.dot < len(self.right):
            return self.right[self.dot]
        return None

    def is_complete(self) -> bool:
        return self.dot >= len(self.right)

    def core(self) -> LR0Item:
        return LR0Item(self.left, self.right, self.dot)

    def __str__(self) -> str:
        parts = list(self.right)
        parts.insert(self.dot, ".")
        body = " ".join(parts) if parts != ["."] else "."
        return f"{self.left} -> {body} , {self.lookahead}"


class AnalyzeRequest(BaseModel):
    grammar_text: str
    input_string: str
    algorithm: str


class AnalyzeResponse(BaseModel):
    accepted: bool
    algorithm: str
    message: str
    grammar: dict[str, Any]
    ast: AstNode | None = None
    first: dict[str, Any]
    follow: dict[str, Any]
    ll1_table: dict[str, Any]
    action_table: dict[str, Any]
    goto_table: dict[str, Any]
    states: list[Any]
    transitions: list[Any]
    steps: list[Any]
    conflicts: list[Any]
    explanation: str


class ExampleModel(BaseModel):
    name: str
    grammar_text: str
    input_string: str
    recommended_algorithm: str
