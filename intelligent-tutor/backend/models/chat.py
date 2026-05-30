from pydantic import BaseModel, Field
from typing import Optional


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000, description="用户消息")
    session_id: str = Field(default="default", description="会话ID")
    subject_override: Optional[str] = Field(None, description="手动指定学科")
    intent_override: Optional[str] = Field(None, description="手动指定意图")


class ChatResponse(BaseModel):
    session_id: str
    agent_chain: list[str]
    content: str
    subject: str
    intent: str


class StreamEvent(BaseModel):
    event: str  # status, token, error, done
    data: dict
