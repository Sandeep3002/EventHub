from uuid import uuid4
from datetime import datetime
from typing import List
from fastapi import HTTPException, status
from app.database import get_database
from app.schemas.registration import RegistrationCreate
from app.models.registration import RegistrationStatus
from app.utils.email import send_booking_details_email, send_custom_email

class RegistrationService:
    @staticmethod
    async def create_registration(reg_in: RegistrationCreate, user_id: str) -> dict:
        db = get_database()
        event = await db.events.find_one({"_id": reg_in.event_id})
        if not event:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
        
        ticket = await db.tickets.find_one({"_id": reg_in.ticket_id})
        ticket_price = ticket["price"] if ticket else event.get("price", 0.0)

        if event.get("available_tickets", 0) < reg_in.quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough tickets available")

        qr_token = f"EVTHUB-{uuid4().hex[:8].upper()}"
        total_amount = ticket_price * reg_in.quantity

        reg_dict = {
            "_id": str(uuid4()),
            "event_id": reg_in.event_id,
            "user_id": user_id,
            "ticket_id": reg_in.ticket_id,
            "quantity": reg_in.quantity,
            "total_amount": reg_in.total_amount if reg_in.total_amount else total_amount,
            "status": RegistrationStatus.CONFIRMED,
            "qr_code_token": qr_token,
            "attendee_name": reg_in.attendee_name or "",
            "attendee_phone": reg_in.attendee_phone or "",
            "attendee_email": reg_in.attendee_email or "",
            "attendee_age": reg_in.attendee_age,
            "event_title": event.get("title", ""),
            "payment_method": reg_in.payment_method or "credit_card",
            "created_at": datetime.utcnow()
        }

        await db.registrations.insert_one(reg_dict)
        # Deduct ticket quantity
        await db.events.update_one(
            {"_id": reg_in.event_id},
            {"$inc": {"available_tickets": -reg_in.quantity}}
        )

        # Fetch user for fallback email/name
        user = await db.users.find_one({"_id": user_id})

        # Send detailed booking email to attendee
        recipient_email = reg_in.attendee_email or (user.get("email") if user else "")
        recipient_name = reg_in.attendee_name or (user.get("full_name", "") if user else "")
        if recipient_email:
            # Format event date and time
            start = event.get("start_time")
            end = event.get("end_time")
            event_date = start.strftime("%B %d, %Y") if start else "TBD"
            event_time = ""
            if start:
                event_time = start.strftime("%I:%M %p")
                if end:
                    event_time += f" - {end.strftime('%I:%M %p')}"
            else:
                event_time = "TBD"
            event_location = event.get("venue_id") or event.get("location") or "TBD"

            await send_booking_details_email(
                email_to=recipient_email,
                attendee_name=recipient_name,
                event_title=event.get("title", ""),
                event_date=event_date,
                event_time=event_time,
                event_location=event_location,
                amount=reg_dict["total_amount"],
                pass_code=qr_token,
                payment_method=reg_in.payment_method or "Card",
            )

        reg_dict["id"] = reg_dict["_id"]
        return reg_dict

    @staticmethod
    async def get_user_registrations(user_id: str) -> List[dict]:
        db = get_database()
        cursor = db.registrations.find({"user_id": user_id})
        registrations = []
        async for reg in cursor:
            reg["id"] = str(reg["_id"])
            registrations.append(reg)
        return registrations

    @staticmethod
    async def delete_registration(registration_id: str) -> dict:
        db = get_database()
        result = await db.registrations.delete_one({"_id": registration_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Registration not found")
        return {"message": "Registration deleted"}

    @staticmethod
    async def get_all_registrations() -> List[dict]:
        db = get_database()
        cursor = db.registrations.find().sort("created_at", -1)
        registrations = []
        async for reg in cursor:
            reg["id"] = str(reg["_id"])
            event = await db.events.find_one({"_id": reg.get("event_id")})
            reg["event_title"] = event["title"] if event else "Unknown Event"
            registrations.append(reg)
        return registrations

    @staticmethod
    async def send_email_to_attendees(registration_ids: List[str], subject: str, message: str) -> dict:
        db = get_database()
        sent_to = []
        for rid in registration_ids:
            reg = await db.registrations.find_one({"_id": rid})
            if not reg:
                continue
            email = reg.get("attendee_email", "")
            name = reg.get("attendee_name", "Attendee")
            if email:
                success = await send_custom_email(email, name, subject, message)
                sent_to.append(email if success else f"{email} (failed)")
        return {"sent_count": len(sent_to), "sent_to": sent_to}
