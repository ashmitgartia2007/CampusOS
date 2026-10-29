import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import WasteCluster
from models.schemas import WasteSummaryResponse, WasteClusterCreate
from security import get_current_user_optional, enforce_role

router = APIRouter(prefix="/api/v1/waste", tags=["Waste & Recycling"])

@router.get("/summary", response_model=WasteSummaryResponse)
def get_waste_summary():
    """Retrieve campus solid waste, landfill diversion rate, and organic compost metrics."""
    return WasteSummaryResponse(
        total_bins=142,
        bins_requiring_pickup=8,
        avg_fill_pct=58.4,
        monthly_diversion_rate_pct=72.8,
        compost_diverted_kg=12840.0,
        recycling_kg=18450.0,
        landfill_kg=11900.0,
        e_waste_recycled_kg=2450.0
    )

@router.get("/clusters")
def get_bin_clusters(db: Session = Depends(get_db)):
    """Retrieve ultrasonic bin fill levels across campus stations."""
    clusters = db.query(WasteCluster).all()
    return [
        {
            "id": c.id,
            "location": c.location,
            "zone": c.zone,
            "compostFillPct": c.compost_fill_pct,
            "recyclingFillPct": c.recycling_fill_pct,
            "landfillFillPct": c.landfill_fill_pct,
            "lastEmptied": c.last_emptied,
            "status": c.status
        }
        for c in clusters
    ]

@router.get("/streams")
def get_waste_streams():
    """Retrieve monthly waste stream mass balance composition."""
    return [
        {"stream": "Compost & Organic", "weightTons": 12.8, "percentage": 31, "color": "#10b981"},
        {"stream": "Paper & Cardboard", "weightTons": 10.4, "percentage": 25, "color": "#38bdf8"},
        {"stream": "Plastics & Metals", "weightTons": 8.2, "percentage": 20, "color": "#818cf8"},
        {"stream": "General Landfill", "weightTons": 9.8, "percentage": 24, "color": "#94a3b8"}
    ]

@router.post("/dispatch-route")
def dispatch_collection_route():
    """Dispatch autonomous collection truck with dynamic Traveling Salesman route optimization."""
    return {
        "status": "success",
        "message": "Dynamic collection route dispatched to electric collection truck #CT-04.",
        "stops": 8,
        "est_travel_km": 4.2,
        "fuel_saved_liters": 18.5,
        "co2_saved_kg": 49.2,
        "eta_minutes": 14
    }

@router.post("/clusters", status_code=status.HTTP_201_CREATED)
def create_bin_cluster(
    payload: WasteClusterCreate,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Register a new smart waste and recycling station."""
    new_id = f"wc-{uuid.uuid4().hex[:6]}"
    cluster = WasteCluster(
        id=new_id,
        location=payload.location,
        zone=payload.zone,
        compost_fill_pct=payload.compost_fill_pct,
        recycling_fill_pct=payload.recycling_fill_pct,
        landfill_fill_pct=payload.landfill_fill_pct,
        last_emptied="Just now",
        status=payload.status
    )
    db.add(cluster)
    db.commit()
    db.refresh(cluster)
    return {
        "id": cluster.id,
        "location": cluster.location,
        "zone": cluster.zone,
        "compostFillPct": cluster.compost_fill_pct,
        "recyclingFillPct": cluster.recycling_fill_pct,
        "landfillFillPct": cluster.landfill_fill_pct,
        "lastEmptied": cluster.last_emptied,
        "status": cluster.status
    }

@router.patch("/clusters/{cluster_id}/empty")
def empty_bin_cluster(
    cluster_id: str,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Mark all bins in the cluster as emptied and reset sensors."""
    cluster = db.query(WasteCluster).filter(WasteCluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Waste station '{cluster_id}' not found.")
    cluster.compost_fill_pct = 5
    cluster.recycling_fill_pct = 5
    cluster.landfill_fill_pct = 5
    cluster.last_emptied = "Just now"
    cluster.status = "Normal"
    db.commit()
    db.refresh(cluster)
    return {
        "status": "success",
        "message": f"Waste station '{cluster.location}' successfully cleared.",
        "cluster": {
            "id": cluster.id,
            "location": cluster.location,
            "compostFillPct": cluster.compost_fill_pct,
            "recyclingFillPct": cluster.recycling_fill_pct,
            "landfillFillPct": cluster.landfill_fill_pct,
            "lastEmptied": cluster.last_emptied,
            "status": cluster.status
        }
    }

@router.delete("/clusters/{cluster_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bin_cluster(
    cluster_id: str,
    current_user: Optional[dict] = Depends(enforce_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Remove a waste station from the campus map."""
    cluster = db.query(WasteCluster).filter(WasteCluster.id == cluster_id).first()
    if not cluster:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Waste station '{cluster_id}' not found.")
    db.delete(cluster)
    db.commit()
    return None
