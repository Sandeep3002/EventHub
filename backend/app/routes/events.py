from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.services.event_service import EventService
from app.services.activity_service import ActivityService
from app.routes.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(event_in: EventCreate, current_user: dict = Depends(get_current_user)):
    result = await EventService.create_event(event_in, organizer_id=current_user["id"])
    await ActivityService.log_activity(
        actor_id=current_user["id"], actor_name=current_user.get("full_name", ""),
        actor_role=current_user.get("role", "admin"), action="created_event",
        target_type="event", target_name=event_in.title, target_id=result.get("id", ""),
        details=f"Created event '{event_in.title}' with capacity {event_in.capacity}, price ₹{event_in.price}",
    )
    return result

@router.get("/", response_model=List[EventResponse])
async def list_events(
    category_id: Optional[str] = None,
    venue_id: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0)
):
    return await EventService.get_events(category_id, venue_id, search, limit, skip)

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    return await EventService.get_event_by_id(event_id)

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event_in: EventUpdate,
    current_user: dict = Depends(get_current_user)
):
    result = await EventService.update_event(event_id, event_in, current_user["id"])
    await ActivityService.log_activity(
        actor_id=current_user["id"], actor_name=current_user.get("full_name", ""),
        actor_role=current_user.get("role", "admin"), action="updated_event",
        target_type="event", target_name=event_in.title or "Event", target_id=event_id,
        details=f"Updated event '{event_in.title or 'Event'}'",
    )
    return result

@router.delete("/{event_id}", status_code=status.HTTP_200_OK)
async def delete_event(event_id: str, current_user: dict = Depends(get_current_user)):
    result = await EventService.delete_event(event_id)
    await ActivityService.log_activity(
        actor_id=current_user["id"], actor_name=current_user.get("full_name", ""),
        actor_role=current_user.get("role", "admin"), action="deleted_event",
        target_type="event", target_name=f"Event {event_id}", target_id=event_id,
        details=f"Deleted event {event_id}",
    )
    return result
