from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool

from app.models.request_models import QuizRequest
from app.models.response_models import QuizResponse
from app.services.rag.pipeline import pipeline

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post("", response_model=QuizResponse)
async def create_quiz(request: QuizRequest) -> QuizResponse:
    questions = await run_in_threadpool(pipeline.quiz, request.document_ids, request.count)
    return QuizResponse(questions=questions)
