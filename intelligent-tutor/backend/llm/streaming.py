"""SSE streaming helpers for agent output."""

import json
from typing import AsyncGenerator, Any

from fastapi.responses import StreamingResponse


def serialize_event(event: str, data: dict) -> str:
    """Serialize an SSE event."""
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


class EventStream:
    """Helper to build SSE event streams."""

    def __init__(self):
        self.events: list[str] = []

    def status(self, agent: str, status: str, message: str = "") -> str:
        return serialize_event("status", {
            "agent": agent,
            "status": status,
            "message": message,
        })

    def token(self, text: str) -> str:
        return serialize_event("token", {"token": text})

    def error(self, message: str) -> str:
        return serialize_event("error", {"message": message})

    def done(self, session_id: str, agent_chain: list[str] | None = None) -> str:
        data = {"session_id": session_id}
        if agent_chain:
            data["agent_chain"] = agent_chain
        return serialize_event("done", data)

    def agent_start(self, agent_name: str, display_name: str = "") -> str:
        name = display_name or agent_name
        return self.status(agent_name, "started", f"{name}正在处理...")

    def agent_complete(self, agent_name: str) -> str:
        return self.status(agent_name, "complete")


def create_sse_response(
    generator: AsyncGenerator[str, None],
) -> StreamingResponse:
    """Create a FastAPI StreamingResponse with SSE headers."""
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
