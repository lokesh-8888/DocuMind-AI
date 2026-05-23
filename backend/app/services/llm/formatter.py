from typing import Iterable

from app.models.document_models import Source


def format_sources(sources: Iterable[Source]) -> str:
    return "\n\n".join(f"{source.filename} page {source.page}: {source.text}" for source in sources)


def compact_answer(answer: str) -> str:
    return (answer or "").strip()
