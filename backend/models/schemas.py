from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# ----------------- Auth Schemas -----------------
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "viewer"

# ----------------- Building Schemas -----------------
class BuildingBase(BaseModel):
    code: str
    name: str
    category: str
    floors: int = 1
    gross_area_sqft: int = 50000
    current_occupancy: int = 0
    max_capacity: int = 100
    energy_usage_kw: float = 0.0
    water_draw_lpm: float = 0.0
    indoor_temp_c: float = 22.0
    co2_ppm: int = 600
    aqi: int = 35
    energy_star_score: int = 85
    status: str = "optimal"
    zone: str
    hvac_status: str = "Optimized"

class BuildingCreate(BuildingBase):
    pass

class BuildingUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    floors: Optional[int] = None
    gross_area_sqft: Optional[int] = None
    current_occupancy: Optional[int] = None
    max_capacity: Optional[int] = None
    energy_usage_kw: Optional[float] = None
    water_draw_lpm: Optional[float] = None
    indoor_temp_c: Optional[float] = None
    co2_ppm: Optional[int] = None
    aqi: Optional[int] = None
    energy_star_score: Optional[int] = None
    status: Optional[str] = None
    zone: Optional[str] = None
    hvac_status: Optional[str] = None

class BuildingResponse(BuildingBase):
    id: str
    critical_alerts: int = 0

# ----------------- Room Schemas -----------------
class RoomBase(BaseModel):
    building_id: str
    building_name: str
    room_number: str
    name: str
    type: str
    floor: int = 1
    capacity: int = 30
    current_occupancy: int = 0
    temperature_c: float = 22.0
    target_temp_c: float = 22.0
    humidity_pct: float = 45.0
    co2_ppm: int = 600
    lux_level: int = 400
    lighting_state: bool = True
    hvac_mode: str = "Comfort"
    schedule_status: str = "Available"
    active_event: Optional[str] = None
    air_quality_status: str = "Good"

class RoomCreate(RoomBase):
    pass

class RoomControlPatch(BaseModel):
    target_temp_c: Optional[float] = None
    lighting_state: Optional[bool] = None
    hvac_mode: Optional[str] = None

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    floor: Optional[int] = None
    capacity: Optional[int] = None
    target_temp_c: Optional[float] = None
    lighting_state: Optional[bool] = None
    hvac_mode: Optional[str] = None
    schedule_status: Optional[str] = None
    air_quality_status: Optional[str] = None

class RoomResponse(RoomBase):
    id: str

# ----------------- Maintenance Schemas -----------------
class MaintenanceOrderCreate(BaseModel):
    title: str
    asset_id: str
    asset_name: str
    building: str
    floor: str = "1"
    severity: str = "P3-Normal"
    category: str = "HVAC"
    assigned_to: str
    notes: Optional[str] = ""
    due_date: Optional[str] = "Tomorrow"

class MaintenanceOrderStatusPatch(BaseModel):
    status: str

class MaintenanceOrderResponse(MaintenanceOrderCreate):
    id: str
    ticket_number: str
    status: str
    is_predictive: bool = False
    rul_days: Optional[int] = None
    failure_risk_pct: Optional[int] = None
    created_at: str

# ----------------- Telemetry Schemas -----------------
class EnergySummaryResponse(BaseModel):
    realtime_demand_kw: float
    solar_pv_kw: float
    bess_storage_kw: float
    bess_soc_pct: float
    grid_import_kw: float
    power_factor: float
    daily_consumption_kwh: float
    estimated_cost_today_usd: float
    peak_demand_threshold_kw: float
    carbon_avoided_kg: float

class EnergyReadingCreate(BaseModel):
    realtime_demand_kw: float
    solar_pv_kw: float = 0.0
    bess_storage_kw: float = 0.0
    bess_soc_pct: float = 80.0
    grid_import_kw: float = 0.0
    power_factor: float = 0.98
    daily_consumption_kwh: float = 0.0
    estimated_cost_today_usd: float = 0.0
    carbon_avoided_kg: float = 0.0

class WaterSummaryResponse(BaseModel):
    total_flow_lpm: float
    daily_usage_liters: float
    rainwater_harvested_l: float
    rainwater_capacity_pct: float
    greywater_treated_l: float
    reservoir_level_pct: float
    active_leaks_detected: int
    non_revenue_water_pct: float

