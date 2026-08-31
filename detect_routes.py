"""
detect_routes.py
-----------------
API routes for running PPE detection on uploaded images and videos.
"""

import shutil
import uuid
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from detector import run_detection, run_video_detection, get_model_info
from vector_store import search_documents
from llm import generate_answer
router = APIRouter(prefix="/api", tags=["detection"])
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".webm", ".avi"}
@router.get("/model-info")
async def model_info():
    """Debug endpoint - shows which model file is currently loaded."""
    return get_model_info()
@router.post("/detect")
async def detect_image(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Please upload a JPG, PNG, or WEBP image.",
        )
    unique_name = f"{uuid.uuid4().hex}{ext}"
    save_path = UPLOAD_DIR / unique_name
    with save_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        result = run_detection(str(save_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")
    return result
def _confidence_phrase(confidence: float) -> str:
    if confidence >= 0.75:
        return "high confidence"
    if confidence >= 0.5:
        return "moderate confidence"
    return "low confidence"
def _build_image_context(detections: list[dict]) -> str:
    if not detections:
        return "No PPE items were detected in the image."
    details = []
    for d in detections:
        conf_pct = round(d.get("confidence", 0) * 100)
        phrase = _confidence_phrase(d.get("confidence", 0))
        details.append(
            f"{d['class']} detected at {conf_pct}% confidence ({phrase})"
        )
    return (
        f"Image analysis found {len(detections)} item{'s' if len(detections) != 1 else ''}: "
        + ", ".join(details)
        + "."
    )
def _build_video_context(result: dict) -> str:
    frames = result.get("frames_analyzed", 0)
    violations = result.get("violation_frame_count", 0)
    class_counts = result.get("class_counts", {}) or {}
    if frames == 0:
        return "No video frames were analyzed."
    violation_classes = [c for c in class_counts if c.startswith("NO-") or c == "Fall-Detected"]
    safe_classes = [c for c in class_counts if c not in violation_classes]
    parts = [
        f"Video analysis processed {frames} frame{'s' if frames != 1 else ''}.",
        f"{violations} frame{'s' if violations != 1 else ''} contained violations.",
    ]
    if violation_classes:
        parts.append(f"Violations included: {', '.join(sorted(violation_classes))}.")
    if safe_classes:
        parts.append(f"Also observed: {', '.join(sorted(safe_classes))}.")

    return " ".join(parts)

def _filter_search_results(raw_results: list[dict], top_k: int, max_per_file: int = 3) -> list[dict]:
    """
    Keep the top-ranked chunks up to top_k total, but cap how many chunks
    can come from any single file (max_per_file) so one huge or highly-
    relevant document doesn't crowd out everything else. This replaces the
    old "one chunk per filename" behavior, which silently discarded every
    other relevant section of a document whenever only one file was
    uploaded - e.g. keeping the Hardhat section chunk but dropping the
    Safety Vest section chunk from the same manual, even though both were
    relevant to the query.
    """
    per_file_count = {}
    filtered = []
    for item in raw_results:
        filename = item.get("filename") or item.get("source") or "unknown"
        count = per_file_count.get(filename, 0)
        if count >= max_per_file:
            continue
        filtered.append(item)
        per_file_count[filename] = count + 1
        if len(filtered) >= top_k:
            break
    return filtered


@router.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    query: Optional[str] = Form(None),
    top_k: int = Form(5),
):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS and ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Please upload a supported image or video file.",
        )

    unique_name = f"{uuid.uuid4().hex}{ext}"
    save_path = UPLOAD_DIR / unique_name

    with save_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if ext in ALLOWED_IMAGE_EXTENSIONS:
        detection = run_detection(str(save_path))
        analysis_summary = _build_image_context(detection.get("detections", []))
        detected_classes = [d.get("class") for d in detection.get("detections", []) if d.get("class")]
        analysis_payload = {
            "detections": detection.get("detections", []),
            "annotated_image_url": detection.get("annotated_image_url"),
            "count": detection.get("count", 0),
        }
    else:
        detection = run_video_detection(str(save_path), frame_interval_sec=1.0, max_frames=20)
        analysis_summary = _build_video_context(detection)
        detected_classes = sorted([c for c in (detection.get("class_counts", {}) or {}).keys() if c])
        analysis_payload = {
            "video_analysis": detection,
            "count": detection.get("frames_analyzed", 0),
        }
    def _normalize_class_name(cls: str) -> str:
        return cls.replace("NO-", "").replace("-", " ").replace("_", " ").strip().lower()
    def _build_search_query(user_query: Optional[str], analysis_summary: str, ext: str, detected_classes: list[str]) -> str:
        if user_query and user_query.strip():
            return user_query.strip()
        classes_text = ", ".join(sorted({ _normalize_class_name(c) for c in detected_classes })) if detected_classes else "detected PPE items"
        if ext in ALLOWED_IMAGE_EXTENSIONS:
            return (
                "Search the safety documents for PPE compliance rules specifically about "
                f"{classes_text}. Image analysis summary: {analysis_summary}"
            )
        return (
            "Search the safety documents for PPE compliance rules specifically about "
            f"{classes_text}. Video analysis summary: {analysis_summary}"
        )
    search_query = _build_search_query(query, analysis_summary, ext, detected_classes)
    user_query = query.strip() if query and query.strip() else search_query
    raw_results = search_documents(search_query, top_k=top_k * 3)
    filtered_results = _filter_search_results(raw_results, top_k)
    result = generate_answer(user_query, filtered_results, analysis_summary=analysis_summary)
    return {
        "query": query,
        "answer": result["answer"],
        "evidence": result["evidence"],
        "grounded": result["grounded"],
        "confidence": result["confidence"],
        "analysis_summary": analysis_summary,
        **analysis_payload,
    }
@router.post("/detect-video")
async def detect_video(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Please upload MP4, MOV, WEBM, or AVI.",
        )
    unique_name = f"{uuid.uuid4().hex}{ext}"
    save_path = UPLOAD_DIR / unique_name
    with save_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        result = run_video_detection(str(save_path), frame_interval_sec=1.0, max_frames=20)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")
    return result