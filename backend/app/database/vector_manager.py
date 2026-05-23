from app.services.rag.pipeline import pipeline


def list_documents():
    return list(pipeline.documents.values())


def delete_document(document_id: str) -> None:
    pipeline.delete(document_id)


def cleanup_session() -> None:
    pipeline.cleanup_session()
