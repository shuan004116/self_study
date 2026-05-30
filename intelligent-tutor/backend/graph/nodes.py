"""LangGraph node functions for agent workflow."""

from backend.agents.dispatcher import DispatcherAgent
from backend.agents.subject.math_agent import math_agent_handler
from backend.agents.subject.cs_agent import cs_agent_handler
from backend.agents.subject.physics_agent import physics_agent_handler
from backend.agents.subject.humanities_agent import humanities_agent_handler
from backend.agents.service.exercise_agent import exercise_agent_handler
from backend.agents.service.planner_agent import planner_agent_handler
from backend.agents.service.summary_agent import summary_agent_handler
from backend.agents.service.code_review_agent import code_review_agent_handler
from backend.agents.registry import registry
from backend.graph.state import AgentState


def register_all_agents():
    """Register all agents in the global registry."""
    # Subject agents
    registry.register_subject("数学", math_agent_handler)
    registry.register_subject("计算机", cs_agent_handler)
    registry.register_subject("物理", physics_agent_handler)
    registry.register_subject("人文", humanities_agent_handler)

    # Service agents
    registry.register_service("出题", exercise_agent_handler)
    registry.register_service("规划", planner_agent_handler)
    registry.register_service("总结", summary_agent_handler)
    registry.register_service("代码", code_review_agent_handler)

    # Default
    registry.register_default(cs_agent_handler)


async def classify_intent_node(state: AgentState) -> dict:
    """Dispatcher node: classify user intent and subject."""
    dispatcher = DispatcherAgent()
    result = await dispatcher.process(state["user_message"])
    return {
        "user_intent": result["intent"],
        "subject": result["subject"],
        "current_agent": "dispatcher",
        "agent_chain": ["dispatcher"],
    }


async def route_by_subject_node(state: AgentState) -> dict:
    """Route to the subject expert agent based on classification."""
    subject = state.get("subject", "跨学科")
    intent = state.get("user_intent", "答疑")
    message = state["user_message"]
    history = state.get("history", "")

    handlers = registry.route(subject, intent)
    agent_outputs = {}
    agent_chain = ["dispatcher"]

    for i, handler in enumerate(handlers):
        agent_name = handler.__name__.replace("_handler", "")
        agent_chain.append(agent_name)

        try:
            if intent == "出题":
                output = await handler(
                    subject=subject,
                    topic=message,
                    difficulty="medium",
                    count=3,
                    history=history,
                )
            elif intent == "规划":
                output = await handler(
                    subjects=[subject],
                    current_level="beginner",
                    goal=message,
                    history=history,
                )
            elif intent == "总结":
                output = await handler(
                    text=message,
                    subject=subject,
                )
            elif intent == "代码":
                output = await handler(
                    code=message,
                    language="python",
                    task_type="debug",
                    history=history,
                )
            else:
                output = await handler(
                    message=message,
                    history=history,
                )
            agent_outputs[agent_name] = output
        except Exception as e:
            agent_outputs[agent_name] = f"[{agent_name}处理出错: {str(e)}]"

    return {
        "agent_outputs": agent_outputs,
        "agent_chain": agent_chain,
        "current_agent": agent_chain[-1] if agent_chain else "unknown",
    }


async def assemble_response_node(state: AgentState) -> dict:
    """Assemble final response from all agent outputs."""
    dispatcher = DispatcherAgent()
    classification = {
        "intent": state.get("user_intent", "答疑"),
        "subject": state.get("subject", "跨学科"),
    }
    response = await dispatcher.assemble_response(
        state["user_message"],
        state.get("agent_outputs", {}),
        classification,
    )
    return {"final_response": response}
