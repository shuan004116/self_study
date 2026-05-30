"""Knowledge summarization agent."""

from langchain_core.messages import HumanMessage, SystemMessage

from backend.llm.llm_client import LLMClient
from backend.llm.prompts import SYSTEM_PROMPTS


async def summary_agent_handler(
    text: str,
    subject: str = "",
    max_ratio: float = 0.3,
) -> str:
    """Summarize a long text with structured output."""
    llm = LLMClient()

    # Truncate text if too long
    max_chars = 8000
    truncated = text[:max_chars] if len(text) > max_chars else text
    if len(text) > max_chars:
        truncated += "\n\n[注意：原文过长，已截取前8000字符]"

    prompt = (
        f"学科：{subject or '通用'}\n"
        f"总结比例：控制在原文的{int(max_ratio * 100)}%以内\n\n"
        f"需要总结的文本如下：\n{truncated}"
    )

    messages = [
        SystemMessage(content=SYSTEM_PROMPTS["summary_agent"]),
        HumanMessage(content=prompt),
    ]

    return await llm.achat(messages, role="summary")
