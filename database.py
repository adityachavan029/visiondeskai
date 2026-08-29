"""
Database connection setup.

Reads the connection string from the DATABASE_URL environment variable.
If the configured database is unavailable, the application falls back to a local
SQLite database so the app can still start in development environments without a
separate Postgres service.
"""

import logging
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
load_dotenv()  
DEFAULT_SQLITE_URL = "sqlite:///./vision_desk_ai.db"
def _resolve_database_url() -> str:
    """Prefer the configured database URL, but fall back to SQLite when missing."""
    database_url = os.getenv("DATABASE_URL")
    if database_url and database_url.strip():
        return database_url.strip()
    return DEFAULT_SQLITE_URL
def _create_engine_for_url(database_url: str):
    """Create the engine, falling back to SQLite if the configured DB is unreachable."""
    if database_url.startswith("sqlite"):
        return create_engine(database_url, connect_args={"check_same_thread": False})
    engine = create_engine(database_url)
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return engine
    except Exception as exc:
        logging.warning(
            "Database connection failed for %s. Falling back to SQLite. Error: %s",
            database_url,
            exc,
        )
        return create_engine(DEFAULT_SQLITE_URL, connect_args={"check_same_thread": False})
DATABASE_URL = _resolve_database_url()
engine = _create_engine_for_url(DATABASE_URL)
if str(engine.url).startswith("sqlite"):
    DATABASE_URL = str(engine.url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
def get_db():
    """FastAPI dependency that yields a database session and closes it after use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()