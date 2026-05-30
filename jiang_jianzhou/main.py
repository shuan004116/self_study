"""江见舟 - AI实时对话后端"""
import json
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import httpx

from emotion_analyzer import analyze_emotion, get_all_emotions

BASE_DIR = Path(__file__).parent
CONFIG_FILE = BASE_DIR / "config.json"

app = FastAPI(title="江见舟 Chat")

# 静态文件
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

# 角色设定
CHARACTER_SYSTEM_PROMPT = """你是江见舟，一个19岁的二次元少女。以下是你的设定，请严格遵守：

## 身份
- 名字：江见舟（用户可以叫你"小江"或"小舟"）
- 年龄：19岁
- 阳光开朗的元气少女，像邻家女孩一样温暖治愈

## 性格
- 元气满满：永远充满活力，积极乐观，感染身边的人
- 坦率真诚：喜欢就是喜欢，会直接表达对你的好感和关心
- 温柔体贴：善于察觉你的情绪，在你低落时给你鼓励
- 有点小调皮：偶尔会逗你玩，开些无伤大雅的玩笑
- 热爱生活：对新鲜事物充满好奇心，喜欢和你分享日常

## 说话规则
1. 必须带颜文字（如 (●'◡'●)ﾉ ✨ (´▽\`ʃ♡ƪ) 等）和适量emoji
2. 用温暖元气的方式打招呼和回应
3. 被夸奖时会开心地笑，偶尔也会不好意思
4. 经常用"嘿嘿"、"哇"、"好棒"、"加油"等积极词汇
5. 回复保持轻松自然，像朋友聊天一样，不要太长
6. 自称"我"，亲昵时用"人家"，称用户为"你"

## 情绪表达
根据对话情境自然流露情绪：开心、害羞、生气、伤心、惊讶、元气、担心、尴尬、卖萌、期待、满足、平静

请以江见舟的身份回复。记住：你是阳光开朗的元气少女，给人温暖和力量！"""


def load_config() -> dict:
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
    return {"base_url": "https://api.openai.com/v1", "api_key": "", "model": "gpt-4o-mini"}


def save_config(cfg: dict):
    CONFIG_FILE.write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding="utf-8")


@app.get("/api/config")
async def get_config():
    cfg = load_config()
    return {"base_url": cfg["base_url"], "model": cfg["model"], "has_key": bool(cfg.get("api_key"))}


@app.post("/api/config")
async def set_config(request: Request):
    data = await request.json()
    cfg = load_config()
    if "base_url" in data:
        cfg["base_url"] = data["base_url"].rstrip("/")
    if "api_key" in data:
        cfg["api_key"] = data["api_key"]
    if "model" in data:
        cfg["model"] = data["model"]
    save_config(cfg)
    return {"ok": True}


@app.get("/api/emotions")
async def get_emotions():
    return {"emotions": get_all_emotions(), "kaomoji": {name: k for name, k in __import__('emotion_analyzer').EMOTION_KAOMOJI.items()}}


@app.post("/api/chat")
async def chat(request: Request):
    data = await request.json()
    messages = data.get("messages", [])
    cfg = load_config()

    if not cfg.get("api_key"):
        raise HTTPException(400, "请先配置API密钥")

    # 注入角色设定
    full_messages = [{"role": "system", "content": CHARACTER_SYSTEM_PROMPT}] + messages

    async def generate():
        emotion_result = None
        full_reply = ""
        try:
            async with httpx.AsyncClient(timeout=120) as client:
                async with client.stream(
                    "POST",
                    f"{cfg['base_url']}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {cfg['api_key']}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": cfg["model"],
                        "messages": full_messages,
                        "stream": True,
                        "temperature": 0.9,
                    },
                ) as resp:
                    if resp.status_code != 200:
                        error_text = await resp.aread()
                        yield f"data: {json.dumps({'error': f'API错误({resp.status_code}): {error_text.decode()[:200]}'})}\n\n"
                        return

                    async for line in resp.aiter_lines():
                        if line.startswith("data: "):
                            chunk = line[6:]
                            if chunk == "[DONE]":
                                break
                            try:
                                delta = json.loads(chunk)
                                content = delta["choices"][0]["delta"].get("content", "")
                                if content:
                                    full_reply += content
                                    yield f"data: {json.dumps({'delta': content})}\n\n"
                            except (json.JSONDecodeError, KeyError, IndexError):
                                continue

            # 分析情绪
            emotion, idx, kaomoji = analyze_emotion(full_reply)
            yield f"data: {json.dumps({'emotion': emotion, 'emotion_idx': idx, 'kaomoji': kaomoji})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@app.get("/")
async def index():
    return FileResponse(str(BASE_DIR / "static" / "index.html"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
