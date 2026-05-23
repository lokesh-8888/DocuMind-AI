from app.models.document_models import Source


def highlight_excerpt(source: Source, query: str) -> dict:
    return {
        "document_id": source.document_id,
        "filename": source.filename,
        "page": source.page,
        "query": query,
        "excerpt": source.text,
    }
