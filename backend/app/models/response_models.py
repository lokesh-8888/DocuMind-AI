from typing import List

from pydantic import BaseModel

from app.models.document_models import Document, Flashcard, PreviewPage, QuizQuestion, Source


class UploadResponse(BaseModel):
    documents: List[Document]


class ChatResponse(BaseModel):
    answer: str
    sources: List[Source]


class DocumentsResponse(BaseModel):
    documents: List[Document]


class DocumentPreviewResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    pages: List[PreviewPage]


class SummaryResponse(BaseModel):
    summary: str
    sources: List[Source] = []


class QuizResponse(BaseModel):
    questions: List[QuizQuestion]


class FlashcardsResponse(BaseModel):
    cards: List[Flashcard]


class TopicsResponse(BaseModel):
    topics: List[str]
