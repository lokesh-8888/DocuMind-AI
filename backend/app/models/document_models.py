from typing import List, Optional

from pydantic import BaseModel


class Source(BaseModel):
    document_id: str
    filename: str
    page: int
    text: str
    score: float = 0.0


class PreviewPage(BaseModel):
    page: int
    text: str


class Document(BaseModel):
    id: str
    filename: str
    pages: int
    chunks: int
    scanned_pages: int = 0
    file_type: str = "pdf"
    summary: Optional[str] = None


class ChatMessage(BaseModel):
    role: str
    content: str


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answer: str


class Flashcard(BaseModel):
    front: str
    back: str
