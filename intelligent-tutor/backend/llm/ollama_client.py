"""Ollama LLM client wrapper with Chinese-optimized settings."""

from typing import AsyncGenerator, Optional

from langchain_ollama import ChatOllama
from langchain_core.messages import BaseMessage
from langchain_core.language_models import BaseChatModel

from backend.config import settings


class OllamaClient:
    """Centralized Ollama LLM client with role-specific configurations."""

    def __init__(
        self,
        model_name: str = None,
        base_url: str = None,
    ):
        self.base_url = base_url or settings.ollama_base_url
        self.model_name = model_name or settings.ollama_chat_model

        self._role_temps = {
            "dispatcher": settings.agent_dispatcher_temperature,
            "subject": settings.agent_subject_temperature,
            "exercise": settings.agent_exercise_temperature,
            "planner": settings.agent_planner_temperature,
            "summary": settings.agent_subject_temperature,
            "code": settings.agent_code_temperature,
        }

    def get_chat_model(self, temperature: Optional[float] = None, role: Optional[str] = None) -> BaseChatModel:
        """Get a ChatOllama instance with appropriate temperature.

        Args:
            temperature: Direct temperature override.
            role: Agent role name for role-based temperature presets.
        """
        temp = temperature
        if temp is None and role:
            temp = self._role_temps.get(role, settings.agent_default_temperature)
        if temp is None:
            temp = settings.agent_default_temperature

        return ChatOllama(
            model=self.model_name,
            base_url=self.base_url,
            temperature=temp,
            top_p=0.9,
            num_predict=settings.agent_max_tokens,
            stop=["<|im_end|>"],
            repeat_penalty=1.1,
            presence_penalty=0.0,
            frequency_penalty=0.0,
            timeout=settings.ollama_request_timeout,
        )

    async def achat(self, messages: list[BaseMessage], role: Optional[str] = None) -> str:
        """Send a chat message and get response."""
        model = self.get_chat_model(role=role)
        response = await model.ainvoke(messages)
        return response.content

    async def astream(
        self, messages: list[BaseMessage], role: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Stream tokens from Ollama."""
        model = self.get_chat_model(role=role)
        async for chunk in model.astream(messages):
            if hasattr(chunk, "content") and chunk.content:
                yield chunk.content
