import mimetypes

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.models.response_models import DocumentPreviewResponse, DocumentsResponse
from app.services.rag.pipeline import pipeline

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=DocumentsResponse)
async def list_documents() -> DocumentsResponse:
    return DocumentsResponse(documents=list(pipeline.documents.values()))


@router.get("/{document_id}/preview", response_model=DocumentPreviewResponse)
async def preview_document(document_id: str) -> DocumentPreviewResponse:
    document = pipeline.documents.get(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentPreviewResponse(
        id=document.id,
        filename=document.filename,
        file_type=document.file_type,
        pages=pipeline.pages.get(document_id, []),
    )


@router.get("/{document_id}/file")
async def view_document_file(document_id: str) -> FileResponse:
    document = pipeline.documents.get(document_id)
    path = pipeline.files.get(document_id)
    if not document or not path or not path.exists():
        raise HTTPException(status_code=404, detail="Document file not found")

    media_type, _ = mimetypes.guess_type(document.filename)
    return FileResponse(
        path,
        media_type=media_type or "application/octet-stream",
        filename=document.filename,
        content_disposition_type="inline",
    )


@router.delete("/{document_id}")
async def delete_document(document_id: str) -> dict:
    if document_id not in pipeline.documents:
        raise HTTPException(status_code=404, detail="Document not found")
    pipeline.delete(document_id)
    return {"ok": True}
