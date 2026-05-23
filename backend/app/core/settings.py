from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DocuMind AI"
    api_prefix: str = "/api"
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"

    pinecone_api_key: str = ""
    pinecone_index: str = "documind-ai"
    pinecone_cloud: str = "aws"
    pinecone_region: str = "us-east-1"

    embedding_model: str = "BAAI/bge-small-en-v1.5"
    embedding_backend: str = "auto"
    chunk_size: int = 950
    chunk_overlap: int = 160
    top_k: int = 5
    max_upload_mb: int = Field(default=25, ge=1)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
