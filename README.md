# DocuMind AI

DocuMind AI is a full-stack document assistant. It lets users upload PDFs, Word documents, and PowerPoint files, extracts text from them, indexes that text for retrieval, and answers questions using the most relevant document chunks. The app also includes study tools for summaries, key topics, quizzes, and flashcards.

The project has two main parts:

- `backend/`: FastAPI server for upload, document parsing, PDF OCR, embeddings, vector search, Groq LLM calls, and API/WebSocket routes.
- `frontend/`: React + Vite app for uploading PDFs, Word documents, and PowerPoint files, chatting with documents, selecting/deleting files, and using study tools.

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React, Vite |
| Styling | Tailwind CSS |
| Icons | lucide-react |
| HTTP client | Axios |
| Backend | FastAPI, Uvicorn |
| PDF parsing | PyMuPDF |
| Word parsing | python-docx |
| PowerPoint parsing | python-pptx |
| OCR fallback | pytesseract + Tesseract OCR system binary |
| Embeddings | FastEmbed, with local hash fallback |
| Vector store | Pinecone, with local in-memory fallback |
| LLM | Groq |
| Streaming | WebSockets |

## Main Features

- Upload one or more PDFs, DOCX files, or PPTX files.
- Extract embedded document text.
- Use OCR fallback for scanned or low-text pages.
- Split PDF text into overlapping chunks.
- Generate embeddings for chunks.
- Store vectors in Pinecone when configured.
- Fall back to local in-memory vector storage when Pinecone is unavailable.
- Ask questions against selected documents.
- Stream chat answers in the frontend.
- Show source citations with filename, page, text, and score.
- View uploaded PDFs inline and preview extracted text for Word and PowerPoint files.
- Generate summaries, topics, quizzes, and flashcards.
- Delete single documents or all selected documents.
- Keep UI document state synced with the backend after upload/delete.
- Show frontend errors when the backend is unreachable.

## How The App Works

```text
User uploads PDF files
  -> Backend validates file type and size
  -> Backend writes each PDF to a temporary file
  -> PyMuPDF extracts page text
  -> OCR runs for pages with very little text
  -> Text is split into chunks
  -> Embeddings are generated
  -> Vectors are stored in Pinecone or local memory
  -> Frontend refreshes document list
  -> User asks a question
  -> Backend embeds the question
  -> Vector search finds relevant chunks
  -> Groq receives the question + retrieved context
  -> Answer streams to frontend over WebSocket
  -> Sources appear below the answer
```

## Quick Start

Open two PowerShell terminals in the project root:



Open the app:

```text
http://127.0.0.1:5173
```

Backend health check:

```text
http://127.0.0.1:8000/health
```

Expected response:

```json
{"ok":true}
```

## Manual Run

Backend:

```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

## Environment Variables

The backend reads environment variables from:

```text
backend/.env
```

Supported variables:

```env
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant

EMBEDDING_BACKEND=auto
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5

PINECONE_API_KEY=
PINECONE_INDEX=documind-ai
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1

MAX_UPLOAD_MB=25
```

Notes:

- Put real API keys only in `backend/.env`.
- Do not commit real secrets to GitHub.
- If `GROQ_API_KEY` is empty or Groq fails, the backend returns fallback answers from retrieved text.
- If `PINECONE_API_KEY` is empty or Pinecone fails, the backend uses local in-memory vectors.
- If `EMBEDDING_BACKEND=hash`, the backend skips FastEmbed and uses deterministic local hash embeddings.
- If Tesseract OCR is not installed, normal text PDFs still work; scanned PDFs may have missing text.

## Frontend Backend URL

The frontend default backend URL is defined in:

```text
frontend/src/services/api.js
```

Current default:

```text
http://127.0.0.1:8000
```

To override it, create a frontend Vite environment variable:

```env
VITE_API_BASE=http://127.0.0.1:8000
```

## API Endpoints

Base URL:

```text
http://127.0.0.1:8000
```

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check backend status |
| `POST` | `/api/upload` | Upload one or more PDF files |
| `GET` | `/api/documents` | List documents in the current backend session |
| `DELETE` | `/api/documents/{document_id}` | Delete one document and its vectors |
| `POST` | `/api/chat` | Ask a question using normal HTTP |
| `POST` | `/api/summary` | Generate a summary |
| `POST` | `/api/topics` | Generate key topics |
| `POST` | `/api/quiz` | Generate quiz questions |
| `POST` | `/api/flashcards` | Generate flashcards |

WebSocket:

```text
ws://127.0.0.1:8000/ws/chat
```

Example chat payload:

```json
{
  "question": "What is this PDF about?",
  "document_ids": ["document-id"],
  "history": [
    { "role": "user", "content": "Previous question" },
    { "role": "assistant", "content": "Previous answer" }
  ]
}
```

## Project Structure

```text
DocuMind-AI/
  README.md
  run-backend.ps1
  run-frontend.ps1
  backend/
  frontend/
  scripts/
  docs/
