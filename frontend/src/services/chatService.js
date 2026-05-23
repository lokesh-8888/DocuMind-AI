import { api, WS_BASE } from "./api";

export async function askQuestion(payload) {
  const { data } = await api.post("/chat", payload);
  return data;
}

export function streamQuestion(payload, handlers) {
  const ws = new WebSocket(`${WS_BASE}/ws/chat`);
  let completed = false;
  ws.onopen = () => ws.send(JSON.stringify(payload));
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "token") handlers.onToken?.(message.value);
    if (message.type === "done") {
      completed = true;
      handlers.onDone?.(message.sources || []);
      ws.close();
    }
    if (message.type === "error") {
      completed = true;
      handlers.onError?.(new Error(message.value || "WebSocket request failed"));
      ws.close();
    }
  };
  ws.onerror = (error) => {
    if (!completed) handlers.onError?.(error);
  };
  ws.onclose = () => {
    if (!completed) handlers.onError?.(new Error("WebSocket closed before completing"));
  };
  return ws;
}
