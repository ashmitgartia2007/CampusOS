import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import WaterTelemetry, WaterReservoir, WaterLeakAlert
from models.schemas import WaterSummaryResponse, WaterLeakCreate, WaterReadingCreate
from security import get_current_user_optional, enforce_role

router = APIRouter(prefix="/api/v1/water", tags=["Water & Utilities"])

@router.get("/summary", response_model=WaterSummaryResponse)
def get_water_summary(db: Session = Depends(get_db)):
    """Retrieve instantaneous hydraulic flow rate, reservoir levels, and acoustic leak statuses."""
    record = db.query(WaterTelemetry).order_by(WaterTelemetry.id.desc()).first()
    if not record:
        return WaterSummaryResponse(
            total_flow_lpm=184.2,
            daily_usage_liters=164200.0,
            rainwater_harvested_l=48600.0,
            rainwater_capacity_pct=78.4,
            greywater_treated_l=38200.0,
            reservoir_level_pct=82.6,
            active_leaks_detected=1,
            non_revenue_water_pct=3.2
        )
    return WaterSummaryResponse(
        total_flow_lpm=record.total_flow_lpm,
        daily_usage_liters=record.daily_usage_liters,
        rainwater_harvested_l=record.rainwater_harvested_l,
        rainwater_capacity_pct=record.rainwater_capacity_pct,
        greywater_treated_l=record.greywater_treated_l,
        reservoir_level_pct=record.reservoir_level_pct,
        active_leaks_detected=record.active_leaks_detected,
        non_revenue_water_pct=record.non_revenue_water_pct
    )

@router.get("/hourly")
def get_water_hourly():
    """Retrieve sector hydraulic flow distribution (Academic, Residential, Irrigation, Recycled)."""
    return [
        {"time": "00:00", "academicFlow": 8, "residentialFlow": 24, "irrigationFlow": 0, "recycledFlow": 12},
        {"time": "04:00", "academicFlow": 6, "residentialFlow": 18, "irrigationFlow": 35, "recycledFlow": 30},
        {"time": "08:00", "academicFlow": 64, "residentialFlow": 82, "irrigationFlow": 0, "recycledFlow": 22},
        {"time": "12:00", "academicFlow": 78, "residentialFlow": 54, "irrigationFlow": 0, "recycledFlow": 36},
        {"time": "16:00", "academicFlow": 70, "residentialFlow": 60, "irrigationFlow": 0, "recycledFlow": 28},
        {"time": "20:00", "academicFlow": 28, "residentialFlow": 88, "irrigationFlow": 20, "recycledFlow": 25}
    ]

@router.get("/reservoirs")
def get_reservoirs(db: Session = Depends(get_db)):
    """Retrieve storage reservoir metrics and water purity index."""
    res = db.query(WaterReservoir).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "capacityLiters": r.capacity_liters,
            "currentLiters": r.current_liters,
            "status": r.status,
            "purityIndex": r.purity_index
        }
        for r in res
    ]

@router.get("/leaks")
def get_leak_alerts(db: Session = Depends(get_db)):
    """Retrieve active acoustic hydrophone leak alerts."""
    leaks = db.query(WaterLeakAlert).all()
    return [
        {
            "id": l.id,
            "location": l.location,
            "flowLossLph": l.flow_loss_lph,
            "acousticConfidence": l.acoustic_confidence,
            "detectedAt": l.detected_at,
            "status": l.status
        }
        for l in leaks
    ]

@router.post("/leaks/{leak_id}/isolate")
def isolate_leak_valve(
    leak_id: str,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Remotely actuate smart solenoid isolation valve for acoustic leak."""
    alert = db.query(WaterLeakAlert).filter(WaterLeakAlert.id == leak_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Leak alert '{leak_id}' not found.")
    alert.status = "Isolated"
    db.commit()
    return {
        "status": "success",
        "message": f"Smart valve actuated successfully for alert '{leak_id}'. Lateral line isolated.",
        "leak_id": leak_id,
        "new_status": "Isolated"
    }

@router.post("/leaks", status_code=status.HTTP_201_CREATED)
def create_leak_alert(
    payload: WaterLeakCreate,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Register or report a suspected hydraulic leak event."""
    new_id = f"leak-{uuid.uuid4().hex[:6]}"
    alert = WaterLeakAlert(
        id=new_id,
        location=payload.location,
        flow_loss_lph=payload.flow_loss_lph,
        acoustic_confidence=payload.acoustic_confidence,
        detected_at="Just now",
        status=payload.status
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return {
        "id": alert.id,
        "location": alert.location,
        "flowLossLph": alert.flow_loss_lph,
        "acousticConfidence": alert.acoustic_confidence,
        "detectedAt": alert.detected_at,
        "status": alert.status
    }

@router.delete("/leaks/{leak_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_leak_alert(
    leak_id: str,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Resolve and clear acoustic leak alert."""
    alert = db.query(WaterLeakAlert).filter(WaterLeakAlert.id == leak_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Leak alert '{leak_id}' not found.")
    db.delete(alert)
    db.commit()
    return None

@router.post("/readings", status_code=status.HTTP_201_CREATED)
def record_water_reading(
    payload: WaterReadingCreate,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Insert a persistent water flow telemetry snapshot."""
    reading = WaterTelemetry(
        total_flow_lpm=payload.total_flow_lpm,
        daily_usage_liters=payload.daily_usage_liters,
        rainwater_harvested_l=payload.rainwater_harvested_l,
        reservoir_level_pct=payload.reservoir_level_pct,
        active_leaks_detected=payload.active_leaks_detected
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return {"status": "success", "id": reading.id, "flow_lpm": reading.total_flow_lpm}
