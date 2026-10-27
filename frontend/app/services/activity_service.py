from uuid import uuid4
from datetime import datetime
from typing import List, Optional
from app.database import get_database


class ActivityService:
    @staticmethod
    async def log_activity(
        actor_id: str,
        actor_name: str,
        actor_role: str,
        action: str,
        target_type: str,
        target_name: str,
        target_id: str = "",
        details: str = "",
        status: str = "success",
    ) -> dict:
        db = get_database()
        entry = {
            "_id": str(uuid4()),
            "actor_id": actor_id,
            "actor_name": actor_name,
            "actor_role": actor_role,
            "action": action,
            "target_type": target_type,
            "target_name": target_name,
            "target_id": target_id,
            "details": details,
            "timestamp": datetime.utcnow(),
            "status": status,
        }
        await db.activity_logs.insert_one(entry)
        entry["id"] = entry["_id"]
        return entry

    @staticmethod
    async def get_activities(limit: int = 50, skip: int = 0, actor_id: Optional[str] = None) -> List[dict]:
        db = get_database()
        query = {}
        if actor_id:
            query["actor_id"] = actor_id
        cursor = db.activity_logs.find(query).sort("timestamp", -1).skip(skip).limit(limit)
        activities = []
        async for log in cursor:
            log["id"] = str(log["_id"])
            activities.append(log)
        return activities

    @staticmethod
    async def get_activity_count() -> int:
        db = get_database()
        return await db.activity_logs.count_documents({})

    @staticmethod
    async def get_recent_activities(limit: int = 20) -> List[dict]:
        return await ActivityService.get_activities(limit=limit)