class WaterLeakCreate(BaseModel):
    location: str
    flow_loss_lph: float = 120.0
    acoustic_confidence: float = 0.92
    status: str = "Investigating"

class WaterReadingCreate(BaseModel):
    total_flow_lpm: float
    daily_usage_liters: float = 150000.0
    rainwater_harvested_l: float = 40000.0
    reservoir_level_pct: float = 80.0
    active_leaks_detected: int = 0

class WasteSummaryResponse(BaseModel):
    total_bins: int
    bins_requiring_pickup: int
    avg_fill_pct: float
    monthly_diversion_rate_pct: float
    compost_diverted_kg: float
    recycling_kg: float
    landfill_kg: float
    e_waste_recycled_kg: float

class WasteClusterCreate(BaseModel):
    location: str
    zone: str
    compost_fill_pct: int = 50
    recycling_fill_pct: int = 50
    landfill_fill_pct: int = 50
    status: str = "Normal"

class EnvironmentSummaryResponse(BaseModel):
    campus_aqi: int
    primary_pollutant: str
    ambient_temp_c: float
    humidity_pct: float
    wind_speed_kmh: float
    uv_index: float
    noise_level_db: float
    solar_irradiance_wm2: float

class EnvironmentNodeCreate(BaseModel):
    name: str
    zone: str
    aqi: int = 35
    pm25: float = 8.5
    pm10: float = 18.0
    co2: int = 450
    temp: float = 22.5
    humidity: float = 46.0
    noise_db: float = 42.0
    status: str = "Healthy"

class EnvironmentNodeUpdate(BaseModel):
    name: Optional[str] = None
    zone: Optional[str] = None
    aqi: Optional[int] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    co2: Optional[int] = None
    temp: Optional[float] = None
    humidity: Optional[float] = None
    noise_db: Optional[float] = None
    status: Optional[str] = None

# ----------------- Notification Schemas -----------------
class NotificationCreate(BaseModel):
    title: str
    description: str
    severity: str = "info"
    category: str = "Energy"
    action_url: Optional[str] = None

class NotificationResponse(NotificationCreate):
    id: str
    timestamp: str
    is_read: bool

# ----------------- Report Schemas -----------------
class ReportGenerateRequest(BaseModel):
    report_type: str
    date_range: str
    format: str = "pdf" # pdf, csv, json

class ReportResponse(BaseModel):
    id: str
    title: str
    report_type: str
    date_range: str
    format: str
    status: str
    generated_by: str
    file_url: Optional[str] = None
    created_at: datetime

# ----------------- ML Analytics Schemas -----------------
class LoadPredictionRequest(BaseModel):
    ambient_temp_delta_c: float = Field(0.0, description="Offset from nominal 22C")
    campus_occupancy_pct: float = Field(76.5, description="Campus population capacity percentage")
    solar_cloud_cover_pct: float = Field(15.0, description="Cloud cover percentage (0-100)")
    hvac_eco_override: bool = Field(False, description="Setback HVAC setpoints by +1.5C")

class LoadPredictionResponse(BaseModel):
    baseline_kw: float
    projected_demand_kw: float
    solar_generated_kw: float
    grid_net_draw_kw: float
    cost_impact_usd_per_hour: float
    peak_threshold_risk: bool
    confidence_interval: List[float]
    model_version: str
    algorithm: str

class AnomalyDetectionRequest(BaseModel):
    subsystem: str = Field("energy", description="'energy' or 'water'")
    readings: List[float] = Field(..., description="Telemetry values to score")

class AnomalyDetectionResponse(BaseModel):
    subsystem: str
    total_evaluated: int
    anomalies_detected: int
    anomaly_indices: List[int]
    anomaly_scores: List[float]
    detection_method: str
    threshold_comparison: Dict[str, Any]

class ModelMetadataResponse(BaseModel):
    id: str
    name: str
    version: str
    framework: str
    algorithm: str
    target_task: str
    last_trained: str
    metrics: Dict[str, Any]
    status: str
    dataset_samples: int
    features_count: int

class SystemSettingsSchema(BaseModel):
    campus_name: str
    fast_api_backend_url: str
    postgres_db_url: str
    websocket_telemetry_url: str
    simulated_data_fallback: bool
    max_peak_demand_kw: int
    co2_warning_threshold_ppm: int
    water_leak_threshold_lph: int
    auto_hvac_eco_setback: bool
    email_alerts_enabled: bool
    sms_emergency_enabled: bool
    active_theme: str
