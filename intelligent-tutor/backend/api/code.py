"""Code review and tutoring API."""

from fastapi import APIRouter, HTTPException

from backend.models.code import CodeReviewRequest, CodeReviewResponse
from backend.agents.service.code_review_agent import code_review_agent_handler

router = APIRouter()


@router.post("/code/review")
async def review_code(request: CodeReviewRequest):
    """Review, debug, or explain code."""
    try:
        response = await code_review_agent_handler(
            code=request.code,
            language=request.language,
            task_type=request.task_type,
        )
        return {
            "review": response,
            "language": request.language,
            "task_type": request.task_type,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"代码审查失败: {str(e)}")
