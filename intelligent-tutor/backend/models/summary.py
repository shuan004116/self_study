from pydantic import BaseModel, Field
from typing import Optional


class SummaryRequest(BaseModel):
    text: str = Field(..., min_length=100, max_length=100000, description="需要总结的文本")
    subject: Optional[str] = Field(None, description="学科")
    max_ratio: float = Field(default=0.3, ge=0.1, le=0.5, description="总结长度比例")


class KeyConcept(BaseModel):
    name: str
    description: str
    importance: str  # high/medium/low


class SummaryResponse(BaseModel):
    abstract: str
    outline: list[dict]
    key_concepts: list[KeyConcept]
    key_formulas: list[str] | None = None
    mind_map_json: dict | None = None
