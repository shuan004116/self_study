import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings


@dataclass
class RuntimeLLMConfig:
    """Runtime LLM configuration that can be changed via API.

    Persisted to data/settings.json and survives restarts.
    """
    provider: str = "openai_compatible"  # "openai_compatible" or "ollama"
    api_key: str = ""
    api_base_url: str = "https://api.deepseek.com/v1"
    api_chat_model: str = "deepseek-chat"
    api_embedding_model: str = ""
    ollama_base_url: str = "http://localhost:11434"
    ollama_chat_model: str = "qwen2.5:14b"

    @property
    def is_configured(self) -> bool:
        """Check if the config has valid API credentials."""
        if self.provider == "openai_compatible":
            return bool(self.api_key and self.api_base_url and self.api_chat_model)
        return True  # Ollama is always "configured" if running

    def to_dict(self) -> dict:
        result = asdict(self)
        # Mask API key for display
        if result["api_key"] and len(result["api_key"]) > 8:
            result["api_key_masked"] = result["api_key"][:6] + "****" + result["api_key"][-4:]
        else:
            result["api_key_masked"] = "****" if result["api_key"] else ""
        return result


SETTINGS_FILE = Path(__file__).parent.parent / "data" / "settings.json"

# Global runtime config, initialized from file or defaults
_runtime_config: Optional[RuntimeLLMConfig] = None


def load_llm_config() -> RuntimeLLMConfig:
    """Load saved LLM config from settings file, or return defaults."""
    global _runtime_config
    if _runtime_config is not None:
        return _runtime_config

    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            _runtime_config = RuntimeLLMConfig(**data)
            return _runtime_config
        except Exception:
            pass

    _runtime_config = RuntimeLLMConfig()
    return _runtime_config


def save_llm_config(config: RuntimeLLMConfig) -> None:
    """Save LLM config to settings file and update global state."""
    global _runtime_config
    _runtime_config = config
    SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(asdict(config), f, ensure_ascii=False, indent=2)


class Settings(BaseSettings):
    # App
    app_name: str = "智能学习助手"
    app_version: str = "1.0.0"
    debug: bool = True

    # LLM defaults (used as fallback when no runtime config saved)
    llm_provider: str = "openai_compatible"
    api_key: str = ""
    api_base_url: str = "https://api.deepseek.com/v1"
    api_chat_model: str = "deepseek-chat"
    api_embedding_model: str = ""
    api_request_timeout: int = 120
    ollama_base_url: str = "http://localhost:11434"
    ollama_chat_model: str = "qwen2.5:14b"
    ollama_embedding_model: str = "bge-m3:latest"
    ollama_request_timeout: int = 120

    # Agent settings
    agent_default_temperature: float = 0.7
    agent_dispatcher_temperature: float = 0.1
    agent_subject_temperature: float = 0.3
    agent_exercise_temperature: float = 0.8
    agent_planner_temperature: float = 0.2
    agent_code_temperature: float = 0.2
    agent_max_tokens: int = 4096

    # RAG / Vector store
    chroma_db_path: str = str(Path(__file__).parent.parent / "data" / "chromadb")
    chunk_size: int = 512
    chunk_overlap: int = 128
    retrieval_top_k: int = 5
    retrieval_score_threshold: float = 0.6

    # Memory
    short_term_window: int = 20
    summary_token_limit: int = 4000

    # Code sandbox
    sandbox_memory_mb: int = 256
    sandbox_timeout_sec: int = 10

    # File upload
    upload_max_size_mb: int = 10
    upload_dir: str = str(Path(__file__).parent.parent / "data" / "uploads")

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:8000"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
