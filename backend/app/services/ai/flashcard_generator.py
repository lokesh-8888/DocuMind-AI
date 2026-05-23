from typing import List, Optional

from app.models.document_models import Flashcard
from app.services.rag.pipeline import pipeline


def generate_flashcards(document_ids: Optional[List[str]] = None) -> List[Flashcard]:
    return pipeline.flashcards(document_ids)
