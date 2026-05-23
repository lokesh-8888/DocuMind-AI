import SourceCitation from "../pdf/SourceCitation";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[86%] rounded-lg px-4 py-3 ${isUser ? "bg-brand text-white" : "border border-line bg-white text-ink"}`}>
        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
        {!!message.sources?.length && (
          <div className="mt-3 grid gap-2">
            {message.sources.slice(0, 3).map((source, index) => (
              <SourceCitation key={`${source.document_id}-${source.page}-${index}`} source={source} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
