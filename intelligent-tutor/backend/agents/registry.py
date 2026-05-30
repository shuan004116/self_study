"""Agent registry - maps subject/intent to agent handlers."""

from typing import Callable, Awaitable

AgentHandler = Callable[..., Awaitable[str]]


class AgentRegistry:
    """Registry that maps subject/intent combinations to agent handlers."""

    def __init__(self):
        self._subject_agents: dict[str, AgentHandler] = {}
        self._service_agents: dict[str, AgentHandler] = {}
        self._default_agent: AgentHandler | None = None

    def register_subject(self, subject: str, handler: AgentHandler):
        """Register a subject expert agent."""
        self._subject_agents[subject] = handler

    def register_service(self, service: str, handler: AgentHandler):
        """Register a service agent (exercise/plan/summary/code)."""
        self._service_agents[service] = handler

    def register_default(self, handler: AgentHandler):
        """Register the default fallback handler."""
        self._default_agent = handler

    def get_subject_agent(self, subject: str) -> AgentHandler | None:
        """Get agent for a subject."""
        return self._subject_agents.get(subject)

    def get_service_agent(self, intent: str) -> AgentHandler | None:
        """Get agent for an intent/service type."""
        return self._service_agents.get(intent)

    def get_default(self) -> AgentHandler | None:
        return self._default_agent

    def route(self, subject: str, intent: str) -> list[AgentHandler]:
        """Determine which agents should handle a request.

        Returns a list of handlers in execution order.
        """
        handlers = []

        # Service agents take priority for non-Q&A intents
        if intent in ("出题", "规划", "总结", "代码"):
            service_agent = self.get_service_agent(intent)
            if service_agent:
                handlers.append(service_agent)
            # Subject agent may assist
            if intent in ("出题", "代码"):
                subject_agent = self.get_subject_agent(subject)
                if subject_agent:
                    handlers.append(subject_agent)
        else:
            # Default Q&A: use subject agent
            agent = self.get_subject_agent(subject)
            if agent:
                handlers.append(agent)
            else:
                default = self.get_default()
                if default:
                    handlers.append(default)

        return handlers


# Global registry
registry = AgentRegistry()
