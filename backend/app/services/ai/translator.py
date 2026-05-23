def translate_text(text: str, target_language: str = "English") -> str:
    if target_language.lower() == "english":
        return text
    return f"[Translation to {target_language} requires an LLM prompt.]\n{text}"
