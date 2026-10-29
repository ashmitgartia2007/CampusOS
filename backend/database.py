import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL
from models.db_models import Base

def create_db_engine():
    """Create SQLAlchemy engine with PostgreSQL or SQLite fallback."""
    # Check if DATABASE_URL starts with postgresql
    if DATABASE_URL.startswith("postgresql"):
        try:
            eng = create_engine(
                DATABASE_URL,
                pool_size=10,
                max_overflow=20,
                connect_args={"connect_timeout": 3}
            )
            # Test connection
            with eng.connect() as conn:
                pass
            return eng
        except Exception:
            # Fall back to local SQLite if PostgreSQL is not reachable
            sqlite_url = "sqlite:///./campusos.db"
            return create_engine(sqlite_url, connect_args={"check_same_thread": False})
    else:
        return create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """FastAPI dependency for yielding database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all tables in the configured database."""
    Base.metadata.create_all(bind=engine)
