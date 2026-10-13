from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.payment import PaymentStatus, PaymentMethod

from typing import Optional

class PaymentCreate(BaseModel):
    registration_id: str
    payment_method: PaymentMethod = PaymentMethod.CREDIT_CARD
    card_number: str = "4242424242424242"
    cvv: str = "123"

class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    registration_id: str
    user_id: str
    amount: float
    currency: str
    payment_method: PaymentMethod
    transaction_id: str
    status: PaymentStatus
    platform_commission: Optional[float] = 0.0
    organizer_share: Optional[float] = 0.0
    organizer_id: Optional[str] = None
    transfer_id: Optional[str] = None
    transfer_status: Optional[str] = "settled"
    created_at: datetime

class PayoutSettingsUpdate(BaseModel):
    razorpay_account_id: Optional[str] = None
    payout_bank_name: Optional[str] = None
    payout_account_number: Optional[str] = None
    payout_ifsc: Optional[str] = None
    payout_beneficiary_name: Optional[str] = None

class PayoutSettingsResponse(BaseModel):
    razorpay_account_id: Optional[str] = None
    payout_bank_name: Optional[str] = None
    payout_account_number_masked: Optional[str] = None
    payout_ifsc: Optional[str] = None
    payout_beneficiary_name: Optional[str] = None
    payout_status: str = "unconfigured"
