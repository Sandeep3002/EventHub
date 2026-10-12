from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class VenueInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    address: str
    city: str
    state: str
    country: str = "USA"
    capacity: int
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
