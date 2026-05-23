import { useEffect, useRef } from "react";

import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto bg-panel p-4">
      {messages.length === 0 ? (
        <div className="mx-auto mt-16 max-w-md text-center">
          <h2 className="text-xl font-semibold">Ask your documents anything</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Upload one or more documents, then ask for answers, summaries, or sources.
          </p>
        </div>
      ) : (
        messages.map((message) => <MessageBubble key={message.id} message={message} />)
      )}
      <div ref={bottomRef} />
    </div>
  );
}
