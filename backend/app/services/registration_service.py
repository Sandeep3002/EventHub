from uuid import uuid4
from datetime import datetime
from typing import List
from fastapi import HTTPException, status
from app.database import get_database
from app.schemas.registration import RegistrationCreate
from app.models.registration import RegistrationStatus
from app.utils.email import send_booking_details_email, send_custom_email

from app.config.settings import settings

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
        final_amount = reg_in.total_amount if reg_in.total_amount else total_amount

        # EventHub 5% Marketplace Commission calculation
        commission_rate = getattr(settings, "PLATFORM_COMMISSION_PERCENT", 5.0)
        platform_commission = round(float(final_amount) * (commission_rate / 100.0), 2)
        organizer_share = round(float(final_amount) - platform_commission, 2)
        organizer_id = event.get("organizer_id", "")
        transfer_id = f"trf_sim_{uuid4().hex[:10]}"

        reg_dict = {
            "_id": str(uuid4()),
            "event_id": reg_in.event_id,
            "user_id": user_id,
            "ticket_id": reg_in.ticket_id,
            "quantity": reg_in.quantity,
            "total_amount": final_amount,
            "platform_commission": platform_commission,
            "organizer_share": organizer_share,
            "organizer_id": organizer_id,
            "commission_rate": commission_rate,
            "transfer_id": transfer_id,
            "transfer_status": "settled",
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

        # Record payment transaction
        payment_dict = {
            "_id": str(uuid4()),
            "registration_id": reg_dict["_id"],
            "user_id": user_id,
            "amount": final_amount,
            "currency": "INR",
            "payment_method": reg_in.payment_method or "credit_card",
            "transaction_id": f"TXN-{uuid4().hex[:10].upper()}",
            "status": "completed",
            "platform_commission": platform_commission,
            "organizer_share": organizer_share,
            "organizer_id": organizer_id,
            "transfer_id": transfer_id,
            "transfer_status": "settled",
            "created_at": datetime.utcnow(),
        }
        await db.payments.insert_one(payment_dict)
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
    async def cancel_registration(registration_id: str, user_id: str) -> dict:
        db = get_database()
        reg = await db.registrations.find_one({"_id": registration_id})
        if not reg:
            raise HTTPException(status_code=404, detail="Registration not found")
        if reg["user_id"] != user_id:
            # Allow admins too — caller checks are in route layer
            user = await db.users.find_one({"_id": user_id})
            if not user or user.get("role") not in ("admin", "organizer", "superadmin"):
                raise HTTPException(status_code=403, detail="Not allowed to cancel this registration")
        if reg.get("status") == "cancelled":
            raise HTTPException(status_code=400, detail="Registration already cancelled")
        await db.registrations.update_one(
            {"_id": registration_id},
            {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}}
        )
        # Restore seats
        await db.events.update_one(
            {"_id": reg["event_id"]},
            {"$inc": {"available_tickets": reg.get("quantity", 1)}}
        )
        return {"message": "Registration cancelled and seats restored"}

    @staticmethod
    async def delete_registration(registration_id: str, current_user: dict = None) -> dict:
        db = get_database()
        reg = await db.registrations.find_one({"_id": registration_id})
        if not reg:
            raise HTTPException(status_code=404, detail="Registration not found")
        if current_user:
            is_owner = reg.get("user_id") == current_user.get("id") or reg.get("user_id") == current_user.get("_id")
            is_admin = current_user.get("role") in ("admin", "organizer", "superadmin")
            if not is_owner and not is_admin:
                raise HTTPException(status_code=403, detail="Not authorized to delete this registration")
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

    @staticmethod
    async def check_in_pass(qr_token: str, action: str = "check_in", current_user: dict = None) -> dict:
        import re
        db = get_database()
        token_clean = (qr_token or "").strip()
        if not token_clean:
            raise HTTPException(status_code=400, detail="QR Code or Pass code is required.")

        reg = await db.registrations.find_one({
            "qr_code_token": {"$regex": f"^{re.escape(token_clean)}$", "$options": "i"}
        })

        if not reg:
            raise HTTPException(status_code=404, detail="Invalid Ticket: Pass code not found.")

        reg["id"] = str(reg["_id"])
        event = await db.events.find_one({"_id": reg.get("event_id")})
        reg["event_title"] = event.get("title", reg.get("event_title", "Event")) if event else reg.get("event_title", "Event")
        reg["event_start_time"] = event.get("start_time").strftime("%b %d, %Y • %I:%M %p") if event and event.get("start_time") else None
        reg["event_venue"] = event.get("venue_id") or event.get("location") or "Main Venue" if event else "Main Venue"

        # If user is organizer, ensure they own this event or are admin/superadmin
        if current_user and current_user.get("role") == "organizer":
            if event and event.get("organizer_id") and event.get("organizer_id") != current_user.get("id"):
                raise HTTPException(status_code=403, detail="Unauthorized: This pass belongs to an event hosted by another organizer.")

        if reg.get("status") == "cancelled":
            return {
                "valid": False,
                "status": "cancelled",
                "message": "⚠️ Ticket has been CANCELLED! Entry Denied.",
                "registration": reg
            }

        already_checked_in = bool(reg.get("checked_in"))
        checked_in_at = reg.get("checked_in_at")

        if action == "undo":
            await db.registrations.update_one(
                {"_id": reg["_id"]},
                {"$set": {"checked_in": False, "checked_in_at": None}}
            )
            reg["checked_in"] = False
            reg["checked_in_at"] = None
            return {
                "valid": True,
                "already_checked_in": False,
                "message": "Check-in undone successfully.",
                "registration": reg
            }

        if already_checked_in:
            time_str = checked_in_at.strftime("%I:%M %p, %b %d") if hasattr(checked_in_at, "strftime") else str(checked_in_at)
            return {
                "valid": True,
                "already_checked_in": True,
                "checked_in_at": time_str,
                "message": f"⚠️ ALREADY CHECKED IN at {time_str}!",
                "registration": reg
            }

        if action == "verify":
            return {
                "valid": True,
                "already_checked_in": False,
                "message": "✅ Ticket is Valid & Confirmed.",
                "registration": reg
            }

        now = datetime.utcnow()
        await db.registrations.update_one(
            {"_id": reg["_id"]},
            {"$set": {"checked_in": True, "checked_in_at": now}}
        )
        reg["checked_in"] = True
        reg["checked_in_at"] = now.strftime("%I:%M %p, %b %d")
        return {
            "valid": True,
            "already_checked_in": False,
            "message": "✅ VERIFIED & CHECKED IN! Welcome!",
            "registration": reg
        }

