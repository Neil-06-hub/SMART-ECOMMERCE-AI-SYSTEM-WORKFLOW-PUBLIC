"""
Hybrid recommendation scoring: α × CF + (1-α) × CBF.
Handles cold-start, filters (OOS, price range), and top-N selection.
"""

import logging
from typing import Any

import numpy as np

from .train_cf import predict_for_user
from .train_cbf import get_cbf_scores_for_user
from ..config import settings, PLACEMENT_CONFIG

logger = logging.getLogger(__name__)

# Cold-start alpha overrides
COLD_START_ALPHA = {
    "no_history": 0.0,       # 0 interactions → pure CBF
    "few_interactions": 0.2, # < 5 interactions → CBF-heavy
}


def normalize(arr: np.ndarray) -> np.ndarray:
    """Min-max normalize array to [0, 1]. Returns zeros if range is zero."""
    min_val = arr.min()
    max_val = arr.max()
    if max_val - min_val < 1e-9:
        return np.zeros_like(arr)
    return (arr - min_val) / (max_val - min_val)


def get_recommendations(
    user_id: str | None,
    placement: str,
    n: int,
    filters: dict,
    registry: Any,
    all_item_ids: list[str],
    all_products: list[dict],
    user_recent_views: list[str] | None = None,
    user_interaction_count: int = 0,
    preferences: list[str] | None = None,
    keywords: str | None = None,
) -> tuple[list[str], list[float]]:
    """
    Compute hybrid recommendations for a user.

    Args:
        user_id: MongoDB ObjectId string or None for anonymous
        placement: "homepage" | "pdp" | "cart"
        n: number of results to return
        filters: { excludeOos, minPrice, maxPrice, excludeIds }
        registry: ModelRegistry instance (cf_model, cf_dataset, cbf_similarity)
        all_item_ids: list of all product id strings
        all_products: list of product dicts (for price filtering)
        user_recent_views: list of recently viewed product id strings
        user_interaction_count: number of historical interactions for this user

    Returns:
        (productIds list, scores list) — both length ≤ n
    """
    n_items = len(all_item_ids)
    if n_items == 0:
        logger.warning("No items available for recommendations.")
        return [], []

    # ── Determine alpha ────────────────────────────────────────────────────
    placement_cfg = PLACEMENT_CONFIG.get(placement, {"alpha": 0.5, "n": 12})
    base_alpha = float(placement_cfg["alpha"])

    # Cold-start adjustments
    if not user_id:
        alpha = settings.ALPHA_ANONYMOUS  # anonymous → 0.0
    elif user_interaction_count == 0:
        alpha = COLD_START_ALPHA["no_history"]
    elif user_interaction_count < 5:
        alpha = COLD_START_ALPHA["few_interactions"]
    else:
        alpha = base_alpha

    logger.debug(
        f"[hybrid] user={user_id}, placement={placement}, "
        f"alpha={alpha}, interactions={user_interaction_count}"
    )

    # ── CF scores ──────────────────────────────────────────────────────────
    if user_id and alpha > 0 and registry.is_ready:
        try:
            cf_raw, _ = predict_for_user(
                registry.cf_model,
                registry.cf_dataset,
                user_id,
                all_item_ids,
            )
        except Exception as e:
            logger.error(f"CF prediction failed: {e}")
            cf_raw = np.zeros(n_items, dtype=np.float32)
    else:
        cf_raw = np.zeros(n_items, dtype=np.float32)

    # ── CBF scores ─────────────────────────────────────────────────────────
    item_index = {iid: i for i, iid in enumerate(all_item_ids)}

    if registry.cbf_similarity and user_recent_views:
        try:
            cbf_raw = get_cbf_scores_for_user(
                registry.cbf_similarity,
                item_index,
                user_recent_views,
                n_items,
            )
        except Exception as e:
            logger.error(f"CBF scoring failed: {e}")
            cbf_raw = np.zeros(n_items, dtype=np.float32)
    else:
        # Fallback: use view/purchase counts as CBF signal (popularity)
        cbf_raw = np.zeros(n_items, dtype=np.float32)
        for i, prod in enumerate(all_products):
            cbf_raw[i] = float(prod.get("sold", 0)) + float(prod.get("rating", 0)) * 10

    # ── Normalize and combine ──────────────────────────────────────────────
    cf_norm = normalize(cf_raw)
    cbf_norm = normalize(cbf_raw)

    hybrid = alpha * cf_norm + (1.0 - alpha) * cbf_norm

    # ── Apply filters ──────────────────────────────────────────────────────
    exclude_oos = filters.get("excludeOos", True)
    min_price = float(filters.get("minPrice", 0))
    max_price = float(filters.get("maxPrice", float("inf")))
    exclude_ids: set[str] = set(filters.get("excludeIds", []))

    for i, prod in enumerate(all_products):
        # Out-of-stock filter
        if exclude_oos and int(prod.get("stock", 0)) <= 0:
            hybrid[i] = -1.0
            continue
        # Price range filter
        price = float(prod.get("price", 0))
        if price < min_price or price > max_price:
            hybrid[i] = -1.0
            continue
        # Explicit exclusion
        if str(prod.get("_id", "")) in exclude_ids:
            hybrid[i] = -1.0

    # ── Preference tag boost (style/color matching) ────────────────────────
    PREF_BOOST_WEIGHT = 0.15
    if preferences:
        prefs_set = {p.lower() for p in preferences}
        for i, prod in enumerate(all_products):
            if hybrid[i] < 0:
                continue
            prod_tags = {t.lower() for t in prod.get("tags", [])}
            prod_features = prod_tags | {prod.get("category", "").lower()}
            overlap = len(prefs_set & prod_features)
            if overlap > 0:
                boost = (overlap / len(prefs_set)) * PREF_BOOST_WEIGHT
                hybrid[i] = min(hybrid[i] + boost, 1.0)

    # ── Keyword boost (context/need matching) ──────────────────────────────
    KW_BOOST_WEIGHT = 0.10
    if keywords and keywords.strip():
        kw_tokens = set(keywords.lower().split())
        for i, prod in enumerate(all_products):
            if hybrid[i] < 0:
                continue
            prod_text = (
                f"{prod.get('name', '')} "
                f"{prod.get('category', '')} "
                f"{' '.join(prod.get('tags', []))}"
            ).lower()
            match_count = sum(1 for kw in kw_tokens if kw in prod_text)
            if match_count > 0:
                boost = (match_count / len(kw_tokens)) * KW_BOOST_WEIGHT
                hybrid[i] = min(hybrid[i] + boost, 1.0)

    # ── Top-N ──────────────────────────────────────────────────────────────
    valid_indices = np.where(hybrid >= 0)[0]
    if len(valid_indices) == 0:
        logger.warning("All items filtered out — returning empty list.")
        return [], []

    top_indices = valid_indices[np.argsort(hybrid[valid_indices])[::-1]][:n]

    result_ids = [all_item_ids[i] for i in top_indices]
    result_scores = [round(float(hybrid[i]), 4) for i in top_indices]

    return result_ids, result_scores
