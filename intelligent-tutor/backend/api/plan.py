"""Study planning API."""

from fastapi import APIRouter, HTTPException

from backend.models.plan import PlanRequest, PlanResponse
from backend.agents.service.planner_agent import planner_agent_handler

router = APIRouter()


@router.post("/plan/create")
async def create_plan(request: PlanRequest):
    """Create a personalized study plan."""
    try:
        exam_dates_str = ""
        if request.exam_dates:
            exam_dates_str = ", ".join(f"{k}: {v}" for k, v in request.exam_dates.items())

        response = await planner_agent_handler(
            subjects=request.subjects,
            current_level=request.current_level,
            goal=request.goal,
            hours_per_week=request.hours_per_week,
            deadline=request.deadline or "",
            exam_dates=exam_dates_str,
        )

        return {
            "plan_text": response,
            "subjects": request.subjects,
            "hours_per_week": request.hours_per_week,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建学习计划失败: {str(e)}")
