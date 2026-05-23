import hashlib
from typing import Iterable, List

import numpy as np

from app.core.settings import get_settings


class EmbeddingService:
    def __init__(self) -> None:
        self._model = None
        self._model_checked = False
        self.dimension = 384
        self.backend = get_settings().embedding_backend

    def _load_model(self) -> None:
        if self._model_checked or self.backend == "hash":
            self._model_checked = True
            return
        self._model_checked = True
        try:
            from fastembed import TextEmbedding

            self._model = TextEmbedding(model_name=get_settings().embedding_model)
        except Exception:
            self._model = None

    def embed(self, texts: Iterable[str]) -> List[List[float]]:
        items = list(texts)
        self._load_model()
        if self._model:
            vectors = list(self._model.embed(items))
            if vectors:
                self.dimension = len(vectors[0])
            return [vector.astype(float).tolist() for vector in vectors]
        return [self._hash_embedding(text) for text in items]

    def _hash_embedding(self, text: str) -> List[float]:
        vector = np.zeros(self.dimension, dtype=np.float32)
        for token in text.lower().split():
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            idx = int.from_bytes(digest[:4], "little") % self.dimension
            vector[idx] += 1.0
        norm = np.linalg.norm(vector)
        if norm:
            vector = vector / norm
        return vector.tolist()
