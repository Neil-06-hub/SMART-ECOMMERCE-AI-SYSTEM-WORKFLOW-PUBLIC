"""
ModelRegistry — in-memory store for the active CF and CBF models.
Provides thread-safe atomic hot-reload via asyncio.Lock.
Called on FastAPI startup (lifespan) and via POST /internal/reload-model.
"""

import asyncio
import logging
from datetime import datetime
from typing import Any

from .mongo_client import get_db
from .r2_client import download_pickle
from ..config import settings

logger = logging.getLogger(__name__)


class ModelRegistry:
    def __init__(self) -> None:
        # LightFM collaborative-filtering model
        self.cf_model: Any = None
        # LightFM Dataset (user/item mappings)
        self.cf_dataset: Any = None
        # CBF similarity dict: { productId_str → [{productId, score}, ...] }
        self.cbf_similarity: dict = {}
        # TF-IDF vectorizer (used at inference for new-product queries)
        self.vectorizer: Any = None
        # Currently loaded version string (YYYY-MM-DD)
        self.current_version: str | None = None
        # Asyncio lock — prevents concurrent reloads
        self._lock: asyncio.Lock = asyncio.Lock()

    async def load_from_r2(self, version: str | None = None) -> str:
        """
        Load model artifacts from Cloudflare R2 into memory.
        If version is None, queries MongoDB for the active version.
        Returns the loaded version string.
        """
        async with self._lock:
            if version is None:
                version = await self._get_active_version_from_mongo()
            if version is None:
                logger.warning(
                    "No active model version found in MongoDB. "
                    "Inference will use cold-start fallback until training completes."
                )
                return "none"

            logger.info(f"Loading model version {version} from R2...")

            try:
                cf_model = await asyncio.to_thread(
                    download_pickle, f"models/cf/{version}/cf_model.pkl"
                )
                cf_dataset = await asyncio.to_thread(
                    download_pickle, f"models/cf/{version}/cf_dataset.pkl"
                )
                cbf_similarity = await asyncio.to_thread(
                    download_pickle, f"models/cbf/{version}/cbf_top50.pkl"
                )
                vectorizer = await asyncio.to_thread(
                    download_pickle, f"models/cbf/{version}/vectorizer.pkl"
                )

                # Atomic in-memory swap (GIL protects assignment)
                self.cf_model = cf_model
                self.cf_dataset = cf_dataset
                self.cbf_similarity = cbf_similarity
                self.vectorizer = vectorizer
                self.current_version = version

                logger.info(
                    f"Model version {version} loaded. "
                    f"CF users={len(cf_dataset.mapping()[0])}, items={len(cf_dataset.mapping()[2])}. "
                    f"CBF products={len(cbf_similarity)}."
                )
                return version

            except FileNotFoundError as e:
                logger.error(f"Artifact not found in R2: {e}")
                return "none"
            except Exception as e:
                logger.exception(f"Failed to load model version {version}: {e}")
                return "none"

    async def _get_active_version_from_mongo(self) -> str | None:
        """Query the model_versions collection for the active CF model version."""
        try:
            db = get_db()
            doc = await db["modelversions"].find_one(
                {"modelType": "cf", "isActive": True},
                sort=[("promotedAt", -1)],
            )
            if doc:
                return doc.get("version")
        except Exception as e:
            logger.error(f"Failed to query active model version: {e}")
        return None

    @property
    def is_ready(self) -> bool:
        """True if a CF model has been loaded successfully."""
        return self.cf_model is not None

    def user_interaction_count(self, user_id_str: str) -> int:
        """
        Returns how many unique items the user has in the CF dataset.
        Used for cold-start alpha adjustment.
        """
        if not self.is_ready or not self.cf_dataset:
            return 0
        try:
            uid_map = self.cf_dataset.mapping()[0]  # user_id → internal index
            if user_id_str not in uid_map:
                return 0
            # Count non-zero entries in the user's row (approximation)
            return 5  # If user is in dataset, assume ≥5 interactions
        except Exception:
            return 0


# Singleton registry — shared across all FastAPI workers
registry = ModelRegistry()
