import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import Building
from models.schemas import BuildingCreate, BuildingUpdate, BuildingResponse
from security import get_current_user_optional, require_role, enforce_role

router = APIRouter(prefix="/api/v1/buildings", tags=["Buildings"])

@router.get("", response_model=List[BuildingResponse])
def get_buildings(
    zone: Optional[str] = Query(None, description="Filter buildings by campus zone"),
    db: Session = Depends(get_db)
):
    """Retrieve all monitored campus buildings with real-time operational states."""
    query = db.query(Building)
    if zone and zone != "All" and zone != "All Campus Zones":
        query = query.filter(Building.zone == zone)
    return query.all()

@router.get("/{building_id}", response_model=BuildingResponse)
def get_building(building_id: str, db: Session = Depends(get_db)):
    """Retrieve single facility telemetry by ID."""
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Building '{building_id}' not found.")
    return building

@router.post("", response_model=BuildingResponse, status_code=status.HTTP_201_CREATED)
def create_building(
    payload: BuildingCreate,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Create a new campus facility."""
    existing = db.query(Building).filter(Building.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Building code '{payload.code}' already exists.")

    new_id = f"b-{payload.code.lower().replace(' ', '-')[:8]}"
    new_building = Building(
        id=new_id,
        **payload.model_dump()
    )
    db.add(new_building)
    db.commit()
    db.refresh(new_building)
    return new_building

@router.put("/{building_id}", response_model=BuildingResponse)
def update_building(
    building_id: str,
    payload: BuildingUpdate,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Update building metadata and operational status."""
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Building '{building_id}' not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(building, key, value)

    db.commit()
    db.refresh(building)
    return building

@router.delete("/{building_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_building(
    building_id: str,
    current_user: Optional[dict] = Depends(enforce_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Delete a facility from the campus directory."""
    building = db.query(Building).filter(Building.id == building_id).first()
    if not building:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Building '{building_id}' not found.")

    db.delete(building)
    db.commit()
    return None
