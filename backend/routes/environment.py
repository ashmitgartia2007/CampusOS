import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import EnvironmentNode
from models.schemas import (
    EnvironmentSummaryResponse,
    EnvironmentNodeCreate,
    EnvironmentNodeUpdate
)
from security import get_current_user_optional, enforce_role

router = APIRouter(prefix="/api/v1/environment", tags=["Environment & AQI"])

@router.get("/summary", response_model=EnvironmentSummaryResponse)
def get_environment_summary():
    """Retrieve campus macro-environment metrics (AQI, PM2.5, Solar Irradiance, Noise dB)."""
    return EnvironmentSummaryResponse(
        campus_aqi=38,
        primary_pollutant="PM2.5 (9.2 µg/m³)",
        ambient_temp_c=23.4,
        humidity_pct=48.0,
        wind_speed_kmh=14.5,
        uv_index=5.2,
        noise_level_db=46.8,
        solar_irradiance_wm2=685.0
    )

@router.get("/sensors")
def get_environment_sensors(db: Session = Depends(get_db)):
    """Retrieve EPA NAAQS microclimate nodes stationed across campus."""
    nodes = db.query(EnvironmentNode).all()
    return [
        {
            "id": n.id,
            "name": n.name,
            "zone": n.zone,
            "aqi": n.aqi,
            "pm25": n.pm25,
            "pm10": n.pm10,
            "co2": n.co2,
            "temp": n.temp,
            "humidity": n.humidity,
            "noiseDb": n.noise_db,
            "status": n.status
        }
        for n in nodes
    ]

@router.get("/history")
def get_environment_aqi_history():
    """Retrieve 24-hour AQI history across campus quadrants."""
    return [
        {"time": "00:00", "northQuad": 28, "centralPlaza": 32, "botanicalGarden": 20, "parkingEast": 38},
        {"time": "04:00", "northQuad": 25, "centralPlaza": 28, "botanicalGarden": 18, "parkingEast": 34},
        {"time": "08:00", "northQuad": 36, "centralPlaza": 46, "botanicalGarden": 24, "parkingEast": 68},
        {"time": "12:00", "northQuad": 34, "centralPlaza": 44, "botanicalGarden": 22, "parkingEast": 58},
        {"time": "16:00", "northQuad": 38, "centralPlaza": 48, "botanicalGarden": 26, "parkingEast": 64},
        {"time": "20:00", "northQuad": 30, "centralPlaza": 36, "botanicalGarden": 21, "parkingEast": 46}
    ]

@router.post("/sensors", status_code=status.HTTP_201_CREATED)
def create_environment_sensor(
    payload: EnvironmentNodeCreate,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Deploy and register a new EPA NAAQS microclimate sensor node."""
    new_id = f"env-{uuid.uuid4().hex[:6]}"
    node = EnvironmentNode(
        id=new_id,
        **payload.model_dump()
    )
    db.add(node)
    db.commit()
    db.refresh(node)
    return {
        "id": node.id,
        "name": node.name,
        "zone": node.zone,
        "aqi": node.aqi,
        "pm25": node.pm25,
        "pm10": node.pm10,
        "co2": node.co2,
        "temp": node.temp,
        "humidity": node.humidity,
        "noiseDb": node.noise_db,
        "status": node.status
    }

@router.put("/sensors/{sensor_id}")
def update_environment_sensor(
    sensor_id: str,
    payload: EnvironmentNodeUpdate,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Calibrate or update telemetry metrics on an environmental node."""
    node = db.query(EnvironmentNode).filter(EnvironmentNode.id == sensor_id).first()
    if not node:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Sensor node '{sensor_id}' not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(node, key, value)

    db.commit()
    db.refresh(node)
    return {
        "id": node.id,
        "name": node.name,
        "zone": node.zone,
        "aqi": node.aqi,
        "pm25": node.pm25,
        "pm10": node.pm10,
        "co2": node.co2,
        "temp": node.temp,
        "humidity": node.humidity,
        "noiseDb": node.noise_db,
        "status": node.status
    }

@router.delete("/sensors/{sensor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_environment_sensor(
    sensor_id: str,
    current_user: Optional[dict] = Depends(enforce_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Decommission an environmental sensor node."""
    node = db.query(EnvironmentNode).filter(EnvironmentNode.id == sensor_id).first()
    if not node:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Sensor node '{sensor_id}' not found.")

    db.delete(node)
    db.commit()
    return None
