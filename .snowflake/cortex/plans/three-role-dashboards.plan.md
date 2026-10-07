# Plan: Three Role-Based Dashboards with Activity Logging

## Current State
- **Roles**: `admin`, `organizer`, `attendee` (in UserRole enum)
- **Pages**: `/admin/*` (5 pages), `/organizer/*` (5 pages), attendee uses public pages + `/profile`, `/my-bookings`
- **No activity logging** exists

## New Role Mapping
| Current | New | Route Prefix |
|---------|-----|-------------|
| — (new) | **Super Admin** | `/superadmin/*` |
| `admin` + `organizer` merged | **Admin** | `/admin/*` |
| `attendee` | **Customer** | `/customer/*` |

## Architecture

```
Common Login (/login)
       |
  Role Check
       |
  ┌────┼────────────┐
  ↓    ↓             ↓
SuperAdmin  Admin    Customer
/superadmin /admin   /customer
```

---

## Task 1: Add 'superadmin' Role to Backend

**Files:** `backend/app/models/user.py`, `backend/app/schemas/user.py`, `backend/app/routes/auth.py`

- Add `SUPERADMIN = "superadmin"` to `UserRole` enum
- Update `get_current_user` to handle superadmin
- Update `ProtectedRoute` on frontend to support `requiredRole="superadmin"`

---

## Task 2: Create Activity Log Backend

**New files:** `backend/app/models/activity.py`, `backend/app/services/activity_service.py`, `backend/app/routes/activities.py`

**Activity Log Schema (MongoDB):**
```python
{
    "_id": uuid,
    "actor_id": str,         # admin user id
    "actor_name": str,        # "John Doe"
    "actor_role": str,        # "admin"
    "action": str,            # "created_event", "updated_event", "deleted_event",
                              # "published_event", "unpublished_event",
                              # "created_ticket", "updated_ticket",
                              # "new_registration", "deleted_registration"
    "target_type": str,       # "event", "ticket", "registration", "user"
    "target_name": str,       # "AI Workshop"
    "target_id": str,         # event/ticket/reg id
    "details": str,           # "Published event 'AI Workshop' with 100 capacity"
    "timestamp": datetime,
    "status": str             # "success" / "failed"
}
```

**API Endpoints:**
- `GET /api/v1/activities` — Get all activities (superadmin only)
- `GET /api/v1/activities/recent?limit=20` — Recent activities
- `GET /api/v1/activities/admin/{admin_id}` — Activities by specific admin

**ActivityService.log_activity()** — Called from event/registration/ticket routes after every mutating action.

---

## Task 3: Super Admin Dashboard (Frontend)

**New files in `frontend/src/pages/superadmin/`:**

| Page | Route | Features |
|------|-------|----------|
| `SuperAdminDashboard.jsx` | `/superadmin` | Welcome header, 4 stat cards (Total Admins, Total Events, Total Registrations, Total Revenue), Live Activity Feed (last 20), Quick actions |
| `ActivityLog.jsx` | `/superadmin/activities` | Full searchable/filterable activity log table with actor, action, target, timestamp, status columns |
| `ManageAdmins.jsx` | `/superadmin/admins` | List all admin users, activate/deactivate, view their events |
| `AllEvents.jsx` | `/superadmin/events` | All events across all admins with approve/reject/publish/unpublish/delete controls |
| `AllRegistrations.jsx` | `/superadmin/registrations` | All registrations system-wide |

**Sidebar nav (superadminNav):**
- Dashboard, Activity Log, Manage Admins, All Events, All Registrations, Settings

---

## Task 4: Admin Dashboard (Frontend)

**Reuse/merge current organizer + admin pages at `/admin/*`:**

| Page | Route | Features |
|------|-------|----------|
| `AdminDashboard.jsx` | `/admin` | Welcome header, stat cards, charts (reuse current OrganizerDashboard design), recent events |
| `CreateEvent.jsx` | `/admin/create-event` | Current CreateEvent (already works) |
| `ManageEvents.jsx` | `/admin/manage-events` | Current ManageEvents |
| `Registrations.jsx` | `/admin/registrations` | Current Registrations page |
| `Analytics.jsx` | `/admin/analytics` | Current Analytics page |
| `ManageCategories.jsx` | `/admin/categories` | Current ManageCategories |
| `ManageVenues.jsx` | `/admin/venues` | Current ManageVenues |

**Sidebar nav (adminNav):**
- Dashboard, Create Event, Manage Events, Registrations, Analytics, Categories, Venues, Settings

---

## Task 5: Customer Dashboard (Frontend)

**New/rebranded files in `frontend/src/pages/customer/`:**

| Page | Route | Features |
|------|-------|----------|
| `CustomerDashboard.jsx` | `/customer` | Welcome header, stat cards (Upcoming Events, Past Events, Total Spent), upcoming bookings list |
| `BrowseEvents.jsx` | `/customer/events` | Current Events page with sidebar layout |
| `MyBookings.jsx` | `/customer/bookings` | Current MyBookings with sidebar |
| `CustomerProfile.jsx` | `/customer/profile` | Current Profile page with sidebar |

**Sidebar nav (customerNav):**
- Dashboard, Browse Events, My Bookings, Profile, Settings

---

## Task 6: Update Routes & Login Logic

**App.jsx changes:**
- Add `/superadmin/*` routes with `requiredRole="superadmin"`
- Move `/admin/*` routes (admin-as-organizer)
- Add `/customer/*` routes with `requiredRole="attendee"`
- Keep old `/organizer/*` redirecting to `/admin/*` for backwards compat

**Login.jsx redirect:**
```
superadmin → /superadmin
admin → /admin
attendee → /customer
```

---

## Task 7: Inject Activity Logging

Add `ActivityService.log_activity()` calls into:

| Route File | Actions Logged |
|-----------|---------------|
| `events.py` | create, update, delete, publish, unpublish |
| `registrations.py` | new registration, delete registration |
| `tickets.py` | create ticket, update ticket |
| `categories.py` | create, delete category |
| `venues.py` | create, delete venue |

Each log captures: who did it, what they did, which object, when, and success/failure.

---

## Task 8: End-to-End Testing

- Create superadmin user in DB
- Login as superadmin → verify `/superadmin` dashboard with activity feed
- Login as admin → verify `/admin` dashboard with event management
- Login as customer → verify `/customer` dashboard with booking flow
- Perform admin actions → verify they appear in superadmin activity feed
