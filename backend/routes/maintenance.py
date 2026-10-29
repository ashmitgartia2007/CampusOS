import uuid
import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import MaintenanceOrder
from models.schemas import (
    MaintenanceOrderCreate,
    MaintenanceOrderStatusPatch,
    MaintenanceOrderResponse
)
from security import get_current_user_optional, enforce_role

router = APIRouter(prefix="/api/v1/maintenance", tags=["Maintenance & Work Orders"])

@router.get("", response_model=List[MaintenanceOrderResponse])
def get_orders(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    db: Session = Depends(get_db)
):
    """Retrieve all maintenance work orders and Scikit-learn predictive failure alerts."""
    query = db.query(MaintenanceOrder)
    if status_filter and status_filter != "All":
        query = query.filter(MaintenanceOrder.status == status_filter)
    if severity and severity != "All":
        query = query.filter(MaintenanceOrder.severity == severity)
    return query.order_by(MaintenanceOrder.id.desc()).all()

@router.get("/{order_id}", response_model=MaintenanceOrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    """Retrieve single work order by ID."""
    order = db.query(MaintenanceOrder).filter(MaintenanceOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Work order '{order_id}' not found.")
    return order

@router.post("", response_model=MaintenanceOrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: MaintenanceOrderCreate,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Create and dispatch a new maintenance work order."""
    new_id = f"mo-{uuid.uuid4().hex[:6]}"
    ticket_num = f"WO-2026-{random.randint(8900, 9999)}"

    new_order = MaintenanceOrder(
        id=new_id,
        ticket_number=ticket_num,
        status="Open",
        is_predictive=False,
        created_at="Just now",
        **payload.model_dump()
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@router.patch("/{order_id}/status", response_model=MaintenanceOrderResponse)
def update_order_status(
    order_id: str,
    payload: MaintenanceOrderStatusPatch,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Advance or update work order status (Open, In Progress, Scheduled, Resolved)."""
    order = db.query(MaintenanceOrder).filter(MaintenanceOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Work order '{order_id}' not found.")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(
    order_id: str,
    current_user: Optional[dict] = Depends(enforce_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Delete a maintenance work order."""
    order = db.query(MaintenanceOrder).filter(MaintenanceOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Work order '{order_id}' not found.")

    db.delete(order)
    db.commit()
    return None
