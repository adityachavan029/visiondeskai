"""
detector.py
-----------
Loads the trained YOLOv8 PPE detection model and runs inference on images
and videos.

The model is loaded ONCE when this module is first imported (not on every
request) — loading it fresh each time would be slow and wasteful.
"""

import os
import datetime
from pathlib import Path

import cv2
from ultralytics import YOLO
MODEL_PATH = "models/best.pt"
model = YOLO(MODEL_PATH)
RESULTS_DIR = Path("static/detections")
RESULTS_DIR.mkdir(parents=True, exist_ok=True)


def get_model_info() -> dict:
    """Returns info about the currently loaded model, useful for verifying
    which weights file is actually in use."""
    abs_path = os.path.abspath(MODEL_PATH)
    size_mb = round(os.path.getsize(abs_path) / (1024 * 1024), 2)
    modified = os.path.getmtime(abs_path)
    modified_str = datetime.datetime.fromtimestamp(modified).strftime("%Y-%m-%d %H:%M:%S")

    return {
        "model_path": abs_path,
        "file_size_mb": size_mb,
        "last_modified": modified_str,
        "num_classes": len(model.names),
        "class_names": model.names,
    }


def run_detection(image_path: str, confidence: float = 0.25) -> dict:
    """
    Runs the PPE detection model on a single image.

    Args:
        image_path: path to the uploaded image on disk
        confidence: minimum confidence threshold (0-1) to count as a detection

    Returns:
        {
            "detections": [
                {"class": "Hardhat", "confidence": 0.87, "box": [x1, y1, x2, y2]},
                ...
            ],
            "annotated_image_url": "/static/detections/result_<name>.jpg",
            "count": 3
        }
    """
    results = model.predict(source=image_path, conf=confidence, verbose=False)
    result = results[0]  

    detections = []
    for box in result.boxes:
        class_id = int(box.cls[0])
        class_name = model.names[class_id]
        conf_score = float(box.conf[0])
        xyxy = box.xyxy[0].tolist()

        detections.append({
            "class": class_name,
            "confidence": round(conf_score, 3),
            "box": [round(v, 1) for v in xyxy],
        })

    annotated = result.plot()
    output_filename = f"result_{Path(image_path).stem}.jpg"
    output_path = RESULTS_DIR / output_filename
    cv2.imwrite(str(output_path), annotated)

    return {
        "detections": detections,
        "annotated_image_url": f"/static/detections/{output_filename}",
        "count": len(detections),
    }


def run_video_detection(
    video_path: str,
    confidence: float = 0.25,
    frame_interval_sec: float = 1.0,
    max_frames: int = 20,
) -> dict:
    """
    Runs PPE detection on a video by sampling frames at a fixed interval
    (rather than every single frame, which would be far too slow on CPU).

    Args:
        video_path: path to the uploaded video on disk
        confidence: minimum confidence threshold (0-1)
        frame_interval_sec: how often to sample a frame, in seconds
        max_frames: hard cap on frames analyzed, so a long video doesn't take forever

    Returns:
        {
            "frames_analyzed": 12,
            "video_duration_sec": 34.2,
            "class_counts": {"Hardhat": 9, "NO-Hardhat": 3, ...},
            "violation_frame_count": 3,
        }
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError("Could not open video file.")

    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration_sec = total_frames / fps if fps else 0
    frame_step = max(1, int(fps * frame_interval_sec))

    video_stem = Path(video_path).stem
    class_counts: dict = {}
    violation_frame_count = 0
    frames_analyzed = 0
    frame_idx = 0

    while frames_analyzed < max_frames:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        success, frame = cap.read()
        if not success:
            break

        results = model.predict(source=frame, conf=confidence, verbose=False)
        result = results[0]

        has_violation = False
        for box in result.boxes:
            class_id = int(box.cls[0])
            class_name = model.names[class_id]
            class_counts[class_name] = class_counts.get(class_name, 0) + 1
            if class_name.startswith("NO-") or class_name == "Fall-Detected":
                has_violation = True

        if has_violation:
            violation_frame_count += 1

        frames_analyzed += 1
        frame_idx += frame_step
        if frame_idx >= total_frames:
            break

    cap.release()

    return {
        "frames_analyzed": frames_analyzed,
        "video_duration_sec": round(duration_sec, 1),
        "class_counts": class_counts,
        "violation_frame_count": violation_frame_count,
    }