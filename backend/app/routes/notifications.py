from uuid import uuid4
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.database import get_database
from app.routes.auth import get_current_user

router = APIRouter()


@router.get("/")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db.notifications.find({"user_id": current_user["_id"]}).sort("created_at", -1).limit(50)
    notifs = []
    async for n in cursor:
        n["id"] = str(n["_id"])
        notifs.append(n)
    return notifs


@router.put("/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db.notifications.update_one(
        {"_id": notification_id, "user_id": current_user["_id"]},
        {"$set": {"is_read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Marked as read"}


@router.put("/read-all")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    db = get_database()
    await db.notifications.update_many(
        {"user_id": current_user["_id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"message": "All notifications marked as read"}


async def create_notification(user_id: str, title: str, message: str, notif_type: str = "info", link: str = "") -> dict:
    db = get_database()
    notif = {
        "_id": str(uuid4()),
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notif_type,
        "link": link,
        "is_read": False,
        "created_at": datetime.utcnow(),
    }
    await db.notifications.insert_one(notif)
    return notif
