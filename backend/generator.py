"""
CampusOS AI - Background Telemetry Generator & WebSocket Broadcaster
Generates realistic physical sensor fluctuations and broadcasts them in real time.
All generated records are explicitly labelled as [SIMULATED DATA].
"""

import asyncio
import time
import random
from typing import Set, Dict, Any
from fastapi import WebSocket
from database import SessionLocal
from models.db_models import EnergyTelemetry, WaterTelemetry, Building
from config import SIMULATOR_ENABLED, SIMULATOR_INTERVAL_SECONDS, DATA_SOURCE_LABEL

class WebSocketTelemetryManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.active_connections.discard(connection)

ws_manager = WebSocketTelemetryManager()

async def background_telemetry_generator():
    """Background task generating periodic micro-fluctuations and pushing to WebSockets."""
    if not SIMULATOR_ENABLED:
        return

    print(f">>> Started CampusOS simulated telemetry generator (Interval: {SIMULATOR_INTERVAL_SECONDS}s)...")
    
    while True:
        try:
            await asyncio.sleep(SIMULATOR_INTERVAL_SECONDS)
            
            delta_kw = round((random.random() - 0.5) * 5.0, 1)
            delta_water = round((random.random() - 0.5) * 2.0, 1)

            # Update database record
            db = SessionLocal()
            try:
                energy_rec = db.query(EnergyTelemetry).order_by(EnergyTelemetry.id.desc()).first()
                if energy_rec:
                    energy_rec.realtime_demand_kw = round(max(800.0, energy_rec.realtime_demand_kw + delta_kw), 1)
                    energy_rec.grid_import_kw = round(max(400.0, energy_rec.realtime_demand_kw - energy_rec.solar_pv_kw), 1)

                water_rec = db.query(WaterTelemetry).order_by(WaterTelemetry.id.desc()).first()
                if water_rec:
                    water_rec.total_flow_lpm = round(max(50.0, water_rec.total_flow_lpm + delta_water), 1)

                db.commit()

                current_demand = energy_rec.realtime_demand_kw if energy_rec else 1428.5
                current_water = water_rec.total_flow_lpm if water_rec else 184.2
            finally:
                db.close()

            # Broadcast to active WebSockets
            payload = {
                "type": "TELEMETRY_PULSE",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "deltaKw": delta_kw,
                "deltaWater": delta_water,
                "liveDemandKw": current_demand,
                "liveWaterLpm": current_water,
                "connectedToLiveServer": True,
                "dataSource": DATA_SOURCE_LABEL,
                "activeNodes": 1420
            }
            await ws_manager.broadcast(payload)
        except asyncio.CancelledError:
            break
        except Exception as e:
            # Prevent generator crash on transient errors
            await asyncio.sleep(2)
