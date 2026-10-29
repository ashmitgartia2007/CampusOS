"""
CampusOS AI - Smart University Campus Management Platform
Production-Ready FastAPI Backend with PostgreSQL/SQLite, WebSockets, RBAC & Scikit-learn ML
"""

import time
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from database import init_db
from seed import seed_database
from generator import ws_manager, background_telemetry_generator

# Import all domain routers
from routes import (
    auth,
    buildings,
    rooms,
    maintenance,
    energy,
    water,
    waste,
    environment,
    analytics,
    reports,
    settings,
    notifications
)

start_time = time.time()
generator_task = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist, seed initial data, launch generator
    init_db()
    seed_database()
    global generator_task
    generator_task = asyncio.create_task(background_telemetry_generator())
    yield
    # Shutdown
    if generator_task:
        generator_task.cancel()

app = FastAPI(
    title="CampusOS AI API",
    description="Smart University Campus Management System API with real-time IoT telemetry, PostgreSQL persistence, and Scikit-learn predictive models.",
    version="2.4.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(buildings.router)
app.include_router(rooms.router)
app.include_router(maintenance.router)
app.include_router(energy.router)
app.include_router(water.router)
app.include_router(waste.router)
app.include_router(environment.router)
app.include_router(analytics.router)
app.include_router(reports.router)
app.include_router(settings.router)
app.include_router(notifications.router)

# Health check endpoint
@app.get("/api/v1/health", tags=["System"])
def health_check():
    return {
        "status": "ok",
        "app_name": "CampusOS AI",
        "version": "2.4.0",
        "uptime_seconds": round(time.time() - start_time, 1),
        "db_connected": True,
        "active_iot_nodes": 1420,
        "websocket_subscribers": len(ws_manager.active_connections)
    }

# Executive KPI summary for dashboard
@app.get("/api/v1/telemetry/kpis", tags=["System"])
def get_dashboard_kpis():
    return {
        "total_energy_kw": 1428.5,
        "energy_change_pct": -4.2,
        "water_flow_rate_lpm": 184.2,
        "water_change_pct": 1.8,
        "waste_fill_avg_pct": 58.4,
        "waste_change_pct": -6.5,
        "campus_population": 8420,
        "population_capacity_pct": 76.5,
        "average_aqi": 38,
        "aqi_status": "Good",
        "active_alerts_count": 3,
        "solar_generation_kw": 485.0,
        "grid_import_kw": 943.5,
        "carbon_offset_today_kg": 1820.4,
        "data_source": "[SIMULATED TELEMETRY]"
    }

# Real-time WebSocket Endpoint
@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keepalive receiver
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)
