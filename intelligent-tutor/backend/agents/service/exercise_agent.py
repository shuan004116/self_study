"""Exercise/quiz generation agent."""

import json
import re

from langchain_core.messages import HumanMessage, SystemMessage

from backend.llm.llm_client import LLMClient
from backend.llm.prompts import SYSTEM_PROMPTS


async def exercise_agent_handler(
    subject: str,
    topic: str,
    difficulty: str = "medium",
    count: int = 3,
    question_type: str = "choice",
    history: str = "",
) -> str:
    """Generate exercise questions on a topic."""
    llm = LLMClient()

    prompt = (
        f"学科：{subject}\n"
        f"知识点：{topic}\n"
        f"难度：{difficulty}\n"
        f"题目数量：{count}\n"
        f"题型：{question_type}\n\n"
        f"请严格按照JSON格式输出{count}道{subject}的{difficulty}难度题目。"
    )

    messages = [
        SystemMessage(content=SYSTEM_PROMPTS["exercise_agent"]),
        HumanMessage(content=prompt),
    ]

    raw_response = await llm.achat(messages, role="exercise")

    # Try to extract JSON from the response
    try:
        json_match = re.search(r'\[.*\]', raw_response, re.DOTALL)
        if json_match:
            json.loads(json_match.group())
        else:
            json_match = re.search(r'\{.*\}', raw_response, re.DOTALL)
            if json_match:
                json.loads(json_match.group())
    except (json.JSONDecodeError, AttributeError):
        pass  # Return as-is if JSON parsing fails

    return raw_response
