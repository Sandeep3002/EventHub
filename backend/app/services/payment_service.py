from uuid import uuid4
from datetime import datetime
from typing import List
import hmac
import hashlib
from fastapi import HTTPException, status
from app.database import get_database
from app.schemas.payment import PaymentCreate
from app.models.payment import PaymentStatus
from app.config.settings import settings
import razorpay

razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class PaymentService:

    @staticmethod
    async def create_razorpay_order(amount: float, currency: str = "INR", event_id: str = "", registration_data: dict = None) -> dict:
        amount_paise = int(amount * 100)
        order_data = {
            "amount": amount_paise,
            "currency": currency,
            "receipt": f"evt_{event_id}_{uuid4().hex[:8]}",
            "payment_capture": 1,
        }
        try:
            order = razorpay_client.order.create(data=order_data)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Razorpay order creation failed: {str(e)}")

        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "razorpay_key_id": settings.RAZORPAY_KEY_ID,
        }

    @staticmethod
    async def verify_and_save_payment(
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
        event_id: str,
        user_id: str,
        amount: float,
        payment_method: str = "razorpay",
        attendee: dict = None,
        quantity: int = 1,
    ) -> dict:
        expected_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256,
        ).hexdigest()

        if expected_signature != razorpay_signature:
            raise HTTPException(status_code=400, detail="Payment verification failed: invalid signature")

        db = get_database()

        qr_token = f"EVTHUB-{uuid4().hex[:8].upper()}"
        reg_dict = {
            "_id": str(uuid4()),
            "event_id": event_id,
            "user_id": user_id,
            "ticket_id": "",
            "quantity": quantity,
            "total_amount": amount,
            "status": "confirmed",
            "qr_code_token": qr_token,
            "attendee_name": attendee.get("full_name", "") if attendee else "",
            "attendee_phone": attendee.get("phone", "") if attendee else "",
            "attendee_email": attendee.get("email", "") if attendee else "",
            "attendee_age": attendee.get("age", 0) if attendee else 0,
            "created_at": datetime.utcnow(),
        }
        await db.registrations.insert_one(reg_dict)

        await db.events.update_one(
            {"_id": event_id},
            {"$inc": {"available_tickets": -quantity}},
        )

        payment_dict = {
            "_id": str(uuid4()),
            "registration_id": reg_dict["_id"],
            "user_id": user_id,
            "amount": amount,
            "currency": "INR",
            "payment_method": payment_method,
            "transaction_id": razorpay_payment_id,
            "razorpay_order_id": razorpay_order_id,
            "status": PaymentStatus.COMPLETED,
            "created_at": datetime.utcnow(),
        }
        await db.payments.insert_one(payment_dict)
        payment_dict["id"] = payment_dict["_id"]

        return {
            "payment_id": payment_dict["_id"],
            "registration_id": reg_dict["_id"],
            "transaction_id": razorpay_payment_id,
            "qr_code_token": qr_token,
            "status": "confirmed",
        }

    @staticmethod
    async def process_payment(payment_in: PaymentCreate, user_id: str) -> dict:
        db = get_database()
        registration = await db.registrations.find_one({"_id": payment_in.registration_id})
        if not registration:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration order not found")

        tx_id = f"TXN-{uuid4().hex[:12].upper()}"
        payment_dict = {
            "_id": str(uuid4()),
            "registration_id": payment_in.registration_id,
            "user_id": user_id,
            "amount": registration["total_amount"],
            "currency": "USD",
            "payment_method": payment_in.payment_method,
            "transaction_id": tx_id,
            "status": PaymentStatus.COMPLETED,
            "created_at": datetime.utcnow(),
        }
        await db.payments.insert_one(payment_dict)
        payment_dict["id"] = payment_dict["_id"]
        return payment_dict

    @staticmethod
    async def get_user_payments(user_id: str) -> List[dict]:
        db = get_database()
        cursor = db.payments.find({"user_id": user_id})
        payments = []
        async for pay in cursor:
            pay["id"] = str(pay["_id"])
            payments.append(pay)
        return payments
