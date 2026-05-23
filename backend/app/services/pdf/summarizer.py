from typing import List, Optional, Tuple

from app.models.document_models import Source
from app.services.rag.pipeline import pipeline


def summarize_documents(document_ids: Optional[List[str]] = None) -> Tuple[str, List[Source]]:
    return pipeline.summarize(document_ids)
