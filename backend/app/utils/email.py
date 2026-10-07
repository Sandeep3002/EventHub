import logging
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config.settings import settings

logger = logging.getLogger(__name__)


async def _send_email(to_email: str, subject: str, html_body: str) -> bool:
    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(html_body, "html"))

        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_SERVER,
            port=587,
            start_tls=True,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            timeout=20,
        )

        logger.info(f"Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {type(e).__name__}: {e}")
        return False


async def send_confirmation_email(email_to: str, user_name: str, event_title: str, ticket_qr: str) -> bool:
    subject = f"Booking Confirmed - {event_title} | EventHub"
    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 32px 28px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmed!</h1>
        <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Your registration was successful</p>
      </div>
      <div style="background: white; padding: 28px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #334155; font-size: 15px; margin: 0 0 20px;">Hi <strong>{user_name}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
          Your booking for <strong style="color: #1e40af;">{event_title}</strong> has been confirmed.
        </p>
        <div style="background: #f1f5f9; border-radius: 10px; padding: 18px; margin: 0 0 20px;">
          <p style="margin: 0; font-size: 13px; color: #64748b;">Your Digital Pass Code</p>
          <p style="margin: 6px 0 0; font-size: 22px; font-weight: 700; color: #0f172a; font-family: monospace;">{ticket_qr}</p>
        </div>
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          Please show this pass code at the event entrance for verification.
        </p>
      </div>
      <div style="text-align: center; padding: 16px; color: #94a3b8; font-size: 11px;">
        EventHub - Event Management Platform
      </div>
    </div>
    """
    return await _send_email(email_to, subject, html)


async def send_event_reminder_email(
    email_to: str,
    attendee_name: str,
    event_title: str,
    event_date: str,
    event_time: str,
    event_location: str,
    pass_code: str,
) -> bool:
    subject = f"Reminder: {event_title} is Tomorrow! | EventHub"
    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: linear-gradient(135deg, #d97706, #f59e0b); padding: 32px 28px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          <span style="color: white; font-size: 24px;">&#9200;</span>
        </div>
        <h1 style="color: white; margin: 0; font-size: 22px;">Event Tomorrow!</h1>
        <p style="color: #fef3c7; margin: 6px 0 0; font-size: 13px;">Don't forget — your event is just around the corner</p>
      </div>
      <div style="background: white; padding: 28px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="color: #334155; font-size: 15px; margin: 0 0 20px;">Hi <strong>{attendee_name}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          This is a friendly reminder that <strong style="color: #d97706;">{event_title}</strong> is happening tomorrow! Here are the details:
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
          <tr><td style="padding: 10px 0; color: #64748b; font-size: 13px; width: 120px; border-bottom: 1px solid #f1f5f9;">Event</td><td style="padding: 10px 0; color: #0f172a; font-size: 13px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">{event_title}</td></tr>
          <tr><td style="padding: 10px 0; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">Date</td><td style="padding: 10px 0; color: #0f172a; font-size: 13px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">{event_date}</td></tr>
          <tr><td style="padding: 10px 0; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;">Time</td><td style="padding: 10px 0; color: #0f172a; font-size: 13px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">{event_time}</td></tr>
          <tr><td style="padding: 10px 0; color: #64748b; font-size: 13px;">Location</td><td style="padding: 10px 0; color: #0f172a; font-size: 13px; font-weight: 600;">{event_location}</td></tr>
        </table>
        <div style="background: #0f172a; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 20px;">
          <p style="margin: 0 0 4px; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Your Digital Entry Pass</p>
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #fbbf24; font-family: monospace; letter-spacing: 2px;">{pass_code}</p>
          <p style="margin: 8px 0 0; font-size: 11px; color: #64748b;">Show this code at the entrance</p>
        </div>
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; margin: 0 0 16px;">
          <p style="color: #92400e; font-size: 13px; margin: 0; font-weight: 600;">Quick Checklist:</p>
          <ul style="margin: 8px 0 0; padding: 0 0 0 20px; color: #92400e; font-size: 12px; line-height: 1.8;">
            <li>Arrive 15 minutes early</li>
            <li>Keep your digital pass code ready</li>
            <li>Bring a valid ID for verification</li>
          </ul>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">We look forward to seeing you there!</p>
      </div>
      <div style="text-align: center; padding: 16px; color: #94a3b8; font-size: 11px;">EventHub - Event Management Platform</div>
    </div>
    """
    return await _send_email(email_to, subject, html)


