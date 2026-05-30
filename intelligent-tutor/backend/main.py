"""FastAPI application entry point for the Intelligent Tutor."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.config import settings, load_llm_config
from backend.api import chat, exercise, plan, summary, code, knowledge, settings as settings_api
from backend.graph.nodes import register_all_agents

FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: startup and shutdown."""
    # Startup
    register_all_agents()
    # Ensure directories exist
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.chroma_db_path).mkdir(parents=True, exist_ok=True)
    # Load saved LLM config
    load_llm_config()

    yield

    # Shutdown (cleanup if needed)


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="全学科智能学习多 Agent 助手",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(chat.router, prefix="/api", tags=["聊天"])
app.include_router(exercise.router, prefix="/api", tags=["出题"])
app.include_router(plan.router, prefix="/api", tags=["学习规划"])
app.include_router(summary.router, prefix="/api", tags=["知识总结"])
app.include_router(code.router, prefix="/api", tags=["代码辅导"])
app.include_router(knowledge.router, prefix="/api", tags=["知识库管理"])
app.include_router(settings_api.router, prefix="/api", tags=["系统设置"])


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    from backend.config import load_llm_config
    config = load_llm_config()
    return {
        "status": "ok",
        "app": settings.app_name,
        "version": settings.app_version,
        "llm_configured": config.is_configured,
        "llm_provider": config.provider,
    }


@app.get("/api/config")
async def get_config():
    """Get public configuration (no secrets)."""
    return {
        "llm_provider": settings.llm_provider,
        "max_message_length": 10000,
    }


# Serve frontend static files (if built)
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve the Vue frontend SPA for all non-API routes."""
        if full_path.startswith("api/"):
            from fastapi.responses import JSONResponse
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        index_path = FRONTEND_DIST / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        return JSONResponse({"detail": "Frontend not built"}, status_code=404)
