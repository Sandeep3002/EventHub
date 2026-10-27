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
        # Calculate additional fees
        gateway_fee = round(amount * settings.GATEWAY_FEE_PERCENT / 100.0, 2)
        gst_on_fee = round(settings.GST_ON_FIXED_FEE, 2)
        total_amount = round(amount + gateway_fee + gst_on_fee, 2)
        amount_paise = int(total_amount * 100)
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
            "gateway_fee": int(gateway_fee * 100),
            "gst_on_fee": int(gst_on_fee * 100),
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
        expected_signature = hmac.HMAC(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256,
        ).hexdigest()

        if expected_signature != razorpay_signature:
            raise HTTPException(status_code=400, detail="Payment verification failed: invalid signature")

        db = get_database()

        # Calculate platform commission, gateway fee and GST on fee
        event = await db.events.find_one({"_id": event_id})
        organizer_id = event.get("organizer_id", "") if event else ""
        commission_rate = getattr(settings, "PLATFORM_COMMISSION_PERCENT", 5.0)
        gateway_fee_percent = getattr(settings, "GATEWAY_FEE_PERCENT", 2.0)
        gst_on_fee_amount = round(settings.GST_ON_FIXED_FEE, 2)
        platform_commission = round(float(amount) * (commission_rate / 100.0), 2)
        gateway_fee = round(float(amount) * (gateway_fee_percent / 100.0), 2)
        organizer_share = round(float(amount) - platform_commission, 2)
        transfer_id = f"trf_sim_{uuid4().hex[:10]}"

        qr_token = f"EVTHUB-{uuid4().hex[:8].upper()}"
        reg_dict = {
            "_id": str(uuid4()),
            "event_id": event_id,
            "user_id": user_id,
            "ticket_id": "",
            "quantity": quantity,
            "total_amount": amount,
            "platform_commission": platform_commission,
            "organizer_share": organizer_share,
            "organizer_id": organizer_id,
            "commission_rate": commission_rate,
            "transfer_id": transfer_id,
            "transfer_status": "settled",
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
            "platform_commission": platform_commission,
            "gateway_fee": gateway_fee,
            "gst_on_fee": gst_on_fee_amount,
            "organizer_share": organizer_share,
            "organizer_id": organizer_id,
            "transfer_id": transfer_id,
            "transfer_status": "settled",
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
            "platform_commission": platform_commission,
            "organizer_share": organizer_share,
            "transfer_id": transfer_id,
            "transfer_status": "settled",
            "status": "confirmed",
        }

    @staticmethod
    async def process_payment(payment_in: PaymentCreate, user_id: str) -> dict:
        db = get_database()
        registration = await db.registrations.find_one({"_id": payment_in.registration_id})
        if not registration:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registration order not found")

        amount = float(registration.get("total_amount", 0.0))
        event = await db.events.find_one({"_id": registration.get("event_id")})
        organizer_id = event.get("organizer_id", "") if event else registration.get("organizer_id", "")
        commission_rate = getattr(settings, "PLATFORM_COMMISSION_PERCENT", 5.0)
        gateway_fee_percent = getattr(settings, "GATEWAY_FEE_PERCENT", 2.0)
        gst_on_fee_amount = round(settings.GST_ON_FIXED_FEE, 2)
        platform_commission = round(amount * (commission_rate / 100.0), 2)
        gateway_fee = round(amount * (gateway_fee_percent / 100.0), 2)
        organizer_share = round(amount - platform_commission, 2)
        transfer_id = f"trf_sim_{uuid4().hex[:10]}"

        tx_id = f"TXN-{uuid4().hex[:12].upper()}"
        payment_dict = {
            "_id": str(uuid4()),
            "registration_id": payment_in.registration_id,
            "user_id": user_id,
            "amount": amount,
            "currency": "INR",
            "payment_method": payment_in.payment_method,
            "transaction_id": tx_id,
            "platform_commission": platform_commission,
            "gateway_fee": gateway_fee,
            "gst_on_fee": gst_on_fee_amount,
            "organizer_share": organizer_share,
            "organizer_id": organizer_id,
            "transfer_id": transfer_id,
            "transfer_status": "settled",
            "status": PaymentStatus.COMPLETED,
            "created_at": datetime.utcnow(),
        }
        await db.payments.insert_one(payment_dict)
        payment_dict["id"] = payment_dict["_id"]
        return payment_dict

    @staticmethod
    async def get_user_payments(user_id: str) -> List[dict]:
        db = get_database()
        cursor = db.payments.find({"user_id": user_id}).sort("created_at", -1)
        payments = []
        async for pay in cursor:
            pay["id"] = str(pay["_id"])
            payments.append(pay)
        return payments

    @staticmethod
    async def get_organizer_payouts(organizer_id: str) -> dict:
        db = get_database()
        # Find all payments for this organizer
        cursor = db.payments.find({"organizer_id": organizer_id}).sort("created_at", -1)
        transactions = []
        total_gross = 0.0
        total_commission = 0.0
        total_gateway_fees = 0.0
        total_gst_fees = 0.0
        total_net = 0.0

        async for p in cursor:
            p["id"] = str(p["_id"])
            amt = float(p.get("amount", 0.0))
            comm = float(p.get("platform_commission", round(amt * 0.05, 2)))
            share = float(p.get("organizer_share", round(amt - comm, 2)))
            total_gross += amt
            total_commission += comm
            total_gateway_fees = total_gateway_fees + (float(p.get("gateway_fee", 0.0))) if "gateway_fee" in p else total_gateway_fees
            total_gst_fees = total_gst_fees + (float(p.get("gst_on_fee", 0.0))) if "gst_on_fee" in p else total_gst_fees
            total_net += share
            p["platform_commission"] = comm
            p["organizer_share"] = share
            transactions.append(p)

        organizer = await db.users.find_one({"_id": organizer_id})
        payout_status = organizer.get("payout_status", "unconfigured") if organizer else "unconfigured"

        return {
            "gross_ticket_sales": round(total_gross, 2),
            "platform_commission_deducted": round(total_commission, 2),
            "gateway_fees_total": round(total_gateway_fees, 2),
            "gst_fees_total": round(total_gst_fees, 2),
            "commission_rate_percent": getattr(settings, "PLATFORM_COMMISSION_PERCENT", 5.0),
            "net_organizer_payout": round(total_net, 2),
            "settled_payout": round(total_net, 2),
            "payout_status": payout_status,
            "razorpay_account_id": organizer.get("razorpay_account_id") if organizer else None,
            "transactions": transactions,
        }

    @staticmethod
    async def get_payout_settings(user_id: str) -> dict:
        db = get_database()
        user = await db.users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "razorpay_account_id": user.get("razorpay_account_id", ""),
            "payout_bank_name": user.get("payout_bank_name", ""),
            "payout_account_number_masked": user.get("payout_account_number_masked", ""),
            "payout_ifsc": user.get("payout_ifsc", ""),
            "payout_beneficiary_name": user.get("payout_beneficiary_name", ""),
            "payout_status": user.get("payout_status", "unconfigured"),
        }

    @staticmethod
    async def update_payout_settings(user_id: str, data: dict) -> dict:
        db = get_database()
        user = await db.users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        acc_num = data.get("payout_account_number", "").strip()
        masked = ""
        if acc_num:
            masked = f"{'*' * max(0, len(acc_num) - 4)}{acc_num[-4:]}"

        rzp_acc = data.get("razorpay_account_id", "").strip() or user.get("razorpay_account_id") or f"acc_sim_{uuid4().hex[:8]}"
        status_val = "active" if (rzp_acc or acc_num) else "unconfigured"

        update_dict = {
            "razorpay_account_id": rzp_acc,
            "payout_bank_name": data.get("payout_bank_name", user.get("payout_bank_name", "")),
            "payout_account_number_masked": masked or user.get("payout_account_number_masked", ""),
            "payout_ifsc": data.get("payout_ifsc", user.get("payout_ifsc", "")),
            "payout_beneficiary_name": data.get("payout_beneficiary_name", user.get("payout_beneficiary_name", "")),
            "payout_status": status_val,
            "updated_at": datetime.utcnow(),
        }

        await db.users.update_one({"_id": user_id}, {"$set": update_dict})
        return {
            "message": "Payout settings updated successfully",
            **update_dict,
        }

    @staticmethod
    async def get_platform_revenue_breakdown() -> dict:
        db = get_database()
        cursor = db.payments.find()
        gross = 0.0
        total_gateway_fees = 0.0
        total_gst_fees = 0.0
        organizer_total = 0.0
        total_commission = 0.0
        count = 0

        async for p in cursor:
            amt = float(p.get("amount", 0.0))
            comm = float(p.get("platform_commission", round(amt * 0.05, 2)))
            share = float(p.get("organizer_share", round(amt - comm, 2)))
            gross += amt
            total_gateway_fees += float(p.get("gateway_fee", 0.0))
            total_gst_fees += float(p.get("gst_on_fee", 0.0))
            organizer_total += share
            count += 1

        return {
            "gross_ticket_volume": round(gross, 2),
            "total_platform_commission": round(total_commission, 2),
            "total_gateway_fees": round(total_gateway_fees, 2),
            "total_gst_fees": round(total_gst_fees, 2),
            "total_organizer_payouts": round(organizer_total, 2),
            "commission_rate_percent": getattr(settings, "PLATFORM_COMMISSION_PERCENT", 5.0),
            "total_transactions": count,
        }
