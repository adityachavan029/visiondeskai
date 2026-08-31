"""
document_routes.py
-------------------
API routes for Module 2: Document Processing & Knowledge Extraction.

  POST /api/document/upload  -> processes a document into the vector database
  POST /api/document/search  -> searches the knowledge repository
  GET  /api/document/stats   -> quick stats (how many chunks are stored)
"""

import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from document_processor import process_document
from vector_store import add_document_chunks, search_documents, get_document_count
from llm import generate_answer

router = APIRouter(prefix="/api/document", tags=["document"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}


class SearchRequest(BaseModel):
    query: str
    top_k: int = 5


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Please upload a PDF, DOCX, or TXT file.",
        )

    doc_id = uuid.uuid4().hex
    save_path = UPLOAD_DIR / f"{doc_id}{ext}"

    with save_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        chunks = process_document(str(save_path))
        chunk_count = add_document_chunks(doc_id, file.filename, chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}")

    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "chunks_created": chunk_count,
        "message": f"Document processed and added to the knowledge repository ({chunk_count} chunks).",
    }


@router.post("/search")
async def search(payload: SearchRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty.")

    raw_results = search_documents(payload.query, top_k=payload.top_k * 3)
    # get more results first to allow filtering

    # Cap how many chunks can come from any single file, rather than
    # collapsing to one chunk per file. The old logic ("if filename not in
    # seen_files") kept only the single top-ranked chunk from each document,
    # which meant a manual with multiple relevant sections (e.g. hardhats
    # AND safety vests) would only ever surface the highest-ranked section -
    # silently dropping everything else from that file, even when it was
    # the only document uploaded.
    max_per_file = 3
    per_file_count: dict[str, int] = {}
    filtered_results = []

    for r in raw_results:
        filename = r.get("filename") or r.get("source") or "unknown"
        count = per_file_count.get(filename, 0)

        if count >= max_per_file:
            continue

        filtered_results.append(r)
        per_file_count[filename] = count + 1

        if len(filtered_results) >= payload.top_k:
            break

    results = filtered_results

    # generate_answer now returns a structured dict:
    # {"answer": str, "evidence": [...], "grounded": bool, "confidence": str}
    result = generate_answer(payload.query, results)

    return {
        "query": payload.query,
        "answer": result["answer"],
        "evidence": result["evidence"],
        "grounded": result["grounded"],
        "confidence": result["confidence"],
        "count": len(results),
    }


@router.get("/stats")
async def stats():
    return {
        "total_chunks_stored": get_document_count(),
    }