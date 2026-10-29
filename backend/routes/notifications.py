import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import Notification
from models.schemas import NotificationResponse, NotificationCreate
from security import get_current_user_optional, enforce_role

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications & Alerts"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(db: Session = Depends(get_db)):
    """Retrieve active campus alert notifications."""
    notifs = db.query(Notification).order_by(Notification.id.desc()).all()
    return notifs

@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    payload: NotificationCreate,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Publish a new campus alert notification."""
    new_id = f"notif-{uuid.uuid4().hex[:6]}"
    notif = Notification(
        id=new_id,
        title=payload.title,
        description=payload.description,
        timestamp="Just now",
        severity=payload.severity,
        category=payload.category,
        action_url=payload.action_url,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

@router.patch("/{notif_id}/read", response_model=NotificationResponse)
def mark_as_read(notif_id: str, db: Session = Depends(get_db)):
    """Mark a single notification as read."""
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif

@router.post("/mark-all-read")
def mark_all_read(db: Session = Depends(get_db)):
    """Mark all notifications as read."""
    db.query(Notification).update({"is_read": True})
    db.commit()
    return {"status": "success", "message": "All notifications marked as read."}

@router.delete("/{notif_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notif_id: str,
    current_user: Optional[dict] = Depends(enforce_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """Dismiss and remove a notification alert."""
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    db.delete(notif)
    db.commit()
    return None
