"""Knowledge base management API."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Body
from pathlib import Path

from backend.config import settings

router = APIRouter()


@router.post("/knowledge/upload")
async def upload_knowledge(
    file: UploadFile = File(...),
    subject: str = Form(...),
    source: str = Form(default=""),
):
    """Upload a document to the knowledge base."""
    valid_subjects = ["数学", "计算机", "物理", "人文"]
    if subject not in valid_subjects:
        raise HTTPException(status_code=400, detail=f"学科必须是: {', '.join(valid_subjects)}")

    try:
        content = await file.read()
        text = content.decode("utf-8", errors="ignore")

        if len(text) < 50:
            raise HTTPException(status_code=400, detail="文档内容太短")

        from backend.rag.chunking import ChineseTextChunker
        chunker = ChineseTextChunker()
        chunks = chunker.split_with_metadata(text, {
            "subject": subject,
            "source": source or file.filename or "unknown",
        })

        from backend.rag.vector_store import VectorStore
        store = VectorStore()
        store.add_documents(
            subject=subject,
            texts=[c["text"] for c in chunks],
            metadatas=[c["metadata"] for c in chunks],
        )

        return {
            "message": f"成功导入 {len(chunks)} 个知识片段",
            "subject": subject,
            "chunks": len(chunks),
            "filename": file.filename,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导入知识库失败: {str(e)}")


@router.get("/knowledge/status")
async def knowledge_status():
    """Get knowledge base status."""
    try:
        from backend.rag.vector_store import VectorStore
        store = VectorStore()
        subjects = ["数学", "计算机", "物理", "人文"]
        status = {}
        for subject in subjects:
            try:
                collection = store.get_or_create_collection(subject)
                count = collection.count()
                status[subject] = {"count": count}
            except Exception:
                status[subject] = {"count": 0, "error": "无法访问"}

        return {"knowledge_base": status}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取知识库状态失败: {str(e)}")
