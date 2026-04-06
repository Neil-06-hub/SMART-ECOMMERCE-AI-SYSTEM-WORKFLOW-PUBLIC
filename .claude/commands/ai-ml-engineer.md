---
description: FastAPI and ML pipeline specialist for the SMART-ECOMMERCE AI recommendation engine. Handles LightFM training, TF-IDF CBF matrix, feature store Redis patterns, circuit breaker integration, and the daily GitHub Actions training cron.
---

# AI/ML Engineer

## When to Use This Skill
- Any task touching `apps/ai-service/`
- "Train the recommendation model"
- "Update the feature store for user X"
- "Debug circuit breaker trips"
- "Add a new recommendation placement"
- "Optimize inference latency"
- ML training pipeline tasks (GitHub Actions cron)

## Context to Read First (in order)
1. `docs/ARCHITECTURE.md` §4 (complete AI architecture: recommendation flow, circuit breaker, training pipeline, feature store design)
2. `docs/TECH_STACK.md` §5 (AI/ML stack: LightFM 1.17, scikit-learn 1.4, Python 3.11 — why not alternatives)
3. `docs/DATABASE_DESIGN.md` §3.8 (`behavioral_events` schema), §3.9 (`feature_snapshots`), §3.10 (`model_versions`)
4. `docs/DATABASE_DESIGN.md` §6 (Redis data structures — `features:user:{userId}` Hash, TTL 2h)
5. `libs/shared/src/constants/placement-config.ts` (alpha values per placement, n per placement)

---

## FastAPI Service Structure

```
apps/ai-service/
├── app/
│   ├── main.py                    # FastAPI app init, CORS, /health endpoint
│   ├── config.py                  # pydantic-settings: REDIS_URL, MONGO_URI, R2_*, INTERNAL_API_TOKEN
│   ├── routers/
│   │   ├── recommend.py           # POST /recommend
│   │   ├── features.py            # POST /features/update (called by Express.js on user activity)
│   │   └── internal.py            # POST /internal/reload-model (GitHub Actions callback)
│   ├── services/
│   │   ├── cf_service.py          # LightFM model load + predict()
│   │   ├── cbf_service.py         # cosine similarity matrix compute + query()
│   │   ├── hybrid.py              # α-weighted scoring + post_filter()
│   │   └── fallback.py            # get_popular_products() — when circuit is open
│   └── ml/
│       ├── train_cf.py            # LightFM WARP fit, evaluate precision@10/recall@10
│       ├── train_cbf.py           # TF-IDF vectorize + cosine similarity matrix
│       └── model_registry.py      # Cloudflare R2 upload/download .pkl artifacts
├── scripts/
│   └── train_pipeline.py          # GitHub Actions entry point (all 7 steps)
└── tests/
    ├── test_recommend.py
    └── test_training.py
```

---

## Recommendation Inference Flow

```
GET /api/v1/recommendations?placement=homepage&n=12
  ↓ Express.js RecommendationModule
  → Redis GET rec:{userId}:homepage
  ├─ HIT (target ≥80%): return cached productIds, source='cache'
  └─ MISS: opossum circuit breaker
      ├─ CLOSED: POST to FastAPI /recommend
      │   ├─ Redis HGETALL features:user:{userId}
      │   │   {recent_product_ids, recent_category_ids, avg_price_range, rfm_segment, ...}
      │   ├─ CF_score = LightFM.predict(userId, all_item_ids)  [matrix factorization]
      │   ├─ CBF_score = cosine_similarity[user_profile_vector, item_vectors]
      │   ├─ hybrid_score = α × CF_score + (1-α) × CBF_score
      │   │   (α from placement-config.ts: homepage=0.7, pdp=0.3, cart=0.5)
      │   ├─ post_filter: remove OOS items + already-in-cart items
      │   ├─ top_N = np.argsort(hybrid_score)[-n:][::-1]
      │   └─ return {product_ids, scores, model_version, source='model_lightfm'}
      │       → Express.js caches: SETEX rec:{userId}:homepage 600 [productIds]
      │
      └─ OPEN (>50% error rate or >500ms): fallback
          → Redis GET fallback:popular:homepage
          ├─ HIT: return cached popular productIds
          └─ MISS: MongoDB agg (behavioral_events, 7 days, top N by views)
                → SETEX fallback:popular:homepage 3600
          → return {product_ids, source='fallback_popular'}
```

---

## Circuit Breaker Configuration (Express.js side)

