"""Conditional edge logic for LangGraph routing."""

from backend.graph.state import AgentState


def route_by_subject(state: AgentState) -> str:
    """Route to subject agent based on classified subject."""
    subject = state.get("subject", "数学")
    intent = state.get("user_intent", "答疑")

    # Non-Q&A intents go to service agents
    if intent == "出题":
        return "exercise_agent"
    elif intent == "规划":
        return "planner_agent"
    elif intent == "总结":
        return "summary_agent"
    elif intent == "代码":
        return "code_agent"

    # Q&A: route by subject
    return {
        "数学": "math_agent",
        "计算机": "cs_agent",
        "物理": "physics_agent",
        "人文": "humanities_agent",
    }.get(subject, "cs_agent")


def check_if_need_more_agents(state: AgentState) -> str:
    """Check if additional agent collaboration is needed."""
    intent = state.get("user_intent", "答疑")

    # After subject agent, check if user also wanted exercises
    # For now, simple: if Q&A, assemble; if service, also run subject agent
    if intent in ("出题", "代码"):
        # Check if we've already run a subject agent
        outputs = state.get("agent_outputs", {})
        subject_agents = {"math_agent", "cs_agent", "physics_agent", "humanities_agent"}
        has_subject = subject_agents & set(outputs.keys())
        if not has_subject:
            return "subject_agent"  # Need subject expertise too
    return "assemble"
