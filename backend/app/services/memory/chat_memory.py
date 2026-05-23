from collections import defaultdict
from typing import DefaultDict, List

from app.models.document_models import ChatMessage


class ChatMemory:
    def __init__(self) -> None:
        self._messages: DefaultDict[str, List[ChatMessage]] = defaultdict(list)

    def add(self, session_id: str, role: str, content: str) -> None:
        self._messages[session_id].append(ChatMessage(role=role, content=content))

    def get(self, session_id: str, limit: int = 8) -> List[ChatMessage]:
        return self._messages[session_id][-limit:]

    def clear(self, session_id: str) -> None:
        self._messages.pop(session_id, None)


memory = ChatMemory()
