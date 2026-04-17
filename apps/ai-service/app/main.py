"""
FastAPI AI Service — entry point.
Lifespan: loads ML model from Cloudflare R2 on startup.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import recommend, features, internal, health
from .services.model_registry import registry
from .services.mongo_client import close_mongo_connection

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: load the active ML model from Cloudflare R2.
    Shutdown: close MongoDB connection.
    """
    logger.info("AI Service starting up...")
    try:
        version = await registry.load_from_r2()
        if version == "none":
            logger.warning(
                "No model loaded on startup. "
                "Recommendations will use cold-start CBF until training runs."
            )
        else:
            logger.info(f"Model version '{version}' loaded successfully.")
    except Exception as e:
        logger.error(f"Model load failed on startup: {e}. Continuing without model.")

    yield

    logger.info("AI Service shutting down...")
    await close_mongo_connection()


app = FastAPI(
    title="SMART-ECOMMERCE AI Service",
    version="1.0.0",
    description="LightFM CF + TF-IDF CBF hybrid recommendation engine.",
    lifespan=lifespan,
)

# CORS — allow Express.js backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router)
app.include_router(recommend.router, tags=["Recommendations"])
app.include_router(features.router, tags=["Features"])
app.include_router(internal.router, tags=["Internal"])

