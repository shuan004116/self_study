"""Knowledge summary API."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from backend.models.summary import SummaryRequest, SummaryResponse
from backend.agents.service.summary_agent import summary_agent_handler

router = APIRouter()


@router.post("/summary")
async def summarize_text(request: SummaryRequest):
    """Summarize a block of text."""
    try:
        response = await summary_agent_handler(
            text=request.text,
            subject=request.subject or "",
            max_ratio=request.max_ratio,
        )
        return {"summary": response, "subject": request.subject}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"总结失败: {str(e)}")


@router.post("/summary/upload")
async def summarize_file(
    file: UploadFile = File(...),
    subject: str = Form(default=""),
):
    """Upload a file and get a summary."""
    try:
        content = await file.read()
        text = content.decode("utf-8", errors="ignore")

        if len(text) < 100:
            raise HTTPException(status_code=400, detail="文件内容太短，需要至少100个字符")

        response = await summary_agent_handler(
            text=text,
            subject=subject,
        )
        return {"summary": response, "subject": subject, "filename": file.filename}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件总结失败: {str(e)}")
