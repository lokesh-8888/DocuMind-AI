from app.services.rag.pipeline import pipeline


pipeline.cleanup_session()
print("Cleared current session document and vector state.")
