import re
from pathlib import Path
from typing import Iterable


def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def safe_filename(filename: str) -> str:
    name = Path(filename or "document.pdf").name
    return re.sub(r"[^A-Za-z0-9._ -]", "_", name)


def join_context(passages: Iterable[str], limit: int = 6000) -> str:
    text = "\n\n".join(clean_text(passage) for passage in passages if passage)
    return text[:limit]
