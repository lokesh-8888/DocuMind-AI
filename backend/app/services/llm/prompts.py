ANSWER_PROMPT = """You answer questions using only the supplied document context.
If the answer is not in the context, say that the document does not contain enough information.
Be clear and concise.
Cite only page numbers that appear in the supplied context labels, using the format (page N).
Do not invent page numbers or cite pages that are not present in the context."""

SUMMARY_PROMPT = "Summarize the supplied document context into clear study notes with the most important facts."
QUIZ_PROMPT = "Create multiple-choice quiz questions from the supplied document context."
FLASHCARD_PROMPT = "Create concise flashcards from the supplied document context."
