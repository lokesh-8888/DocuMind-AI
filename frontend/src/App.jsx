import { BookOpen, MessageSquareText, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import SummaryPanel from "./components/ai/SummaryPanel";
import ChatInput from "./components/chat/ChatInput";
import ChatWindow from "./components/chat/ChatWindow";
import DocumentViewer from "./components/pdf/DocumentViewer";
import PDFCard from "./components/pdf/PDFCard";
import UploadBox from "./components/pdf/UploadBox";
import { getApiErrorMessage } from "./services/api";
import { getSummary } from "./services/aiService";
import { askQuestion, streamQuestion } from "./services/chatService";
import { deleteDocument, fetchDocumentPreview, fetchDocuments, getDocumentFileUrl, uploadDocuments } from "./services/pdfService";

const tabs = [
  { id: "summary", label: "Summary", icon: BookOpen },
];

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState([]);
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [study, setStudy] = useState({ summary: "" });
  const [viewer, setViewer] = useState({ document: null, preview: null, fileUrl: "", loading: false, error: "" });

  const selectedIds = useMemo(() => selected.filter((id) => documents.some((doc) => doc.id === id)), [selected, documents]);
  const availableDocumentIds = useMemo(() => documents.map((doc) => doc.id), [documents]);

  async function refreshDocuments({ selectAll = false } = {}) {
    const items = await fetchDocuments();
    setDocuments(items);
    setSelected((current) => {
      if (selectAll) return items.map((item) => item.id);
      const availableIds = new Set(items.map((item) => item.id));
      return current.filter((id) => availableIds.has(id));
    });
    return items;
  }

  useEffect(() => {
    refreshDocuments({ selectAll: true }).catch((loadError) => setError(getApiErrorMessage(loadError, "Could not load existing documents.")));
  }, []);

  async function handleUpload(files) {
    setBusy(true);
    setError("");
    try {
      const uploaded = await uploadDocuments(files);
      const uploadedIds = uploaded.map((doc) => doc.id).filter(Boolean);

      setDocuments((current) => {
        const existingIds = new Set(current.map((doc) => doc.id));
        return [...uploaded.filter((doc) => doc.id && !existingIds.has(doc.id)), ...current];
      });
      setSelected((current) => {
        const ids = new Set([...uploadedIds, ...current]);
        return Array.from(ids);
      });

      try {
        const refreshed = await fetchDocuments();
        if (refreshed.length) {
          setDocuments(refreshed);
          setSelected((current) => {
            const availableIds = new Set(refreshed.map((doc) => doc.id));
            const ids = new Set([...uploadedIds, ...current].filter((id) => availableIds.has(id)));
            return Array.from(ids);
          });
        }
      } catch (refreshError) {
        setError(getApiErrorMessage(refreshError, "Upload succeeded, but the document list could not be refreshed."));
      }
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError, "Upload failed. Please confirm the file is a PDF, DOCX, or PPTX and the backend is running."));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    setBusy(true);
    setError("");
    try {
      await deleteDocument(id);
      if (viewer.document?.id === id) closeViewer();
      await refreshDocuments();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, "Could not delete the document."));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteSelected() {
    setBusy(true);
    setError("");
    try {
      await Promise.all(selectedIds.map((id) => deleteDocument(id)));
      if (viewer.document && selectedIds.includes(viewer.document.id)) closeViewer();
      await refreshDocuments();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, "Could not delete the selected documents."));
    } finally {
      setBusy(false);
    }
  }

  function toggleDocument(id) {
    setSelected((current) => (current.includes(id) ? current.filter((docId) => docId !== id) : [...current, id]));
  }

  async function handleView(document) {
    setViewer({ document, preview: null, fileUrl: getDocumentFileUrl(document.id), loading: true, error: "" });
    try {
      const preview = await fetchDocumentPreview(document.id);
      setViewer((current) => (current.document?.id === document.id ? { ...current, preview, loading: false } : current));
    } catch (previewError) {
      setViewer((current) =>
        current.document?.id === document.id
          ? { ...current, loading: false, error: getApiErrorMessage(previewError, "Could not load the document preview.") }
          : current
      );
    }
  }

  function closeViewer() {
    setViewer({ document: null, preview: null, fileUrl: "", loading: false, error: "" });
  }

  async function handleAsk(question) {
    const documentIds = selectedIds.length ? selectedIds : availableDocumentIds;
    if (!documentIds.length) return;
    const history = messages.map(({ role, content }) => ({ role, content }));
    const userMessage = { id: crypto.randomUUID(), role: "user", content: question };
    const assistantId = crypto.randomUUID();
    setMessages((current) => [...current, userMessage, { id: assistantId, role: "assistant", content: "", sources: [] }]);
    setChatBusy(true);

    const payload = { question, document_ids: documentIds, history };
    let streamed = false;
    streamQuestion(payload, {
      onToken: (token) => {
        streamed = true;
        setMessages((current) => current.map((msg) => (msg.id === assistantId ? { ...msg, content: msg.content + token } : msg)));
      },
      onDone: (sources) => {
        setMessages((current) => current.map((msg) => (msg.id === assistantId ? { ...msg, sources } : msg)));
        setChatBusy(false);
      },
      onError: async () => {
        if (streamed) {
          setChatBusy(false);
          return;
        }
        try {
          const response = await askQuestion(payload);
          setMessages((current) => current.map((msg) => (msg.id === assistantId ? { ...msg, content: response.answer, sources: response.sources } : msg)));
        } catch {
          setMessages((current) =>
            current.map((msg) =>
              msg.id === assistantId ? { ...msg, content: "I could not reach the chat service. Please check that the backend is running.", sources: [] } : msg
            )
          );
        } finally {
          setChatBusy(false);
        }
      },
    });
  }

  async function runStudyTool(tab = activeTab) {
    setBusy(true);
    setError("");
    try {
      if (tab === "summary") {
        const data = await getSummary(selectedIds);
        setStudy((current) => ({ ...current, summary: data.summary }));
      }
    } catch (studyError) {
      setError(getApiErrorMessage(studyError, "Could not update the study details."));
    } finally {
      setBusy(false);
    }
  }

  const activeCount = selectedIds.length || documents.length;

  return (
    <main className="grid h-screen grid-cols-[320px_minmax(0,1fr)_360px] overflow-hidden max-xl:grid-cols-[300px_minmax(0,1fr)] max-lg:h-auto max-lg:min-h-screen max-lg:grid-cols-1">
      <aside className="flex min-h-0 flex-col gap-4 border-r border-line bg-panel p-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-6 w-6 text-brand" />
            <h1 className="text-lg font-bold">DocuMind AI</h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">Intelligent multi-document assistant powered by RAG and Groq.</p>
        </div>
        <UploadBox onUpload={handleUpload} busy={busy} />
        {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <div className="min-h-0 flex-1">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Documents</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{activeCount} active</span>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={busy || !selectedIds.length}
                className="grid h-8 w-8 place-items-center rounded-md border border-line bg-white text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Delete selected documents"
                title="Delete selected documents"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="scrollbar-thin grid max-h-full gap-2 overflow-y-auto pr-1">
            {documents.map((document) => (
              <PDFCard
                key={document.id}
                document={document}
                selected={selectedIds.includes(document.id)}
                onToggle={() => toggleDocument(document.id)}
                onView={() => handleView(document)}
                onDelete={() => handleDelete(document.id)}
              />
            ))}
            {!documents.length && <p className="rounded-lg border border-line bg-white p-3 text-sm text-slate-500">Upload PDFs, Word, or PowerPoint files to begin.</p>}
          </div>
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-line bg-white px-4">
          <div>
            <p className="text-sm font-semibold">Document Chat</p>
            <p className="text-xs text-slate-500">Answers are grounded in selected document chunks.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs">
            <Sparkles className="h-4 w-4 text-coral" />
            WebSocket streaming
          </div>
        </div>
        <ChatWindow messages={messages} />
        <ChatInput onSend={handleAsk} disabled={chatBusy || !availableDocumentIds.length} />
      </section>

      <aside className="flex min-h-0 flex-col border-l border-line bg-panel p-4 max-xl:col-span-2 max-xl:border-l-0 max-xl:border-t max-lg:col-span-1">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Study Tools</h2>
          <button
            type="button"
            onClick={() => runStudyTool()}
            disabled={busy || !documents.length}
            className="rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white disabled:bg-slate-300"
          >
            Generate
          </button>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-1 rounded-lg border border-line bg-white p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex h-10 items-center justify-center gap-1 rounded-md text-xs font-medium ${activeTab === tab.id ? "bg-teal-50 text-brand" : "text-slate-500 hover:bg-slate-50"}`}
                title={tab.label}
              >
                <Icon className="h-4 w-4" />
                <span className="max-2xl:hidden">{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto rounded-lg border border-line bg-white p-4">
          {activeTab === "summary" && <SummaryPanel summary={study.summary} />}
        </div>
      </aside>
      <DocumentViewer
        document={viewer.document}
        preview={viewer.preview}
        fileUrl={viewer.fileUrl}
        loading={viewer.loading}
        error={viewer.error}
        onClose={closeViewer}
      />
    </main>
  );
}