```typescript
// apps/api/src/modules/recommendation/services/ai-client.service.ts
import CircuitBreaker from 'opossum';

const breakerOptions = {
  timeout: 500,                       // ms — FastAPI MUST respond within 500ms
  errorThresholdPercentage: 50,       // >50% errors → circuit opens
  resetTimeout: 60_000,               // 60s before half-open probe
  volumeThreshold: 5,                 // minimum 5 requests before evaluating error rate
  name: 'fastapi-recommendation',
};

const breaker = new CircuitBreaker(
  this.callFastApiRecommend.bind(this),
  breakerOptions,
);

breaker.fallback(() => this.getPopularityFallback());
breaker.on('open',     () => logger.warn('AI circuit OPEN — using popularity fallback'));
breaker.on('halfOpen', () => logger.log('AI circuit HALF-OPEN — probing FastAPI'));
breaker.on('close',    () => logger.log('AI circuit CLOSED — AI recommendations restored'));
```

**Common circuit breaker trip causes:**
- Render.com FastAPI cold start after 15 min idle → exceeds 500ms timeout
- Fix: UptimeRobot pings `/health` every 5 min to keep service warm
- Fix: increase `resetTimeout` to 120s during startup window
- Fix: `volumeThreshold: 10` to require more samples before tripping

---

## ML Training Pipeline (7 steps)

```python
# apps/ai-service/scripts/train_pipeline.py
# Triggered by GitHub Actions cron: '0 19 * * *' (02:00 ICT = 19:00 UTC)

def run_pipeline():
    # Step 1: Fetch features from MongoDB
    # behavioral_events: last 90 DAYS ONLY (TTL constraint)
    # feature_snapshots: latest per user
    interactions, user_features, item_features = fetch_features_from_mongo(
        days_back=90  # NEVER exceed 90 days
    )

    # Step 2: Train CF model (LightFM WARP loss — best for implicit feedback)
    cf_model = train_cf_model(
        interactions=interactions,
        user_features=user_features,
        item_features=item_features,
        epochs=30,
        num_threads=4,  # GitHub Actions runner: 2 vCPU, use 4 threads
        loss='warp',    # Weighted Approximate-Rank Pairwise — for implicit feedback
    )

    # Step 3: Evaluate against held-out 20% test set
    precision, recall, ndcg = evaluate_model(cf_model, test_interactions)
    print(f'Metrics: precision@10={precision:.3f}, recall@10={recall:.3f}')

    # Step 4: Promote only if BOTH metrics improve vs current active model
    current_model = get_active_model_metrics()  # from model_versions collection
    if precision >= current_model['precision_at_10'] and recall >= current_model['recall_at_10']:
        # Step 5: Upload to Cloudflare R2
        # Path: models/cf/YYYY-MM-DD/cf_model.pkl
        artifact_url = upload_to_r2(cf_model, model_type='cf')

        # Step 6: Rebuild CBF matrix (TF-IDF on product name+description)
        cbf_matrix, product_index = train_cbf_model()
        cbf_url = upload_to_r2(cbf_matrix, model_type='cbf')
        index_url = upload_to_r2(product_index, model_type='cbf_index')

        # Step 7: Hot-reload FastAPI (in-memory atomic swap, no restart)
        reload_fastapi(artifact_url, cbf_url, index_url)

        # Update model_versions collection (INSERT new, set old isActive=False)
        update_model_registry(precision, recall, ndcg, artifact_url)
    else:
        print('No improvement — keeping current model active')
```

### LightFM Training Details
```python
from lightfm import LightFM
from lightfm.data import Dataset

# Build interaction matrix (implicit feedback)
# Events weighted: purchase=5, add_to_cart=3, view=1, rec_click=2
dataset = Dataset()
dataset.fit(users=user_ids, items=item_ids)

(interactions, weights) = dataset.build_interactions([
    (uid, iid, weight) for uid, iid, weight in weighted_interactions
])

model = LightFM(
    no_components=64,    # embedding dimension
    loss='warp',         # WARP: good for implicit feedback top-N ranking
    learning_rate=0.05,
    item_alpha=1e-6,
    user_alpha=1e-6,
)
model.fit(
    interactions,
    sample_weight=weights,
    epochs=30,
    num_threads=4,
    verbose=True,
)

# Evaluate
from lightfm.evaluation import precision_at_k, recall_at_k
p10 = precision_at_k(model, test_interactions, k=10).mean()
r10 = recall_at_k(model, test_interactions, k=10).mean()
# Thresholds: precision@10 >= 0.30, recall@10 >= 0.20
```

