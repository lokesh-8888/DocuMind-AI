from app.services.rag.pipeline import pipeline


pipeline.documents.clear()
pipeline.chunks.clear()
print("Reset in-memory application state.")
