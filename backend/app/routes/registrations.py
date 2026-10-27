from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, status
from app.schemas.registration import RegistrationCreate, RegistrationResponse
from app.services.registration_service import RegistrationService
from app.services.activity_service import ActivityService
from app.routes.auth import get_current_user, require_admin
from app.routes.notifications import create_notification

router = APIRouter()


@router.post("/", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_for_event(
    reg_in: RegistrationCreate,
    current_user: dict = Depends(get_current_user)
):
    result = await RegistrationService.create_registration(reg_in, current_user["id"])
    await ActivityService.log_activity(
        actor_id=current_user["id"], actor_name=reg_in.attendee_name or current_user.get("full_name", ""),
        actor_role=current_user.get("role", "attendee"), action="new_registration",
        target_type="registration", target_name=result.get("event_title", "Event"),
        target_id=result.get("id", ""),
        details=f"New registration for '{result.get('event_title', 'Event')}' by {reg_in.attendee_name or 'attendee'}, amount ₹{result.get('total_amount', 0)}",
    )
    await create_notification(
        user_id=current_user["id"],
        title="Booking Confirmed",
        message=f"Your booking for '{result.get('event_title', 'Event')}' is confirmed. Pass: {result.get('qr_code_token', '')}",
        notif_type="booking",
        link=f"/customer/bookings",
    )
    return result


@router.get("/my-registrations", response_model=List[RegistrationResponse])
async def get_my_registrations(current_user: dict = Depends(get_current_user)):
    return await RegistrationService.get_user_registrations(current_user["id"])


@router.get("/all")
async def get_all_registrations(current_user: dict = Depends(require_admin)):
    return await RegistrationService.get_all_registrations()


@router.delete("/{registration_id}")
async def delete_registration(registration_id: str, current_user: dict = Depends(get_current_user)):
    result = await RegistrationService.delete_registration(registration_id, current_user)
    await ActivityService.log_activity(
        actor_id=current_user["id"], actor_name=current_user.get("full_name", ""),
        actor_role=current_user.get("role", "admin"), action="deleted_registration",
        target_type="registration", target_name=f"Registration {registration_id}",
        target_id=registration_id, details=f"Deleted registration {registration_id}",
    )
    return result


@router.put("/{registration_id}/cancel")
async def cancel_registration(registration_id: str, current_user: dict = Depends(get_current_user)):
    result = await RegistrationService.cancel_registration(registration_id, current_user["id"])
    await ActivityService.log_activity(
        actor_id=current_user["id"], actor_name=current_user.get("full_name", ""),
        actor_role=current_user.get("role", "attendee"), action="cancelled_registration",
        target_type="registration", target_name=f"Registration {registration_id}",
        target_id=registration_id, details=f"Cancelled registration {registration_id}",
    )
    return result


class SendEmailRequest(BaseModel):
    registration_ids: List[str] = []
    subject: str = "EventHub Notification"
    message: str = ""


@router.post("/send-email")
async def send_email_to_attendees(req: SendEmailRequest, current_user: dict = Depends(require_admin)):
    return await RegistrationService.send_email_to_attendees(req.registration_ids, req.subject, req.message)


class CheckInRequest(BaseModel):
    qr_token: str
    action: Optional[str] = "check_in"  # "check_in", "verify", "undo"


@router.post("/check-in", include_in_schema=False)
@router.post("/check-in/")
async def check_in_attendee(req: CheckInRequest, current_user: dict = Depends(require_admin)):
    result = await RegistrationService.check_in_pass(
        qr_token=req.qr_token,
        action=req.action or "check_in",
        current_user=current_user
    )
    reg = result.get("registration", {})
    if result.get("valid") and not result.get("already_checked_in") and req.action == "check_in":
        await ActivityService.log_activity(
            actor_id=current_user["id"],
            actor_name=current_user.get("full_name", "Organizer"),
            actor_role=current_user.get("role", "organizer"),
            action="attendee_checked_in",
            target_type="registration",
            target_name=f"{reg.get('attendee_name', 'Attendee')} ({req.qr_token})",
            target_id=reg.get("id", ""),
            details=f"Checked in attendee '{reg.get('attendee_name')}' for event '{reg.get('event_title')}'",
        )
    return result

