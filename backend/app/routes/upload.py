from typing import List

from fastapi import APIRouter, File, UploadFile

from app.core.security import validate_document_upload, validate_upload_size
from app.models.response_models import UploadResponse
from app.services.rag.pipeline import pipeline

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("", response_model=UploadResponse)
async def upload_documents(files: List[UploadFile] = File(...)) -> UploadResponse:
    for file in files:
        validate_document_upload(file)
        if getattr(file, "size", None):
            validate_upload_size(file.size)
    documents = await pipeline.ingest(files)
    return UploadResponse(documents=documents)
