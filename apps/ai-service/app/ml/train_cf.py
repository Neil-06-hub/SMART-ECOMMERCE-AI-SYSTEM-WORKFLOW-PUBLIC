"""
Collaborative Filtering training using LightFM with WARP loss.
Optimized for implicit feedback (view, click, purchase events).
"""

import logging
from typing import Any

import numpy as np
import scipy.sparse as sp
from lightfm import LightFM
from lightfm.data import Dataset

logger = logging.getLogger(__name__)


def train_cf(
    interactions_matrix: sp.coo_matrix,
    user_index: dict[str, int],
    item_index: dict[str, int],
    no_components: int = 128,
    epochs: int = 50,
    num_threads: int = 4,
    learning_rate: float = 0.05,
    item_alpha: float = 1e-6,
    user_alpha: float = 1e-6,
) -> tuple[LightFM, Dataset]:
    """
    Train a LightFM CF model with WARP loss.

    Returns:
        (model, dataset) — both needed for inference.
    """
    n_users, n_items = interactions_matrix.shape
    logger.info(
        f"Training CF model: {n_users} users, {n_items} items, "
        f"no_components={no_components}, epochs={epochs}"
    )

    if interactions_matrix.nnz == 0:
        raise ValueError("Interaction matrix is empty — cannot train CF model.")

    # ── Build LightFM Dataset ──────────────────────────────────────────────
    # user_ids / item_ids must be sorted to match index positions
    user_ids_sorted = sorted(user_index.keys(), key=lambda u: user_index[u])
    item_ids_sorted = sorted(item_index.keys(), key=lambda i: item_index[i])

    dataset = Dataset()
    dataset.fit(users=user_ids_sorted, items=item_ids_sorted)

    # Build weighted interactions from COO matrix
    weighted_triplets = [
        (user_ids_sorted[r], item_ids_sorted[c], float(v))
        for r, c, v in zip(
            interactions_matrix.row,
            interactions_matrix.col,
            interactions_matrix.data,
        )
    ]

    (train_interactions, train_weights) = dataset.build_interactions(weighted_triplets)

    logger.info(
        f"LightFM Dataset built: {dataset.n_users()} users, "
        f"{dataset.n_items()} items, {train_interactions.nnz} interactions."
    )

    # ── Train model ────────────────────────────────────────────────────────
    model = LightFM(
        loss="warp",
        no_components=no_components,
        learning_rate=learning_rate,
        item_alpha=item_alpha,
        user_alpha=user_alpha,
        random_state=42,
    )

    model.fit(
        interactions=train_interactions,
        sample_weight=train_weights,
        epochs=epochs,
        num_threads=num_threads,
        verbose=True,
    )

    logger.info("CF model training complete.")
    return model, dataset


def predict_for_user(
    model: LightFM,
    dataset: Dataset,
    user_id_str: str,
    all_item_ids: list[str],
) -> tuple[np.ndarray, list[str]]:
    """
    Generate CF scores for all items for a given user.
    Returns (scores array, item_ids list) — both aligned by index.
    Unknown users → zero scores (cold-start handled upstream).
    """
    user_mapping = dataset.mapping()[0]  # user_id → internal index
    item_mapping = dataset.mapping()[2]  # item_id → internal index

    if user_id_str not in user_mapping:
        # Unknown user — return zeros for pure CBF fallback
        return np.zeros(len(all_item_ids)), all_item_ids

    user_idx = user_mapping[user_id_str]

    # Map item_ids to internal indices (skip unknown items)
    valid_item_ids = []
    internal_indices = []
    for iid in all_item_ids:
        if iid in item_mapping:
            valid_item_ids.append(iid)
            internal_indices.append(item_mapping[iid])

    if not internal_indices:
        return np.zeros(len(all_item_ids)), all_item_ids

    scores_partial = model.predict(
        user_ids=user_idx,
        item_ids=np.array(internal_indices, dtype=np.int32),
    )

    # Map back to full all_item_ids order
    score_map = {iid: float(s) for iid, s in zip(valid_item_ids, scores_partial)}
    full_scores = np.array([score_map.get(iid, 0.0) for iid in all_item_ids])

    return full_scores, all_item_ids
