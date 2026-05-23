from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.document_models import ChatMessage


class ChatRequest(BaseModel):
    question: str
    document_ids: Optional[List[str]] = None
    history: List[ChatMessage] = Field(default_factory=list)


class DocumentActionRequest(BaseModel):
    document_ids: Optional[List[str]] = None


class QuizRequest(DocumentActionRequest):
    count: int = 5