### TF-IDF CBF Matrix
```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Vectorize product name + description (Vietnamese text)
# Note: no stopword list for Vietnamese — use character n-grams instead
vectorizer = TfidfVectorizer(
    analyzer='char_wb',    # character n-grams work better for Vietnamese
    ngram_range=(2, 4),
    max_features=50000,
    sublinear_tf=True,
)

product_texts = [f"{p['name']} {p['description']}" for p in active_products]
tfidf_matrix = vectorizer.fit_transform(product_texts)  # shape: (n_products, n_features)

# Pre-compute full similarity matrix at training time (not at inference!)
# This is expensive but only done once per training cycle
similarity_matrix = cosine_similarity(tfidf_matrix, dense_output=False)
# At inference: similarity_matrix[product_idx].toarray()[0]  → similar item scores
```

---

## Feature Store (Redis Hash)

```python
# Key: features:user:{userId}   Type: Hash   TTL: 2 hours (7200s)
# Updated: on every user action (behavioral event) + on order completion

# Write (from Express.js via POST /features/update)
async def update_feature_store(user_id: str, event_type: str, product_id: str):
    key = f'features:user:{user_id}'
    pipe = redis_client.pipeline()
    
    if event_type == 'view':
        # Append to recent views (keep last 20)
        recent = json.loads(redis_client.hget(key, 'recent_product_ids') or '[]')
        recent = ([product_id] + recent)[:20]
        pipe.hset(key, 'recent_product_ids', json.dumps(recent))
    
    pipe.expire(key, 7200)  # refresh TTL on every update (sliding expiry)
    pipe.execute()

# Read (at inference time — HGETALL is a single Redis command)
async def get_user_features(user_id: str) -> dict:
    key = f'features:user:{user_id}'
    features = redis_client.hgetall(key)
    if not features:
        # Fallback: compute on-demand from MongoDB (adds ~20ms)
        features = await compute_features_from_mongo(user_id)
        store_features_in_redis(user_id, features)
    return features
```

---

## Placement Configuration

```typescript
// libs/shared/src/constants/placement-config.ts
export const PLACEMENT_CONFIG = {
  homepage: { alpha: 0.7, n: 12, ttl: 600 },  // CF-heavy (personalized)
  pdp:      { alpha: 0.3, n: 8,  ttl: 600 },  // CBF-heavy (similar items)
  cart:     { alpha: 0.5, n: 6,  ttl: 300 },  // balanced (FBT)
  email:    { alpha: 0.6, n: 10, ttl: 0   },  // no cache (batch job)
  search:   { alpha: 0.5, n: 12, ttl: 300 },  // balanced (reranking)
};
```

---

## Performance Targets

| Metric | Target | How to Achieve |
|---|---|---|
| Inference p95 (cache hit) | < 200ms | Redis GET ~1ms + catalog lookup ~10ms |
| Inference p99 (cache miss) | < 500ms | FastAPI hybrid scoring ~200ms + Redis SETEX |
| Cold-start fallback | < 100ms | Pre-computed `fallback:popular:{placement}` in Redis |
| Cache hit rate | ≥ 80% | 10-min TTL + Upstash keeping service warm |
| Model training duration | < 30 min | LightFM ~10min + CBF ~5min + R2 upload ~2min |
| Feature store freshness | ≤ 1 hour lag | Redis TTL 2h, updated on every behavioral event |

---

## Critical Constraints

1. **Never query `behavioral_events` beyond 90 days** — TTL index auto-purges, older data doesn't exist
2. **R2 artifact path**: `models/{type}/{YYYY-MM-DD}/{filename}.pkl`
3. **`/internal/reload-model`** requires `X-Internal-Token: {INTERNAL_API_TOKEN}` header
4. **ML training cron**: `0 19 * * *` UTC = 02:00 ICT (off-peak for Vietnamese users)
5. **Hot-reload**: model swap is in-memory — Python GIL protects the assignment. No restart needed.
6. **FastAPI is inference-only** — no order creation, no user management, no campaign logic
7. **GitHub Actions timeout**: set `timeout-minutes: 30` on ML training job

## Final Checklist Before Done
- [ ] `behavioral_events` queries have `timestamp >= (now - 90 days)` filter
- [ ] Model stored in R2 with correct path pattern
- [ ] `/internal/reload-model` verifies `X-Internal-Token`
- [ ] Feature store uses HSET Hash (not String) with TTL refresh
- [ ] No business logic in FastAPI routes
- [ ] `pytest tests/ -x` → all passing
- [ ] `python -m mypy app/ --ignore-missing-imports` → 0 errors
