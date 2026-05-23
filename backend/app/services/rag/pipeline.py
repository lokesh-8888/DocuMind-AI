import asyncio
import json
import re
import shutil
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from fastapi import UploadFile

from app.core.settings import get_settings
from app.models.document_models import ChatMessage, Document, Flashcard, PreviewPage, QuizQuestion, Source
from app.services.documents.document_loader import extract_document_text
from app.services.llm.groq_client import GroqClient
from app.services.llm.prompts import FLASHCARD_PROMPT, QUIZ_PROMPT, SUMMARY_PROMPT
from app.services.rag.chunking import TextChunk, chunk_pages
from app.services.rag.citation_handler import order_sources_for_answer
from app.services.rag.embeddings import EmbeddingService
from app.services.rag.pinecone_store import VectorStore
from app.utils.helpers import safe_filename


class RAGPipeline:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.embeddings = EmbeddingService()
        self.store = VectorStore(self.embeddings.dimension)
        self.llm = GroqClient()
        self.session_id = str(uuid.uuid4())
        self.documents: Dict[str, Document] = {}
        self.chunks: Dict[str, List[TextChunk]] = {}
        self.pages: Dict[str, List[PreviewPage]] = {}
        self.files: Dict[str, Path] = {}
        self.upload_dir = Path(__file__).resolve().parents[3] / "uploads" / self.session_id
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def ingest(self, files: List[UploadFile]) -> List[Document]:
        payloads = [(file.filename or "document", await file.read()) for file in files]
        return await asyncio.to_thread(self.ingest_bytes, payloads)

    def ingest_bytes(self, files: List[Tuple[str, bytes]]) -> List[Document]:
        docs: List[Document] = []
        for filename, content in files:
            document_id = str(uuid.uuid4())
            suffix = Path(filename).suffix or ".pdf"
            stored_path = self.upload_dir / f"{document_id}-{safe_filename(filename)}"
            stored_path.write_bytes(content)
            try:
                pages = extract_document_text(stored_path)
            except Exception:
                stored_path.unlink(missing_ok=True)
                raise

            chunks = chunk_pages(document_id, filename, pages, self.settings.chunk_size, self.settings.chunk_overlap)
            vectors = self.embeddings.embed(chunk.text for chunk in chunks)
            self.store.upsert(
                {
                    "id": chunk.id,
                    "values": vector,
                    "metadata": {
                        "document_id": chunk.document_id,
                        "filename": chunk.filename,
                        "page": chunk.page,
                        "text": chunk.text,
                        "session_id": self.session_id,
                    },
                }
                for chunk, vector in zip(chunks, vectors)
            )
            doc = Document(
                id=document_id,
                filename=filename,
                pages=len(pages),
                chunks=len(chunks),
                scanned_pages=sum(1 for page in pages if page.used_ocr),
                file_type=suffix.lstrip(".").lower(),
            )
            self.documents[document_id] = doc
            self.chunks[document_id] = chunks
            self.pages[document_id] = [PreviewPage(page=page.page, text=page.text) for page in pages]
            self.files[document_id] = stored_path
            docs.append(doc)
        return docs

    def ask(self, question: str, document_ids: Optional[List[str]], history: List[ChatMessage]) -> tuple[str, List[Source]]:
        sources = self.retrieve(question, document_ids)
        answer = self.llm.answer(question, sources, history)
        return answer, order_sources_for_answer(answer, sources)

    def retrieve(self, query: str, document_ids: Optional[List[str]] = None, top_k: Optional[int] = None) -> List[Source]:
        vector = self.embeddings.embed([query])[0]
        return self.store.query(vector, top_k or self.settings.top_k, document_ids, self.session_id)

    def all_sources(self, document_ids: Optional[List[str]] = None, limit: int = 10) -> List[Source]:
        ids = document_ids or list(self.documents)
        sources: List[Source] = []
        for doc_id in ids:
            sources.extend(
                Source(document_id=chunk.document_id, filename=chunk.filename, page=chunk.page, text=chunk.text, score=1.0)
                for chunk in self.chunks.get(doc_id, [])[:limit]
            )
        return sources[:limit]

    def summarize(self, document_ids: Optional[List[str]]) -> tuple[str, List[Source]]:
        sources = self.all_sources(document_ids, 12)
        summary = self.llm.complete(SUMMARY_PROMPT, sources, 900)
        return summary, sources[:5]

    def topics(self, document_ids: Optional[List[str]]) -> List[str]:
        text = " ".join(source.text for source in self.all_sources(document_ids, 20)).lower()
        words = re.findall(r"\b[a-z][a-z-]{4,}\b", text)
        stop = {"about", "which", "their", "there", "these", "those", "would", "could", "should", "where", "after", "before", "between"}
        counts: Dict[str, int] = {}
        for word in words:
            if word not in stop:
                counts[word] = counts.get(word, 0) + 1
        return [word.title() for word, _ in sorted(counts.items(), key=lambda item: item[1], reverse=True)[:12]]

    def quiz(self, document_ids: Optional[List[str]], count: int) -> List[QuizQuestion]:
        sources = self.all_sources(document_ids, 12)
        prompt = f"{QUIZ_PROMPT} Return JSON only as an array with question, options, answer. Make {count} questions."
        raw = self.llm.complete(prompt, sources, 1200)
        parsed = self._parse_json(raw, [])
        if isinstance(parsed, list) and parsed:
            return [QuizQuestion(**item) for item in parsed[:count] if {"question", "options", "answer"} <= set(item)]
        return [
            QuizQuestion(
                question=f"What is a key idea on page {source.page} of {source.filename}?",
                options=[source.text[:90], "Not discussed in the document", "A formatting instruction", "A file upload error"],
                answer=source.text[:90],
            )
            for source in sources[:count]
        ]

    def flashcards(self, document_ids: Optional[List[str]]) -> List[Flashcard]:
        sources = self.all_sources(document_ids, 12)
        prompt = f"{FLASHCARD_PROMPT} Return JSON only as an array with front and back. Make 8 cards."
        raw = self.llm.complete(prompt, sources, 1000)
        parsed = self._parse_json(raw, [])
        if isinstance(parsed, list) and parsed:
            return [Flashcard(**item) for item in parsed[:8] if {"front", "back"} <= set(item)]
        return [Flashcard(front=f"{source.filename} page {source.page}", back=source.text[:260]) for source in sources[:8]]

    def delete(self, document_id: str) -> None:
        self.documents.pop(document_id, None)
        self.chunks.pop(document_id, None)
        self.pages.pop(document_id, None)
        path = self.files.pop(document_id, None)
        if path:
            path.unlink(missing_ok=True)
        self.store.delete_document(document_id)

    def cleanup_session(self) -> None:
        for document_id in list(self.documents):
            self.documents.pop(document_id, None)
            self.chunks.pop(document_id, None)
            self.pages.pop(document_id, None)
            self.files.pop(document_id, None)
        self.store.delete_session(self.session_id)
        shutil.rmtree(self.upload_dir, ignore_errors=True)

    @staticmethod
    def _parse_json(raw: str, fallback):
        try:
            match = re.search(r"\[.*\]", raw, flags=re.S)
            return json.loads(match.group(0) if match else raw)
        except Exception:
            return fallback


pipeline = RAGPipeline()
