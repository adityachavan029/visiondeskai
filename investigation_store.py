"""
investigation_store.py
-----------------------
Lightweight persistence for Module 5 investigation reports.

Deliberately file-backed (a single JSON file) rather than a new Postgres
table - this workflow's human-in-the-loop review step just needs a status
flag and a place to store the draft report between "generate" and "review"
calls. If you later want this in Postgres/SQLite alongside your other
tables, swap the functions below for calls into database.py/models.py;
nothing outside this file needs to change.
"""

import json
import uuid
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

STORE_PATH = Path("investigations.json")
_lock = threading.Lock()

def _load() -> Dict[str, dict]:
    if not STORE_PATH.exists():
        return {}
    try:
        with STORE_PATH.open("r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}

def _save(data: Dict[str, dict]) -> None:
    with STORE_PATH.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)

def create_investigation(state: dict) -> dict:
    """Store a freshly-generated investigation as status='draft'."""
    investigation_id = uuid.uuid4().hex
    record = {
        "id": investigation_id,
        "status": "draft",  # draft -> approved | rejected | edited
        "created_at": datetime.now(timezone.utc).isoformat(),
        "reviewed_at": None,
        "reviewer_notes": None,
        **state,
    }
    with _lock:
        data = _load()
        data[investigation_id] = record
        _save(data)
    return record

def get_investigation(investigation_id: str) -> Optional[dict]:
    with _lock:
        data = _load()
    return data.get(investigation_id)

def list_investigations(status: Optional[str] = None) -> List[dict]:
    with _lock:
        data = _load()
    records = list(data.values())
    if status:
        records = [r for r in records if r.get("status") == status]
    records.sort(key=lambda r: r.get("created_at", ""), reverse=True)
    return records

def update_investigation(investigation_id: str, updates: dict) -> Optional[dict]:
    with _lock:
        data = _load()
        if investigation_id not in data:
            return None
        data[investigation_id].update(updates)
        _save(data)
        return data[investigation_id]