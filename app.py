import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from auth_routes import router as auth_router
from detect_routes import router as detect_router
from document_routes import router as document_router
from investigation_routes import router as investigation_router
from dashboard_routes import router as dashboard_router

app = FastAPI(title="Vision Desk AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(investigation_router)
app.include_router(detect_router)
app.include_router(document_router)
app.include_router(dashboard_router)

# Mount detections output directory
detections_dir = Path("static/detections")
detections_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static/detections", StaticFiles(directory="static/detections"), name="detections")

# Mount React UI production bundle if present, else fallback to legacy static folder
frontend_dist = Path("frontend/dist")
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
else:
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