```

## Root Files

| File | What it does |
| --- | --- |
| `README.md` | Main project documentation and setup guide. |
| `.gitignore` | Tells Git which generated/local files to ignore. |
| `run-backend.ps1` | Starts the FastAPI backend on `127.0.0.1:8000`. Installs Python packages only when needed. |
| `run-frontend.ps1` | Starts the Vite frontend on `127.0.0.1:5173`. Installs npm packages only when needed. |

## Backend Files

| File | What it does |
| --- | --- |
| `backend/.env` | Local backend environment variables and API keys. Keep this private. |
| `backend/requirements.txt` | Python dependencies needed by the backend. |
| `backend/uvicorn.out.log` | Local backend stdout log file, if generated. |
| `backend/uvicorn.err.log` | Local backend stderr log file, if generated. |
| `backend/app/main.py` | Creates the FastAPI app, configures CORS, registers routers, and exposes `/health`. |
| `backend/app/__init__.py` | Marks `app` as a Python package. |

### Backend Core

| File | What it does |
| --- | --- |
| `backend/app/core/settings.py` | Loads backend settings from `.env`, including API prefix, CORS, Groq, Pinecone, embeddings, chunking, and upload limits. |
| `backend/app/core/security.py` | Validates uploaded files, including PDF extension and upload size limit. |

### Backend Models

| File | What it does |
| --- | --- |
| `backend/app/models/document_models.py` | Pydantic models for documents, sources, chat messages, quiz questions, and flashcards. |
| `backend/app/models/request_models.py` | Request schemas for chat, document actions, and quiz generation. |
| `backend/app/models/response_models.py` | Response schemas for upload, documents, chat, summary, quiz, flashcards, and topics. |

### Backend Routes

| File | What it does |
| --- | --- |
| `backend/app/routes/upload.py` | Handles `POST /api/upload`; validates PDFs and sends them to the RAG pipeline for ingestion. |
| `backend/app/routes/documents.py` | Handles document listing and deletion. |
| `backend/app/routes/chat.py` | Handles REST chat and WebSocket streaming chat. Slow LLM/retrieval work runs in a threadpool so the API stays responsive. |
| `backend/app/routes/summary.py` | Handles summary generation for selected documents. |
| `backend/app/routes/topics.py` | Handles key topic extraction for selected documents. |
| `backend/app/routes/quiz.py` | Handles quiz generation for selected documents. |
| `backend/app/routes/flashcards.py` | Handles flashcard generation for selected documents. |
| `backend/app/routes/__init__.py` | Marks `routes` as a Python package. |

### Backend RAG Services

| File | What it does |
| --- | --- |
| `backend/app/services/rag/pipeline.py` | Main backend brain. Ingests PDFs, stores document metadata, chunks, embeddings, asks questions, retrieves sources, summarizes, creates quizzes/flashcards, and deletes vectors. |
| `backend/app/services/rag/chunking.py` | Splits extracted page text into overlapping chunks for retrieval. |
| `backend/app/services/rag/embeddings.py` | Creates embeddings using FastEmbed when available, with hash embedding fallback. |
| `backend/app/services/rag/pinecone_store.py` | Vector store wrapper. Uses Pinecone when configured and falls back to local memory if Pinecone is missing or fails. |
| `backend/app/services/rag/retriever.py` | Retrieval helper module. |
| `backend/app/services/rag/reranker.py` | Reranking helper module. |
| `backend/app/services/rag/hybrid_search.py` | Hybrid search helper module. |
| `backend/app/services/rag/citation_handler.py` | Citation formatting/helper module. |
| `backend/app/services/rag/__init__.py` | Marks `rag` as a Python package. |

### Backend PDF Services

| File | What it does |
| --- | --- |
| `backend/app/services/pdf/pdf_loader.py` | Opens PDFs with PyMuPDF, extracts text page by page, and calls OCR for low-text pages. |
| `backend/app/services/pdf/ocr.py` | Converts pages to images and uses Tesseract through `pytesseract` for OCR text. |
| `backend/app/services/pdf/metadata_extractor.py` | PDF metadata helper module. |
| `backend/app/services/pdf/pdf_highlighter.py` | PDF highlighting helper module. |
| `backend/app/services/pdf/section_summary.py` | Section summary helper module. |
| `backend/app/services/pdf/summarizer.py` | PDF summary helper module. |
| `backend/app/services/pdf/__init__.py` | Marks `pdf` as a Python package. |

### Backend LLM Services

| File | What it does |
| --- | --- |
| `backend/app/services/llm/groq_client.py` | Wraps Groq chat completions. Returns fallback text if Groq is not configured or errors. |
| `backend/app/services/llm/prompts.py` | Stores prompt templates for answers, summaries, quizzes, and flashcards. |
| `backend/app/services/llm/formatter.py` | Formatting helper module for LLM output. |
| `backend/app/services/llm/__init__.py` | Marks `llm` as a Python package. |

### Backend AI Helpers

| File | What it does |
| --- | --- |
| `backend/app/services/ai/flashcard_generator.py` | Flashcard helper module. |
| `backend/app/services/ai/keyword_extractor.py` | Keyword/topic helper module. |
| `backend/app/services/ai/quiz_generator.py` | Quiz helper module. |
| `backend/app/services/ai/translator.py` | Translation helper module. |

### Backend Memory, Database, And Utils

| File | What it does |
| --- | --- |
| `backend/app/services/memory/chat_memory.py` | Chat memory helper module. |
| `backend/app/services/memory/context_manager.py` | Context helper module. |
| `backend/app/database/pinecone_client.py` | Pinecone client helper module. |
| `backend/app/database/vector_manager.py` | Vector management helper module. |
| `backend/app/database/delete_vectors.py` | Vector deletion helper module. |
| `backend/app/utils/config.py` | Utility config helper module. |
| `backend/app/utils/constants.py` | Shared constants helper module. |
| `backend/app/utils/helpers.py` | General helper functions. |
| `backend/app/utils/logger.py` | Logging helper module. |
| `backend/app/services/__init__.py` | Marks `services` as a Python package. |

## Frontend Files

| File | What it does |
| --- | --- |
| `frontend/package.json` | npm dependencies and scripts. |
| `frontend/package-lock.json` | Exact npm dependency versions. |
| `frontend/index.html` | Vite HTML entry point. |
| `frontend/vite.config.js` | Vite configuration. |
| `frontend/tailwind.config.js` | Tailwind CSS configuration. |
| `frontend/postcss.config.js` | PostCSS configuration for Tailwind. |
| `frontend/vite.out.log` | Local Vite stdout log file, if generated. |
| `frontend/vite.err.log` | Local Vite stderr log file, if generated. |

### Frontend Entry And Main App

| File | What it does |
| --- | --- |
| `frontend/src/main.jsx` | React entry point. Mounts `<App />` into the DOM. |
| `frontend/src/App.jsx` | Main user interface: document sidebar, upload, selection, chat, study tools, API calls, and state updates. |
| `frontend/src/pages/Home.jsx` | Page wrapper/helper component. |
| `frontend/src/pages/Dashboard.jsx` | Dashboard page wrapper that renders the main app. |

### Frontend Services

| File | What it does |
| --- | --- |
| `frontend/src/services/api.js` | Axios API client, backend base URL, WebSocket base URL, and shared API error formatting. |
| `frontend/src/services/pdfService.js` | Uploads PDFs, fetches document list, and deletes documents. Adds a cache-busting timestamp for fast fresh updates. |
| `frontend/src/services/chatService.js` | Sends chat requests over REST or WebSocket. Handles WebSocket completion, errors, and fallback behavior. |
| `frontend/src/services/aiService.js` | Calls summary, topics, quiz, and flashcard endpoints. |

### Frontend Chat Components

| File | What it does |
| --- | --- |
| `frontend/src/components/chat/ChatWindow.jsx` | Displays chat messages and auto-scrolls as streamed text arrives. |
| `frontend/src/components/chat/ChatInput.jsx` | Text input and send button for questions. |
| `frontend/src/components/chat/MessageBubble.jsx` | Renders user and assistant messages with sources. |
| `frontend/src/components/chat/StreamingText.jsx` | Streaming text helper component. |
| `frontend/src/components/chat/TypingAnimation.jsx` | Typing/loading animation helper. |
| `frontend/src/components/chat/ChatHistory.jsx` | Chat history helper component. |

### Frontend PDF Components

| File | What it does |
| --- | --- |
| `frontend/src/components/pdf/UploadBox.jsx` | Drag-and-drop and file picker upload UI. |
| `frontend/src/components/pdf/PDFCard.jsx` | Displays one uploaded document, select state, pages/chunks, and delete button. |
| `frontend/src/components/pdf/SourceCitation.jsx` | Displays source filename, page, excerpt, and score. |
| `frontend/src/components/pdf/PDFViewer.jsx` | PDF viewer helper component. |
| `frontend/src/components/pdf/HighlightAnswer.jsx` | Highlight helper component. |
| `frontend/src/components/pdf/DragDropUpload.jsx` | Upload helper component. |

### Frontend AI Components

| File | What it does |
| --- | --- |
| `frontend/src/components/ai/SummaryPanel.jsx` | Displays generated summaries. |
| `frontend/src/components/ai/KeyTopics.jsx` | Displays generated topic list. |
| `frontend/src/components/ai/QuizGenerator.jsx` | Displays generated quiz questions and answers. |
| `frontend/src/components/ai/Flashcards.jsx` | Displays generated flashcards. |
| `frontend/src/components/ai/AnswerModes.jsx` | Answer mode helper component. |
| `frontend/src/components/ai/LanguageSelector.jsx` | Language selection helper component. |

### Frontend UI, Context, Hooks, And Styles

| File | What it does |
| --- | --- |
| `frontend/src/components/ui/Navbar.jsx` | Navigation helper component. |
| `frontend/src/components/ui/Sidebar.jsx` | Sidebar helper component. |
| `frontend/src/components/ui/SearchChats.jsx` | Chat search helper component. |
| `frontend/src/components/ui/ThemeToggle.jsx` | Theme toggle helper component. |
| `frontend/src/components/ui/Loader.jsx` | Loading indicator component. |
| `frontend/src/context/ChatContext.jsx` | Chat context helper. The current main app keeps chat state in `App.jsx`. |
| `frontend/src/context/PDFContext.jsx` | PDF context helper. The current main app keeps document state in `App.jsx`. |
| `frontend/src/context/ThemeContext.jsx` | Theme context helper. |
| `frontend/src/hooks/useChat.js` | Chat hook helper. |
| `frontend/src/hooks/usePDF.js` | PDF hook helper. |
| `frontend/src/hooks/useTheme.js` | Theme hook helper. |
| `frontend/src/styles/global.css` | Main global styles and Tailwind imports. |
| `frontend/src/styles/theme.css` | Theme-specific styles. |
| `frontend/src/styles/chat.css` | Chat-specific styles. |

## Scripts Folder

| File | What it does |
| --- | --- |
| `scripts/cleanup_vectors.py` | Utility script for cleaning vector data. |
| `scripts/reset_system.py` | Utility script for resetting local/backend state. |
| `scripts/ingest_pdf.py` | Utility script for ingesting a PDF from the command line. |

## Important Runtime Behavior

- Document data is stored in memory in the running backend process.
- If the backend restarts, the frontend document list becomes empty until PDFs are uploaded again.
- Temporary PDF files are deleted immediately after extraction.
- Pinecone vectors are tagged with a backend session id.
- On normal backend shutdown, current session vectors are cleaned up.
- If the backend is force-killed, cleanup may not run.
- Frontend state refreshes after upload/delete by calling `/api/documents`.
- Chat first tries WebSocket streaming and falls back to REST if streaming fails before output begins.

## Verification Commands

Run frontend build:

```powershell
cd frontend
npm.cmd run build
```

Run backend compile check:

```powershell
cd backend
python -m compileall app
```

Check backend import:

```powershell
cd backend
python -c "from app.main import app; print(app.title)"
```

Check backend health:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/health
```

