import asyncio
import json

from fastapi.concurrency import run_in_threadpool
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.models.request_models import ChatRequest
from app.models.response_models import ChatResponse
from app.services.rag.pipeline import pipeline

router = APIRouter(prefix="/chat", tags=["chat"])
ws_router = APIRouter(tags=["websocket"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    answer, sources = await run_in_threadpool(pipeline.ask, request.question, request.document_ids, request.history)
    return ChatResponse(answer=answer, sources=sources)


@ws_router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        while True:
            payload = await websocket.receive_json()
            request = ChatRequest(**payload)
            answer, sources = await run_in_threadpool(pipeline.ask, request.question, request.document_ids, request.history)
            for token in answer.split(" "):
                await websocket.send_json({"type": "token", "value": token + " "})
                await asyncio.sleep(0.015)
            await websocket.send_json({"type": "done", "sources": [json.loads(source.model_dump_json()) for source in sources]})
    except WebSocketDisconnect:
        return
    except Exception as exc:
        await websocket.send_json({"type": "error", "value": str(exc)})
