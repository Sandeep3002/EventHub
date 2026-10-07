from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.services.auth_service import AuthService
from app.utils.security import decode_access_token, create_access_token, get_password_hash
from app.utils.email import send_welcome_email, send_password_reset_email
from app.database import get_database
from pydantic import BaseModel, EmailStr
from datetime import timedelta

from typing import Optional

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login-form", auto_error=False)

async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise credentials_exception
    db = get_database()
    user = await db.users.find_one({"_id": payload["sub"]})
    if not user:
        raise credentials_exception
    user["id"] = str(user["_id"])
    return user

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate):
    result = await AuthService.register_user(user_in)
    # Send welcome email in background (don't block registration)
    try:
        await send_welcome_email(user_in.email, user_in.full_name, user_in.role or "attendee")
    except Exception:
        pass
    return result

@router.post("/login", response_model=Token)
async def login(user_in: UserLogin):
    return await AuthService.authenticate_user(user_in)

@router.post("/login-form", response_model=Token)
async def login_form(form_data: OAuth2PasswordRequestForm = Depends()):
    user_in = UserLogin(email=form_data.username, password=form_data.password)
    return await AuthService.authenticate_user(user_in)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    db = get_database()
    user = await db.users.find_one({"email": req.email})
    if not user:
        # Don't reveal if email exists or not
        return {"message": "If an account with that email exists, a reset link has been sent."}

    # Create a short-lived token (15 min)
    reset_token = create_access_token(
        data={"sub": user["_id"], "purpose": "password_reset"},
        expires_delta=timedelta(minutes=15)
    )

    # Send the email
    await send_password_reset_email(
        email_to=req.email,
        user_name=user.get("full_name", "User"),
        reset_token=reset_token
    )

    return {"message": "If an account with that email exists, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    payload = decode_access_token(req.token)
    if not payload or payload.get("purpose") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid token.")

    db = get_database()
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    from datetime import datetime
    hashed = get_password_hash(req.new_password)
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"hashed_password": hashed, "updated_at": datetime.utcnow()}}
    )

    return {"message": "Password has been reset successfully. You can now log in."}


def require_superadmin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "superadmin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super Admin access required")
    return current_user


def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ("admin", "organizer", "superadmin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
