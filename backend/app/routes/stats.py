from fastapi import APIRouter, Depends
from app.database import get_database
from app.routes.auth import get_current_user, require_superadmin, require_admin
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/superadmin")
async def superadmin_stats(current_user: dict = Depends(require_superadmin)):
    db = get_database()

    total_admins = await db.users.count_documents({"role": {"$in": ["admin", "organizer"]}})
    total_customers = await db.users.count_documents({"role": "attendee"})
    total_events = await db.events.count_documents({})
    total_registrations = await db.registrations.count_documents({})

    revenue_pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}]
    revenue_result = await db.registrations.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0

    activities_cursor = db.activities.find().sort("timestamp", -1).limit(10)
    recent_activities = []
    async for a in activities_cursor:
        a["id"] = str(a["_id"])
        recent_activities.append(a)

    admin_cursor = db.users.find({"role": {"$in": ["admin", "organizer"]}})
    admin_users = []
    async for u in admin_cursor:
        u["id"] = str(u["_id"])
        admin_users.append(u)

    platform_commission = round(total_revenue * 0.05, 2)
    organizer_payouts = round(total_revenue - platform_commission, 2)

    return {
        "total_admins": total_admins,
        "total_customers": total_customers,
        "total_events": total_events,
        "total_registrations": total_registrations,
        "total_revenue": total_revenue,
        "total_platform_commission": platform_commission,
        "total_organizer_payouts": organizer_payouts,
        "commission_rate_percent": 5.0,
        "recent_activities": recent_activities,
        "admin_users": admin_users,
    }


@router.get("/admin")
async def admin_stats(current_user: dict = Depends(require_admin)):
    db = get_database()
    user_role = current_user.get("role", "")
    user_id = current_user.get("_id") or current_user.get("id")

    # Organizers see only their own events; admins/superadmins see all
    event_filter = {"organizer_id": user_id} if user_role == "organizer" else {}

    total_events = await db.events.count_documents(event_filter)

    now = datetime.utcnow()
    upcoming_filter = {**event_filter, "start_time": {"$gt": now}}
    upcoming_events = await db.events.count_documents(upcoming_filter)

    # Get event IDs for this organizer to scope registrations
    if event_filter:
        event_ids = [e["_id"] async for e in db.events.find(event_filter, {"_id": 1})]
        reg_filter = {"event_id": {"$in": event_ids}} if event_ids else {"event_id": "__none__"}
    else:
        reg_filter = {}
        event_ids = None

    total_registrations = await db.registrations.count_documents(reg_filter)

    revenue_pipeline = [{"$match": reg_filter}, {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}]
    revenue_result = await db.registrations.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0

    # Monthly registrations (last 6 months)
    months = []
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for i in range(5, -1, -1):
        d = datetime(now.year, now.month, 1) - timedelta(days=i * 30)
        month_start = datetime(d.year, d.month, 1)
        if d.month == 12:
            month_end = datetime(d.year + 1, 1, 1)
        else:
            month_end = datetime(d.year, d.month + 1, 1)
        month_reg_filter = {**reg_filter, "created_at": {"$gte": month_start, "$lt": month_end}}
        count = await db.registrations.count_documents(month_reg_filter)
        months.append({"month": month_names[d.month - 1], "registrations": count})

    # Category distribution
    cat_pipeline = [
        {"$match": event_filter},
        {"$group": {"_id": "$category_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    cat_result = await db.events.aggregate(cat_pipeline).to_list(20)
    category_distribution = [
        {"name": (c["_id"] or "General").capitalize(), "value": c["count"]}
        for c in cat_result
    ]

    # Recent events (last 6)
    events_cursor = db.events.find(event_filter).sort("created_at", -1).limit(6)
    recent_events = []
    async for e in events_cursor:
        e["id"] = str(e["_id"])
        eid = e["_id"]
        reg_count = await db.registrations.count_documents({"event_id": eid})
        e["registration_count"] = reg_count
        recent_events.append(e)

    platform_commission = round(total_revenue * 0.05, 2)
    net_earnings = round(total_revenue - platform_commission, 2)

    return {
        "total_events": total_events,
        "total_registrations": total_registrations,
        "total_revenue": total_revenue,
        "platform_commission": platform_commission,
        "net_earnings": net_earnings,
        "commission_rate_percent": 5.0,
        "upcoming_events": upcoming_events,
        "monthly_registrations": months,
        "category_distribution": category_distribution,
        "recent_events": recent_events,
    }
