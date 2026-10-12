from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .events import router as events_router
from .categories import router as categories_router
from .venues import router as venues_router
from .tickets import router as tickets_router
from .registrations import router as registrations_router
from .payments import router as payments_router
from .activities import router as activities_router
from .stats import router as stats_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(events_router, prefix="/events", tags=["Events"])
api_router.include_router(categories_router, prefix="/categories", tags=["Categories"])
api_router.include_router(venues_router, prefix="/venues", tags=["Venues"])
api_router.include_router(tickets_router, prefix="/tickets", tags=["Tickets"])
api_router.include_router(registrations_router, prefix="/registrations", tags=["Registrations"])
api_router.include_router(payments_router, prefix="/payments", tags=["Payments"])
api_router.include_router(activities_router, prefix="/activities", tags=["Activities"])
api_router.include_router(stats_router, prefix="/stats", tags=["Stats"])
