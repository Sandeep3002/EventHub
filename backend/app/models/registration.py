from enum import Enum
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class RegistrationStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"

class RegistrationInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    event_id: str
    user_id: str
    ticket_id: str
    quantity: int = 1
    total_amount: float
    status: RegistrationStatus = RegistrationStatus.CONFIRMED
    qr_code_token: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
