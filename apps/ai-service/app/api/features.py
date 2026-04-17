"""
POST /features/update — called by Express.js on each behavioral event.
Updates the user's feature store in MongoDB feature_snapshots.
"""

import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException

from ..schemas.features import FeatureUpdateRequest, FeatureUpdateResponse
from ..services.mongo_client import get_db

logger = logging.getLogger(__name__)

router = APIRouter()

EVENT_WEIGHTS = {
    "view": 1.0,
    "click": 1.5,
    "add_to_cart": 2.0,
    "purchase": 5.0,
    "rec_click": 1.5,
}


@router.post("/features/update", response_model=FeatureUpdateResponse, tags=["Features"])
async def update_features(req: FeatureUpdateRequest):
    """
    Lightweight feature update: appends a behavioral event to MongoDB
    behavioral_events collection. Full snapshot recomputation is done
    by the nightly Express.js cron at 01:00 ICT.
    """
    if req.eventType not in EVENT_WEIGHTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown eventType: {req.eventType}. "
            f"Valid: {list(EVENT_WEIGHTS.keys())}",
        )

    weight = EVENT_WEIGHTS[req.eventType]
    db = get_db()

    try:
        await db["behavioralevents"].insert_one(
            {
                "userId": req.userId,
                "productId": req.productId,
                "eventType": req.eventType,
                "weight": weight,
                "metadata": req.metadata or {},
                "timestamp": datetime.utcnow(),
            }
        )
        return FeatureUpdateResponse(success=True, message="Event recorded.")
    except Exception as e:
        logger.error(f"Failed to record behavioral event: {e}")
        raise HTTPException(status_code=500, detail="Failed to record event.")
