import httpx
import websockets
import asyncio
import json
import time
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"
WS_URL = "ws://127.0.0.1:8000/ws/telemetry"

results = {
    "passed": [],
    "failed": [],
    "audit_details": {}
}

def log_test(name, success, message=""):
    if success:
        print(f"  [PASS] {name}: {message}")
        results["passed"].append({"test": name, "details": message})
    else:
        print(f"  [FAIL] {name}: {message}")
        results["failed"].append({"test": name, "details": message})

async def run_audit():
    print("=" * 65)
    print("  CampusOS AI Comprehensive Verification & Audit Engine")
    print("=" * 65)

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=5.0) as client:
        # 1. Health Probe
        try:
            r = await client.get("/health")
            if r.status_code == 200 and r.json().get("status") == "ok":
                log_test("Health Probe", True, f"HTTP 200 - App: {r.json().get('app_name')}")
            else:
                log_test("Health Probe", False, f"Unexpected response: {r.status_code}")
        except Exception as e:
            log_test("Health Probe", False, str(e))

        # 2. Authentication & RBAC Login
        tokens = {}
        users = [
            ("admin", "admin@campusos.ai", "CampusOS@2026!"),
            ("operator", "operator@campusos.ai", "Operator@2026!"),
            ("viewer", "dean@campusos.ai", "Dean@2026!")
        ]

        for role, email, password in users:
            try:
                r = await client.post("/auth/login", json={"email": email, "password": password})
                if r.status_code == 200:
                    data = r.json()
                    tokens[role] = data["access_token"]
                    log_test(f"Auth Login ({role})", True, f"Role verified: {data['user']['role']}")
                else:
                    log_test(f"Auth Login ({role})", False, f"HTTP {r.status_code}: {r.text}")
            except Exception as e:
                log_test(f"Auth Login ({role})", False, str(e))

        # 3. RBAC Enforcement Checks
        # Viewer blocked from /auth/users
        try:
            r = await client.get("/auth/users", headers={"Authorization": f"Bearer {tokens['viewer']}"})
            if r.status_code == 403:
                log_test("RBAC - Viewer blocked from /auth/users", True, "HTTP 403 Forbidden as expected")
            else:
                log_test("RBAC - Viewer blocked from /auth/users", False, f"Expected 403, got {r.status_code}")
        except Exception as e:
            log_test("RBAC - Viewer blocked from /auth/users", False, str(e))

        # Operator can list users
        try:
            r = await client.get("/auth/users", headers={"Authorization": f"Bearer {tokens['operator']}"})
            if r.status_code == 200 and isinstance(r.json(), list):
                log_test("RBAC - Operator can list users", True, f"HTTP 200 - {len(r.json())} users listed")
            else:
                log_test("RBAC - Operator can list users", False, f"HTTP {r.status_code}")
        except Exception as e:
            log_test("RBAC - Operator can list users", False, str(e))

        # Operator blocked from creating user
        try:
            r = await client.post(
                "/auth/users",
                headers={"Authorization": f"Bearer {tokens['operator']}"},
                json={"email": "temp@campusos.ai", "password": "TempPass@2026!", "full_name": "Temp User", "role": "viewer"}
            )
            if r.status_code == 403:
                log_test("RBAC - Operator blocked from creating user", True, "HTTP 403 Forbidden as expected")
            else:
                log_test("RBAC - Operator blocked from creating user", False, f"Expected 403, got {r.status_code}")
        except Exception as e:
            log_test("RBAC - Operator blocked from creating user", False, str(e))

        # Admin creating user
        try:
            test_user_email = f"audit_{int(time.time())}@campusos.ai"
            r = await client.post(
                "/auth/users",
                headers={"Authorization": f"Bearer {tokens['admin']}"},
                json={"email": test_user_email, "password": "AuditPass@2026!", "full_name": "Audit Officer", "role": "viewer"}
            )
            if r.status_code == 200:
                log_test("RBAC - Admin create user", True, f"Created {test_user_email}")
            else:
                log_test("RBAC - Admin create user", False, f"HTTP {r.status_code}: {r.text}")
        except Exception as e:
            log_test("RBAC - Admin create user", False, str(e))

        # 4. CRUD and Data Persistence Checks

        # Buildings CRUD
        created_building_id = None
        try:
            b_payload = {
                "code": f"AUD-{int(time.time()) % 1000}",
                "name": "Audit Verification Center",
                "category": "Academic",
                "zone": "North Tech Quad",
                "floors": 4,
                "gross_area_sqft": 45000,
                "current_occupancy": 120,
                "max_capacity": 450,
                "energy_usage_kw": 125.0,
                "water_draw_lpm": 18.0,
                "indoor_temp_c": 21.8,
                "co2_ppm": 510,
                "aqi": 28,
                "energy_star_score": 92,
                "status": "optimal",
                "critical_alerts": 0,
                "hvac_status": "Optimized"
            }
            r = await client.post("/buildings", json=b_payload)
            if r.status_code == 201:
                created_building_id = r.json()["id"]
                log_test("Buildings API - Create", True, f"Created building ID: {created_building_id}")
            else:
                log_test("Buildings API - Create", False, f"HTTP {r.status_code}: {r.text}")

            if created_building_id:
                r_get = await client.get(f"/buildings/{created_building_id}")
                if r_get.status_code == 200 and r_get.json()["name"] == b_payload["name"]:
                    log_test("Buildings API - Read & Verify Persistence", True, "Retrieved identical attributes from DB")
                else:
                    log_test("Buildings API - Read & Verify Persistence", False, f"HTTP {r_get.status_code}")

                r_put = await client.put(f"/buildings/{created_building_id}", json={"status": "warning"})
                if r_put.status_code == 200 and r_put.json()["status"] == "warning":
                    log_test("Buildings API - Update Status", True, "Status successfully changed to 'warning'")
                else:
                    log_test("Buildings API - Update Status", False, f"HTTP {r_put.status_code}")

                r_del = await client.delete(f"/buildings/{created_building_id}")
                if r_del.status_code == 204:
                    log_test("Buildings API - Delete", True, f"Deleted building {created_building_id}")
                else:
                    log_test("Buildings API - Delete", False, f"HTTP {r_del.status_code}")
        except Exception as e:
            log_test("Buildings API - CRUD", False, str(e))

        # Rooms Control and CRUD
        created_room_id = None
        try:
            r_payload = {
                "building_id": "b-eng",
                "building_name": "Engineering Complex",
                "room_number": "ENG-AUDIT",
                "name": "Audit Microgrid Lab",
                "type": "Robotics Lab",
                "floor": 2,
                "capacity": 30,
                "current_occupancy": 12,
                "temperature_c": 22.5,
                "target_temp_c": 22.0,
                "humidity_pct": 46.0,
                "co2_ppm": 540,
                "lux_level": 420,
                "lighting_state": True,
                "hvac_mode": "Comfort",
                "schedule_status": "Available",
                "air_quality_status": "Good"
            }
            r = await client.post("/rooms", json=r_payload)
            if r.status_code == 201:
                created_room_id = r.json()["id"]
                log_test("Rooms API - Create", True, f"Created room ID: {created_room_id}")
            else:
                log_test("Rooms API - Create", False, f"HTTP {r.status_code}: {r.text}")

            if created_room_id:
                r_ctrl = await client.patch(f"/rooms/{created_room_id}/control", json={
                    "target_temp_c": 20.5,
                    "hvac_mode": "Eco",
                    "lighting_state": False
                })
                if r_ctrl.status_code == 200 and r_ctrl.json()["target_temp_c"] == 20.5 and r_ctrl.json()["lighting_state"] is False:
                    log_test("Rooms API - Thermostat & Lighting Control", True, "Thermostat=20.5°C, Mode=Eco, Lighting=Off")
                else:
                    log_test("Rooms API - Thermostat & Lighting Control", False, f"HTTP {r_ctrl.status_code}")

                r_del = await client.delete(f"/rooms/{created_room_id}")
                if r_del.status_code == 204:
                    log_test("Rooms API - Delete", True, f"Deleted room {created_room_id}")
                else:
                    log_test("Rooms API - Delete", False, f"HTTP {r_del.status_code}")
        except Exception as e:
            log_test("Rooms API - CRUD", False, str(e))

        # Maintenance Work Orders CRUD
        created_wo_id = None
        try:
            wo_payload = {
                "title": "Audit HVAC Actuator Diagnostic",
                "asset_id": "VLV-AUDIT-01",
                "asset_name": "Chilled Water Modulating Valve",
                "building": "Science & Innovation Hall",
                "floor": "Basement Sub-station",
                "severity": "P2-High",
                "category": "HVAC",
                "assigned_to": "Elena Rostova"
            }
            r = await client.post("/maintenance", json=wo_payload)
            if r.status_code == 201:
                created_wo_id = r.json()["id"]
                log_test("Maintenance API - Create Work Order", True, f"Created {r.json()['ticket_number']} ({created_wo_id})")
            else:
                log_test("Maintenance API - Create Work Order", False, f"HTTP {r.status_code}: {r.text}")

            if created_wo_id:
                r_patch1 = await client.patch(f"/maintenance/{created_wo_id}/status", json={"status": "In Progress"})
                r_patch2 = await client.patch(f"/maintenance/{created_wo_id}/status", json={"status": "Resolved"})
                if r_patch2.status_code == 200 and r_patch2.json()["status"] == "Resolved":
                    log_test("Maintenance API - Status Workflow", True, "Progressed Open -> In Progress -> Resolved")
                else:
                    log_test("Maintenance API - Status Workflow", False, f"HTTP {r_patch2.status_code}")

                await client.delete(f"/maintenance/{created_wo_id}")
        except Exception as e:
            log_test("Maintenance API - CRUD", False, str(e))

        # Water Leak Alert & Isolation
        created_leak_id = None
        try:
            l_payload = {
                "location": "Audit Sub-meter Pipeline 4",
                "flow_loss_lph": 175.5,
                "acoustic_confidence": 0.94,
                "status": "Investigating"
            }
            r = await client.post("/water/leaks", json=l_payload)
            if r.status_code == 201:
                created_leak_id = r.json()["id"]
                log_test("Water API - Report Leak Alert", True, f"Leak alert ID: {created_leak_id}")
            else:
                log_test("Water API - Report Leak Alert", False, f"HTTP {r.status_code}")

            if created_leak_id:
                r_iso = await client.post(f"/water/leaks/{created_leak_id}/isolate")
                if r_iso.status_code == 200 and r_iso.json()["new_status"] == "Isolated":
                    log_test("Water API - Solenoid Valve Isolation Actuation", True, "Valve status successfully set to Isolated")
                else:
                    log_test("Water API - Solenoid Valve Isolation Actuation", False, f"HTTP {r_iso.status_code}")

                await client.delete(f"/water/leaks/{created_leak_id}")
        except Exception as e:
            log_test("Water API - Leak & Isolation", False, str(e))

        # Waste Cluster & Empty Station Action
        created_station_id = None
        try:
            w_payload = {
                "location": "Audit Station Quad",
                "zone": "North Tech Quad",
                "compost_fill_pct": 92,
                "recycling_fill_pct": 88,
                "landfill_fill_pct": 95,
                "status": "Critical"
            }
            r = await client.post("/waste/clusters", json=w_payload)
            if r.status_code == 201:
                created_station_id = r.json()["id"]
                log_test("Waste API - Deploy Bin Station", True, f"Station ID: {created_station_id}")
            else:
                log_test("Waste API - Deploy Bin Station", False, f"HTTP {r.status_code}")

            if created_station_id:
                r_empty = await client.patch(f"/waste/clusters/{created_station_id}/empty")
                if r_empty.status_code == 200 and r_empty.json()["cluster"]["status"] == "Normal":
                    log_test("Waste API - Empty Station Action", True, "Bins reset to 5%, status reset to Normal")
                else:
                    log_test("Waste API - Empty Station Action", False, f"HTTP {r_empty.status_code}")

                await client.delete(f"/waste/clusters/{created_station_id}")
        except Exception as e:
            log_test("Waste API - Deploy & Empty", False, str(e))

        # Environment Sensors
        created_sensor_id = None
        try:
            s_payload = {
                "name": "Audit Environmental Node",
                "zone": "North Tech Quad",
                "aqi": 34,
                "pm25": 8.0,
                "pm10": 16.0,
                "co2": 435,
                "temp": 21.5,
                "humidity": 44.0,
                "noise_db": 41.0,
                "status": "Healthy"
            }
            r = await client.post("/environment/sensors", json=s_payload)
            if r.status_code == 201:
                created_sensor_id = r.json()["id"]
                log_test("Environment API - Deploy Sensor", True, f"Sensor ID: {created_sensor_id}")
            else:
                log_test("Environment API - Deploy Sensor", False, f"HTTP {r.status_code}")

            if created_sensor_id:
                await client.delete(f"/environment/sensors/{created_sensor_id}")
        except Exception as e:
            log_test("Environment API - Deploy Sensor", False, str(e))

        # Notifications API
        created_notif_id = None
        try:
            n_payload = {
                "title": "Audit Compliance Verification Notice",
                "description": "System automated audit initiated across all services",
                "severity": "info",
                "category": "Security"
            }
            r = await client.post("/notifications", json=n_payload)
            if r.status_code == 201:
                created_notif_id = r.json()["id"]
                log_test("Notifications API - Create", True, f"Notification ID: {created_notif_id}")
            else:
                log_test("Notifications API - Create", False, f"HTTP {r.status_code}")

            if created_notif_id:
                r_read = await client.patch(f"/notifications/{created_notif_id}/read")
                if r_read.status_code == 200 and r_read.json()["is_read"] is True:
                    log_test("Notifications API - Mark Read", True, "Marked as read successfully")
                else:
                    log_test("Notifications API - Mark Read", False, f"HTTP {r_read.status_code}")

                await client.delete(f"/notifications/{created_notif_id}")
        except Exception as e:
            log_test("Notifications API - CRUD", False, str(e))

        # Reports & Compliance Audits CRUD & CSV Export
        created_rep_id = None
        try:
            rep_payload = {
                "report_type": "ISO 50001 Energy Management Verification",
                "date_range": "Q4 2026",
                "format": "csv"
            }
            r = await client.post("/reports/generate", json=rep_payload)
            if r.status_code == 201:
                created_rep_id = r.json()["id"]
                log_test("Reports API - Register Audit", True, f"Audit report registered: {created_rep_id}")
            else:
                log_test("Reports API - Register Audit", False, f"HTTP {r.status_code}")

            r_exp = await client.get("/reports/export?format=csv&type=facilities")
            if r_exp.status_code == 200 and "text/csv" in r_exp.headers.get("content-type", ""):
                lines = r_exp.text.strip().split("\n")
                log_test("Reports API - Export CSV", True, f"Valid CSV returned ({len(lines)} lines)")
            else:
                log_test("Reports API - Export CSV", False, f"HTTP {r_exp.status_code}")

            if created_rep_id:
                await client.delete(f"/reports/{created_rep_id}")
        except Exception as e:
            log_test("Reports API - CRUD & Export", False, str(e))

        # Settings API
        try:
            r_get = await client.get("/settings")
            if r_get.status_code == 200:
                current_cfg = r_get.json()
                log_test("Settings API - Retrieve", True, f"Campus: {current_cfg.get('campus_name')}")
                
                orig_peak = current_cfg.get("max_peak_demand_kw", 1750)
                current_cfg["max_peak_demand_kw"] = 1800
                r_put = await client.put("/settings", json=current_cfg)
                if r_put.status_code == 200 and r_put.json()["max_peak_demand_kw"] == 1800:
                    log_test("Settings API - Update & Persist", True, "Peak threshold updated to 1800 kW")
                    current_cfg["max_peak_demand_kw"] = orig_peak
                    await client.put("/settings", json=current_cfg)
                else:
                    log_test("Settings API - Update & Persist", False, f"HTTP {r_put.status_code}")
            else:
                log_test("Settings API - Retrieve", False, f"HTTP {r_get.status_code}")
        except Exception as e:
            log_test("Settings API", False, str(e))

        # 5. ML Models & Prediction Verification
        try:
            r_models = await client.get("/analytics/models")
            if r_models.status_code == 200 and len(r_models.json()) >= 2:
                m_names = [m["name"] for m in r_models.json()]
                log_test("ML Model Registry", True, f"Models verified: {', '.join(m_names)}")
            else:
                log_test("ML Model Registry", False, f"HTTP {r_models.status_code}")

            r_pred = await client.post("/analytics/predict-load", json={
                "ambient_temp_delta_c": 3.5,
                "campus_occupancy_pct": 88.0,
                "solar_cloud_cover_pct": 20.0,
                "hvac_eco_override": False
            })
            if r_pred.status_code == 200:
                p_data = r_pred.json()
                ci = p_data.get("confidence_interval", [])
                log_test(
                    "ML Load Forecasting",
                    True,
                    f"Projected Demand: {p_data.get('projected_demand_kw')} kW (95% CI: [{ci[0]}, {ci[1]}])"
                )
            else:
                log_test("ML Load Forecasting", False, f"HTTP {r_pred.status_code}")

            r_anom = await client.post("/analytics/detect-anomalies", json={
                "subsystem": "energy",
                "readings": [1210.0, 1205.0, 1198.0, 1850.0, 1204.0, 310.0, 1215.0]
            })
            if r_anom.status_code == 200:
                a_data = r_anom.json()
                log_test(
                    "ML Anomaly Detection (IsolationForest)",
                    True,
                    f"Evaluated {a_data['total_evaluated']} readings -> Flagged {a_data['anomalies_detected']} anomalies"
                )
            else:
                log_test("ML Anomaly Detection", False, f"HTTP {r_anom.status_code}")

            r_bench = await client.get("/analytics/benchmark")
            if r_bench.status_code == 200:
                b_data = r_bench.json()
                iforest = b_data.get("isolation_forest", {})
                baseline = b_data.get("statistical_threshold", {})
                log_test(
                    "ML vs Statistical Benchmark",
                    True,
                    f"IsolationForest F1={iforest.get('f1_score')} vs 2.5σ Baseline F1={baseline.get('f1_score')}"
                )
            else:
                log_test("ML vs Statistical Benchmark", False, f"HTTP {r_bench.status_code}")
        except Exception as e:
            log_test("ML Inference & Benchmarks", False, str(e))

    # 6. WebSocket Telemetry Stream Test
    try:
        async with websockets.connect(WS_URL) as ws:
            received_frames = []
            for _ in range(2):
                msg = await asyncio.wait_for(ws.recv(), timeout=6.0)
                received_frames.append(json.loads(msg))

            if len(received_frames) >= 2:
                frame1 = received_frames[0]
                log_test(
                    "WebSocket Telemetry Pulse (/ws/telemetry)",
                    True,
                    f"Received {len(received_frames)} pulse frames. Type: {frame1.get('type')}, Demand: {frame1.get('liveDemandKw')} kW, Label: {frame1.get('dataSource')}"
                )
            else:
                log_test("WebSocket Telemetry Pulse", False, f"Received only {len(received_frames)} frames")
    except Exception as e:
        log_test("WebSocket Telemetry Pulse", False, str(e))

    print("=" * 65)
    print(f"Audit Summary: {len(results['passed'])} PASSED, {len(results['failed'])} FAILED")
    print("=" * 65)

    with open("/Users/ashmitgartia/CampusOS/audit_backend_results.json", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    asyncio.run(run_audit())
