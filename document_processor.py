"""
document_processor.py
----------------------
Handles the first two steps of the Module 2 pipeline:
  1. Extract raw text from an uploaded document (PDF, DOCX, or TXT)
  2. Clean and split that text into smaller overlapping chunks

Why chunking matters: embedding models and vector search work much better
on small, focused pieces of text (a paragraph or two) than on an entire
50-page document at once. Chunking also lets us point back to the specific
part of a document that answered a question, not just "somewhere in this PDF."
"""

import re
from pathlib import Path

from pypdf import PdfReader
from docx import Document as DocxDocument


def extract_text(file_path: str) -> str:
    """
    Extracts raw text from a PDF, DOCX, or TXT file.

    Note: this handles text-based PDFs (where the text is actually stored
    as text in the file). Scanned/image-only PDFs would need OCR instead,
    which is a separate, more advanced step — see the note at the bottom
    of this file if you want to add that later.
    """
    ext = Path(file_path).suffix.lower()

    if ext == ".pdf":
        return _extract_pdf_text(file_path)
    elif ext == ".docx":
        return _extract_docx_text(file_path)
    elif ext == ".txt":
        return _extract_txt_text(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def _extract_pdf_text(file_path: str) -> str:
    reader = PdfReader(file_path)
    text_parts = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)
    return "\n".join(text_parts)


def _extract_docx_text(file_path: str) -> str:
    doc = DocxDocument(file_path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)


def _extract_txt_text(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def clean_text(text: str) -> str:
    """Basic cleanup: collapse excessive whitespace, strip weird characters."""
    text = re.sub(r"\s+", " ", text) 
    text = text.strip()
    return text


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """
    Splits text into overlapping chunks.

    Args:
        text: the cleaned text to split
        chunk_size: target number of characters per chunk
        overlap: how many characters from the end of one chunk repeat at the
                 start of the next — this prevents important context from
                 being awkwardly cut in half at a chunk boundary

    Returns:
        A list of text chunks.
    """
    if not text:
        return []

    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk.strip())
        start += chunk_size - overlap 

    return [c for c in chunks if c] 


def process_document(file_path: str) -> list[str]:
    """
    Full pipeline: extract -> clean -> chunk.
    This is the main function other code should call.
    """
    raw_text = extract_text(file_path)
    cleaned = clean_text(raw_text)
    chunks = chunk_text(cleaned)
    return chunks
