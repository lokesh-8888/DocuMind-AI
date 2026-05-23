from typing import List

from app.models.document_models import Source


def rerank(query: str, sources: List[Source]) -> List[Source]:
    terms = {term.lower() for term in query.split() if len(term) > 2}
    return sorted(
        sources,
        key=lambda source: (sum(term in source.text.lower() for term in terms), source.score),
        reverse=True,
    )
