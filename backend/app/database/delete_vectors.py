from app.services.rag.pipeline import pipeline


def delete_document_vectors(document_id: str) -> None:
    pipeline.store.delete_document(document_id)
