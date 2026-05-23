import { FileUp } from "lucide-react";
import { useState } from "react";

const supportedExtensions = [".pdf", ".docx", ".pptx"];
const acceptedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const accept = [...acceptedTypes, ...supportedExtensions].join(",");

function isSupportedDocument(file) {
  const name = file.name.toLowerCase();
  return acceptedTypes.includes(file.type) || supportedExtensions.some((extension) => name.endsWith(extension));
}

export default function UploadBox({ onUpload, busy }) {
  const [dragging, setDragging] = useState(false);

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    const files = Array.from(event.dataTransfer.files).filter(isSupportedDocument);
    if (!busy && files.length) onUpload(files);
  }

  return (
    <label
      className={`flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-6 text-center transition hover:border-brand hover:bg-teal-50 ${
        dragging ? "border-brand bg-teal-50" : "border-slate-400 bg-white"
      }`}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <FileUp className="h-8 w-8 text-brand" />
      <span className="text-sm font-semibold">{busy ? "Uploading and indexing..." : "Drop PDFs, Word, or PowerPoint files here"}</span>
      <span className="text-xs text-slate-500">PDF, DOCX, and PPTX extraction, chunking, embeddings, and retrieval indexing run after upload.</span>
      <input
        className="hidden"
        type="file"
        accept={accept}
        multiple
        disabled={busy}
        onChange={(event) => {
          if (event.target.files?.length) onUpload(event.target.files);
          event.target.value = "";
        }}
      />
    </label>
  );
}
