from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.ticket import TicketType

class TicketCreate(BaseModel):
    event_id: str
    name: str
    ticket_type: TicketType = TicketType.GENERAL
    price: float
    total_quantity: int

class TicketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    event_id: str
    name: str
    ticket_type: TicketType
    price: float
    total_quantity: int
    remaining_quantity: int
    created_at: datetime
