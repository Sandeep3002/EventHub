# Plan: Email Notifications & Event Reminders

## What Already Works
- **Booking confirmation email** — `send_booking_details_email()` in `email.py` is already called from `registration_service.py` when a booking is created. This sends event details, payment info, and the digital pass code.
- **Welcome email** — sent on registration
- **Password reset email** — sent on forgot password
- **SMTP via aiosmtplib** — working with Gmail app password

## What Needs to Be Added

### 1. Add `aiosmtplib` to `requirements.txt`
Currently missing — add it so the dependency is tracked.

### 2. Event Reminder Email Template (`email.py`)
Add a new `send_event_reminder_email()` function with:
- Gradient header (orange/amber theme — "Event Tomorrow!")
- Attendee name, event title, date, time, location
- Digital pass code reminder
- "Don't forget to bring your digital pass" note

### 3. Background Reminder Scheduler (`utils/reminder_scheduler.py`)
A new module with an async function that:
- Runs every **1 hour** via `asyncio.sleep(3600)`
- Queries events where `start_time` is between **now** and **now + 24 hours**
- For each upcoming event, finds all registrations with `status: confirmed` and `reminder_sent != True`
- Sends `send_event_reminder_email()` to each attendee
- Sets `reminder_sent: True` on the registration to prevent duplicates
- Logs successes/failures

### 4. Wire Into FastAPI (`main.py`)
- On startup: create an asyncio background task running the scheduler
- On shutdown: cancel the task

### 5. Files Changed
| File | Change |
|------|--------|
| `backend/requirements.txt` | Add `aiosmtplib>=2.0.0` |
| `backend/app/utils/email.py` | Add `send_event_reminder_email()` |
| `backend/app/utils/reminder_scheduler.py` | **New** — background scheduler loop |
| `backend/app/main.py` | Start/stop scheduler on app lifecycle |
