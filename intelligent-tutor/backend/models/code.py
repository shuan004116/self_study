from pydantic import BaseModel, Field
from typing import Optional


class CodeReviewRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=50000, description="代码内容")
    language: str = Field(default="python", description="编程语言")
    task_type: str = Field(default="debug", pattern="^(debug|review|explain|optimize)$")


class CodeReviewLine(BaseModel):
    line: int
    issue_type: str  # error/warning/style/performance/security
    description: str
    suggestion: str


class CodeReviewResponse(BaseModel):
    summary: str
    line_reviews: list[CodeReviewLine]
    suggestions: list[str]
    corrected_code: str | None = None
