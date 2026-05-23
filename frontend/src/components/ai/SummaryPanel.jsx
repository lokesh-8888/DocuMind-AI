export default function SummaryPanel({ summary }) {
  return <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{summary || "No summary generated yet."}</p>;
}
