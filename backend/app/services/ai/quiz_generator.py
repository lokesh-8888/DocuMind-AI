from typing import List, Optional

from app.models.document_models import QuizQuestion
from app.services.rag.pipeline import pipeline


def generate_quiz(document_ids: Optional[List[str]] = None, count: int = 5) -> List[QuizQuestion]:
    return pipeline.quiz(document_ids, count)
