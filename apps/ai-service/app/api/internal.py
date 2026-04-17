"""
POST /internal/reload-model — hot-reload model artifacts from R2.
Called by GitHub Actions training pipeline after a new model is promoted.
Protected by X-Internal-Secret header.
"""

import logging

from fastapi import APIRouter, Header, HTTPException, status

from ..schemas.features import ReloadModelRequest, ReloadModelResponse
from ..services.model_registry import registry
from ..api.recommend import invalidate_product_cache
from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/internal/reload-model",
    response_model=ReloadModelResponse,
    tags=["Internal"],
    include_in_schema=False,  # Hide from public API docs
)
async def reload_model(
    req: ReloadModelRequest,
    x_internal_secret: str | None = Header(default=None, alias="X-Internal-Secret"),
):
    """
    Hot-reload: download new model artifacts from R2 and swap in-memory.
    No service restart required.
    """
    # Auth check
    if x_internal_secret != settings.INTERNAL_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-Internal-Secret header.",
        )

    logger.info(f"Reload triggered for version: {req.version or 'latest'}")

    try:
        loaded_version = await registry.load_from_r2(version=req.version)
        invalidate_product_cache()

        if loaded_version == "none":
            return ReloadModelResponse(
                success=False,
                version="none",
                message="No model version found in MongoDB or R2.",
            )

        logger.info(f"Model reloaded successfully: version={loaded_version}")
        return ReloadModelResponse(
            success=True,
            version=loaded_version,
            message=f"Model version {loaded_version} loaded successfully.",
        )

    except Exception as e:
        logger.exception(f"Model reload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reload failed: {str(e)}",
        )
