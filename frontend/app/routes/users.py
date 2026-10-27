from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.schemas.user import UserResponse, UserUpdate
from app.routes.auth import get_current_user, require_admin, require_superadmin
from app.database import get_database
from app.models.user import UserRole

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def list_users(current_user: dict = Depends(require_admin)):
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
async def get_user(user_id: str, current_user: dict = Depends(require_admin)):
    db = get_database()
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user["id"] = str(user["_id"])
    return user


class RoleUpdate(BaseModel):
    role: UserRole


@router.put("/{user_id}/role", response_model=UserResponse)
async def update_user_role(user_id: str, role_in: RoleUpdate, current_user: dict = Depends(require_superadmin)):
    db = get_database()
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_id == current_user["_id"]:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"role": role_in.role, "updated_at": datetime.utcnow()}}
    )
    updated = await db.users.find_one({"_id": user_id})
    updated["id"] = str(updated["_id"])
    return updated


@router.put("/{user_id}/toggle-active", response_model=UserResponse)
async def toggle_user_active(user_id: str, current_user: dict = Depends(require_superadmin)):
    db = get_database()
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_id == current_user["_id"]:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    new_active = not user.get("is_active", True)
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"is_active": new_active, "updated_at": datetime.utcnow()}}
    )
    updated = await db.users.find_one({"_id": user_id})
    updated["id"] = str(updated["_id"])
    return updated


@router.delete("/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(require_superadmin)):
    db = get_database()
    if user_id == current_user["_id"]:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    result = await db.users.delete_one({"_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}
