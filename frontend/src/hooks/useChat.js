import { useState } from "react";

import { askQuestion, streamQuestion } from "../services/chatService";

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function send(question, documentIds = []) {
    const history = messages.map(({ role, content }) => ({ role, content }));
    const userMessage = { id: crypto.randomUUID(), role: "user", content: question };
    const assistantId = crypto.randomUUID();
    setMessages((current) => [...current, userMessage, { id: assistantId, role: "assistant", content: "", sources: [] }]);
    setLoading(true);

    const payload = { question, document_ids: documentIds, history };
    streamQuestion(payload, {
      onToken: (token) => setMessages((current) => current.map((msg) => (msg.id === assistantId ? { ...msg, content: msg.content + token } : msg))),
      onDone: (sources) => {
        setMessages((current) => current.map((msg) => (msg.id === assistantId ? { ...msg, sources } : msg)));
        setLoading(false);
      },
      onError: async () => {
        const response = await askQuestion(payload);
        setMessages((current) => current.map((msg) => (msg.id === assistantId ? { ...msg, content: response.answer, sources: response.sources } : msg)));
        setLoading(false);
      },
    });
  }

  return { messages, setMessages, loading, send };
}
