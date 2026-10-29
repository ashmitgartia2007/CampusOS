from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    Text,
    ForeignKey
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default="viewer", nullable=False) # admin, operator, viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Building(Base):
    __tablename__ = "buildings"

    id = Column(String(50), primary_key=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    floors = Column(Integer, default=1)
    gross_area_sqft = Column(Integer, default=50000)
    current_occupancy = Column(Integer, default=0)
    max_capacity = Column(Integer, default=100)
    energy_usage_kw = Column(Float, default=0.0)
    water_draw_lpm = Column(Float, default=0.0)
    indoor_temp_c = Column(Float, default=22.0)
    co2_ppm = Column(Integer, default=600)
    aqi = Column(Integer, default=35)
    energy_star_score = Column(Integer, default=85)
    status = Column(String(20), default="optimal") # optimal, warning, alert, offline
    zone = Column(String(80), nullable=False)
    critical_alerts = Column(Integer, default=0)
    hvac_status = Column(String(30), default="Optimized")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    rooms = relationship("Room", back_populates="building", cascade="all, delete-orphan")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(String(50), primary_key=True)
    building_id = Column(String(50), ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    building_name = Column(String(150), nullable=False)
    room_number = Column(String(30), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    type = Column(String(50), nullable=False)
    floor = Column(Integer, default=1)
    capacity = Column(Integer, default=30)
    current_occupancy = Column(Integer, default=0)
    temperature_c = Column(Float, default=22.0)
    target_temp_c = Column(Float, default=22.0)
    humidity_pct = Column(Float, default=45.0)
    co2_ppm = Column(Integer, default=600)
    lux_level = Column(Integer, default=400)
    lighting_state = Column(Boolean, default=True)
    hvac_mode = Column(String(20), default="Comfort") # Eco, Comfort, Boost, Off
    schedule_status = Column(String(80), default="Available")
    active_event = Column(String(150), nullable=True)
    air_quality_status = Column(String(30), default="Good")

    building = relationship("Building", back_populates="rooms")

class MaintenanceOrder(Base):
    __tablename__ = "maintenance_orders"

    id = Column(String(50), primary_key=True)
    ticket_number = Column(String(30), unique=True, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    asset_id = Column(String(50), nullable=False)
    asset_name = Column(String(150), nullable=False)
    building = Column(String(150), nullable=False)
    floor = Column(String(50), default="1")
    severity = Column(String(20), default="P3-Normal") # P1-Critical, P2-High, P3-Normal, P4-Low
    category = Column(String(50), default="HVAC")
    assigned_to = Column(String(100), nullable=False)
    status = Column(String(30), default="Open") # Open, In Progress, Scheduled, Resolved
    is_predictive = Column(Boolean, default=False)
    rul_days = Column(Integer, nullable=True)
    failure_risk_pct = Column(Integer, nullable=True)
    notes = Column(Text, default="")
    created_at = Column(String(50), default="Just now")
    due_date = Column(String(50), default="Tomorrow")

class EnergyTelemetry(Base):
    __tablename__ = "energy_telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    realtime_demand_kw = Column(Float, default=1428.5)
    solar_pv_kw = Column(Float, default=485.0)
    bess_storage_kw = Column(Float, default=120.0)
    bess_soc_pct = Column(Float, default=84.5)
    grid_import_kw = Column(Float, default=823.5)
    power_factor = Column(Float, default=0.98)
    daily_consumption_kwh = Column(Float, default=24680.0)
    estimated_cost_today_usd = Column(Float, default=3120.5)
    peak_demand_threshold_kw = Column(Float, default=1750.0)
    carbon_avoided_kg = Column(Float, default=1820.4)

class WaterTelemetry(Base):
    __tablename__ = "water_telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    total_flow_lpm = Column(Float, default=184.2)
    daily_usage_liters = Column(Float, default=164200.0)
    rainwater_harvested_l = Column(Float, default=48600.0)
    rainwater_capacity_pct = Column(Float, default=78.4)
    greywater_treated_l = Column(Float, default=38200.0)
    reservoir_level_pct = Column(Float, default=82.6)
    active_leaks_detected = Column(Integer, default=1)
    non_revenue_water_pct = Column(Float, default=3.2)

class WaterReservoir(Base):
    __tablename__ = "water_reservoirs"

    id = Column(String(50), primary_key=True)
    name = Column(String(150), nullable=False)
    capacity_liters = Column(Integer, nullable=False)
    current_liters = Column(Integer, nullable=False)
    status = Column(String(30), default="Normal")
    purity_index = Column(Float, default=95.0)

class WaterLeakAlert(Base):
    __tablename__ = "water_leak_alerts"

    id = Column(String(50), primary_key=True)
    location = Column(String(200), nullable=False)
    flow_loss_lph = Column(Float, default=145.0)
    acoustic_confidence = Column(Float, default=0.94)
    detected_at = Column(String(50), default="Just now")
    status = Column(String(30), default="Investigating") # Investigating, Dispatched, Isolated

class WasteCluster(Base):
    __tablename__ = "waste_clusters"

    id = Column(String(50), primary_key=True)
    location = Column(String(150), nullable=False)
    zone = Column(String(100), nullable=False)
    compost_fill_pct = Column(Integer, default=50)
    recycling_fill_pct = Column(Integer, default=60)
    landfill_fill_pct = Column(Integer, default=45)
    last_emptied = Column(String(50), default="3 hours ago")
    status = Column(String(30), default="Normal") # Normal, Attention, Overflow Risk

class EnvironmentNode(Base):
    __tablename__ = "environment_nodes"

    id = Column(String(50), primary_key=True)
    name = Column(String(150), nullable=False)
    zone = Column(String(100), nullable=False)
    aqi = Column(Integer, default=35)
    pm25 = Column(Float, default=8.0)
    pm10 = Column(Float, default=18.0)
    co2 = Column(Integer, default=450)
    temp = Column(Float, default=22.5)
    humidity = Column(Float, default=46.0)
    noise_db = Column(Float, default=42.0)
    status = Column(String(30), default="Healthy")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(50), primary_key=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    timestamp = Column(String(50), default="Just now")
    severity = Column(String(20), default="info") # critical, warning, success, info
    category = Column(String(50), default="Energy")
    is_read = Column(Boolean, default=False)
    action_url = Column(String(100), nullable=True)

class ReportRecord(Base):
    __tablename__ = "report_records"

    id = Column(String(50), primary_key=True)
    title = Column(String(200), nullable=False)
    report_type = Column(String(100), nullable=False)
    date_range = Column(String(100), nullable=False)
    format = Column(String(20), default="pdf") # pdf, csv, json
    status = Column(String(30), default="Ready")
    generated_by = Column(String(100), default="System")
    file_url = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, autoincrement=True)
    campus_name = Column(String(200), default="Metropolitan University of Technology & Innovation")
    iot_gateway_status = Column(String(30), default="Connected")
    fast_api_backend_url = Column(String(200), default="http://localhost:8000/api/v1")
    postgres_db_url = Column(String(200), default="postgresql://campus_admin:***@localhost:5432/campusos_db")
    websocket_telemetry_url = Column(String(200), default="ws://localhost:8000/ws/telemetry")
    simulated_data_fallback = Column(Boolean, default=True)
    max_peak_demand_kw = Column(Integer, default=1750)
    co2_warning_threshold_ppm = Column(Integer, default=1000)
    water_leak_threshold_lph = Column(Integer, default=100)
    auto_hvac_eco_setback = Column(Boolean, default=True)
    email_alerts_enabled = Column(Boolean, default=True)
    sms_emergency_enabled = Column(Boolean, default=True)
    active_theme = Column(String(20), default="dark")
