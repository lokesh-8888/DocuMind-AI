export default function KeyTopics({ topics }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(topics || []).map((topic) => (
        <span key={topic} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-medium">
          {topic}
        </span>
      ))}
      {!topics?.length && <p className="text-sm text-slate-500">No topics generated yet.</p>}
    </div>
  );
}
