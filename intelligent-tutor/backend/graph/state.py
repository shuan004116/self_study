"""LangGraph state definitions."""

from typing import Annotated, Optional, TypedDict
from langgraph.graph import add_messages
from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    """Shared state for the multi-agent LangGraph workflow."""

    # Conversation
    messages: Annotated[list[BaseMessage], add_messages]
    user_message: str
    session_id: str

    # Classification (set by Dispatcher)
    user_intent: Optional[str]  # 答疑 | 出题 | 规划 | 总结 | 代码
    subject: Optional[str]      # 数学 | 计算机 | 物理 | 人文 | 跨学科

    # Agent execution tracking
    current_agent: Optional[str]
    agent_outputs: dict[str, str]  # {agent_name: output_text}
    agent_chain: list[str]        # Execution order for display
    agent_errors: dict[str, str]  # {agent_name: error_message}

    # RAG context
    retrieved_context: Optional[str]

    # Conversation memory
    history: Optional[str]

    # Final assembled response
    final_response: Optional[str]
