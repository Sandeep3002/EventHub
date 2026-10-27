from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.services.activity_service import ActivityService
from app.routes.auth import get_current_user

router = APIRouter()


@router.get("/")
async def get_activities(
    limit: int = Query(50, le=200),
    skip: int = Query(0, ge=0),
    actor_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    activities = await ActivityService.get_activities(limit=limit, skip=skip, actor_id=actor_id)
    total = await ActivityService.get_activity_count()
    return {"activities": activities, "total": total}


@router.get("/recent")
async def get_recent_activities(
    limit: int = Query(20, le=50),
    current_user: dict = Depends(get_current_user),
):
    return await ActivityService.get_recent_activities(limit=limit)
