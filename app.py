from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from auth_routes import router as auth_router
from detect_routes import router as detect_router
from document_routes import router as document_router
from investigation_routes import router as investigation_router
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
app.mount("/", StaticFiles(directory="static", html=True), name="static")