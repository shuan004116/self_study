"""LLM client wrapper supporting OpenAI-compatible APIs and Ollama.

Reads configuration from RuntimeLLMConfig (settable via API at runtime).
"""

from typing import AsyncGenerator, Optional

from langchain_core.messages import BaseMessage
from langchain_core.language_models import BaseChatModel

from backend.config import settings, load_llm_config


class LLMClient:
    """Centralized LLM client with multi-provider support.

    Supports:
    - OpenAI-compatible APIs (DeepSeek, SiliconFlow, 通义千问, etc.)
    - Ollama (local models)

    Reads credentials from RuntimeLLMConfig, which can be updated at runtime.
    """

    def __init__(self):
        self._role_temps = {
            "dispatcher": settings.agent_dispatcher_temperature,
            "subject": settings.agent_subject_temperature,
            "exercise": settings.agent_exercise_temperature,
            "planner": settings.agent_planner_temperature,
            "summary": settings.agent_subject_temperature,
            "code": settings.agent_code_temperature,
        }

    def _get_config(self):
        """Get current runtime config."""
        return load_llm_config()

    def get_chat_model(self, temperature: Optional[float] = None, role: Optional[str] = None) -> BaseChatModel:
        """Get a chat model instance with appropriate temperature."""
        temp = temperature
        if temp is None and role:
            temp = self._role_temps.get(role, settings.agent_default_temperature)
        if temp is None:
            temp = settings.agent_default_temperature

        config = self._get_config()
        if config.provider == "openai_compatible":
            return self._build_openai_model(config, temp)
        else:
            return self._build_ollama_model(config, temp)

    def _build_openai_model(self, config, temperature: float) -> BaseChatModel:
        """Build an OpenAI-compatible chat model from runtime config."""
        from langchain_openai import ChatOpenAI

        kwargs = {
            "model": config.api_chat_model,
            "temperature": temperature,
            "base_url": config.api_base_url,
            "api_key": config.api_key or settings.api_key,
            "timeout": settings.api_request_timeout,
            "max_tokens": settings.agent_max_tokens,
        }
        if not kwargs["api_key"]:
            kwargs["api_key"] = "sk-placeholder"

        return ChatOpenAI(**kwargs)

    def _build_ollama_model(self, config, temperature: float) -> BaseChatModel:
        """Build an Ollama chat model from runtime config."""
        from langchain_ollama import ChatOllama

        return ChatOllama(
            model=config.ollama_chat_model or settings.ollama_chat_model,
            base_url=config.ollama_base_url or settings.ollama_base_url,
            temperature=temperature,
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
        """Stream tokens from the LLM."""
        model = self.get_chat_model(role=role)
        async for chunk in model.astream(messages):
            if hasattr(chunk, "content") and chunk.content:
                yield chunk.content
