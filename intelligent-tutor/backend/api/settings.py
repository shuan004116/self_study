"""API settings management endpoint.

Allows configuring LLM provider (API key, endpoint, model) via the web UI.
Settings are persisted to data/settings.json and survive restarts.
"""

import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.config import (
    RuntimeLLMConfig,
    load_llm_config,
    save_llm_config,
)
from backend.llm.llm_client import LLMClient

router = APIRouter()


class LLMSettingsRequest(BaseModel):
    provider: str = Field(default="openai_compatible", pattern="^(openai_compatible|ollama)$")
    api_key: str = Field(default="", description="API Key")
    api_base_url: str = Field(default="https://api.deepseek.com/v1")
    api_chat_model: str = Field(default="deepseek-chat")
    api_embedding_model: str = Field(default="")
    ollama_base_url: str = Field(default="http://localhost:11434")
    ollama_chat_model: str = Field(default="qwen2.5:14b")


class TestConnectionRequest(BaseModel):
    provider: str = Field(default="openai_compatible")
    api_key: str = Field(default="")
    api_base_url: str = Field(default="https://api.deepseek.com/v1")
    api_chat_model: str = Field(default="deepseek-chat")
    ollama_base_url: str = Field(default="http://localhost:11434")
    ollama_chat_model: str = Field(default="qwen2.5:14b")


@router.get("/settings/llm")
async def get_llm_settings():
    """Get current LLM configuration (API key is masked)."""
    config = load_llm_config()
    return config.to_dict()


@router.post("/settings/llm")
async def save_llm_settings(request: LLMSettingsRequest):
    """Save LLM configuration to persistent storage."""
    config = RuntimeLLMConfig(
        provider=request.provider,
        api_key=request.api_key,
        api_base_url=request.api_base_url.rstrip("/"),
        api_chat_model=request.api_chat_model,
        api_embedding_model=request.api_embedding_model,
        ollama_base_url=request.ollama_base_url.rstrip("/"),
        ollama_chat_model=request.ollama_chat_model,
    )
    save_llm_config(config)
    return {"status": "ok", "message": "配置已保存", "config": config.to_dict()}


@router.post("/settings/llm/test")
async def test_connection(request: TestConnectionRequest):
    """Test LLM connection with the given settings."""
    # Temporarily create a config and test it
    test_config = RuntimeLLMConfig(
        provider=request.provider,
        api_key=request.api_key,
        api_base_url=request.api_base_url.rstrip("/"),
        api_chat_model=request.api_chat_model,
        ollama_base_url=request.ollama_base_url.rstrip("/"),
        ollama_chat_model=request.ollama_chat_model,
    )

    # Temporarily override the global config for testing
    from backend.config import _runtime_config
    original = _runtime_config

    try:
        # Save test config temporarily
        save_llm_config(test_config)
        # Re-read to ensure it's used
        load_llm_config()

        client = LLMClient()
        from langchain_core.messages import HumanMessage, SystemMessage

        messages = [
            SystemMessage(content="你是一个助手。只回复'连接成功'这四个字。"),
            HumanMessage(content="测试连接"),
        ]

        response = await client.achat(messages)
        return {
            "status": "ok",
            "message": "连接成功！",
            "response": response[:200] if response else "无响应",
        }
    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg or "unauthorized" in error_msg.lower():
            detail = "认证失败，请检查 API Key 是否正确"
        elif "404" in error_msg:
            detail = "模型名称错误或终端地址不正确"
        elif "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
            detail = "连接超时，请检查网络和终端地址"
        else:
            detail = f"连接失败: {error_msg[:200]}"
        return {"status": "error", "message": detail}
    finally:
        # Restore original config
        if original:
            save_llm_config(original)
        else:
            from backend.config import RuntimeLLMConfig
            save_llm_config(RuntimeLLMConfig())
