from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = "Tag"

class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = "Tag"
    created_at: datetime
