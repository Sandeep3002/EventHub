import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

class Database:
    client: AsyncIOMotorClient = None

db = Database()

def _get_active_client() -> AsyncIOMotorClient:
    try:
        current_loop = asyncio.get_running_loop()
    except RuntimeError:
        current_loop = None

    if db.client is not None:
        try:
            io_loop = db.client.get_io_loop()
            if io_loop.is_closed() or (current_loop and io_loop != current_loop):
                db.client = None
        except Exception:
            db.client = None

    if db.client is None:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    return db.client

async def connect_to_mongo():
    logging.info("Connecting to MongoDB...")
    _get_active_client()
    logging.info("Connected to MongoDB successfully.")

async def close_mongo_connection():
    logging.info("Closing MongoDB connection...")
    if db.client:
        try:
            db.client.close()
        except Exception:
            pass
        db.client = None
        logging.info("MongoDB connection closed.")

def get_database():
    client = _get_active_client()
    return client[settings.DATABASE_NAME]
