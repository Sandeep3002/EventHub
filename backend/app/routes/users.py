from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import UserResponse, UserUpdate
from app.routes.auth import get_current_user
from app.database import get_database

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def list_users(current_user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db.users.find()
    users = []
    async for u in cursor:
        u["id"] = str(u["_id"])
        users.append(u)
    return users

@router.put("/me", response_model=UserResponse)
async def update_my_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_dict = {}
    if update_data.full_name:
        update_dict["full_name"] = update_data.full_name
    if update_data.phone is not None:
        update_dict["phone"] = update_data.phone
    if update_data.password:
        from app.utils.security import get_password_hash
        update_dict["hashed_password"] = get_password_hash(update_data.password)
    
    if update_dict:
        update_dict["updated_at"] = datetime.utcnow()
        await db.users.update_one({"_id": current_user["_id"]}, {"$set": update_dict})
    
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    updated_user["id"] = str(updated_user["_id"])
    return updated_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user["id"] = str(user["_id"])
    return user