## Troubleshooting

### Frontend cannot reach backend

Make sure backend is running:

```text
http://127.0.0.1:8000/health
```

Then restart the frontend.

### Documents do not appear after upload

- Check the error message shown in the sidebar.
- Confirm the backend is running.
- Confirm the uploaded file ends with `.pdf`.
- Confirm the file is below `MAX_UPLOAD_MB`.
- Watch the backend terminal for extraction, embedding, Groq, or Pinecone errors.

### Backend startup is slow

The first startup can be slower because Python packages, FastEmbed, or model files may need setup. Later starts should be faster because the run scripts skip dependency installation unless dependency files changed.

### Groq answers look like fallback text

Check:

```env
GROQ_API_KEY=
```

If the key is missing or invalid, fallback answers are returned from retrieved PDF text.

### Pinecone is not being used

Check:

```env
PINECONE_API_KEY=
PINECONE_INDEX=documind-ai
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1
```

If Pinecone is unavailable, the app uses local in-memory vectors.

### Scanned PDFs have no text

Install the Tesseract OCR system binary and make sure it is available on PATH. `pytesseract` alone is only the Python wrapper.

### PowerShell blocks scripts

Run the manual commands from this README, or start PowerShell with an execution policy that allows local scripts.

## Deployment Notes

Backend start command:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Frontend build command:

```bash
npm install && npm run build
```

Frontend publish directory:

```text
frontend/dist
```

Set production secrets on the hosting platform. Do not deploy or commit local `.env` secrets.
