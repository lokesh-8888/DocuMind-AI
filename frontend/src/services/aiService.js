import { api } from "./api";

export async function getSummary(documentIds) {
  const { data } = await api.post("/summary", { document_ids: documentIds });
  return data;
}

export async function getTopics(documentIds) {
  const { data } = await api.post("/topics", { document_ids: documentIds });
  return data.topics;
}

export async function getQuiz(documentIds, count = 5) {
  const { data } = await api.post("/quiz", { document_ids: documentIds, count });
  return data.questions;
}

export async function getFlashcards(documentIds) {
  const { data } = await api.post("/flashcards", { document_ids: documentIds });
  return data.cards;
}
