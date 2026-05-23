from typing import List, Optional

from app.services.rag.pipeline import pipeline


def extract_keywords(document_ids: Optional[List[str]] = None) -> List[str]:
    return pipeline.topics(document_ids)
