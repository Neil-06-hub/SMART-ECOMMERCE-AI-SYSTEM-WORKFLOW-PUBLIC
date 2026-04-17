"""
Evaluation metrics for the CF model.
Uses LightFM's built-in precision@k and recall@k.
"""

import logging

import numpy as np
import scipy.sparse as sp
from lightfm import LightFM
from lightfm.evaluation import precision_at_k, recall_at_k

logger = logging.getLogger(__name__)

PRECISION_THRESHOLD = 0.30
RECALL_THRESHOLD = 0.20


def evaluate(
    model: LightFM,
    test_interactions: sp.coo_matrix,
    train_interactions: sp.coo_matrix,
    k: int = 10,
    num_threads: int = 4,
) -> dict:
    """
    Evaluate a LightFM model with precision@k and recall@k.

    Args:
        model: trained LightFM model
        test_interactions: held-out interactions (COO matrix)
        train_interactions: training interactions (to exclude from evaluation)
        k: number of top recommendations to consider
        num_threads: parallel threads for evaluation

    Returns:
        dict with keys: precision_at_10, recall_at_10, meets_threshold
    """
    if test_interactions.nnz == 0:
        logger.warning("Test interaction matrix is empty — skipping evaluation.")
        return {
            "precision_at_10": 0.0,
            "recall_at_10": 0.0,
            "meets_threshold": False,
        }

    try:
        # Convert to CSR for LightFM evaluation
        test_csr = test_interactions.tocsr()
        train_csr = train_interactions.tocsr()

        precision_scores = precision_at_k(
            model,
            test_csr,
            train_interactions=train_csr,
            k=k,
            num_threads=num_threads,
        )
        recall_scores = recall_at_k(
            model,
            test_csr,
            train_interactions=train_csr,
            k=k,
            num_threads=num_threads,
        )

        # Filter out NaN (users with no test interactions)
        valid_precision = precision_scores[~np.isnan(precision_scores)]
        valid_recall = recall_scores[~np.isnan(recall_scores)]

        precision_mean = float(np.mean(valid_precision)) if len(valid_precision) > 0 else 0.0
        recall_mean = float(np.mean(valid_recall)) if len(valid_recall) > 0 else 0.0

        meets = (
            precision_mean >= PRECISION_THRESHOLD
            and recall_mean >= RECALL_THRESHOLD
        )

        result = {
            "precision_at_10": round(precision_mean, 4),
            "recall_at_10": round(recall_mean, 4),
            "meets_threshold": meets,
            "evaluated_users": int(len(valid_precision)),
        }
        logger.info(
            f"Evaluation: precision@{k}={precision_mean:.4f}, "
            f"recall@{k}={recall_mean:.4f}, "
            f"meets_threshold={meets}"
        )
        return result

    except Exception as e:
        logger.exception(f"Evaluation failed: {e}")
        return {
            "precision_at_10": 0.0,
            "recall_at_10": 0.0,
            "meets_threshold": False,
        }


def is_improvement(new_metrics: dict, current_metrics: dict | None) -> bool:
    """
    Return True if new model metrics are better than or equal to current.
    If no current model exists, always promote.
    """
    if current_metrics is None:
        return True
    return (
        new_metrics["precision_at_10"] >= current_metrics.get("precisionAt10", 0.0)
        and new_metrics["recall_at_10"] >= current_metrics.get("recallAt10", 0.0)
    )
