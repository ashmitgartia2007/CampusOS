from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import SystemConfig
from models.schemas import SystemSettingsSchema
from security import enforce_role

router = APIRouter(prefix="/api/v1/settings", tags=["Settings & Configuration"])

@router.get("", response_model=SystemSettingsSchema)
def get_settings(db: Session = Depends(get_db)):
    """Retrieve current campus system settings, alarm thresholds, and API URLs."""
    config = db.query(SystemConfig).first()
    if not config:
        return SystemSettingsSchema(
            campus_name="Metropolitan University of Technology & Innovation",
            fast_api_backend_url="http://localhost:8000/api/v1",
            postgres_db_url="postgresql://campus_admin:***@localhost:5432/campusos_db",
            websocket_telemetry_url="ws://localhost:8000/ws/telemetry",
            simulated_data_fallback=True,
            max_peak_demand_kw=1750,
            co2_warning_threshold_ppm=1000,
            water_leak_threshold_lph=100,
            auto_hvac_eco_setback=True,
            email_alerts_enabled=True,
            sms_emergency_enabled=True,
            active_theme="dark"
        )
    return SystemSettingsSchema(
        campus_name=config.campus_name,
        fast_api_backend_url=config.fast_api_backend_url,
        postgres_db_url=config.postgres_db_url,
        websocket_telemetry_url=config.websocket_telemetry_url,
        simulated_data_fallback=config.simulated_data_fallback,
        max_peak_demand_kw=config.max_peak_demand_kw,
        co2_warning_threshold_ppm=config.co2_warning_threshold_ppm,
        water_leak_threshold_lph=config.water_leak_threshold_lph,
        auto_hvac_eco_setback=config.auto_hvac_eco_setback,
        email_alerts_enabled=config.email_alerts_enabled,
        sms_emergency_enabled=config.sms_emergency_enabled,
        active_theme=config.active_theme
    )

@router.put("", response_model=SystemSettingsSchema)
def update_settings(
    payload: SystemSettingsSchema,
    current_user: dict = Depends(enforce_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Update system parameters and alarm thresholds (Admin only)."""
    config = db.query(SystemConfig).first()
    if not config:
        config = SystemConfig(**payload.model_dump())
        db.add(config)
    else:
        for key, value in payload.model_dump().items():
            setattr(config, key, value)
    db.commit()
    db.refresh(config)
    return payload
