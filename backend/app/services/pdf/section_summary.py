from typing import List

from app.models.document_models import Source


def summarize_sections(sources: List[Source]) -> List[str]:
    return [f"{source.filename} page {source.page}: {source.text[:240]}" for source in sources]
