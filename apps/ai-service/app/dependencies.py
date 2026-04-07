"""
Shared FastAPI dependencies (Dependency Injection).
"""

from .services.model_registry import registry, ModelRegistry
from .services.mongo_client import get_db
from motor.motor_asyncio import AsyncIOMotorDatabase


def get_registry() -> ModelRegistry:
    """DI: returns the singleton ModelRegistry."""
    return registry


async def get_database() -> AsyncIOMotorDatabase:
    """DI: returns the Motor async database instance."""
    return get_db()
