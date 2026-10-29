import os
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config import JWT_SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

security_scheme = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hash a password using PBKDF2 with HMAC-SHA256 and a random 16-byte salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored salt$hash format."""
    try:
        salt, expected_hex = hashed_password.split('$')
        key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return secrets.compare_digest(key.hex(), expected_hex)
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Optional[Dict[str, Any]]:
    """Retrieve the current user from the Authorization header if provided."""
    if not credentials:
        return None
    return decode_access_token(credentials.credentials)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Dict[str, Any]:
    """Ensure the user is authenticated and return their payload."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decode_access_token(credentials.credentials)

def require_role(allowed_roles: List[str]):
    """Dependency factory enforcing role-based access control (RBAC)."""
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get("role", "viewer")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Action requires one of roles {allowed_roles}. You have role '{user_role}'."
            )
        return current_user
    return role_checker

def enforce_role(allowed_roles: List[str]):
    """
    RBAC dependency: If an Authorization token is provided, strictly validates that the user's
    role is in allowed_roles, raising HTTP 403 Forbidden otherwise.
    """
    async def role_evaluator(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
    ) -> Optional[Dict[str, Any]]:
        if not credentials:
            return None
        user = decode_access_token(credentials.credentials)
        role = user.get("role", "viewer")
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Action requires role in {allowed_roles}. Your active role is '{role}'."
            )
        return user
    return role_evaluator
