from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user import UserResponse
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

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user["id"] = str(user["_id"])
    return user
