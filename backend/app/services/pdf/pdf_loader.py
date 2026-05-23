from dataclasses import dataclass
from pathlib import Path
from typing import List

import fitz

from app.services.pdf.ocr import ocr_page


@dataclass
class PageText:
    page: int
    text: str
    used_ocr: bool = False


def extract_pdf_text(path: Path) -> List[PageText]:
    pages: List[PageText] = []
    with fitz.open(path) as doc:
        for index, page in enumerate(doc, start=1):
            text = page.get_text("text").strip()
            used_ocr = False
            if len(text) < 30:
                ocr_text = ocr_page(page)
                if ocr_text:
                    text = ocr_text
                    used_ocr = True
            pages.append(PageText(page=index, text=text, used_ocr=used_ocr))
    return pages
