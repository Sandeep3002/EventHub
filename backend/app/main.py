import asyncio
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError
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
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
if settings.CORS_ORIGINS:
    for origin in settings.CORS_ORIGINS.split(","):
        origin_clean = origin.strip()
        if origin_clean and origin_clean not in allowed_origins:
            allowed_origins.append(origin_clean)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.(pages|workers|netlify|vercel)\.(dev|app)|https://.*\.hf\.space|https://.*\.loca\.lt|https://.*\.trycloudflare\.com",
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

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logging.exception(f"Unhandled error on {request.method} {request.url.path}")
    if isinstance(exc, PyMongoError):
        return JSONResponse(
            status_code=503,
            content={"detail": f"Database is temporarily unavailable. Please try again shortly. ({type(exc).__name__})"},
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong on our side. Please try again."},
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Welcome to EventHub API",
        "docs": "/docs",
        "version": "1.0.0"
    }
