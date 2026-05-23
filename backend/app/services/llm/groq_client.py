from typing import Iterable, List

from app.core.settings import get_settings
from app.models.document_models import ChatMessage, Source
from app.services.llm.prompts import ANSWER_PROMPT


class GroqClient:
    def __init__(self) -> None:
        settings = get_settings()
        self.model = settings.groq_model
        self._client = None
        if settings.groq_api_key:
            try:
                from groq import Groq

                self._client = Groq(api_key=settings.groq_api_key)
            except Exception:
                self._client = None

    def answer(self, question: str, sources: List[Source], history: Iterable[ChatMessage] = ()) -> str:
        context = self._format_context(sources)
        if not self._client:
            return self._fallback_answer(question, sources)

        messages = [{"role": "system", "content": ANSWER_PROMPT}]
        for message in list(history)[-8:]:
            if message.role in {"user", "assistant"}:
                messages.append({"role": message.role, "content": message.content})
        messages.append(
            {
                "role": "user",
                "content": f"Question: {question}\n\nDocument context:\n{context}",
            }
        )
        try:
            response = self._client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.2,
                max_tokens=900,
            )
            return response.choices[0].message.content.strip()
        except Exception:
            return self._fallback_answer(question, sources)

    def complete(self, instruction: str, sources: List[Source], max_tokens: int = 900) -> str:
        context = self._format_context(sources)
        if not self._client:
            return "\n\n".join(source.text for source in sources[:4])[:1800]
        try:
            response = self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Use the document context only."},
                    {"role": "user", "content": f"{instruction}\n\nDocument context:\n{context}"},
                ],
                temperature=0.3,
                max_tokens=max_tokens,
            )
            return response.choices[0].message.content.strip()
        except Exception:
            return "\n\n".join(source.text for source in sources[:4])[:1800]

    @staticmethod
    def _format_context(sources: List[Source]) -> str:
        return "\n\n".join(
            f"[{source.filename}, page {source.page}]\n{source.text}" for source in sources
        )

    @staticmethod
    def _fallback_answer(question: str, sources: List[Source]) -> str:
        if not sources:
            return "I could not find relevant text in the uploaded documents."
        lines = [f"Based on the closest document passages for '{question}':"]
        lines.extend(f"- {source.text[:450]} (page {source.page})" for source in sources[:3])
        return "\n".join(lines)
