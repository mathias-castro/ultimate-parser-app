from __future__ import annotations

from fastapi import APIRouter

from app.core.config import EXAMPLES
from app.domain.models import AnalyzeRequest, AnalyzeResponse, ExampleModel
from app.services import parser_service

router = APIRouter()


@router.get("/")
def root() -> dict[str, str]:
    return {"message": "Ultimate Parser App API"}


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    return parser_service.analyze(request)


@router.get("/examples", response_model=list[ExampleModel])
def examples() -> list[ExampleModel]:
    return [ExampleModel(**example) for example in EXAMPLES]
