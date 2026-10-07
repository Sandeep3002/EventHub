import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import api_router
from app.utils.reminder_scheduler import reminder_scheduler_loop

_reminder_task = None

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="EventHub - Modern Event Management and Ticket Reservation System API"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    global _reminder_task
    await connect_to_mongo()
    _reminder_task = asyncio.create_task(reminder_scheduler_loop())

@app.on_event("shutdown")
async def shutdown_db_client():
    global _reminder_task
    if _reminder_task:
        _reminder_task.cancel()
    await close_mongo_connection()

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Welcome to EventHub API",
        "docs": "/docs",
        "version": "1.0.0"
    }
