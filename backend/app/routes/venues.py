from uuid import uuid4
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, status
from app.schemas.venue import VenueCreate, VenueResponse
from app.database import get_database
from app.routes.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=VenueResponse, status_code=status.HTTP_201_CREATED)
async def create_venue(venue_in: VenueCreate, current_user: dict = Depends(get_current_user)):
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
