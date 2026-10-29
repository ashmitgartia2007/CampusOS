# CampusOS AI — Python FastAPI Backend & Scikit-learn ML Pipelines

The backend service for **CampusOS AI** handles real-time IoT telemetry ingestion, WebSocket broadcasting, PostgreSQL persistence, and Scikit-learn machine learning inference for predictive building maintenance and electrical load forecasting.

---

## Architecture Overview

```
backend/
├── main.py                    # FastAPI application with REST & WebSocket endpoints
├── database.py                # SQLAlchemy engine with PostgreSQL / SQLite support
├── requirements.txt           # Python packages
├── models/
│   └── schemas.py             # Pydantic schemas for telemetry, buildings, work orders
└── ml/
    └── train_load_forecaster.py  # Scikit-learn ML training & evaluation script
```

---

## Quickstart

### 1. Create Virtual Environment & Install Dependencies

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Train the Scikit-learn Load Forecaster Model

Train the `HistGradientBoostingRegressor` model on 8,760 hours of campus timeseries telemetry:

```bash
python ml/train_load_forecaster.py
```

This evaluates RMSE, MAE, and R² scores, and generates `ml/load_forecaster.joblib`.

### 3. Launch FastAPI Server

```bash
uvicorn main:app --reload --port 8000
```

- **Interactive API Docs (Swagger UI)**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/v1/health`
- **Real-time Telemetry WebSocket**: `ws://localhost:8000/ws/telemetry`

---

## PostgreSQL Database Configuration (Optional)

By default, CampusOS will seamlessly connect to an active PostgreSQL database specified in `DATABASE_URL`, or fall back to local storage if PostgreSQL is not running.

To use PostgreSQL:
```bash
export DATABASE_URL="postgresql://campus_admin:your_password@localhost:5432/campusos_db"
```
