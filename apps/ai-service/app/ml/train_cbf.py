"""
Content-Based Filtering (CBF) using TF-IDF + category/price-tier one-hot.
Pre-computes top-50 similar items per product to avoid real-time cosine similarity.
"""

import logging
from typing import Any

import numpy as np
import scipy.sparse as sp
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import OneHotEncoder

logger = logging.getLogger(__name__)


def get_price_tier(price: float) -> str:
    """Bucket price into three tiers (VND)."""
    if price < 200_000:
        return "low"
    elif price < 1_000_000:
        return "medium"
    else:
        return "high"


def build_cbf_matrix(
    products: list[dict],
    top_k: int = 50,
    max_tfidf_features: int = 5000,
) -> tuple[dict[str, list[dict]], TfidfVectorizer, sp.spmatrix]:
    """
    Build the CBF similarity lookup.

    Args:
        products: list of product dicts with fields: _id, name, description, category, tags, price
        top_k: number of similar items to store per product
        max_tfidf_features: vocabulary size for TF-IDF

    Returns:
        (cbf_similarity, vectorizer, feature_matrix)
        - cbf_similarity: { productId_str → [{productId, score}, ...top_k] }
        - vectorizer: fitted TfidfVectorizer (for future inference)
        - feature_matrix: sparse feature matrix (n_products × n_features)
    """
    if not products:
        logger.warning("No products provided for CBF matrix. Returning empty.")
        return {}, None, None

    n = len(products)
    logger.info(f"Building CBF matrix for {n} products (top_k={top_k})...")

    # ── 1. Text corpus: name + description + tags ──────────────────────────
    corpus = []
    for p in products:
        name = p.get("name", "")
        desc = p.get("description", "")
        tags = " ".join(p.get("tags", []))
        corpus.append(f"{name} {desc} {tags}".strip())

    # TF-IDF with character n-grams (better for Vietnamese text)
    vectorizer = TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=(2, 4),
        max_features=max_tfidf_features,
        sublinear_tf=True,
        min_df=1,
    )
    tfidf_matrix = vectorizer.fit_transform(corpus)  # (n, max_features)
    logger.info(f"TF-IDF matrix: {tfidf_matrix.shape}")

    # ── 2. Category one-hot encoding ───────────────────────────────────────
    categories = [[p.get("category", "unknown")] for p in products]
    cat_encoder = OneHotEncoder(sparse_output=True, handle_unknown="ignore")
    category_matrix = cat_encoder.fit_transform(categories)  # (n, n_categories)

    # ── 3. Price tier one-hot encoding ────────────────────────────────────
    price_tiers = [[get_price_tier(float(p.get("price", 0)))] for p in products]
    price_encoder = OneHotEncoder(sparse_output=True, handle_unknown="ignore")
    price_matrix = price_encoder.fit_transform(price_tiers)  # (n, 3)

    # ── 4. Stack features: text + category(×2.0) + price_tier ─────────────
    feature_matrix = sp.hstack(
        [tfidf_matrix, category_matrix * 2.0, price_matrix],
        format="csr",
    )
    logger.info(f"Combined feature matrix: {feature_matrix.shape}")

    # ── 5. Pre-compute top-K similar items per product ────────────────────
    cbf_similarity: dict[str, list[dict]] = {}
    chunk_size = 100  # Process in chunks to avoid memory issues

    for start in range(0, n, chunk_size):
        end = min(start + chunk_size, n)
        chunk = feature_matrix[start:end]

        # Cosine similarity between this chunk and all products
        sim_block = cosine_similarity(chunk, feature_matrix)  # (chunk_size, n)

        for local_i, global_i in enumerate(range(start, end)):
            prod_id = str(products[global_i]["_id"])
            scores = sim_block[local_i]

            # Argsort descending, skip self (index global_i)
            sorted_indices = np.argsort(scores)[::-1]
            top_indices = [j for j in sorted_indices if j != global_i][:top_k]

            cbf_similarity[prod_id] = [
                {
                    "productId": str(products[j]["_id"]),
                    "score": float(scores[j]),
                }
                for j in top_indices
            ]

        if (start // chunk_size) % 5 == 0:
            logger.info(f"CBF progress: {end}/{n} products processed...")

    logger.info(
        f"CBF similarity built: {len(cbf_similarity)} products, "
        f"~{top_k} neighbors each."
    )
    return cbf_similarity, vectorizer, feature_matrix


def get_cbf_scores_for_user(
    cbf_similarity: dict[str, list[dict]],
    item_index: dict[str, int],
    recent_view_ids: list[str],
    n_items: int,
    max_seed_products: int = 5,
) -> np.ndarray:
    """
    Aggregate CBF scores for a user based on their recent views.
    Returns an array of shape (n_items,) with scores in [0, 1].
    """
    scores = np.zeros(n_items, dtype=np.float32)

    seed_products = recent_view_ids[:max_seed_products]
    for viewed_id in seed_products:
        if viewed_id not in cbf_similarity:
            continue
        for entry in cbf_similarity[viewed_id]:
            neighbor_id = entry["productId"]
            if neighbor_id in item_index:
                idx = item_index[neighbor_id]
                scores[idx] = max(scores[idx], float(entry["score"]))

    return scores
