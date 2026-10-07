# Plan: Fix Dashboard Buffering & Separate Admin/SuperAdmin Dashboards

## Root Cause
Both dashboards fetch **entire collections** (all events, all registrations, all users) from the backend, then compute counts/stats on the client side. This causes slow loading ("buffering") especially as data grows.

## Fix Strategy
Create dedicated **server-side stats endpoints** that return pre-computed counts directly from MongoDB aggregation, so dashboards load instantly with minimal data transfer.

## Changes

### 1. New Backend Stats Route (`backend/app/routes/stats.py`)
A new route file with two endpoints:

**`GET /stats/superadmin`** — returns:
```json
{
  "total_admins": 5,
  "total_customers": 20,
  "total_events": 15,
  "total_registrations": 48,
  "total_revenue": 25000,
  "recent_activities": [...],  // last 10 only
  "admin_users": [...]         // just admin/organizer users
}
```
Uses MongoDB `count_documents()` and `aggregate()` — no full-collection fetch.

**`GET /stats/admin`** — returns:
```json
{
  "total_events": 8,
  "total_registrations": 30,
  "total_revenue": 12000,
  "upcoming_events": 3,
  "monthly_registrations": [...],  // last 6 months aggregated
  "category_distribution": [...],  // event count per category
  "recent_events": [...]           // last 6 events only
}
```

### 2. Register Stats Route (`backend/app/routes/__init__.py`)
Add the new stats router to the API router.

### 3. Update SuperAdminDashboard (`frontend/src/pages/superadmin/SuperAdminDashboard.jsx`)
- Replace 4 separate API calls with single `GET /stats/superadmin`
- Dashboard loads in 1 request instead of 4
- Instant stat cards, activity feed limited to 10 items

### 4. Update OrganizerDashboard (`frontend/src/pages/organizer/OrganizerDashboard.jsx`)
- Replace 2 separate API calls with single `GET /stats/admin`
- Chart data comes pre-computed from backend
- Recent events limited to 6

### 5. Remove Mock Fallbacks from Services
Clean up `eventService.js` and `bookingService.js` to remove mock data fallbacks that mask real errors (these were causing the "any credentials work" issue too).

## Files Changed
| File | Change |
|------|--------|
| `backend/app/routes/stats.py` | **New** — stats endpoints |
| `backend/app/routes/__init__.py` | Register stats router |
| `frontend/src/pages/superadmin/SuperAdminDashboard.jsx` | Use stats endpoint |
| `frontend/src/pages/organizer/OrganizerDashboard.jsx` | Use stats endpoint |
| `frontend/src/services/eventService.js` | Remove mock fallbacks |
| `frontend/src/services/bookingService.js` | Remove mock fallbacks |
