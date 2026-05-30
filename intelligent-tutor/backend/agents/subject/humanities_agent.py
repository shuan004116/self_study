"""Humanities subject expert agent."""

from langchain_core.messages import HumanMessage, SystemMessage

from backend.llm.llm_client import LLMClient
from backend.llm.prompts import format_system_prompt


async def humanities_agent_handler(
    message: str,
    history: str = "",
    context: str = "",
) -> str:
    """Handle humanities questions."""
    llm = LLMClient()
    system_prompt = format_system_prompt("humanities_agent", context)

    messages = [SystemMessage(content=system_prompt)]
    if history:
        messages.append(SystemMessage(content=f"对话历史：\n{history}"))
    messages.append(HumanMessage(content=message))

    return await llm.achat(messages, role="subject")
