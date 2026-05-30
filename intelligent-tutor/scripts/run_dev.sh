#!/bin/bash
# Development startup script for Intelligent Tutor

echo "=== 智能学习助手 - 开发环境启动 ==="
echo ""

# Check if Ollama is running
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✓ Ollama 服务运行中"
else
    echo "! Ollama 未运行，请执行: ollama serve"
fi

# Check if models are available
echo "检查模型..."
OLLAMA_MODELS=$(curl -s http://localhost:11434/api/tags 2>/dev/null)
if echo "$OLLAMA_MODELS" | grep -q "qwen2.5"; then
    echo "✓ Qwen2.5 模型已就绪"
else
    echo "! Qwen2.5 模型未下载，执行: ollama pull qwen2.5:14b"
fi
if echo "$OLLAMA_MODELS" | grep -q "bge-m3"; then
    echo "✓ BGE-M3 模型已就绪"
else
    echo "! BGE-M3 模型未下载，执行: ollama pull bge-m3:latest"
fi

echo ""
echo "启动服务..."
echo "后端: http://localhost:8000"
echo "前端: http://localhost:5173"
echo "API文档: http://localhost:8000/docs"
echo ""

# Start backend
echo "启动后端 (FastAPI)..."
cd "$(dirname "$0")/.."
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend if available
if [ -d "frontend" ]; then
    echo "启动前端 (Vue 3)..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
fi

echo ""
echo "按 Ctrl+C 停止所有服务"

# Trap Ctrl+C and clean up
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
