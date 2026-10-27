from enum import Enum
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class TicketType(str, Enum):
    GENERAL = "general"
    VIP = "vip"
    EARLY_BIRD = "early_bird"
    STUDENT = "student"

class TicketInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    event_id: str
    name: str
    ticket_type: TicketType = TicketType.GENERAL
    price: float
    total_quantity: int
    remaining_quantity: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
