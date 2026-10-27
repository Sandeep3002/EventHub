from enum import Enum
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserRole(str, Enum):
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    ORGANIZER = "organizer"
    ATTENDEE = "attendee"

class UserInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    hashed_password: str
    role: UserRole = UserRole.ATTENDEE
    is_active: bool = True
    razorpay_account_id: Optional[str] = None
    payout_bank_name: Optional[str] = None
    payout_account_number_masked: Optional[str] = None
    payout_ifsc: Optional[str] = None
    payout_beneficiary_name: Optional[str] = None
    payout_status: str = "unconfigured"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
