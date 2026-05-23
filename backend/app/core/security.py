from fastapi import HTTPException, UploadFile

from app.core.settings import get_settings
from app.utils.constants import SUPPORTED_DOCUMENT_EXTENSIONS


def validate_document_upload(file: UploadFile) -> None:
    filename = file.filename or ""
    if not any(filename.lower().endswith(extension) for extension in SUPPORTED_DOCUMENT_EXTENSIONS):
        supported = ", ".join(sorted(SUPPORTED_DOCUMENT_EXTENSIONS))
        raise HTTPException(status_code=400, detail=f"{filename} is not supported. Upload one of: {supported}")


def validate_upload_size(size_bytes: int) -> None:
    max_bytes = get_settings().max_upload_mb * 1024 * 1024
    if size_bytes > max_bytes:
        raise HTTPException(status_code=413, detail=f"Document exceeds {get_settings().max_upload_mb} MB limit")
