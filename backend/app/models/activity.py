from enum import Enum
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ActivityAction(str, Enum):
    CREATED_EVENT = "created_event"
    UPDATED_EVENT = "updated_event"
    DELETED_EVENT = "deleted_event"
    PUBLISHED_EVENT = "published_event"
    UNPUBLISHED_EVENT = "unpublished_event"
    CREATED_TICKET = "created_ticket"
    UPDATED_TICKET = "updated_ticket"
    DELETED_TICKET = "deleted_ticket"
    NEW_REGISTRATION = "new_registration"
    DELETED_REGISTRATION = "deleted_registration"
    CREATED_CATEGORY = "created_category"
    DELETED_CATEGORY = "deleted_category"
    CREATED_VENUE = "created_venue"
    DELETED_VENUE = "deleted_venue"
    USER_LOGIN = "user_login"
    USER_REGISTERED = "user_registered"


class ActivityLog(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    actor_id: str
    actor_name: str
    actor_role: str
    action: str
    target_type: str
    target_name: str
    target_id: str = ""
    details: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "success"
