export default function ChatHistory({ messages = [], onSelect = () => {} }) {
  const userMessages = messages.filter((message) => message.role === "user");
  return (
    <div className="grid gap-2">
      {userMessages.map((message) => (
        <button
          key={message.id}
          type="button"
          onClick={() => onSelect(message)}
          className="truncate rounded-md border border-line bg-white px-3 py-2 text-left text-xs hover:border-brand"
        >
          {message.content}
        </button>
      ))}
      {!userMessages.length && <p className="text-xs text-slate-500">No chat history yet.</p>}
    </div>
  );
}
