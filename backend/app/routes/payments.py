from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, status
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
