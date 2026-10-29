import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.db_models import User
from models.schemas import LoginRequest, TokenResponse, UserResponse, UserCreate
from security import verify_password, hash_password, create_access_token, get_current_user, require_role

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password, returning signed JWT token."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated.")

    token_data = {
        "sub": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role
    }
    access_token = create_access_token(token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve profile of the currently authenticated user."""
    user = db.query(User).filter(User.id == current_user.get("sub")).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active
    )

@router.get("/users", response_model=List[UserResponse])
def list_users(
    current_user: dict = Depends(require_role(["admin", "operator"])),
    db: Session = Depends(get_db)
):
    """List all registered campus users (Admin/Operator only)."""
    users = db.query(User).all()
    return [
        UserResponse(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            is_active=u.is_active
        )
        for u in users
    ]

@router.post("/users", response_model=UserResponse)
def create_user(
    payload: UserCreate,
    current_user: dict = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Create a new user account (Admin only)."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered.")

    new_user = User(
        id=f"usr-{uuid.uuid4().hex[:8]}",
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        is_active=new_user.is_active
    )
