import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    logging.info("Connecting to MongoDB...")
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    logging.info("Connected to MongoDB successfully.")

async def close_mongo_connection():
    logging.info("Closing MongoDB connection...")
    if db.client:
        db.client.close()
        logging.info("MongoDB connection closed.")

def get_database():
    if db.client is None:
        # Fallback for standalone/testing or direct sync/async access
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    return db.client[settings.DATABASE_NAME]
