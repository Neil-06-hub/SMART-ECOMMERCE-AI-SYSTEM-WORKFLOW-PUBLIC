from fastapi import APIRouter
from ..services.mongo_client import ping_mongo
from ..services.model_registry import registry

router = APIRouter()


@router.get("/health", tags=["Health"])
async def health_check():
    mongo_ok = await ping_mongo()
    return {
        "status": "ok",
        "service": "ai-service",
        "model_loaded": registry.is_ready,
        "model_version": registry.current_version,
        "mongo": "ok" if mongo_ok else "unreachable",
    }