async def send_booking_details_email(
    email_to: str,
    attendee_name: str,
    event_title: str,
    event_date: str,
    event_time: str,
    event_location: str,
    amount: float,
    pass_code: str,
    payment_method: str = "Card",
) -> bool:
    subject = f"Payment Successful - {event_title} | EventHub"
    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 32px 28px; text-align: center; border-radius: 12px 12px 0 0;">
        <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          <span style="color: white; font-size: 24px;">&#10003;</span>
        </div>
        <h1 style="color: white; margin: 0; font-size: 22px;">Payment Successful!</h1>
        <p style="color: #a7f3d0; margin: 6px 0 0; font-size: 13px;">Your ticket has been booked</p>
      </div>
      <div style="background: white; padding: 28px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="color: #334155; font-size: 15px; margin: 0 0 20px;">Hi <strong>{attendee_name}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Thank you for registering! Here are your event and payment details:
        </p>
        <h3 style="color: #0f172a; font-size: 15px; margin: 0 0 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Event Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
          <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 130px;">Event</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">{event_title}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Date</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">{event_date}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Time</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">{event_time}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Location</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">{event_location}</td></tr>
        </table>
        <h3 style="color: #0f172a; font-size: 15px; margin: 0 0 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Payment Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
          <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 130px;">Amount Paid</td><td style="padding: 8px 0; color: #059669; font-size: 16px; font-weight: 700;">&#8377;{amount}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Payment Method</td><td style="padding: 8px 0; color: #0f172a; font-size: 13px; font-weight: 600;">{payment_method}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Status</td><td style="padding: 8px 0; font-size: 13px;"><span style="background: #ecfdf5; color: #059669; padding: 3px 12px; border-radius: 20px; font-weight: 600; font-size: 12px;">Confirmed</span></td></tr>
        </table>
        <div style="background: #0f172a; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 20px;">
          <p style="margin: 0 0 4px; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Digital Entry Pass</p>
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #38bdf8; font-family: monospace; letter-spacing: 2px;">{pass_code}</p>
          <p style="margin: 8px 0 0; font-size: 11px; color: #64748b;">Show this code at the entrance</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">Please arrive 15 minutes before the event starts.</p>
      </div>
      <div style="text-align: center; padding: 16px; color: #94a3b8; font-size: 11px;">EventHub - Event Management Platform</div>
    </div>
    """
    return await _send_email(email_to, subject, html)


async def send_custom_email(email_to: str, name: str, subject: str, message: str) -> bool:
    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">{subject}</h1>
      </div>
      <div style="background: white; padding: 28px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #334155; font-size: 15px; margin: 0 0 16px;">Hi <strong>{name}</strong>,</p>
        <div style="color: #475569; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">{message}</div>
      </div>
      <div style="text-align: center; padding: 16px; color: #94a3b8; font-size: 11px;">EventHub - Event Management Platform</div>
    </div>
    """
    return await _send_email(email_to, subject, html)


async def send_password_reset_email(email_to: str, user_name: str, reset_token: str, frontend_url: str = "http://localhost:5173") -> bool:
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    subject = "Reset Your Password - EventHub"
    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding: 32px 28px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Password Reset</h1>
        <p style="color: #f5d0fe; margin: 6px 0 0; font-size: 13px;">We received a request to reset your password</p>
      </div>
      <div style="background: white; padding: 28px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #334155; font-size: 15px; margin: 0 0 20px;">Hi <strong>{user_name}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Click the button below to reset your password. This link will expire in <strong>15 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 0 0 24px;">
          <a href="{reset_link}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 700; font-size: 14px;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 12px; margin: 0 0 12px;">If the button doesn't work, copy and paste this link:</p>
        <p style="color: #7c3aed; font-size: 12px; word-break: break-all; margin: 0 0 20px;">{reset_link}</p>
        <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px;">
          <p style="color: #92400e; font-size: 12px; margin: 0;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
      <div style="text-align: center; padding: 16px; color: #94a3b8; font-size: 11px;">EventHub - Event Management Platform</div>
    </div>
    """
    return await _send_email(email_to, subject, html)


async def send_welcome_email(email_to: str, user_name: str, role: str = "attendee") -> bool:
    subject = "Welcome to EventHub!"
    role_msg = "discover amazing events and book tickets" if role == "attendee" else "create and manage events"
    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 0;">
      <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 32px 28px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">Welcome to EventHub!</h1>
        <p style="color: #bfdbfe; margin: 6px 0 0; font-size: 13px;">Your account has been created successfully</p>
      </div>
      <div style="background: white; padding: 28px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #334155; font-size: 15px; margin: 0 0 20px;">Hi <strong>{user_name}</strong>,</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">Thank you for joining EventHub! You can now {role_msg}.</p>
        <div style="background: #f1f5f9; border-radius: 10px; padding: 18px; margin: 0 0 20px;">
          <p style="margin: 0 0 10px; font-size: 13px; color: #334155; font-weight: 600;">Here's what you can do:</p>
          <ul style="margin: 0; padding: 0 0 0 20px; color: #475569; font-size: 13px; line-height: 1.8;">
            <li>Browse and discover events</li>
            <li>Book tickets with digital passes</li>
            <li>Track your bookings and payments</li>
            <li>Get personalized event recommendations</li>
          </ul>
        </div>
        <div style="text-align: center;">
          <a href="http://localhost:5173" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; text-decoration: none; padding: 12px 32px; border-radius: 10px; font-weight: 700; font-size: 14px;">Get Started</a>
        </div>
      </div>
      <div style="text-align: center; padding: 16px; color: #94a3b8; font-size: 11px;">EventHub - Event Management Platform</div>
    </div>
    """
    return await _send_email(email_to, subject, html)
