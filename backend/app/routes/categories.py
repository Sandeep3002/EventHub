from uuid import uuid4
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.category import CategoryCreate, CategoryResponse
from app.database import get_database
from app.routes.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(cat_in: CategoryCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    cat_dict = cat_in.dict()
    cat_dict["_id"] = str(uuid4())
    cat_dict["created_at"] = datetime.utcnow()
    await db.categories.insert_one(cat_dict)
    cat_dict["id"] = cat_dict["_id"]
    return cat_dict

@router.get("/", response_model=List[CategoryResponse])
async def list_categories():
    db = get_database()
    cursor = db.categories.find()
    cats = []
    async for c in cursor:
        c["id"] = str(c["_id"])
        cats.append(c)
    return cats
