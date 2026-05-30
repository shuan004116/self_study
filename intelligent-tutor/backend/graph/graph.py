"""LangGraph workflow construction for multi-agent orchestration."""

from langgraph.graph import StateGraph, END

from backend.graph.state import AgentState
from backend.graph.nodes import (
    classify_intent_node,
    route_by_subject_node,
    assemble_response_node,
)
from backend.graph.edges import route_by_subject, check_if_need_more_agents
from backend.agents.subject.math_agent import math_agent_handler
from backend.agents.subject.cs_agent import cs_agent_handler
from backend.agents.subject.physics_agent import physics_agent_handler
from backend.agents.subject.humanities_agent import humanities_agent_handler
from backend.agents.service.exercise_agent import exercise_agent_handler
from backend.agents.service.planner_agent import planner_agent_handler
from backend.agents.service.summary_agent import summary_agent_handler
from backend.agents.service.code_review_agent import code_review_agent_handler


async def math_agent_node(state: AgentState) -> dict:
    output = await math_agent_handler(
        message=state["user_message"],
        history=state.get("history", ""),
        context=state.get("retrieved_context", ""),
    )
    return {
        "agent_outputs": {**state.get("agent_outputs", {}), "math_agent": output},
        "current_agent": "math_agent",
    }


async def cs_agent_node(state: AgentState) -> dict:
    output = await cs_agent_handler(
        message=state["user_message"],
        history=state.get("history", ""),
        context=state.get("retrieved_context", ""),
    )
    return {
        "agent_outputs": {**state.get("agent_outputs", {}), "cs_agent": output},
        "current_agent": "cs_agent",
    }


async def physics_agent_node(state: AgentState) -> dict:
    output = await physics_agent_handler(
        message=state["user_message"],
        history=state.get("history", ""),
        context=state.get("retrieved_context", ""),
    )
    return {
        "agent_outputs": {**state.get("agent_outputs", {}), "physics_agent": output},
        "current_agent": "physics_agent",
    }


async def humanities_agent_node(state: AgentState) -> dict:
    output = await humanities_agent_handler(
        message=state["user_message"],
        history=state.get("history", ""),
        context=state.get("retrieved_context", ""),
    )
    return {
        "agent_outputs": {**state.get("agent_outputs", {}), "humanities_agent": output},
        "current_agent": "humanities_agent",
    }


async def exercise_agent_node(state: AgentState) -> dict:
    output = await exercise_agent_handler(
        subject=state.get("subject", "计算机"),
        topic=state["user_message"],
        difficulty="medium",
        count=3,
        history=state.get("history", ""),
    )
    return {
        "agent_outputs": {**state.get("agent_outputs", {}), "exercise_agent": output},
        "current_agent": "exercise_agent",
    }


async def planner_agent_node(state: AgentState) -> dict:
    output = await planner_agent_handler(
        subjects=[state.get("subject", "通用")],
        current_level="beginner",
        goal=state["user_message"],
        hours_per_week=20,
    )
    return {
        "agent_outputs": {**state.get("agent_outputs", {}), "planner_agent": output},
        "current_agent": "planner_agent",
    }


async def summary_agent_node(state: AgentState) -> dict:
    output = await summary_agent_handler(
        text=state["user_message"],
        subject=state.get("subject", ""),
    )
    return {
        "agent_outputs": {**state.get("agent_outputs", {}), "summary_agent": output},
        "current_agent": "summary_agent",
    }


async def code_agent_node(state: AgentState) -> dict:
    output = await code_review_agent_handler(
        code=state["user_message"],
        language="python",
        task_type="debug",
        history=state.get("history", ""),
    )
    return {
        "agent_outputs": {**state.get("agent_outputs", {}), "code_agent": output},
        "current_agent": "code_agent",
    }


def build_tutor_graph() -> StateGraph:
    """Build the multi-agent orchestration graph."""
    workflow = StateGraph(AgentState)

    # Register all nodes
    workflow.add_node("classify_intent", classify_intent_node)
    workflow.add_node("route_agents", route_by_subject_node)
    workflow.add_node("assemble_response", assemble_response_node)
    workflow.add_node("math_agent", math_agent_node)
    workflow.add_node("cs_agent", cs_agent_node)
    workflow.add_node("physics_agent", physics_agent_node)
    workflow.add_node("humanities_agent", humanities_agent_node)
    workflow.add_node("exercise_agent", exercise_agent_node)
    workflow.add_node("planner_agent", planner_agent_node)
    workflow.add_node("summary_agent", summary_agent_node)
    workflow.add_node("code_agent", code_agent_node)

    # Entry point
    workflow.set_entry_point("classify_intent")

    # Dispatcher -> classify intent
    workflow.add_conditional_edges(
        "classify_intent",
        route_by_subject,
        {
            "math_agent": "math_agent",
            "cs_agent": "cs_agent",
            "physics_agent": "physics_agent",
            "humanities_agent": "humanities_agent",
            "exercise_agent": "exercise_agent",
            "planner_agent": "planner_agent",
            "summary_agent": "summary_agent",
            "code_agent": "code_agent",
        },
    )

    # Subject agents -> check if more agents needed, then assemble
    for agent in ["math_agent", "cs_agent", "physics_agent", "humanities_agent",
                   "exercise_agent", "planner_agent", "summary_agent", "code_agent"]:
        workflow.add_conditional_edges(
            agent,
            check_if_need_more_agents,
            {
                "assemble": "assemble_response",
                "subject_agent": "cs_agent",  # fallback: use CS agent for additional context
            },
        )

    # Assemble -> end
    workflow.add_edge("assemble_response", END)

    return workflow.compile()
