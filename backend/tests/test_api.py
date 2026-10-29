import pytest
from fastapi.testclient import TestClient
from main import app
from seed import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    seed_database()

@pytest.fixture
def client():
    return TestClient(app)

def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app_name"] == "CampusOS AI"

def test_auth_login_success(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@campusos.ai",
        "password": "CampusOS@2026!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_auth_login_invalid_password(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@campusos.ai",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401

def test_get_buildings(client):
    response = client.get("/api/v1/buildings")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 6
    assert any(b["code"] == "ENG-A" for b in data)

def test_create_and_delete_room(client):
    # 1. Create Room
    create_resp = client.post("/api/v1/rooms", json={
        "building_id": "b-eng",
        "building_name": "Engineering Complex",
        "room_number": "ENG-TEST",
        "name": "Integration Test Laboratory",
        "type": "Robotics Lab",
        "floor": 1,
        "capacity": 25,
        "current_occupancy": 10,
        "temperature_c": 22.0,
        "target_temp_c": 22.0,
        "humidity_pct": 45.0,
        "co2_ppm": 550,
        "lux_level": 400,
        "lighting_state": True,
        "hvac_mode": "Comfort",
        "schedule_status": "Available",
        "air_quality_status": "Good"
    })
    assert create_resp.status_code == 201
    room = create_resp.json()
    room_id = room["id"]

    # 2. Control room thermostat
    patch_resp = client.patch(f"/api/v1/rooms/{room_id}/control", json={
        "target_temp_c": 21.5,
        "hvac_mode": "Eco"
    })
    assert patch_resp.status_code == 200
    assert patch_resp.json()["target_temp_c"] == 21.5
    assert patch_resp.json()["hvac_mode"] == "Eco"

    # 3. Delete Room
    del_resp = client.delete(f"/api/v1/rooms/{room_id}")
    assert del_resp.status_code == 204

def test_maintenance_orders_crud(client):
    # Create work order
    order_resp = client.post("/api/v1/maintenance", json={
        "title": "Air Filter Replacement AHU-10",
        "asset_id": "AHU-10",
        "asset_name": "Air Handling Unit 10",
        "building": "Engineering Complex",
        "floor": "Roof",
        "severity": "P3-Normal",
        "category": "HVAC",
        "assigned_to": "Carlos Vance"
    })
    assert order_resp.status_code == 201
    order = order_resp.json()
    order_id = order["id"]
    assert order["status"] == "Open"

    # Advance status
    patch_resp = client.patch(f"/api/v1/maintenance/{order_id}/status", json={
        "status": "In Progress"
    })
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "In Progress"

def test_ml_load_prediction(client):
    response = client.post("/api/v1/analytics/predict-load", json={
        "ambient_temp_delta_c": 4.0,
        "campus_occupancy_pct": 90.0,
        "solar_cloud_cover_pct": 10.0,
        "hvac_eco_override": True
    })
    assert response.status_code == 200
    data = response.json()
    assert "projected_demand_kw" in data
    assert "confidence_interval" in data
    assert len(data["confidence_interval"]) == 2
    assert data["confidence_interval"][0] < data["confidence_interval"][1]

def test_ml_anomaly_detection(client):
    response = client.post("/api/v1/analytics/detect-anomalies", json={
        "subsystem": "energy",
        "readings": [1200.0, 1210.0, 1195.0, 1205.0, 1850.0, 1190.0, 300.0]
    })
    assert response.status_code == 200
    data = response.json()
    assert data["total_evaluated"] == 7
    assert data["anomalies_detected"] >= 1
    assert "threshold_comparison" in data

def test_ml_water_anomaly_detection(client):
    response = client.post("/api/v1/analytics/detect-anomalies", json={
        "subsystem": "water",
        "readings": [180.0, 182.0, 178.0, 360.0, 185.0, 25.0, 179.0]
    })
    assert response.status_code == 200
    data = response.json()
    assert data["total_evaluated"] == 7
    assert data["anomalies_detected"] >= 1
    assert "threshold_comparison" in data

def test_environment_sensors_crud(client):
    # 1. Create sensor node
    resp = client.post("/api/v1/environment/sensors", json={
        "name": "Integration Test Node",
        "zone": "North Tech Quad",
        "aqi": 32,
        "pm25": 7.5,
        "pm10": 15.0,
        "co2": 420,
        "temp": 21.0,
        "humidity": 45.0,
        "noise_db": 38.0,
        "status": "Healthy"
    })
    assert resp.status_code == 201
    node_id = resp.json()["id"]

    # 2. Update sensor node
    up_resp = client.put(f"/api/v1/environment/sensors/{node_id}", json={
        "aqi": 34,
        "status": "Calibrated"
    })
    assert up_resp.status_code == 200
    assert up_resp.json()["aqi"] == 34

    # 3. Delete sensor node
    del_resp = client.delete(f"/api/v1/environment/sensors/{node_id}")
    assert del_resp.status_code == 204

def test_water_crud(client):
    # 1. Record reading
    r_resp = client.post("/api/v1/water/readings", json={
        "total_flow_lpm": 188.5,
        "daily_usage_liters": 165000.0
    })
    assert r_resp.status_code == 201

    # 2. Create leak alert
    l_resp = client.post("/api/v1/water/leaks", json={
        "location": "North Quad Hydrant Line 3",
        "flow_loss_lph": 130.0,
        "acoustic_confidence": 0.95,
        "status": "Investigating"
    })
    assert l_resp.status_code == 201
    leak_id = l_resp.json()["id"]

    # 3. Isolate leak
    iso_resp = client.post(f"/api/v1/water/leaks/{leak_id}/isolate")
    assert iso_resp.status_code == 200
    assert iso_resp.json()["new_status"] == "Isolated"

    # 4. Delete leak
    del_resp = client.delete(f"/api/v1/water/leaks/{leak_id}")
    assert del_resp.status_code == 204

def test_energy_readings_crud(client):
    # Record reading
    resp = client.post("/api/v1/energy/readings", json={
        "realtime_demand_kw": 1450.0,
        "solar_pv_kw": 500.0,
        "grid_import_kw": 950.0
    })
    assert resp.status_code == 201

    # Query readings
    list_resp = client.get("/api/v1/energy/readings?limit=10")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

def test_waste_clusters_crud(client):
    # 1. Create cluster
    resp = client.post("/api/v1/waste/clusters", json={
        "location": "Library South Plaza Station",
        "zone": "Central Arts & Science",
        "compost_fill_pct": 85,
        "recycling_fill_pct": 75,
        "landfill_fill_pct": 90,
        "status": "Attention"
    })
    assert resp.status_code == 201
    cluster_id = resp.json()["id"]

    # 2. Empty cluster
    empty_resp = client.patch(f"/api/v1/waste/clusters/{cluster_id}/empty")
    assert empty_resp.status_code == 200
    assert empty_resp.json()["cluster"]["status"] == "Normal"

    # 3. Delete cluster
    del_resp = client.delete(f"/api/v1/waste/clusters/{cluster_id}")
    assert del_resp.status_code == 204

def test_notifications_crud(client):
    # 1. Create notification
    resp = client.post("/api/v1/notifications", json={
        "title": "Test Grid Peak Alert",
        "description": "Peak threshold approaching 1700 kW",
        "severity": "warning",
        "category": "Energy"
    })
    assert resp.status_code == 201
    notif_id = resp.json()["id"]

    # 2. Mark as read
    read_resp = client.patch(f"/api/v1/notifications/{notif_id}/read")
    assert read_resp.status_code == 200
    assert read_resp.json()["is_read"] is True

    # 3. Delete notification
    del_resp = client.delete(f"/api/v1/notifications/{notif_id}")
    assert del_resp.status_code == 204

def test_reports_crud_and_export(client):
    # 1. Generate report
    resp = client.post("/api/v1/reports/generate", json={
        "report_type": "LEED O+M Annual Energy Compliance",
        "date_range": "Year 2026",
        "format": "csv"
    })
    assert resp.status_code == 201
    rep_id = resp.json()["id"]

    # 2. Export CSV
    export_resp = client.get("/api/v1/reports/export?format=csv&type=facilities")
    assert export_resp.status_code == 200
    assert "text/csv" in export_resp.headers["content-type"]
    assert "code,name,zone" in export_resp.text

    # 3. Delete report
    del_resp = client.delete(f"/api/v1/reports/{rep_id}")
    assert del_resp.status_code == 204

def test_rbac_permissions(client):
    # 1. Login as Viewer (Dean)
    v_resp = client.post("/api/v1/auth/login", json={"email": "dean@campusos.ai", "password": "Dean@2026!"})
    assert v_resp.status_code == 200
    viewer_token = v_resp.json()["access_token"]

    # 2. Viewer attempts to access protected user list -> 403 Forbidden
    v_users = client.get("/api/v1/auth/users", headers={"Authorization": f"Bearer {viewer_token}"})
    assert v_users.status_code == 403

    # 3. Login as Operator
    o_resp = client.post("/api/v1/auth/login", json={"email": "operator@campusos.ai", "password": "Operator@2026!"})
    assert o_resp.status_code == 200
    operator_token = o_resp.json()["access_token"]

    # 4. Operator can list users
    o_users = client.get("/api/v1/auth/users", headers={"Authorization": f"Bearer {operator_token}"})
    assert o_users.status_code == 200

    # 5. Operator attempts to create a new user -> 403 Forbidden (Admin only)
    o_create = client.post(
        "/api/v1/auth/users",
        headers={"Authorization": f"Bearer {operator_token}"},
        json={"email": "pytest_fail@campusos.ai", "password": "Pass@2026!", "full_name": "Test", "role": "viewer"}
    )
    assert o_create.status_code == 403

    # 6. Viewer attempts to delete building -> 403 Forbidden (Admin only)
    v_del = client.delete("/api/v1/buildings/b-eng", headers={"Authorization": f"Bearer {viewer_token}"})
    assert v_del.status_code == 403

    # 7. Viewer attempts to update system settings -> 403 Forbidden (Admin only)
    v_set = client.put("/api/v1/settings", json={"max_peak_demand_kw": 2000}, headers={"Authorization": f"Bearer {viewer_token}"})
    assert v_set.status_code == 403

def test_ml_benchmark_metrics(client):
    resp = client.get("/api/v1/analytics/benchmark")
    assert resp.status_code == 200
    data = resp.json()
    assert "isolation_forest" in data
    assert "statistical_threshold" in data
    assert data["isolation_forest"]["f1_score"] >= 0.95
    assert data["statistical_threshold"]["f1_score"] >= 0.95

def test_system_settings_crud(client):
    get_resp = client.get("/api/v1/settings")
    assert get_resp.status_code == 200
    orig = get_resp.json()

    # Update
    orig["max_peak_demand_kw"] = 1850
    put_resp = client.put("/api/v1/settings", json=orig)
    assert put_resp.status_code == 200
    assert put_resp.json()["max_peak_demand_kw"] == 1850

    # Revert
    orig["max_peak_demand_kw"] = 1750
    client.put("/api/v1/settings", json=orig)
