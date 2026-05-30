from pydantic import BaseModel, Field
from typing import Optional


class PlanRequest(BaseModel):
    subjects: list[str] = Field(..., description="学科列表")
    current_level: str = Field(default="beginner", description="当前水平")
    goal: str = Field(..., description="学习目标")
    hours_per_week: int = Field(default=20, ge=1, le=168)
    deadline: Optional[str] = Field(None, description="截止日期")
    exam_dates: Optional[dict[str, str]] = Field(None, description="各科考试日期")


class WeekPlan(BaseModel):
    week: int
    subject: str
    content: str
    hours: float
    tasks: list[str]


class PlanResponse(BaseModel):
    summary: str
    weekly_plan: list[WeekPlan]
    daily_tips: list[str]
