"""
ML Training Pipeline — Entry point for GitHub Actions daily cron.
Schedule: 0 19 * * * UTC (= 02:00 ICT)

Steps:
  1. Fetch behavioral events + feature snapshots from MongoDB
  2. Build interaction matrix
  3. Train CF model (LightFM WARP)
  4. Evaluate precision@10 / recall@10
  5. Promote if better than current active model
  6. Build CBF similarity matrix (TF-IDF)
  7. Upload all artifacts to Cloudflare R2
  8. Trigger FastAPI hot-reload via POST /internal/reload-model
  9. Write training_results.json (uploaded by GitHub Actions as artifact)
"""

import json
import logging
import os
import sys
import time
from datetime import datetime, timezone

import httpx
from pymongo import MongoClient

# Ensure package root is on path when run from project root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.config import settings
from app.ml.features import fetch_training_data, train_test_split_interactions
from app.ml.train_cf import train_cf
from app.ml.train_cbf import build_cbf_matrix
from app.ml.evaluate import evaluate, is_improvement
from app.services.r2_client import upload_pickle, upload_bytes

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("train_pipeline")


def get_current_active_metrics(db) -> dict | None:
    """Fetch metrics of the currently active CF model from MongoDB."""
    doc = db["modelversions"].find_one(
        {"modelType": "cf", "isActive": True},
        sort=[("promotedAt", -1)],
    )
    if doc:
        return doc.get("metrics")
    return None


def promote_model(db, version: str, new_metrics: dict, artifact_url: str):
    """
    Deactivate the current model and insert a new active version record.
    """
    now = datetime.now(timezone.utc)

    # Deactivate old active model
    db["modelversions"].update_many(
        {"modelType": "cf", "isActive": True},
        {"$set": {"isActive": False, "deprecatedAt": now}},
    )

    # Insert new active record
    db["modelversions"].insert_one(
        {
            "modelType": "cf",
            "version": version,
            "metrics": {
                "precisionAt10": new_metrics["precision_at_10"],
                "recallAt10": new_metrics["recall_at_10"],
            },
            "artifactUrl": artifact_url,
            "isActive": True,
            "promotedAt": now,
            "deprecatedAt": None,
            "createdAt": now,
            "updatedAt": now,
        }
    )
    logger.info(f"Model version {version} promoted as active ({artifact_url}).")


def record_failed_attempt(db, version: str, new_metrics: dict):
    """Record a training attempt that did not beat the current model."""
    now = datetime.now(timezone.utc)
    db["modelversions"].insert_one(
        {
            "modelType": "cf",
            "version": version,
            "metrics": {
                "precisionAt10": new_metrics["precision_at_10"],
                "recallAt10": new_metrics["recall_at_10"],
            },
            "artifactUrl": None,
            "isActive": False,
            "promotedAt": None,
            "deprecatedAt": now,
            "createdAt": now,
            "updatedAt": now,
        }
    )


def trigger_reload(version: str) -> bool:
    """POST /internal/reload-model to hot-swap the in-memory model."""
    url = f"{settings.FASTAPI_URL}/internal/reload-model"
    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(
                url,
                json={"version": version},
                headers={"X-Internal-Secret": settings.INTERNAL_SECRET},
            )
            resp.raise_for_status()
            logger.info(f"Hot-reload triggered: {resp.json()}")
            return True
    except Exception as e:
        logger.error(f"Hot-reload failed (service may be cold): {e}")
        return False


