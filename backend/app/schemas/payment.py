from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.payment import PaymentStatus, PaymentMethod

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
    created_at: datetime
