import re
from uuid import uuid4
from datetime import datetime
from fastapi import HTTPException, status
from app.database import get_database
from app.models.user import UserInDB, UserRole
from app.schemas.user import UserCreate, UserLogin
from app.utils.security import get_password_hash, verify_password, create_access_token

class AuthService:
    @staticmethod
    async def register_user(user_in: UserCreate) -> dict:
        db = get_database()
        clean_email = user_in.email.strip().lower()
        existing = await db.users.find_one({"email": {"$regex": f"^{re.escape(clean_email)}$", "$options": "i"}})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists."
            )
        
        user_dict = {
            "_id": str(uuid4()),
            "full_name": user_in.full_name,
            "email": clean_email,
            "hashed_password": get_password_hash(user_in.password),
            "role": user_in.role or UserRole.ATTENDEE,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.users.insert_one(user_dict)
        token_data = {"sub": user_dict["_id"], "role": user_dict["role"]}
        access_token = create_access_token(token_data)
        
        user_dict["id"] = user_dict["_id"]
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_dict
        }

    @staticmethod
    async def authenticate_user(user_in: UserLogin) -> dict:
        db = get_database()
        clean_email = user_in.email.strip().lower()
        user = await db.users.find_one({"email": {"$regex": f"^{re.escape(clean_email)}$", "$options": "i"}})
        if not user or not verify_password(user_in.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password."
            )
        
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account."
            )

        token_data = {"sub": user["_id"], "role": user["role"]}
        access_token = create_access_token(token_data)
        
        user["id"] = user["_id"]
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
