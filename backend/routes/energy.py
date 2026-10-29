from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import EnergyTelemetry
from models.schemas import EnergySummaryResponse, EnergyReadingCreate
from security import get_current_user_optional, enforce_role

router = APIRouter(prefix="/api/v1/energy", tags=["Energy & Microgrid"])

@router.get("/summary", response_model=EnergySummaryResponse)
def get_energy_summary(db: Session = Depends(get_db)):
    """Retrieve instantaneous microgrid balance (Demand, Solar PV, BESS, Grid Net)."""
    record = db.query(EnergyTelemetry).order_by(EnergyTelemetry.id.desc()).first()
    if not record:
        return EnergySummaryResponse(
            realtime_demand_kw=1428.5,
            solar_pv_kw=485.0,
            bess_storage_kw=120.0,
            bess_soc_pct=84.5,
            grid_import_kw=823.5,
            power_factor=0.98,
            daily_consumption_kwh=24680.0,
            estimated_cost_today_usd=3120.50,
            peak_demand_threshold_kw=1750.0,
            carbon_avoided_kg=1820.4
        )
    return EnergySummaryResponse(
        realtime_demand_kw=record.realtime_demand_kw,
        solar_pv_kw=record.solar_pv_kw,
        bess_storage_kw=record.bess_storage_kw,
        bess_soc_pct=record.bess_soc_pct,
        grid_import_kw=record.grid_import_kw,
        power_factor=record.power_factor,
        daily_consumption_kwh=record.daily_consumption_kwh,
        estimated_cost_today_usd=record.estimated_cost_today_usd,
        peak_demand_threshold_kw=record.peak_demand_threshold_kw,
        carbon_avoided_kg=record.carbon_avoided_kg
    )

@router.get("/hourly")
def get_energy_hourly_trend():
    """Retrieve 24-hour electrical demand vs solar generation profile."""
    return [
        {"time": "00:00", "actualKw": 680, "baselineKw": 720, "solarKw": 0, "predictedKw": 675},
        {"time": "03:00", "actualKw": 620, "baselineKw": 650, "solarKw": 0, "predictedKw": 615},
        {"time": "06:00", "actualKw": 790, "baselineKw": 830, "solarKw": 45, "predictedKw": 780},
        {"time": "09:00", "actualKw": 1350, "baselineKw": 1420, "solarKw": 310, "predictedKw": 1340},
        {"time": "12:00", "actualKw": 1680, "baselineKw": 1750, "solarKw": 495, "predictedKw": 1660},
        {"time": "15:00", "actualKw": 1520, "baselineKw": 1600, "solarKw": 410, "predictedKw": 1540},
        {"time": "18:00", "actualKw": 1180, "baselineKw": 1240, "solarKw": 110, "predictedKw": 1190},
        {"time": "21:00", "actualKw": 890, "baselineKw": 940, "solarKw": 0, "predictedKw": 885}
    ]

@router.get("/breakdown")
def get_energy_submetering_breakdown():
    """Retrieve consumption breakdown by major facility subsystems."""
    return [
        {"name": "HVAC & Chillers", "value": 44, "kw": 628.5, "color": "#38bdf8"},
        {"name": "Computing & Labs", "value": 26, "kw": 371.4, "color": "#818cf8"},
        {"name": "Interior & Exterior Lighting", "value": 14, "kw": 200.0, "color": "#f59e0b"},
        {"name": "Dining, Kitchens & Pumps", "value": 16, "kw": 228.6, "color": "#10b981"}
    ]

@router.get("/zones")
def get_zone_energy_balances():
    """Retrieve quarterly consumption vs allocated energy budget by zone."""
    return [
        {"zone": "North Tech Quad", "currentKw": 788.2, "budgetKw": 850.0, "efficiencyScore": 92},
        {"zone": "Central Arts & Science", "currentKw": 416.9, "budgetKw": 460.0, "efficiencyScore": 89},
        {"zone": "South Residential", "currentKw": 135.2, "budgetKw": 150.0, "efficiencyScore": 94},
        {"zone": "East Athletics & Utilities", "currentKw": 88.2, "budgetKw": 95.0, "efficiencyScore": 87}
    ]

@router.post("/readings", status_code=status.HTTP_201_CREATED)
def record_energy_reading(
    payload: EnergyReadingCreate,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Insert persistent electrical meter snapshot."""
    rec = EnergyTelemetry(
        realtime_demand_kw=payload.realtime_demand_kw,
        solar_pv_kw=payload.solar_pv_kw,
        bess_storage_kw=payload.bess_storage_kw,
        bess_soc_pct=payload.bess_soc_pct,
        grid_import_kw=payload.grid_import_kw,
        power_factor=payload.power_factor,
        daily_consumption_kwh=payload.daily_consumption_kwh,
        estimated_cost_today_usd=payload.estimated_cost_today_usd,
        carbon_avoided_kg=payload.carbon_avoided_kg
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {"status": "success", "id": rec.id, "realtime_demand_kw": rec.realtime_demand_kw}

@router.get("/readings")
def get_energy_readings(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Retrieve logged microgrid telemetry records."""
    records = db.query(EnergyTelemetry).order_by(EnergyTelemetry.id.desc()).limit(limit).all()
    return [
        {
            "id": r.id,
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            "demandKw": r.realtime_demand_kw,
            "solarKw": r.solar_pv_kw,
            "gridImportKw": r.grid_import_kw,
            "bessSocPct": r.bess_soc_pct
        }
        for r in records
    ]
