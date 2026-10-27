from uuid import uuid4
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.venue import VenueCreate, VenueResponse
from app.database import get_database
from app.routes.auth import get_current_user, require_admin

router = APIRouter()

@router.post("/", response_model=VenueResponse, status_code=status.HTTP_201_CREATED)
async def create_venue(venue_in: VenueCreate, current_user: dict = Depends(require_admin)):
    db = get_database()
    venue_dict = venue_in.dict()
    venue_dict["_id"] = str(uuid4())
    venue_dict["created_at"] = datetime.utcnow()
    await db.venues.insert_one(venue_dict)
    venue_dict["id"] = venue_dict["_id"]
    return venue_dict

@router.get("/", response_model=List[VenueResponse])
async def list_venues():
    db = get_database()
    cursor = db.venues.find()
    venues = []
    async for v in cursor:
        v["id"] = str(v["_id"])
        venues.append(v)
    return venues

@router.put("/{venue_id}", response_model=VenueResponse)
async def update_venue(venue_id: str, venue_in: VenueCreate, current_user: dict = Depends(require_admin)):
    db = get_database()
    existing = await db.venues.find_one({"_id": venue_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Venue not found")
    update_dict = venue_in.dict()
    update_dict["updated_at"] = datetime.utcnow()
    await db.venues.update_one({"_id": venue_id}, {"$set": update_dict})
    updated = await db.venues.find_one({"_id": venue_id})
    updated["id"] = str(updated["_id"])
    return updated

@router.delete("/{venue_id}")
async def delete_venue(venue_id: str, current_user: dict = Depends(require_admin)):
    db = get_database()
    result = await db.venues.delete_one({"_id": venue_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Venue not found")
    return {"message": "Venue deleted"}
