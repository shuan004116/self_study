"""FastAPI dependency injection."""

from backend.memory.buffer import ConversationMemory

# Session storage
_sessions: dict[str, ConversationMemory] = {}


def get_memory(session_id: str = "default") -> ConversationMemory:
    """Get or create conversation memory for a session."""
    if session_id not in _sessions:
        _sessions[session_id] = ConversationMemory(session_id)
    return _sessions[session_id]
