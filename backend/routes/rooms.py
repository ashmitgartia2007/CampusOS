import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import Room, Building
from models.schemas import RoomCreate, RoomControlPatch, RoomUpdate, RoomResponse
from security import get_current_user_optional, enforce_role

router = APIRouter(prefix="/api/v1/rooms", tags=["Rooms & Labs"])

@router.get("", response_model=List[RoomResponse])
def get_rooms(
    building_id: Optional[str] = Query(None, description="Filter by building ID"),
    type: Optional[str] = Query(None, description="Filter by room type"),
    db: Session = Depends(get_db)
):
    """Retrieve classrooms, labs, and offices with real-time IoT climate status."""
    query = db.query(Room)
    if building_id and building_id != "All":
        query = query.filter(Room.building_id == building_id)
    if type and type != "All":
        query = query.filter(Room.type == type)
    return query.all()

@router.get("/{room_id}", response_model=RoomResponse)
def get_room(room_id: str, db: Session = Depends(get_db)):
    """Retrieve details for a single room."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Room '{room_id}' not found.")
    return room

@router.post("", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    payload: RoomCreate,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Register a new room or laboratory."""
    new_id = f"r-{uuid.uuid4().hex[:6]}"
    new_room = Room(
        id=new_id,
        **payload.model_dump()
    )
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

@router.patch("/{room_id}/control", response_model=RoomResponse)
def control_room(
    room_id: str,
    payload: RoomControlPatch,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Update interactive environmental controls (thermostat setpoint, lighting, HVAC mode)."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Room '{room_id}' not found.")

    if payload.target_temp_c is not None:
        room.target_temp_c = payload.target_temp_c
    if payload.lighting_state is not None:
        room.lighting_state = payload.lighting_state
    if payload.hvac_mode is not None:
        room.hvac_mode = payload.hvac_mode

    db.commit()
    db.refresh(room)
    return room

@router.put("/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: str,
    payload: RoomUpdate,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Update room properties and status."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Room '{room_id}' not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(room, key, value)

    db.commit()
    db.refresh(room)
    return room

@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    room_id: str,
    current_user: Optional[dict] = Depends(enforce_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Delete a room record."""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Room '{room_id}' not found.")

    db.delete(room)
    db.commit()
    return None
