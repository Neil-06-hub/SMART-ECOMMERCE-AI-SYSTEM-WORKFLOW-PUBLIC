"""
MongoDB async client using Motor.
Provides a singleton database connection shared across the FastAPI app.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from ..config import settings

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def get_mongo_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )
    return _client


def get_db() -> AsyncIOMotorDatabase:
    global _db
    if _db is None:
        client = get_mongo_client()
        _db = client[settings.MONGODB_DB_NAME]
    return _db


async def close_mongo_connection() -> None:
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None


async def ping_mongo() -> bool:
    """Health-check: returns True if MongoDB is reachable."""
    try:
        client = get_mongo_client()
        await client.admin.command("ping")
        return True
    except Exception:
        return False
