"""
Feature matrix builder.
Fetches behavioral_events and feature_snapshots from MongoDB and builds
the interaction matrix + item feature matrix needed by LightFM training.
"""

import logging
from datetime import datetime, timedelta
from typing import Any

import numpy as np
import scipy.sparse as sp
from pymongo import MongoClient
from bson import ObjectId

logger = logging.getLogger(__name__)

# Event weights for interaction matrix
EVENT_WEIGHTS: dict[str, float] = {
    "view": 1.0,
    "click": 1.5,
    "add_to_cart": 2.0,
    "purchase": 5.0,
    "rec_click": 1.5,
    "search": 0.5,
}


def get_price_tier(price: float) -> str:
    """Bucket price into three tiers (VND)."""
    if price < 200_000:
        return "low"
    elif price < 1_000_000:
        return "medium"
    else:
        return "high"


def fetch_training_data(
    mongo_uri: str,
    window_days: int = 90,
) -> tuple[sp.coo_matrix, dict, dict, list[dict], Any]:
    """
    Fetch behavioral events and products from MongoDB, build:
      - interactions_matrix: scipy.sparse.coo_matrix (users × items, values = weights)
      - user_index: { userId_str → row_index }
      - item_index: { productId_str → col_index }
      - products: list of product dicts (for CBF)
      - item_features_matrix: LightFM-compatible item features (or None)

    Returns: (interactions_matrix, user_index, item_index, products, item_features_matrix)
    """
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=10_000)
    db_name = mongo_uri.rstrip("/").split("/")[-1].split("?")[0] or "smart-ecommerce"
    db = client[db_name]

    cutoff = datetime.utcnow() - timedelta(days=window_days)
    logger.info(f"Fetching behavioral events since {cutoff.date()} (last {window_days}d)...")

    # ── 1. Fetch behavioral events ─────────────────────────────────────────
    raw_events = list(
        db["behavioralevents"].find(
            {
                "timestamp": {"$gte": cutoff},
                "userId": {"$ne": None},
            },
            {"userId": 1, "productId": 1, "eventType": 1, "weight": 1},
        )
    )
    logger.info(f"Found {len(raw_events)} behavioral events.")

    if len(raw_events) < 10:
        logger.warning("Too few events — training may not be meaningful.")

    # ── 2. Build user/item indexes ─────────────────────────────────────────
    user_ids: set[str] = set()
    item_ids: set[str] = set()

    for e in raw_events:
        if e.get("userId") and e.get("productId"):
            user_ids.add(str(e["userId"]))
            item_ids.add(str(e["productId"]))

    user_index: dict[str, int] = {uid: i for i, uid in enumerate(sorted(user_ids))}
    item_index: dict[str, int] = {iid: i for i, iid in enumerate(sorted(item_ids))}

    n_users = len(user_index)
    n_items = len(item_index)
    logger.info(f"Unique users: {n_users}, unique items: {n_items}")

    if n_users == 0 or n_items == 0:
        logger.error("No users or items found. Cannot build interaction matrix.")
        empty = sp.coo_matrix((n_users or 1, n_items or 1))
        return empty, user_index, item_index, [], None

    # ── 3. Aggregate interactions (sum weights per user-item pair) ─────────
    interaction_map: dict[tuple[int, int], float] = {}
    for e in raw_events:
        uid = e.get("userId")
        pid = e.get("productId")
        if not uid or not pid:
            continue
        u_str = str(uid)
        p_str = str(pid)
        if u_str not in user_index or p_str not in item_index:
            continue
        u_idx = user_index[u_str]
        i_idx = item_index[p_str]
        w = float(e.get("weight") or EVENT_WEIGHTS.get(e.get("eventType", "view"), 1.0))
        key = (u_idx, i_idx)
        interaction_map[key] = interaction_map.get(key, 0.0) + w

    rows, cols, data = [], [], []
    for (r, c), v in interaction_map.items():
        rows.append(r)
        cols.append(c)
        data.append(v)

    interactions_matrix = sp.coo_matrix(
        (data, (rows, cols)), shape=(n_users, n_items), dtype=np.float32
    )
    logger.info(
        f"Interaction matrix: {interactions_matrix.shape}, "
        f"nnz={interactions_matrix.nnz}"
    )

    # ── 4. Fetch products for CBF + item features ──────────────────────────
    product_ids_obj = [ObjectId(iid) for iid in item_index.keys() if ObjectId.is_valid(iid)]
    products = list(
        db["products"].find(
            {"_id": {"$in": product_ids_obj}, "isActive": True},
            {"name": 1, "description": 1, "category": 1, "tags": 1, "price": 1},
        )
    )
    logger.info(f"Fetched {len(products)} active products for CBF.")

    client.close()
    return interactions_matrix, user_index, item_index, products, None


def train_test_split_interactions(
    interactions: sp.coo_matrix, test_fraction: float = 0.2
) -> tuple[sp.coo_matrix, sp.coo_matrix]:
    """
    Split interactions into train/test by randomly masking test_fraction of entries.
    Returns (train_interactions, test_interactions) — both in COO format.
    """
    n_interactions = interactions.nnz
    n_test = max(1, int(n_interactions * test_fraction))

    indices = np.arange(n_interactions)
    np.random.shuffle(indices)
    test_indices = set(indices[:n_test])

    train_rows, train_cols, train_data = [], [], []
    test_rows, test_cols, test_data = [], [], []

    for i, (r, c, v) in enumerate(
        zip(interactions.row, interactions.col, interactions.data)
    ):
        if i in test_indices:
            test_rows.append(r)
            test_cols.append(c)
            test_data.append(v)
        else:
            train_rows.append(r)
            train_cols.append(c)
            train_data.append(v)

    shape = interactions.shape
    train = sp.coo_matrix(
        (train_data, (train_rows, train_cols)), shape=shape, dtype=np.float32
    )
    test = sp.coo_matrix(
        (test_data, (test_rows, test_cols)), shape=shape, dtype=np.float32
    )
    return train, test
