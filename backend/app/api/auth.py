from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime

from app.core.database import get_db
from app.models.database import User, AuditLog
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "Engineer"
    department: Optional[str] = "IT Operations"

class ClerkSyncRequest(BaseModel):
    clerk_user_id: str
    email: str
    name: Optional[str] = "AetherPay User"
    phone_number: Optional[str] = None
    role: Optional[str] = "Lead SRE"

class UserResponse(BaseModel):
    id: int
    clerk_user_id: Optional[str] = None
    name: str
    email: str
    phone_number: Optional[str] = None
    role: str
    department: Optional[str] = "Platform Operations"

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

@router.post("/clerk-sync", response_model=UserResponse)
def sync_clerk_user(payload: ClerkSyncRequest, db: Session = Depends(get_db)):
    """Synchronize Clerk authenticated user with SQLite backend database."""
    user = db.query(User).filter(
        (User.clerk_user_id == payload.clerk_user_id) | (User.email == payload.email)
    ).first()

    now = datetime.datetime.utcnow()

    if not user:
        user = User(
            clerk_user_id=payload.clerk_user_id,
            name=payload.name or payload.email.split("@")[0].capitalize(),
            email=payload.email,
            phone_number=payload.phone_number,
            role=payload.role or "Lead SRE",
            department="AetherPay Enterprise",
            last_login_at=now
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        db.add(AuditLog(
            user_id=user.id,
            action="CLERK_USER_CREATED",
            details=f"Created user from Clerk Auth: {user.email} (Phone: {user.phone_number or 'N/A'})."
        ))
        db.commit()
    else:
        user.clerk_user_id = payload.clerk_user_id
        if payload.phone_number:
            user.phone_number = payload.phone_number
        if payload.name:
            user.name = payload.name
        user.last_login_at = now

        db.add(AuditLog(
            user_id=user.id,
            action="CLERK_USER_LOGGED_IN",
            details=f"User verified via Clerk OTP: {user.email} (ID: {payload.clerk_user_id})."
        ))
        db.commit()
        db.refresh(user)

    return {
        "id": user.id,
        "clerk_user_id": user.clerk_user_id,
        "name": user.name,
        "email": user.email,
        "phone_number": user.phone_number,
        "role": user.role,
        "department": user.department or "Platform Operations"
    }

@router.post("/login", response_model=AuthTokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email & password and return JWT access token."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(data={"sub": user.email, "user_id": user.id, "role": user.role})
    
    db.add(AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        details=f"User {user.email} logged in successfully."
    ))
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "clerk_user_id": user.clerk_user_id,
            "name": user.name,
            "email": user.email,
            "phone_number": user.phone_number,
            "role": user.role,
            "department": user.department or "AetherPay Operations"
        }
    }

@router.post("/register", response_model=AuthTokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register new team member for AetherPay Global Inc."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role=payload.role or "Engineer",
        department=payload.department or "Site Reliability"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": user.email, "user_id": user.id, "role": user.role})

    db.add(AuditLog(
        user_id=user.id,
        action="USER_REGISTERED",
        details=f"New user registered: {user.email} ({user.role})."
    ))
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "clerk_user_id": user.clerk_user_id,
            "name": user.name,
            "email": user.email,
            "phone_number": user.phone_number,
            "role": user.role,
            "department": user.department
        }
    }

@router.get("/me", response_model=UserResponse)
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Fetch profile details for currently authenticated user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Bearer token"
        )
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token"
        )

    user = db.query(User).filter(User.email == payload["sub"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )

    return {
        "id": user.id,
        "clerk_user_id": user.clerk_user_id,
        "name": user.name,
        "email": user.email,
        "phone_number": user.phone_number,
        "role": user.role,
        "department": user.department or "Platform Operations"
    }
