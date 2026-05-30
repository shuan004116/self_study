"""Exercise generation API."""

from fastapi import APIRouter, HTTPException

from backend.models.exercise import ExerciseRequest, ExerciseResponse
from backend.agents.service.exercise_agent import exercise_agent_handler

router = APIRouter()


@router.post("/exercise/generate", response_model=ExerciseResponse)
async def generate_exercise(request: ExerciseRequest):
    """Generate exercise questions on a given topic."""
    try:
        response_text = await exercise_agent_handler(
            subject=request.subject,
            topic=request.topic,
            difficulty=request.difficulty,
            count=request.count,
            question_type=request.question_type,
        )

        # Parse LLM response into structured format
        import json
        import re

        items = []
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            try:
                data = json.loads(json_match.group())
                questions = data.get("questions", [])
                for q in questions:
                    items.append({
                        "id": q.get("id", 0),
                        "type": q.get("type", "choice"),
                        "difficulty": q.get("difficulty", "medium"),
                        "question": q.get("question", ""),
                        "options": q.get("options"),
                        "answer": q.get("answer", ""),
                        "explanation": q.get("explanation", ""),
                        "knowledge_points": q.get("knowledge_points", []),
                    })
            except json.JSONDecodeError:
                pass

        if not items:
            # Fallback: wrap raw text into a single exercise item
            items.append({
                "id": 1,
                "type": "essay",
                "difficulty": request.difficulty,
                "question": request.topic,
                "options": None,
                "answer": response_text,
                "explanation": "",
                "knowledge_points": [request.topic],
            })

        return ExerciseResponse(
            subject=request.subject,
            topic=request.topic,
            questions=items,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成题目失败: {str(e)}")
