import asyncio
import logging
from datetime import datetime, timedelta
from app.database import get_database
from app.utils.email import send_event_reminder_email

logger = logging.getLogger(__name__)

REMINDER_INTERVAL_SECONDS = 3600  # check every 1 hour
REMINDER_WINDOW_HOURS = 24       # send reminders for events within 24 hours


async def _send_reminders_for_event(db, event: dict) -> int:
    """Send reminder emails to all confirmed attendees of an event who haven't been reminded yet."""
    sent_count = 0

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

    cursor = db.registrations.find({
        "event_id": event["_id"],
        "status": "confirmed",
        "reminder_sent": {"$ne": True},
    })

    async for reg in cursor:
        email = reg.get("attendee_email", "")
        name = reg.get("attendee_name", "Attendee")
        pass_code = reg.get("qr_code_token", "N/A")

        if not email:
            continue

        success = await send_event_reminder_email(
            email_to=email,
            attendee_name=name,
            event_title=event.get("title", ""),
            event_date=event_date,
            event_time=event_time,
            event_location=event_location,
            pass_code=pass_code,
        )

        if success:
            await db.registrations.update_one(
                {"_id": reg["_id"]},
                {"$set": {"reminder_sent": True}}
            )
            sent_count += 1
            logger.info(f"Reminder sent to {email} for event '{event.get('title')}'")
        else:
            logger.warning(f"Failed to send reminder to {email} for event '{event.get('title')}'")

    return sent_count


async def check_and_send_reminders():
    """Find events starting within 24 hours and send reminders to attendees."""
    try:
        db = get_database()
        now = datetime.utcnow()
        window_end = now + timedelta(hours=REMINDER_WINDOW_HOURS)

        upcoming_events = db.events.find({
            "start_time": {"$gte": now, "$lte": window_end},
        })

        total_sent = 0
        async for event in upcoming_events:
            sent = await _send_reminders_for_event(db, event)
            total_sent += sent

        if total_sent > 0:
            logger.info(f"Reminder cycle complete: {total_sent} reminder(s) sent")
    except Exception as e:
        logger.error(f"Reminder scheduler error: {type(e).__name__}: {e}")


async def reminder_scheduler_loop():
    """Background loop that periodically checks for upcoming events and sends reminders."""
    logger.info("Event reminder scheduler started")
    while True:
        await check_and_send_reminders()
        await asyncio.sleep(REMINDER_INTERVAL_SECONDS)
