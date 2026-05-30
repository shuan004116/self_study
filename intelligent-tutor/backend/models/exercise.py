from pydantic import BaseModel, Field
from typing import Optional


class ExerciseRequest(BaseModel):
    subject: str = Field(..., description="学科")
    topic: str = Field(..., description="知识点/主题")
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard)$")
    count: int = Field(default=3, ge=1, le=10)
    question_type: str = Field(default="choice", pattern="^(choice|fill|essay|code)$")


class ExerciseItem(BaseModel):
    id: int
    type: str
    difficulty: str
    question: str
    options: list[str] | None = None
    answer: str
    explanation: str
    knowledge_points: list[str]


class ExerciseResponse(BaseModel):
    subject: str
    topic: str
    questions: list[ExerciseItem]
