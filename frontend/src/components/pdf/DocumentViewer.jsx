import { ExternalLink, X } from "lucide-react";

export default function DocumentViewer({ document, preview, fileUrl, loading, error, onClose }) {
  if (!document) return null;

  const fileType = (preview?.file_type || document.file_type || "").toLowerCase();
  const isPdf = fileType === "pdf" || document.filename?.toLowerCase().endsWith(".pdf");
  const pageLabel = fileType === "pptx" ? "Slide" : "Page";
  const pages = preview?.pages || [];

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950/60 p-4 max-sm:p-0" role="dialog" aria-modal="true">
      <section className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl max-sm:rounded-none">
        <header className="flex min-h-14 items-center justify-between gap-3 border-b border-line px-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{document.filename}</p>
            <p className="text-xs uppercase text-slate-500">{fileType || "document"}</p>
          </div>
          <div className="flex items-center gap-2">
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-md border border-line text-slate-600 hover:border-brand hover:text-brand"
                aria-label="Open original document"
                title="Open original"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-md border border-line text-slate-600 hover:border-red-200 hover:text-red-600"
              aria-label="Close viewer"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 bg-panel">
          {loading ? (
            <div className="grid h-full place-items-center text-sm text-slate-500">Loading preview...</div>
          ) : error ? (
            <div className="grid h-full place-items-center p-6 text-center text-sm text-red-600">{error}</div>
          ) : isPdf && fileUrl ? (
            <iframe title={document.filename} src={fileUrl} className="h-full w-full border-0 bg-white" />
          ) : (
            <div className="h-full overflow-y-auto p-4">
              <div className="mx-auto grid max-w-4xl gap-3">
                {pages.map((page) => (
                  <article key={page.page} className="rounded-lg border border-line bg-white p-4">
                    <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                      {pageLabel} {page.page}
                    </p>
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-slate-800">{page.text}</pre>
                  </article>
                ))}
                {!pages.length && <p className="rounded-lg border border-line bg-white p-4 text-sm text-slate-500">No preview text available.</p>}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
