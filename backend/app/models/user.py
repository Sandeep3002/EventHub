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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
