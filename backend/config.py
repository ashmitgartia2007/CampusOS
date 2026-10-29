import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Database configuration: defaults to PostgreSQL, falls back to SQLite for local development
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://campus_admin:campus_secret@localhost:5432/campusos_db"
)

# JWT Authentication Config
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "campusos_super_secret_jwt_key_2026_unisphere")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

# Simulated Data Generator Config
SIMULATOR_ENABLED = os.getenv("SIMULATOR_ENABLED", "true").lower() in ("true", "1", "yes")
SIMULATOR_INTERVAL_SECONDS = int(os.getenv("SIMULATOR_INTERVAL_SECONDS", "4"))
DATA_SOURCE_LABEL = "[SIMULATED TELEMETRY]"

# CORS allowed origins - strictly defined for credentialed authentication
cors_env = os.getenv("CORS_ORIGINS")
if cors_env:
    CORS_ORIGINS = [origin.strip() for origin in cors_env.split(",") if origin.strip()]
else:
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
