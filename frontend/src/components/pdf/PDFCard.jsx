import { Eye, FileText, Trash2 } from "lucide-react";

export default function PDFCard({ document, selected, onToggle, onDelete, onView }) {
  return (
    <div className={`rounded-lg border bg-white p-3 ${selected ? "border-brand" : "border-line"}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={`mt-1 h-4 w-4 rounded border ${selected ? "border-brand bg-brand" : "border-slate-400"}`}
          aria-label="Select document"
        />
        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-coral" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{document.filename}</p>
          <p className="text-xs text-slate-500">
            {document.pages} pages / {document.chunks} chunks
            {document.scanned_pages ? ` / ${document.scanned_pages} OCR pages` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onView}
            className="rounded p-1 text-slate-400 hover:bg-teal-50 hover:text-brand"
            aria-label="View document"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete document"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
