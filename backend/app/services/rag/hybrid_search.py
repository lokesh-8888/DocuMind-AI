from typing import List, Optional

from app.models.document_models import Source
from app.services.rag.pipeline import pipeline
from app.services.rag.reranker import rerank


def hybrid_search(query: str, document_ids: Optional[List[str]] = None, top_k: int = 5) -> List[Source]:
    return rerank(query, pipeline.retrieve(query, document_ids, top_k))
