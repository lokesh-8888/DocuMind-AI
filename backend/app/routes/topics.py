from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool

from app.models.request_models import DocumentActionRequest
from app.models.response_models import TopicsResponse
from app.services.rag.pipeline import pipeline

router = APIRouter(prefix="/topics", tags=["topics"])


@router.post("", response_model=TopicsResponse)
async def topics(request: DocumentActionRequest) -> TopicsResponse:
    topic_items = await run_in_threadpool(pipeline.topics, request.document_ids)
    return TopicsResponse(topics=topic_items)