def run_pipeline() -> dict:
    version = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    start_time = time.time()

    logger.info(f"=" * 60)
    logger.info(f"Training pipeline started. Version: {version}")
    logger.info(f"=" * 60)

    results = {
        "version": version,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "promoted": False,
        "metrics": {},
        "error": None,
    }

    # ── Connect to MongoDB ─────────────────────────────────────────────────
    client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=10_000)
    db_name = settings.MONGODB_URI.rstrip("/").split("/")[-1].split("?")[0] or "smart-ecommerce"
    db = client[db_name]

    try:
        # ── Step 1: Fetch training data ────────────────────────────────────
        logger.info("Step 1: Fetching training data from MongoDB...")
        (
            interactions_matrix,
            user_index,
            item_index,
            products,
            _,
        ) = fetch_training_data(settings.MONGODB_URI, window_days=90)

        if interactions_matrix.nnz < 20:
            raise ValueError(
                f"Insufficient training data: only {interactions_matrix.nnz} interactions. "
                "Need at least 20. Run seed scripts 05 and 06 first."
            )

        # ── Step 2: Train/test split ───────────────────────────────────────
        logger.info("Step 2: Splitting train/test (80/20)...")
        train_interactions, test_interactions = train_test_split_interactions(
            interactions_matrix, test_fraction=0.2
        )

        # ── Step 3: Train CF model ─────────────────────────────────────────
        logger.info("Step 3: Training LightFM CF model (WARP loss)...")
        cf_model, cf_dataset = train_cf(
            train_interactions,
            user_index,
            item_index,
            no_components=128,
            epochs=50,
            num_threads=4,
        )

        # ── Step 4: Evaluate ───────────────────────────────────────────────
        logger.info("Step 4: Evaluating model...")
        new_metrics = evaluate(
            cf_model,
            test_interactions,
            train_interactions,
            k=10,
            num_threads=4,
        )
        results["metrics"] = new_metrics
        logger.info(
            f"New model: precision@10={new_metrics['precision_at_10']:.4f}, "
            f"recall@10={new_metrics['recall_at_10']:.4f}, "
            f"meets_threshold={new_metrics['meets_threshold']}"
        )

        # ── Step 5: Compare with current model ────────────────────────────
        logger.info("Step 5: Comparing with current active model...")
        current_metrics = get_current_active_metrics(db)
        should_promote = is_improvement(new_metrics, current_metrics)

        if not should_promote:
            logger.info(
                f"No improvement over current model "
                f"(precision={current_metrics.get('precisionAt10', 0):.4f}, "
                f"recall={current_metrics.get('recallAt10', 0):.4f}). "
                "Keeping current model."
            )
            record_failed_attempt(db, version, new_metrics)
            results["promoted"] = False
        else:
            # ── Step 6: Build CBF matrix ───────────────────────────────────
            logger.info("Step 6: Building CBF similarity matrix (TF-IDF)...")
            cbf_similarity, vectorizer, feature_matrix = build_cbf_matrix(
                products, top_k=50
            )

            # ── Step 7: Upload artifacts to R2 ────────────────────────────
            logger.info("Step 7: Uploading artifacts to Cloudflare R2...")
            artifact_url = upload_pickle(cf_model, f"models/cf/{version}/cf_model.pkl")
            upload_pickle(cf_dataset, f"models/cf/{version}/cf_dataset.pkl")
            upload_pickle(cbf_similarity, f"models/cbf/{version}/cbf_top50.pkl")
            upload_pickle(vectorizer, f"models/cbf/{version}/vectorizer.pkl")
            upload_bytes(
                json.dumps(
                    {
                        "version": version,
                        "metrics": new_metrics,
                        "n_users": cf_dataset.n_users(),
                        "n_items": cf_dataset.n_items(),
                    }
                ).encode(),
                f"models/{version}/metadata.json",
                content_type="application/json",
            )
            logger.info("All artifacts uploaded.")

            # ── Promote model in MongoDB ───────────────────────────────────
            promote_model(db, version, new_metrics, artifact_url)
            results["promoted"] = True

            # ── Step 8: Hot-reload FastAPI ─────────────────────────────────
            logger.info("Step 8: Triggering FastAPI hot-reload...")
            reload_ok = trigger_reload(version)
            results["reload_triggered"] = reload_ok

    except Exception as e:
        logger.exception(f"Pipeline failed: {e}")
        results["error"] = str(e)
    finally:
        client.close()

    elapsed = time.time() - start_time
    results["duration_seconds"] = round(elapsed, 1)
    results["completed_at"] = datetime.now(timezone.utc).isoformat()

    logger.info(f"Pipeline finished in {elapsed:.1f}s. Promoted: {results['promoted']}")
    return results


if __name__ == "__main__":
    results = run_pipeline()

    # Write results for GitHub Actions artifact upload
    output_path = "training_results.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)

    logger.info(f"Results written to {output_path}")

    if results.get("error"):
        sys.exit(1)

    # Exit 0 even if not promoted (no improvement is not an error)
    sys.exit(0)
