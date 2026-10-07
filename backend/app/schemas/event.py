from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.event import EventStatus

class EventCreate(BaseModel):
    title: str
    description: str
    category_id: Optional[str] = "general"
    venue_id: Optional[str] = "tbd"
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    banner_image: Optional[str] = None
    capacity: int = 100
    price: float = 0.0
    tags: List[str] = []

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    venue_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    banner_image: Optional[str] = None
    capacity: Optional[int] = None
    price: Optional[float] = None
    tags: Optional[List[str]] = None
    status: Optional[EventStatus] = None

class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    category_id: str
    venue_id: str
    organizer_id: str
    start_time: datetime
    end_time: datetime
    banner_image: Optional[str] = None
    capacity: int
    available_tickets: int
    price: float
    tags: List[str]
    status: EventStatus
    created_at: datetime
    updated_at: datetime
