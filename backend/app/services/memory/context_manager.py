from typing import Iterable

from app.models.document_models import Source


def build_context(sources: Iterable[Source], max_chars: int = 6000) -> str:
    text = "\n\n".join(f"[{source.filename}, page {source.page}]\n{source.text}" for source in sources)
    return text[:max_chars]
