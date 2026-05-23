from dataclasses import dataclass
from typing import Iterable, List


@dataclass
class TextChunk:
    id: str
    document_id: str
    filename: str
    page: int
    text: str


def chunk_pages(document_id: str, filename: str, pages: Iterable, size: int, overlap: int) -> List[TextChunk]:
    chunks: List[TextChunk] = []
    step = max(size - overlap, 1)
    for page in pages:
        text = " ".join(page.text.split())
        if not text:
            continue
        start = 0
        part = 0
        while start < len(text):
            body = text[start : start + size].strip()
            if body:
                chunks.append(
                    TextChunk(
                        id=f"{document_id}-p{page.page}-{part}",
                        document_id=document_id,
                        filename=filename,
                        page=page.page,
                        text=body,
                    )
                )
            start += step
            part += 1
    return chunks
