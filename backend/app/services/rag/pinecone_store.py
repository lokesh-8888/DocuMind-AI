from typing import Dict, Iterable, List, Optional

import numpy as np

from app.core.settings import get_settings
from app.models.document_models import Source


class VectorStore:
    def __init__(self, dimension: int) -> None:
        self.dimension = dimension
        self._pinecone_index = None
        self._local: Dict[str, dict] = {}
        settings = get_settings()
        if settings.pinecone_api_key:
            try:
                from pinecone import Pinecone, ServerlessSpec

                pc = Pinecone(api_key=settings.pinecone_api_key)
                names = [index["name"] for index in pc.list_indexes()]
                if settings.pinecone_index not in names:
                    pc.create_index(
                        name=settings.pinecone_index,
                        dimension=dimension,
                        metric="cosine",
                        spec=ServerlessSpec(cloud=settings.pinecone_cloud, region=settings.pinecone_region),
                    )
                self._pinecone_index = pc.Index(settings.pinecone_index)
            except Exception:
                self._pinecone_index = None

    def upsert(self, vectors: Iterable[dict]) -> None:
        items = list(vectors)
        if self._pinecone_index:
            try:
                self._pinecone_index.upsert(
                    vectors=[(item["id"], item["values"], item["metadata"]) for item in items]
                )
                return
            except Exception:
                self._pinecone_index = None
        for item in items:
            self._local[item["id"]] = item

    def query(self, vector: List[float], top_k: int, document_ids: Optional[List[str]] = None, session_id: Optional[str] = None) -> List[Source]:
        if self._pinecone_index:
            filters = {}
            if session_id:
                filters["session_id"] = {"$eq": session_id}
            if document_ids:
                filters["document_id"] = {"$in": document_ids}
            try:
                result = self._pinecone_index.query(
                    vector=vector,
                    top_k=top_k,
                    include_metadata=True,
                    filter=filters or None,
                )
                matches = result.get("matches", [])
                return [self._source(match.get("metadata", {}), match.get("score", 0.0)) for match in matches]
            except Exception:
                self._pinecone_index = None

        query_vec = np.array(vector)
        results = []
        allowed = set(document_ids or [])
        for item in self._local.values():
            meta = item["metadata"]
            if session_id and meta.get("session_id") != session_id:
                continue
            if allowed and meta["document_id"] not in allowed:
                continue
            values = np.array(item["values"])
            denom = np.linalg.norm(query_vec) * np.linalg.norm(values)
            score = float(np.dot(query_vec, values) / denom) if denom else 0.0
            results.append(self._source(meta, score))
        results.sort(key=lambda source: source.score, reverse=True)
        return results[:top_k]

    def delete_document(self, document_id: str) -> None:
        if self._pinecone_index:
            try:
                self._pinecone_index.delete(filter={"document_id": {"$eq": document_id}})
                return
            except Exception:
                self._pinecone_index = None
        for key in [key for key, value in self._local.items() if value["metadata"]["document_id"] == document_id]:
            del self._local[key]

    def delete_session(self, session_id: str) -> None:
        if self._pinecone_index:
            try:
                self._pinecone_index.delete(filter={"session_id": {"$eq": session_id}})
                return
            except Exception:
                self._pinecone_index = None
        for key in [key for key, value in self._local.items() if value["metadata"].get("session_id") == session_id]:
            del self._local[key]

    def clear_local(self) -> None:
        self._local.clear()

    @staticmethod
    def _source(meta: dict, score: float) -> Source:
        return Source(
            document_id=meta["document_id"],
            filename=meta["filename"],
            page=int(meta["page"]),
            text=meta["text"],
            score=score,
        )
