from uuid import uuid4
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.category import CategoryCreate, CategoryResponse
from app.database import get_database
from app.routes.auth import get_current_user, require_admin

router = APIRouter()

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(cat_in: CategoryCreate, current_user: dict = Depends(require_admin)):
    db = get_database()
    cat_dict = cat_in.dict()
    cat_dict["_id"] = str(uuid4())
    cat_dict["created_at"] = datetime.utcnow()
    await db.categories.insert_one(cat_dict)
    cat_dict["id"] = cat_dict["_id"]
    return cat_dict

@router.get("", response_model=List[CategoryResponse], include_in_schema=False)
@router.get("/", response_model=List[CategoryResponse])
async def list_categories():
    db = get_database()
    cursor = db.categories.find()
    cats = []
    async for c in cursor:
        c["id"] = str(c["_id"])
        cats.append(c)
    return cats

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: str, cat_in: CategoryCreate, current_user: dict = Depends(require_admin)):
    db = get_database()
    existing = await db.categories.find_one({"_id": category_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    update_dict = cat_in.dict()
    update_dict["updated_at"] = datetime.utcnow()
    await db.categories.update_one({"_id": category_id}, {"$set": update_dict})
    updated = await db.categories.find_one({"_id": category_id})
    updated["id"] = str(updated["_id"])
    return updated

@router.delete("/{category_id}")
async def delete_category(category_id: str, current_user: dict = Depends(require_admin)):
    db = get_database()
    result = await db.categories.delete_one({"_id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}
