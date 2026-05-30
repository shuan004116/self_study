"""Study planning agent."""

from langchain_core.messages import HumanMessage, SystemMessage

from backend.llm.llm_client import LLMClient
from backend.llm.prompts import SYSTEM_PROMPTS


async def planner_agent_handler(
    subjects: list[str],
    current_level: str,
    goal: str,
    hours_per_week: int = 20,
    deadline: str = "",
    exam_dates: str = "",
) -> str:
    """Create a personalized study plan."""
    llm = LLMClient()

    prompt = (
        f"学科列表：{', '.join(subjects)}\n"
        f"当前水平：{current_level}\n"
        f"学习目标：{goal}\n"
        f"每周可用时间：{hours_per_week}小时\n"
        f"截止日期：{deadline or '未指定'}\n"
        f"考试日期：{exam_dates or '未指定'}\n\n"
        f"请根据以上信息制定详细的学习计划。"
    )

    messages = [
        SystemMessage(content=SYSTEM_PROMPTS["planner_agent"]),
        HumanMessage(content=prompt),
    ]

    return await llm.achat(messages, role="planner")
