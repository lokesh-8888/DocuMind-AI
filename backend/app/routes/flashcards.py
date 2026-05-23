from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool

from app.models.request_models import DocumentActionRequest
from app.models.response_models import FlashcardsResponse
from app.services.rag.pipeline import pipeline

router = APIRouter(prefix="/flashcards", tags=["flashcards"])


@router.post("", response_model=FlashcardsResponse)
async def create_flashcards(request: DocumentActionRequest) -> FlashcardsResponse:
    cards = await run_in_threadpool(pipeline.flashcards, request.document_ids)
    return FlashcardsResponse(cards=cards)
