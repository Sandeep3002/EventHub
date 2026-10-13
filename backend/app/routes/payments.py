from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.payment_service import PaymentService
from app.routes.auth import get_current_user

router = APIRouter()


class CreateOrderRequest(BaseModel):
    amount: float
    currency: str = "INR"
    event_id: str = ""


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    event_id: str
    amount: float
    payment_method: str = "razorpay"
    quantity: int = 1
    attendee: Optional[dict] = None


@router.post("/create-order")
async def create_order(req: CreateOrderRequest, current_user: dict = Depends(get_current_user)):
    return await PaymentService.create_razorpay_order(
        amount=req.amount, currency=req.currency, event_id=req.event_id
    )


@router.post("/verify")
async def verify_payment(req: VerifyPaymentRequest, current_user: dict = Depends(get_current_user)):
    return await PaymentService.verify_and_save_payment(
        razorpay_order_id=req.razorpay_order_id,
        razorpay_payment_id=req.razorpay_payment_id,
        razorpay_signature=req.razorpay_signature,
        event_id=req.event_id,
        user_id=current_user["id"],
        amount=req.amount,
        payment_method=req.payment_method,
        attendee=req.attendee,
        quantity=req.quantity,
    )


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def process_payment(
    payment_in: PaymentCreate,
    current_user: dict = Depends(get_current_user),
):
    return await PaymentService.process_payment(payment_in, current_user["id"])


@router.get("/my-payments", response_model=List[PaymentResponse])
async def get_my_payments(current_user: dict = Depends(get_current_user)):
    return await PaymentService.get_user_payments(current_user["id"])


@router.get("/organizer-payouts")
async def get_organizer_payouts(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("_id") or current_user.get("id")
    return await PaymentService.get_organizer_payouts(user_id)


@router.get("/payout-settings")
async def get_payout_settings(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("_id") or current_user.get("id")
    return await PaymentService.get_payout_settings(user_id)


class PayoutSettingsRequest(BaseModel):
    razorpay_account_id: Optional[str] = None
    payout_bank_name: Optional[str] = None
    payout_account_number: Optional[str] = None
    payout_ifsc: Optional[str] = None
    payout_beneficiary_name: Optional[str] = None


@router.put("/payout-settings")
async def update_payout_settings(
    settings_in: PayoutSettingsRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user.get("_id") or current_user.get("id")
    return await PaymentService.update_payout_settings(user_id, settings_in.dict())


@router.get("/platform-revenue")
async def get_platform_revenue(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ("superadmin", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return await PaymentService.get_platform_revenue_breakdown()
