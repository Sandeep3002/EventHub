from uuid import uuid4
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, status
from app.schemas.ticket import TicketCreate, TicketResponse
from app.database import get_database
from app.routes.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(ticket_in: TicketCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    t_dict = ticket_in.dict()
    t_dict["_id"] = str(uuid4())
    t_dict["remaining_quantity"] = ticket_in.total_quantity
    t_dict["created_at"] = datetime.utcnow()
    await db.tickets.insert_one(t_dict)
    t_dict["id"] = t_dict["_id"]
    return t_dict

@router.get("/event/{event_id}", response_model=List[TicketResponse])
async def list_event_tickets(event_id: str):
    db = get_database()
    cursor = db.tickets.find({"event_id": event_id})
    tickets = []
    async for t in cursor:
        t["id"] = str(t["_id"])
        tickets.append(t)
    return tickets
