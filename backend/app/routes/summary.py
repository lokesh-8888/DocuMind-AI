from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool

from app.models.request_models import DocumentActionRequest
from app.models.response_models import SummaryResponse
from app.services.rag.pipeline import pipeline

router = APIRouter(prefix="/summary", tags=["summary"])


@router.post("", response_model=SummaryResponse)
async def summarize(request: DocumentActionRequest) -> SummaryResponse:
    summary, sources = await run_in_threadpool(pipeline.summarize, request.document_ids)
    return SummaryResponse(summary=summary, sources=sources)
