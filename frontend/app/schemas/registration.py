from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.registration import RegistrationStatus

class RegistrationCreate(BaseModel):
    event_id: str
    ticket_id: str = ""
    quantity: int = 1
    attendee_name: Optional[str] = None
    attendee_phone: Optional[str] = None
    attendee_email: Optional[str] = None
    attendee_age: Optional[int] = None
    total_amount: Optional[float] = None
    payment_method: Optional[str] = None

class RegistrationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    event_id: str
    user_id: str
    ticket_id: str
    quantity: int
    total_amount: float
    status: RegistrationStatus
    qr_code_token: str
    created_at: datetime
    attendee_name: Optional[str] = None
    attendee_phone: Optional[str] = None
    attendee_email: Optional[str] = None
    attendee_age: Optional[int] = None
    event_title: Optional[str] = None
    payment_method: Optional[str] = None
