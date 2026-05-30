#!/bin/bash
# Download required Ollama models
# Run this script after installing Ollama

echo "Pulling Qwen2.5-14B chat model..."
ollama pull qwen2.5:14b

echo "Pulling BGE-M3 embedding model..."
ollama pull bge-m3:latest

echo "Models downloaded successfully!"
echo ""
echo "Available models:"
ollama list
