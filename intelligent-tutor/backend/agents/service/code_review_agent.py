"""Code review and debugging agent."""

from langchain_core.messages import HumanMessage, SystemMessage

from backend.llm.llm_client import LLMClient
from backend.llm.prompts import SYSTEM_PROMPTS


async def code_review_agent_handler(
    code: str,
    language: str = "python",
    task_type: str = "debug",
    history: str = "",
) -> str:
    """Review, debug, or explain code."""
    llm = LLMClient()

    task_labels = {
        "debug": "调试/纠错",
        "review": "代码审查",
        "explain": "代码解释",
        "optimize": "性能优化",
    }
    task_label = task_labels.get(task_type, task_type)

    prompt = (
        f"任务类型：{task_label}\n"
        f"编程语言：{language}\n\n"
        f"代码内容：\n```{language}\n{code}\n```"
    )

    messages = [
        SystemMessage(content=SYSTEM_PROMPTS["code_review_agent"]),
        HumanMessage(content=prompt),
    ]

    return await llm.achat(messages, role="code")
