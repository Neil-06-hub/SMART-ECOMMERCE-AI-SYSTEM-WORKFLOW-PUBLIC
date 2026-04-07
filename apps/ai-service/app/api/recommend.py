"""
POST /recommend — main inference endpoint.
Called by Express.js RecommendationModule via opossum circuit breaker.
Must respond within 500ms (circuit breaker timeout).
"""

import logging

from fastapi import APIRouter, HTTPException

from ..schemas.recommend import RecommendRequest, RecommendResponse
from ..services.model_registry import registry
from ..services.mongo_client import get_db
from ..ml.hybrid import get_recommendations
from ..config import PLACEMENT_CONFIG

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory product cache (loaded once, refreshed on model reload)
_product_cache: list[dict] = []
_item_ids_cache: list[str] = []


async def _load_products() -> tuple[list[dict], list[str]]:
    """Fetch active products from MongoDB. Cached in memory."""
    global _product_cache, _item_ids_cache
    if _product_cache:
        return _product_cache, _item_ids_cache

    db = get_db()
    products = await db["products"].find(
        {"isActive": True},
        {"_id": 1, "name": 1, "price": 1, "stock": 1, "sold": 1, "rating": 1, "category": 1},
    ).to_list(length=100_000)

    # Convert ObjectId to string
    for p in products:
        p["_id"] = str(p["_id"])

    _product_cache = products
    _item_ids_cache = [p["_id"] for p in products]
    logger.info(f"Product cache loaded: {len(products)} active products.")
    return _product_cache, _item_ids_cache


def invalidate_product_cache():
    """Called after model reload so cache is refreshed on next request."""
    global _product_cache, _item_ids_cache
    _product_cache = []
    _item_ids_cache = []


async def _get_user_recent_views(user_id: str) -> list[str]:
    """Fetch user's recently viewed product IDs from feature_snapshots."""
    try:
        db = get_db()
        snapshot = await db["featuresnapshots"].find_one(
            {"userId": user_id},
            {"recentViews": 1},
            sort=[("snapshotDate", -1)],
        )
        if snapshot and snapshot.get("recentViews"):
            return [str(v) for v in snapshot["recentViews"][:20]]
    except Exception as e:
        logger.warning(f"Failed to fetch user recent views for {user_id}: {e}")
    return []


@router.post("/recommend", response_model=RecommendResponse)
async def get_recommendation(req: RecommendRequest):
    """
    Hybrid recommendation endpoint.
    - Logged-in users: α × CF + (1-α) × CBF
    - Anonymous: pure CBF (popularity-based)
    - Cold-start: falls back to CBF with popularity signal
    """
    placement = req.placement
    n = req.n or PLACEMENT_CONFIG.get(placement, {}).get("n", 12)

    # Load products
    all_products, all_item_ids = await _load_products()
    if not all_item_ids:
        raise HTTPException(status_code=503, detail="No products available.")

    # Get user context
    user_recent_views: list[str] = []
    user_interaction_count: int = 0

    if req.userId:
        user_recent_views = await _get_user_recent_views(req.userId)
        user_interaction_count = registry.user_interaction_count(req.userId)

    # Run hybrid scoring
    product_ids, scores = get_recommendations(
        user_id=req.userId,
        placement=placement,
        n=n,
        filters=req.filters.model_dump(),
        registry=registry,
        all_item_ids=all_item_ids,
        all_products=all_products,
        user_recent_views=user_recent_views,
        user_interaction_count=user_interaction_count,
    )

    # Determine source label for observability
    if not registry.is_ready or not req.userId:
        source = "cold_start_cbf"
    elif user_interaction_count < 5:
        source = "cold_start_cbf"
    else:
        source = "model_lightfm"

    return RecommendResponse(
        productIds=product_ids,
        scores=scores,
        model_version=registry.current_version or "none",
        source=source,
    )
