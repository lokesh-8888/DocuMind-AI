import SourceCitation from "./SourceCitation";

export default function PDFViewer({ sources = [] }) {
  return (
    <div className="grid gap-2">
      {sources.map((source, index) => (
        <SourceCitation key={`${source.document_id}-${source.page}-${index}`} source={source} />
      ))}
      {!sources.length && <p className="text-sm text-slate-500">Sources will appear after an answer is generated.</p>}
    </div>
  );
}
