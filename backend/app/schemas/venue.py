from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class VenueCreate(BaseModel):
    name: str
    address: str
    city: str
    state: str
    country: str = "USA"
    capacity: int
    image_url: Optional[str] = None

class VenueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    address: str
    city: str
    state: str
    country: str
    capacity: int
    image_url: Optional[str] = None
    created_at: datetime
