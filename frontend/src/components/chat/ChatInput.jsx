import { SendHorizontal } from "lucide-react";
import { useState } from "react";

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");

  function submit(event) {
    event.preventDefault();
    const question = value.trim();
    if (!question || disabled) return;
    setValue("");
    onSend(question);
  }

  return (
    <form onSubmit={submit} className="flex gap-2 border-t border-line bg-white p-3">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) submit(event);
        }}
        rows={1}
        disabled={disabled}
        placeholder="Ask about the selected documents..."
        className="max-h-32 min-h-11 flex-1 resize-none rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="grid h-11 w-11 place-items-center rounded-md bg-brand text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        aria-label="Send"
        title="Send"
      >
        <SendHorizontal className="h-5 w-5" />
      </button>
    </form>
  );
}
