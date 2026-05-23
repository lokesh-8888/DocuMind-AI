import { API_BASE, api } from "./api";

function normalizeDocument(document, index) {
  if (!document || typeof document !== "object") return null;
  const id = String(document.id || document.document_id || document.filename || `document-${index}`);
  return {
    ...document,
    id,
    filename: String(document.filename || document.name || "Untitled document"),
    pages: Number(document.pages || document.page_count || 0),
    chunks: Number(document.chunks || document.chunk_count || 0),
    scanned_pages: Number(document.scanned_pages || 0),
    file_type: String(document.file_type || "").toLowerCase(),
  };
}

function normalizeDocuments(data) {
  const documents = Array.isArray(data) ? data : Array.isArray(data?.documents) ? data.documents : [];
  return documents.map(normalizeDocument).filter(Boolean);
}

export async function uploadDocuments(files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("files", file));
  const { data } = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return normalizeDocuments(data);
}

export const uploadPdfs = uploadDocuments;

export async function fetchDocuments() {
  const { data } = await api.get("/documents", { params: { t: Date.now() } });
  return normalizeDocuments(data);
}

export async function deleteDocument(id) {
  await api.delete(`/documents/${id}`);
}

export async function fetchDocumentPreview(id) {
  const { data } = await api.get(`/documents/${id}/preview`, { params: { t: Date.now() } });
  return {
    ...data,
    pages: Array.isArray(data?.pages) ? data.pages : [],
  };
}

export function getDocumentFileUrl(id) {
  return `${API_BASE}/api/documents/${encodeURIComponent(id)}/file?t=${Date.now()}`;
}
