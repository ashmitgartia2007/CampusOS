from typing import List, Dict, Any
from fastapi import APIRouter
from ml.model_service import campus_ml_service
from models.schemas import (
    LoadPredictionRequest,
    LoadPredictionResponse,
    AnomalyDetectionRequest,
    AnomalyDetectionResponse
)

router = APIRouter(prefix="/api/v1/analytics", tags=["AI Analytics & ML Models"])

@router.post("/predict-load", response_model=LoadPredictionResponse)
def predict_load(payload: LoadPredictionRequest):
    """
    Run genuine Scikit-learn HistGradientBoostingRegressor inference to project 
    electrical demand, solar generation, and cost under simulated environmental stress.
    """
    res = campus_ml_service.predict_load(
        ambient_temp_delta_c=payload.ambient_temp_delta_c,
        campus_occupancy_pct=payload.campus_occupancy_pct,
        solar_cloud_cover_pct=payload.solar_cloud_cover_pct,
        hvac_eco_override=payload.hvac_eco_override
    )
    return LoadPredictionResponse(**res)

@router.post("/detect-anomalies", response_model=AnomalyDetectionResponse)
def detect_anomalies(payload: AnomalyDetectionRequest):
    """
    Evaluate telemetry readings with IsolationForest model and compare against
    a classical statistical threshold baseline (mean +/- 2.5 sigma).
    """
    res = campus_ml_service.detect_anomalies(payload.subsystem, payload.readings)
    return AnomalyDetectionResponse(**res)

@router.get("/models")
def get_model_registry():
    """Retrieve versioned Scikit-learn models and cross-validated accuracy metrics."""
    return campus_ml_service.get_registered_models()

@router.get("/metrics")
def get_model_metrics():
    """Retrieve raw JSON metrics for trained forecaster and anomaly models."""
    return {
        "forecaster": campus_ml_service.forecaster_metrics,
        "anomaly_detector": campus_ml_service.anomaly_metrics
    }

@router.get("/benchmark")
def get_benchmark():
    """Retrieve empirical benchmark comparing IsolationForest vs Statistical 2.5-sigma baseline."""
    anom_metrics = campus_ml_service.anomaly_metrics
    return {
        "isolation_forest": anom_metrics.get("ml_isolation_forest", {}),
        "statistical_threshold": anom_metrics.get("threshold_baseline", {}),
        "summary": anom_metrics.get("comparison_summary", ""),
        "forecaster": campus_ml_service.forecaster_metrics
    }
