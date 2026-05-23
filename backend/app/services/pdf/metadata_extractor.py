from pathlib import Path

import fitz


def extract_metadata(path: Path) -> dict:
    with fitz.open(path) as doc:
        metadata = dict(doc.metadata or {})
        metadata["pages"] = doc.page_count
        return metadata
