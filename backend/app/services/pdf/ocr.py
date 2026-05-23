from io import BytesIO
from typing import Optional

import fitz
from PIL import Image


def ocr_page(page: fitz.Page) -> Optional[str]:
    try:
        import pytesseract
    except Exception:
        return None

    try:
        pix = page.get_pixmap(dpi=180)
        image = Image.open(BytesIO(pix.tobytes("png")))
        text = pytesseract.image_to_string(image)
        return text.strip() or None
    except Exception:
        return None
