"""Main chat API with SSE streaming."""

import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from backend.models.chat import ChatRequest
from backend.llm.streaming import EventStream, create_sse_response
from backend.memory.buffer import ConversationMemory
from backend.graph.graph import build_tutor_graph
from backend.graph.nodes import register_all_agents
from backend.agents.dispatcher import DispatcherAgent

router = APIRouter()

# Register agents on module load
register_all_agents()

# In-memory session store (replace with Redis for production)
sessions: dict[str, ConversationMemory] = {}


def get_memory(session_id: str) -> ConversationMemory:
    """Get or create conversation memory for a session."""
    if session_id not in sessions:
        sessions[session_id] = ConversationMemory(session_id)
    return sessions[session_id]


@router.post("/chat")
async def chat(request: ChatRequest):
    """Main chat endpoint with SSE streaming response."""
    message = request.message
    session_id = request.session_id
    subject_override = request.subject_override
    intent_override = request.intent_override

    memory = get_memory(session_id)
    dispatcher = DispatcherAgent()
    es = EventStream()

    async def event_generator():
        # Step 1: Classify intent
        yield es.agent_start("dispatcher", "调度Agent")

        classification = await dispatcher.process(message)
        if subject_override:
            classification["subject"] = subject_override
        if intent_override:
            classification["intent"] = intent_override

        yield es.status("dispatcher", "complete")

        # Step 2: Get handlers from registry
        from backend.agents.registry import registry
        handlers = registry.route(
            classification["subject"],
            classification["intent"],
        )

        if not handlers:
            yield es.error(f"没有找到适合处理{classification['subject']}{classification['intent']}的Agent")
            yield es.done(session_id)
            return

        # Step 3: Execute each handler
        agent_outputs = {}
        agent_chain = []

        for handler in handlers:
            agent_name = handler.__name__.replace("_handler", "")
            agent_chain.append(agent_name)

            display_names = {
                "math_agent": "数学Agent",
                "cs_agent": "计算机Agent",
                "physics_agent": "物理Agent",
                "humanities_agent": "人文Agent",
                "exercise_agent": "出题Agent",
                "planner_agent": "学习规划Agent",
                "summary_agent": "知识总结Agent",
                "code_review_agent": "代码辅导Agent",
            }
            display_name = display_names.get(agent_name, agent_name)

            yield es.agent_start(agent_name, display_name)

            try:
                intent = classification["intent"]
                subject = classification["subject"]
                history = memory.get_context_string()

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
                        context="",
                    )

                agent_outputs[agent_name] = output
                yield es.agent_complete(agent_name)

            except Exception as e:
                err_msg = f"处理出错: {str(e)}"
                agent_outputs[agent_name] = err_msg
                yield es.error(err_msg)

        # Step 4: Assemble final response
        yield es.agent_start("assemble", "整合回复")

        final_response = await dispatcher.assemble_response(
            message,
            agent_outputs,
            classification,
        )

        # Step 5: Stream the response token by token
        yield es.status("assemble", "complete")

        for chunk in _chunk_text(final_response, chunk_size=20):
            yield es.token(chunk)

        # Step 6: Save to memory
        memory.add_message(message, final_response)

        # Step 7: Done
        yield es.done(session_id, agent_chain)

    return create_sse_response(event_generator())


def _chunk_text(text: str, chunk_size: int = 20) -> list[str]:
    """Split text into chunks for streaming."""
    chunks = []
    for i in range(0, len(text), chunk_size):
        chunks.append(text[i:i + chunk_size])
    return chunks if chunks else [text]
