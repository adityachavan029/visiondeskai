"""
investigation_routes.py
------------------------
API routes for Module 5: Agentic Workflow with LangGraph.

  POST /api/investigate                    -> runs the full 6-agent workflow,
                                                stores the result as a draft
  GET  /api/investigations                  -> list investigations (optionally
                                                filter by ?status=draft)
  GET  /api/investigation/{id}              -> fetch one investigation
  POST /api/investigation/{id}/review       -> human-in-the-loop: approve,
                                                reject, or edit the draft report

Human-in-the-loop here is "generate full draft, then review" (not a mid-graph
pause): the workflow always runs to completion and produces a draft report;
a human then approves/edits/rejects it via the /review endpoint. See
investigation_workflow.py for the agent graph itself.
"""

import shutil
import uuid
from pathlib import Path
from typing import Literal, Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

from investigation_workflow import run_investigation
from investigation_store import (
    create_investigation,
    get_investigation,
    list_investigations,
    update_investigation,
)

router = APIRouter(prefix="/api", tags=["investigation"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov", ".webm", ".avi"}


@router.post("/investigate")
async def investigate(
    file: UploadFile = File(...),
    query: str = Form("Investigate PPE compliance in this media."),
):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Please upload an image or video file.",
        )

    unique_name = f"{uuid.uuid4().hex}{ext}"
    save_path = UPLOAD_DIR / unique_name
    with save_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        final_state = run_investigation(query=query, file_path=str(save_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Investigation workflow failed: {str(e)}")

    record = create_investigation({
        "query": query,
        "filename": file.filename,
        "kind": final_state.get("kind"),
        "search_query": final_state.get("search_query"),
        "investigation_focus": final_state.get("investigation_focus"),
        "detected_classes": final_state.get("detected_classes", []),
        "visual_summary": final_state.get("visual_summary"),
        "retrieved_chunk_count": len(final_state.get("retrieved_chunks", [])),
        "retrieved_chunk_debug": [
            {"filename": c.get("filename") or c.get("source"), "score": c.get("score", c.get("similarity"))}
            for c in final_state.get("retrieved_chunks", [])
        ],
        "evidence": final_state.get("evidence", []),
        "validated_answer": final_state.get("validated_answer"),
        "grounded": final_state.get("grounded"),
        "confidence": final_state.get("confidence"),
        "severity": final_state.get("severity"),
        "recommended_action": final_state.get("recommended_action"),
        "reasoning": final_state.get("reasoning"),
        "report": final_state.get("report"),
        "errors": final_state.get("errors", []),
    })

    return record


@router.get("/investigations")
async def get_investigations(status: Optional[str] = None):
    return {"investigations": list_investigations(status=status)}


@router.get("/investigation/{investigation_id}")
async def get_single_investigation(investigation_id: str):
    record = get_investigation(investigation_id)
    if not record:
        raise HTTPException(status_code=404, detail="Investigation not found.")
    return record


class ReviewRequest(BaseModel):
    action: Literal["approve", "reject", "edit"]
    edited_report: Optional[str] = None
    reviewer_notes: Optional[str] = None


@router.post("/investigation/{investigation_id}/review")
async def review_investigation(investigation_id: str, payload: ReviewRequest):
    record = get_investigation(investigation_id)
    if not record:
        raise HTTPException(status_code=404, detail="Investigation not found.")

    updates = {"reviewer_notes": payload.reviewer_notes}

    if payload.action == "approve":
        updates["status"] = "approved"
    elif payload.action == "reject":
        updates["status"] = "rejected"
    elif payload.action == "edit":
        if not payload.edited_report:
            raise HTTPException(status_code=400, detail="edited_report is required for action='edit'.")
        updates["status"] = "edited"
        updates["report"] = payload.edited_report

    from datetime import datetime, timezone
    updates["reviewed_at"] = datetime.now(timezone.utc).isoformat()

    updated = update_investigation(investigation_id, updates)
    return updated