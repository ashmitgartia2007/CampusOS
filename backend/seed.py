"""
CampusOS AI - Database Seeding Script
Populates initial campus entities, default RBAC user accounts, and telemetry benchmarks.
All synthetic telemetry values are explicitly marked as [SIMULATED DATA].
"""

import sys
import os
from sqlalchemy.orm import Session
from database import SessionLocal, init_db
from models.db_models import (
    User,
    Building,
    Room,
    MaintenanceOrder,
    EnergyTelemetry,
    WaterTelemetry,
    WaterReservoir,
    WaterLeakAlert,
    WasteCluster,
    EnvironmentNode,
    Notification,
    ReportRecord,
    SystemConfig
)
from security import hash_password

def seed_database():
    print(">>> Initializing database schema...")
    init_db()
    db: Session = SessionLocal()

    try:
        # 1. Seed Users (Admin, Operator, Viewer)
        if db.query(User).count() == 0:
            print("Seeding initial RBAC user accounts...")
            users = [
                User(
                    id="usr-admin",
                    email="admin@campusos.ai",
                    password_hash=hash_password("CampusOS@2026!"),
                    full_name="Dr. Evelyn Reed",
                    role="admin",
                    is_active=True
                ),
                User(
                    id="usr-operator",
                    email="operator@campusos.ai",
                    password_hash=hash_password("Operator@2026!"),
                    full_name="Carlos Vance",
                    role="operator",
                    is_active=True
                ),
                User(
                    id="usr-dean",
                    email="dean@campusos.ai",
                    password_hash=hash_password("Dean@2026!"),
                    full_name="Dean Arthur Sterling",
                    role="viewer",
                    is_active=True
                ),
            ]
            db.add_all(users)
            db.commit()
            print("✓ Seeded 3 default users (admin, operator, viewer).")

        # 2. Seed Buildings
        if db.query(Building).count() == 0:
            print("Seeding campus facilities...")
            buildings = [
                Building(
                    id="b-eng",
                    name="Ada Lovelace Engineering Complex",
                    code="ENG-A",
                    category="Academic",
                    floors=5,
                    gross_area_sqft=185000,
                    current_occupancy=1840,
                    max_capacity=2400,
                    energy_usage_kw=412.8,
                    water_draw_lpm=46.2,
                    indoor_temp_c=22.4,
                    co2_ppm=680,
                    aqi=32,
                    energy_star_score=91,
                    status="optimal",
                    zone="North Tech Quad",
                    critical_alerts=0,
                    hvac_status="Optimized"
                ),
                Building(
                    id="b-sci",
                    name="Curie Science & Biotechnology Wing",
                    code="SCI-B",
                    category="Research",
                    floors=4,
                    gross_area_sqft=142000,
                    current_occupancy=890,
                    max_capacity=1200,
                    energy_usage_kw=375.4,
                    water_draw_lpm=58.7,
                    indoor_temp_c=21.8,
                    co2_ppm=820,
                    aqi=41,
                    energy_star_score=84,
                    status="warning",
                    zone="North Tech Quad",
                    critical_alerts=1,
                    hvac_status="Cooling"
                ),
                Building(
                    id="b-lib",
                    name="Alexandria Central Library & Learning Hub",
                    code="LIB-C",
                    category="Academic",
                    floors=6,
                    gross_area_sqft=210000,
                    current_occupancy=2150,
                    max_capacity=2800,
                    energy_usage_kw=248.6,
                    water_draw_lpm=24.1,
                    indoor_temp_c=22.1,
                    co2_ppm=710,
                    aqi=29,
                    energy_star_score=94,
                    status="optimal",
                    zone="Central Arts & Science",
                    critical_alerts=0,
                    hvac_status="Optimized"
                ),
                Building(
                    id="b-stu",
                    name="Turing Student Union & Innovation Commons",
                    code="STU-D",
                    category="Student Life",
                    floors=3,
                    gross_area_sqft=98000,
                    current_occupancy=1420,
                    max_capacity=1900,
                    energy_usage_kw=168.3,
                    water_draw_lpm=38.5,
                    indoor_temp_c=23.0,
                    co2_ppm=895,
                    aqi=44,
                    energy_star_score=88,
                    status="optimal",
                    zone="Central Arts & Science",
                    critical_alerts=0,
                    hvac_status="Cooling"
                ),
                Building(
                    id="b-res-e",
                    name="Hawking East Residential Quad",
                    code="RES-E",
                    category="Residential",
                    floors=8,
                    gross_area_sqft=230000,
                    current_occupancy=1120,
                    max_capacity=1400,
                    energy_usage_kw=135.2,
                    water_draw_lpm=68.4,
                    indoor_temp_c=22.8,
                    co2_ppm=640,
                    aqi=35,
                    energy_star_score=82,
                    status="alert",
                    zone="South Residential",
                    critical_alerts=2,
                    hvac_status="Heating"
                ),
                Building(
                    id="b-adm",
                    name="Founders Administrative Tower",
                    code="ADM-F",
                    category="Administration",
                    floors=7,
                    gross_area_sqft=88000,
                    current_occupancy=480,
                    max_capacity=750,
                    energy_usage_kw=88.2,
                    water_draw_lpm=12.3,
                    indoor_temp_c=22.0,
                    co2_ppm=590,
                    aqi=28,
                    energy_star_score=96,
                    status="optimal",
                    zone="Central Arts & Science",
                    critical_alerts=0,
                    hvac_status="Optimized"
                )
            ]
            db.add_all(buildings)
            db.commit()
            print("✓ Seeded 6 campus facilities.")

        # 3. Seed Rooms
        if db.query(Room).count() == 0:
            print("Seeding rooms & laboratories...")
            rooms = [
                Room(
                    id="r-101",
                    building_id="b-eng",
                    building_name="Engineering Complex",
                    room_number="ENG-101",
                    name="Alan Turing Grand Auditorium",
                    type="Lecture Hall",
                    floor=1,
                    capacity=350,
                    current_occupancy=295,
                    temperature_c=22.1,
                    target_temp_c=22.0,
                    humidity_pct=44.0,
                    co2_ppm=840,
                    lux_level=480,
                    lighting_state=True,
                    hvac_mode="Comfort",
                    schedule_status="Occupied (Class in session)",
                    active_event="CS301: Machine Learning Systems",
                    air_quality_status="Good"
                ),
                Room(
                    id="r-204",
                    building_id="b-eng",
                    building_name="Engineering Complex",
                    room_number="ENG-204",
                    name="Autonomous Robotics Simulation Lab",
                    type="Robotics Lab",
                    floor=2,
                    capacity=40,
                    current_occupancy=32,
                    temperature_c=21.4,
                    target_temp_c=21.0,
                    humidity_pct=41.0,
                    co2_ppm=620,
                    lux_level=650,
                    lighting_state=True,
                    hvac_mode="Boost",
                    schedule_status="Occupied (Class in session)",
                    active_event="Robotics Capstone Sprint",
                    air_quality_status="Excellent"
                ),
                Room(
                    id="r-310",
                    building_id="b-eng",
                    building_name="Engineering Complex",
                    room_number="ENG-310",
                    name="Quantum Architecture Compute Cluster",
                    type="Server Room",
                    floor=3,
                    capacity=10,
                    current_occupancy=2,
                    temperature_c=19.2,
                    target_temp_c=19.0,
                    humidity_pct=38.0,
                    co2_ppm=460,
                    lux_level=220,
                    lighting_state=True,
                    hvac_mode="Boost",
                    schedule_status="Occupied (Class in session)",
                    active_event="HPC Node Maintenance",
                    air_quality_status="Excellent"
                ),
                Room(
                    id="r-sci-102",
                    building_id="b-sci",
                    building_name="Science & Biotech Wing",
                    room_number="SCI-102",
                    name="Molecular Genomics Cleanroom",
                    type="Bio-Chemistry Lab",
                    floor=1,
                    capacity=30,
                    current_occupancy=18,
                    temperature_c=20.5,
                    target_temp_c=20.5,
                    humidity_pct=45.0,
                    co2_ppm=580,
                    lux_level=550,
                    lighting_state=True,
                    hvac_mode="Comfort",
                    schedule_status="Occupied (Class in session)",
                    active_event="Bio-Informatics Postdoc Research",
                    air_quality_status="Excellent"
                ),
                Room(
                    id="r-lib-201",
                    building_id="b-lib",
                    building_name="Central Library",
                    room_number="LIB-201",
                    name="Silent Collaborative Commons",
                    type="Seminar Room",
                    floor=2,
                    capacity=120,
                    current_occupancy=88,
                    temperature_c=22.8,
                    target_temp_c=22.5,
                    humidity_pct=46.0,
                    co2_ppm=760,
                    lux_level=420,
                    lighting_state=True,
                    hvac_mode="Eco",
                    schedule_status="Available",
                    active_event="Open Quiet Study Session",
                    air_quality_status="Good"
                ),
                Room(
                    id="r-stu-305",
                    building_id="b-stu",
                    building_name="Student Union",
                    room_number="STU-305",
                    name="Student Senate Council Chamber",
                    type="Lecture Hall",
                    floor=3,
                    capacity=80,
                    current_occupancy=0,
                    temperature_c=23.5,
                    target_temp_c=24.0,
                    humidity_pct=49.0,
                    co2_ppm=490,
                    lux_level=100,
                    lighting_state=False,
                    hvac_mode="Eco",
                    schedule_status="Available",
                    active_event=None,
                    air_quality_status="Good"
                )
            ]
            db.add_all(rooms)
            db.commit()
            print("✓ Seeded 6 classrooms and research labs.")

        # 4. Seed Maintenance Orders
        if db.query(MaintenanceOrder).count() == 0:
            print("Seeding maintenance work orders...")
            orders = [
                MaintenanceOrder(
                    id="mo-8901",
                    ticket_number="WO-2026-8901",
                    title="Chiller Compressor #2 Bearing Vibration Drift",
                    asset_id="CHL-SCI-02",
                    asset_name="York YVAA 250-Ton Variable Speed Screw Chiller",
                    building="Curie Science & Biotechnology Wing",
                    floor="Roof Mechanical Plant",
                    severity="P1-Critical",
                    category="HVAC",
                    assigned_to="Carlos Vance (Lead HVAC Specialist)",
                    status="In Progress",
                    is_predictive=True,
                    rul_days=12,
                    failure_risk_pct=88,
                    notes="Scikit-learn IsolationForest model flagged harmonic 3X peak vibration exceeding ISO standards.",
                    created_at="Today, 08:30 AM",
                    due_date="Today, 04:00 PM"
                ),
                MaintenanceOrder(
                    id="mo-8902",
                    ticket_number="WO-2026-8902",
                    title="Acoustic Leak Isolation — Lateral Domestic Line B",
                    asset_id="PLM-RES-08",
                    asset_name="Main Potable Water Distribution Manifold",
                    building="Hawking East Residential Quad",
                    floor="Sub-Basement B2",
                    severity="P2-High",
                    category="Plumbing",
                    assigned_to="Sarah Lin (Hydraulic Systems Tech)",
                    status="Scheduled",
                    is_predictive=True,
                    rul_days=6,
                    failure_risk_pct=92,
                    notes="Smart flow meters detected differential loss of 145 L/hr confirmed by acoustic sensor #AC-81.",
                    created_at="Today, 09:15 AM",
                    due_date="Tomorrow, 12:00 PM"
                ),
                MaintenanceOrder(
                    id="mo-8903",
                    ticket_number="WO-2026-8903",
                    title="Cleanroom Fresh Air Damper Actuator Calibrate",
                    asset_id="AHU-SCI-04",
                    asset_name="Air Handling Unit #4 HEPA Filtration Stage",
                    building="Curie Science & Biotechnology Wing",
                    floor="Level 1 North",
                    severity="P3-Normal",
                    category="HVAC",
                    assigned_to="Dave Kroll (Building Automation)",
                    status="Open",
                    is_predictive=False,
                    notes="Damper position feedback loop has 8% offset discrepancy compared to pneumatic control signal.",
                    created_at="Yesterday, 02:40 PM",
                    due_date="Oct 31, 2026"
                )
            ]
            db.add_all(orders)
            db.commit()
            print("✓ Seeded maintenance tickets.")

        # 5. Seed Water Reservoirs & Leak
        if db.query(WaterReservoir).count() == 0:
            reservoirs = [
                WaterReservoir(
                    id="res-main",
                    name="Central Campus Deep Aquifer Storage",
                    capacity_liters=500000,
                    current_liters=415000,
                    status="Normal",
                    purity_index=98.4
                ),
                WaterReservoir(
                    id="res-rain",
                    name="North Quad Rainwater Harvesting Vault",
                    capacity_liters=150000,
                    current_liters=118000,
                    status="Refilling",
                    purity_index=94.2
                ),
                WaterReservoir(
                    id="res-grey",
                    name="Eco-Park Greywater Bio-Retention Cell",
                    capacity_liters=100000,
                    current_liters=68000,
                    status="Normal",
                    purity_index=89.1
                )
            ]
            db.add_all(reservoirs)
            db.add(WaterLeakAlert(
                id="leak-104",
                location="Hawking East Quad — Sub-Basement Lateral B",
                flow_loss_lph=145.0,
                acoustic_confidence=0.94,
                detected_at="28 mins ago",
                status="Investigating"
            ))
            db.commit()

        # 6. Seed Waste Clusters
        if db.query(WasteCluster).count() == 0:
            clusters = [
                WasteCluster(id="bin-c1", location="Student Union Plaza Entrance", zone="Central Plaza", compost_fill_pct=78, recycling_fill_pct=88, landfill_fill_pct=62, last_emptied="4 hours ago", status="Attention"),
                WasteCluster(id="bin-c2", location="Engineering Atrium East", zone="North Quad", compost_fill_pct=45, recycling_fill_pct=60, landfill_fill_pct=40, last_emptied="2 hours ago", status="Normal"),
                WasteCluster(id="bin-c3", location="Library Food & Beverage Courtyard", zone="Central Quad", compost_fill_pct=86, recycling_fill_pct=92, landfill_fill_pct=75, last_emptied="6 hours ago", status="Overflow Risk"),
                WasteCluster(id="bin-c4", location="Dining Hall Delivery Bay", zone="South Residential", compost_fill_pct=82, recycling_fill_pct=70, landfill_fill_pct=65, last_emptied="3 hours ago", status="Attention"),
            ]
            db.add_all(clusters)
            db.commit()

        # 7. Seed Environment Nodes
        if db.query(EnvironmentNode).count() == 0:
            nodes = [
                EnvironmentNode(id="env-1", name="North Quad Research Pavilion", zone="North Tech Quad", aqi=32, pm25=7.8, pm10=16.2, co2=440, temp=22.8, humidity=46.0, noise_db=42.1, status="Healthy"),
                EnvironmentNode(id="env-2", name="University Botanical Conservation Park", zone="Eco Zone", aqi=22, pm25=4.5, pm10=11.0, co2=395, temp=21.6, humidity=56.0, noise_db=36.4, status="Healthy"),
                EnvironmentNode(id="env-3", name="Central Amphitheater & Plaza", zone="Central Quad", aqi=44, pm25=11.2, pm10=24.5, co2=510, temp=24.5, humidity=44.0, noise_db=58.2, status="Healthy"),
                EnvironmentNode(id="env-4", name="Transit Hub & East Parking Deck", zone="Perimeter East", aqi=58, pm25=16.4, pm10=38.0, co2=580, temp=25.1, humidity=42.0, noise_db=64.5, status="Moderate"),
            ]
            db.add_all(nodes)
            db.commit()

        # 8. Seed Notifications
        if db.query(Notification).count() == 0:
            notifs = [
                Notification(id="notif-1", title="High Peak Demand Alert", description="Campus power draw reached 1,428 kW (81.6% of contract threshold). Solar peak offsetting 485 kW.", timestamp="12 mins ago", severity="warning", category="Energy", is_read=False, action_url="/energy"),
                Notification(id="notif-2", title="Isolation Forest Anomaly Detected", description="Chiller Unit #2 in Science Wing experiencing bearing harmonic vibration. Work order #8901 generated.", timestamp="35 mins ago", severity="critical", category="HVAC", is_read=False, action_url="/maintenance"),
                Notification(id="notif-3", title="Smart Waste Overflow Warning", description="Library Courtyard Bin Cluster recycling bin reached 92% fill. Truck dispatch queued.", timestamp="1 hour ago", severity="warning", category="Environment", is_read=False, action_url="/waste"),
                Notification(id="notif-4", title="Rainwater Tank Harvest Optimum", description="North Quad Rainwater Vault reached 78.4% capacity. Treatment pump switching to greywater loop.", timestamp="3 hours ago", severity="success", category="Water", is_read=True, action_url="/water")
            ]
            db.add_all(notifs)
            db.commit()

        # 9. Seed System Config
        if db.query(SystemConfig).count() == 0:
            db.add(SystemConfig(
                campus_name="Metropolitan University of Technology & Innovation",
                iot_gateway_status="Connected",
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
            ))
            db.commit()

        # 10. Seed Initial Telemetry Records
        if db.query(EnergyTelemetry).count() == 0:
            db.add(EnergyTelemetry(
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
            ))
            db.commit()

        if db.query(WaterTelemetry).count() == 0:
            db.add(WaterTelemetry(
                total_flow_lpm=184.2,
                daily_usage_liters=164200.0,
                rainwater_harvested_l=48600.0,
                rainwater_capacity_pct=78.4,
                greywater_treated_l=38200.0,
                reservoir_level_pct=82.6,
                active_leaks_detected=1,
                non_revenue_water_pct=3.2
            ))
            db.commit()

        print("✓ All CampusOS seed data initialized successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
