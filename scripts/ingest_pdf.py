import argparse
import asyncio
from pathlib import Path

from fastapi import UploadFile

from app.services.rag.pipeline import pipeline


async def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest PDFs into the local running pipeline.")
    parser.add_argument("pdfs", nargs="+")
    args = parser.parse_args()
    files = []
    handles = []
    try:
        for pdf in args.pdfs:
            path = Path(pdf)
            handle = path.open("rb")
            handles.append(handle)
            files.append(UploadFile(filename=path.name, file=handle))
        docs = await pipeline.ingest(files)
        for doc in docs:
            print(f"{doc.id} {doc.filename} pages={doc.pages} chunks={doc.chunks}")
    finally:
        for handle in handles:
            handle.close()


if __name__ == "__main__":
    asyncio.run(main())
