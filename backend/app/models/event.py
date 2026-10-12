from enum import Enum
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class EventStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class EventInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    title: str
    description: str
    category_id: str
    venue_id: str
    organizer_id: str
    start_time: datetime
    end_time: datetime
    banner_image: Optional[str] = None
    capacity: int = 100
    available_tickets: int = 100
    price: float = 0.0
    tags: List[str] = []
    status: EventStatus = EventStatus.PUBLISHED
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
