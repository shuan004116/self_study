"""Simple conversation memory without deprecated langchain modules."""

from collections import deque
from dataclasses import dataclass, field
from typing import Optional

from backend.config import settings


@dataclass
class Turn:
    """A single user-AI exchange."""
    user: str
    assistant: str


class ConversationMemory:
    """Simple sliding-window conversation memory."""

    def __init__(self, session_id: str, window_size: int = None):
        self.session_id = session_id
        self.window_size = window_size or settings.short_term_window
        self._turns: deque[Turn] = deque(maxlen=self.window_size)

    def add_message(self, user_msg: str, ai_msg: str):
        """Add a user-AI exchange."""
        self._turns.append(Turn(user=user_msg, assistant=ai_msg))

    def get_history(self) -> str:
        """Get formatted conversation history."""
        if not self._turns:
            return ""
        parts = []
        for t in self._turns:
            parts.append(f"用户: {t.user}")
            parts.append(f"助手: {t.assistant}")
        return "\n".join(parts)

    def get_context_string(self) -> str:
        """Alias for get_history."""
        return self.get_history()

    def clear(self):
        """Clear all turns."""
        self._turns.clear()

    @property
    def turn_count(self) -> int:
        return len(self._turns)
