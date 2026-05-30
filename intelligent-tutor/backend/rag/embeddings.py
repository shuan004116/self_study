"""Embedding model wrapper using Ollama bge-m3."""

from typing import Optional

from langchain_ollama import OllamaEmbeddings

from backend.config import settings


def get_ollama_embeddings(
    model_name: Optional[str] = None,
    base_url: Optional[str] = None,
) -> OllamaEmbeddings:
    """Get Ollama embeddings instance for bge-m3."""
    return OllamaEmbeddings(
        model=model_name or settings.ollama_embedding_model,
        base_url=base_url or settings.ollama_base_url,
    )
