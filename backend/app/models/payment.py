from enum import Enum
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, Enum):
    CREDIT_CARD = "credit_card"
    UPI = "upi"
    PAYPAL = "paypal"

class PaymentInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    registration_id: str
    user_id: str
    amount: float
    currency: str = "USD"
    payment_method: PaymentMethod = PaymentMethod.CREDIT_CARD
    transaction_id: str
    status: PaymentStatus = PaymentStatus.COMPLETED
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
