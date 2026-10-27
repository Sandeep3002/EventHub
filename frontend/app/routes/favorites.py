from uuid import uuid4
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.database import get_database
from app.routes.auth import get_current_user

router = APIRouter()


@router.get("/")
async def get_favorites(current_user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db.favorites.find({"user_id": current_user["_id"]})
    favs = []
    async for f in cursor:
        f["id"] = str(f["_id"])
        favs.append(f)
    return favs


@router.post("/{event_id}")
async def add_favorite(event_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    existing = await db.favorites.find_one({"user_id": current_user["_id"], "event_id": event_id})
    if existing:
        return {"message": "Already in favorites", "id": str(existing["_id"])}
    fav = {
        "_id": str(uuid4()),
        "user_id": current_user["_id"],
        "event_id": event_id,
        "created_at": datetime.utcnow(),
    }
    await db.favorites.insert_one(fav)
    return {"message": "Added to favorites", "id": fav["_id"]}


@router.delete("/{event_id}")
async def remove_favorite(event_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db.favorites.delete_one({"user_id": current_user["_id"], "event_id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return {"message": "Removed from favorites"}
