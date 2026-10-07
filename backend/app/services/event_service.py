from uuid import uuid4
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from app.database import get_database
from app.schemas.event import EventCreate, EventUpdate
from app.models.event import EventStatus

class EventService:
    @staticmethod
    async def create_event(event_in: EventCreate, organizer_id: str) -> dict:
        db = get_database()
        event_dict = event_in.dict()
        event_dict["_id"] = str(uuid4())
        event_dict["organizer_id"] = organizer_id
        event_dict["available_tickets"] = event_in.capacity
        event_dict["status"] = EventStatus.PUBLISHED
        now = datetime.utcnow()
        event_dict["created_at"] = now
        event_dict["updated_at"] = now
        if not event_dict.get("start_time"):
            event_dict["start_time"] = now
        if not event_dict.get("end_time"):
            event_dict["end_time"] = now
        
        await db.events.insert_one(event_dict)
        event_dict["id"] = event_dict["_id"]
        return event_dict

    @staticmethod
    async def get_events(
        category_id: Optional[str] = None,
        venue_id: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        skip: int = 0
    ) -> List[dict]:
        db = get_database()
        query = {}
        if category_id:
            query["category_id"] = category_id
        if venue_id:
            query["venue_id"] = venue_id
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        
        cursor = db.events.find(query).skip(skip).limit(limit)
        events = []
        async for event in cursor:
            event["id"] = str(event["_id"])
            events.append(event)
        return events

    @staticmethod
    async def get_event_by_id(event_id: str) -> dict:
        db = get_database()
        event = await db.events.find_one({"_id": event_id})
        if not event:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        event["id"] = str(event["_id"])
        return event

    @staticmethod
    async def update_event(event_id: str, event_in: EventUpdate, user_id: str) -> dict:
        db = get_database()
        event = await db.events.find_one({"_id": event_id})
        if not event:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        if event["organizer_id"] != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this event")

        update_data = {k: v for k, v in event_in.dict(exclude_unset=True).items()}
        update_data["updated_at"] = datetime.utcnow()

        await db.events.update_one({"_id": event_id}, {"$set": update_data})
        updated = await db.events.find_one({"_id": event_id})
        updated["id"] = str(updated["_id"])
        return updated

    @staticmethod
    async def delete_event(event_id: str) -> dict:
        db = get_database()
        result = await db.events.delete_one({"_id": event_id})
        return {"message": "Event deleted", "deleted": result.deleted_count > 0}
