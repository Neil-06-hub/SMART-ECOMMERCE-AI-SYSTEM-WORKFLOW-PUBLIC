# SMART-ECOMMERCE AI SYSTEM — Implementation Plan

## Context

**Current state:** Design documentation only — no source code scaffolded yet. All 7 design docs live in `docs/`. 10 skill agents are available in `.claude/commands/`.

**Goal:** Build a full-stack AI-powered ecommerce system (Express.js API + Next.js Web + FastAPI AI Service) deployed on Render.com + Vercel within free tier constraints.

**Critical constraints:**
- Upstash Redis: 10,000 cmd/day (use `getOrSet()`, never Redis in loops)
- Render.com FastAPI: 512MB RAM (no Celery, no sentence-transformers)
- Training: GitHub Actions (not Celery) daily 02:00 ICT
- MongoDB: always `{ deletedAt: null }` in queries, soft delete only
- Cross-module comms: EventEmitter2 only (no circular imports)
- Error codes: from `libs/shared/src/constants/error-codes.ts` only
- Response envelope: `ResponseInterceptor` wraps all controller returns

---

## Phase 0 — Foundation & Monorepo Scaffold

**Skill:** `/devops-ci` then manual scaffold

### Steps:
1. **Init monorepo** — create root `package.json` (npm workspaces), `tsconfig.base.json`
2. **Scaffold apps:**
   ```
   apps/api/          ← Express.js 10 (nest new --skip-git)
   apps/web/          ← Next.js 15 (npx create-next-app@latest)
   apps/ai-service/   ← FastAPI 0.111 (manual + pyproject.toml)
   libs/shared/       ← TS types + constants (manual)
   infra/             ← docker-compose.yml
   scripts/           ← seed/ migrations/
   .github/workflows/ ← CI pipelines
   ```
3. **Install Express.js deps:**
   ```
   @express/mongoose mongoose
   @express/bull bullmq
   @express/jwt @express/passport passport-jwt
   ioredis @upstash/redis
   opossum (circuit breaker)
   eventemitter2
   class-validator class-transformer
   nodemailer web-push
   ```
4. **Install FastAPI deps** (`pyproject.toml`):
   ```
   fastapi==0.111, uvicorn[standard], pydantic-settings
   lightfm==1.17, scikit-learn==1.4
   numpy, scipy, pymongo, motor
   boto3 (Cloudflare R2 via S3 SDK)
   underthesea (Vietnamese NLP — optional, whitespace fallback ok)
   ```
5. **Configure tsconfig aliases** in `apps/api/tsconfig.json`:
   ```json
   "@modules/*" → "src/modules/*"
   "@shared/*"  → "src/shared/*"
   "@config/*"  → "src/shared/config/*"
   "@lib/*"     → "../../libs/shared/src/*"
   ```
6. **Docker Compose** (`infra/docker-compose.yml`) — 8 services:
   MongoDB, Redis (Upstash proxy), Meilisearch, Express.js, FastAPI, Next.js, nginx
7. **libs/shared/src/constants/error-codes.ts** — define all error code strings (first file written)
8. **libs/shared/src/types/** — shared TS types (ProductSummary, OrderSummary, etc.)

---

## Phase 1 — Express.js Backend (9 Modules)

**Skill workflow:** `/architect` → `/database-manager` → `/backend-express` → `/api-contract` → `/security-guard` → `/test-engineer` → `/code-reviewer`

### 1.1 SharedModule (Global)

Files to create:
- `src/shared/database/mongoose.provider.ts` — MongoDB Atlas connection
- `src/shared/redis/redis.service.ts` — `getOrSet()` helper, all key builders
- `src/shared/interceptors/response.interceptor.ts` — standard envelope wrapper
- `src/shared/filters/http-exception.filter.ts` — error envelope
- `src/shared/guards/jwt-auth.guard.ts` + `roles.guard.ts`
- `src/shared/decorators/roles.decorator.ts` + `current-user.decorator.ts`
- `src/shared/config/` — pydantic-style env validation

### 1.2 AuthModule

Collections: `users`
Endpoints:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET/PATCH /api/v1/auth/profile`
- `POST /api/v1/auth/addresses`

Key logic:
- bcrypt hash (rounds=12), JWT RS256 (access 15min, refresh 7d)
- Refresh token stored in Redis: `sess:{SHA256(token)}` TTL 7d
- Soft delete on users: `{ deletedAt: null }` everywhere

### 1.3 CatalogModule

Collections: `products`, `categories`, `reviews`
Endpoints:
- `GET/POST/PATCH/DELETE /api/v1/products` (soft delete)
- `GET /api/v1/products/:slug`
- `GET /api/v1/products/search?q=` (Meilisearch + Vietnamese)
- `GET/POST/PATCH/DELETE /api/v1/categories`
- `POST /api/v1/products/bulk-import` (CSV)
- `GET/POST/DELETE /api/v1/products/:id/reviews`

Key logic:
- Only `{ status: 'active', deletedAt: null }` products indexed to Meilisearch (≤100k docs)
- `lastIndexedAt` sparse index to pick up changes
- Category: materialized path (`path`) for tree queries without recursion
- Cache: `product:{productId}` TTL 1h, `cat:{slug}` TTL 1h via `getOrSet()`

### 1.4 CartModule

Collections: `carts`
Endpoints:
- `GET/POST/PATCH/DELETE /api/v1/cart`
- `POST /api/v1/cart/merge` (guest → user on login)

Key logic:
- userId sparse unique index; sessionId sparse index for guest carts
- Guest cart marker in Redis: `cart:guest:{sessionId}` TTL 1d

### 1.5 OrderModule

Collections: `orders`
Endpoints:
- `POST /api/v1/orders` (5-step MongoDB transaction)
- `GET /api/v1/orders` (history)
- `GET /api/v1/orders/:orderNumber`
- `PATCH /api/v1/orders/:id/cancel`
- `GET /api/v1/admin/orders`
- `PATCH /api/v1/admin/orders/:id/status`

Key logic:
- 9-status FSM: `pending → confirmed → processing → packed → shipped → delivered → completed | cancelled | refunded`
- Order items snapshot price/name at order time (immutable)
- `timeline[]` append-only log of status transitions
- 5-step transaction: validate cart → check stock → create order → deduct stock → emit events

### 1.6 PaymentModule

Adapters: VNPay sandbox, COD
Endpoints:
- `POST /api/v1/payments/vnpay/create` — generate payment URL
- `GET /api/v1/payments/vnpay/callback` — VNPay redirect
- `POST /api/v1/payments/vnpay/webhook` — server-to-server IPN

Key logic:
- VNPay HMAC-SHA512 signature verification on webhook
- Idempotency key on payment creation (prevent double charge)
- On payment success → emit `payment.completed` event → OrderModule updates status

### 1.7 NotificationModule (async event listeners)

Collections: `push_subscriptions`
Listens to events:
- `order.created` → confirmation email (Gmail SMTP/nodemailer)
- `order.status.changed` → status email
- `payment.completed` → receipt email
- `campaign.send.requested` → bulk email batch

Key logic:
- Nodemailer + Gmail SMTP (App Password, not OAuth2)
- Web Push API (VAPID) for browser push
- Never block the main thread — all sends via async event handlers

### 1.8 RecommendationModule

Collections: `behavioral_events`
Endpoints:
- `POST /api/v1/events` (behavioral event tracking)
- `GET /api/v1/recommendations?placement=homepage` — main AI endpoint
- `GET /api/v1/recommendations/popular` — fallback endpoint

Key logic (circuit breaker flow):
```
GET /recommendations
  → check Redis rec:{userId}:{placement} (cache hit → return)
  → opossum circuit breaker → POST http://fastapi:8000/recommend
    [OPEN fallback]:
      1. check Redis fallback:popular:{placement}
      2. if miss → MongoDB aggregation (viewCount last 7d)
      3. cache to fallback:popular:{placement} TTL 1h
  → cache result to rec:{userId}:{placement} TTL 10min (homepage)
```

Circuit breaker config:
```typescript
{ timeout: 500, errorThresholdPercentage: 50, resetTimeout: 60_000, volumeThreshold: 5 }
```

### 1.9 MarketingModule

Collections: `campaigns`, `segments`
Endpoints:
- `POST /api/v1/admin/segments/compute-rfm`
- `GET/POST /api/v1/admin/campaigns`
- `POST /api/v1/admin/campaigns/:id/send`

Key logic:
- RFM scoring: R (recency), F (frequency), M (monetary) each 1-5
- Segments stored with `userIds[]` embedded (≤10k users)
- Campaign send: bulk nodemailer batches (avoid Gmail rate limits: 500/day)

### 1.10 AnalyticsModule (read-only)

Collections: `behavioral_events`, `feature_snapshots`, `model_versions` (read-only)
Endpoints:
- `GET /api/v1/admin/analytics/revenue` — aggregation pipeline
- `GET /api/v1/admin/analytics/behavior` — event funnels
- `GET /api/v1/admin/analytics/recommendations` — AI performance
- `GET /api/v1/admin/audit-logs`

Key logic: MongoDB aggregation pipelines only, no writes

### 1.11 Seed Scripts (order: 01→07)
```
scripts/seed/01-categories.ts
scripts/seed/02-products.ts      (100-200 Vietnamese products)
scripts/seed/03-users.ts         (20 buyers, 3 sellers, 1 admin)
scripts/seed/04-orders.ts        (100 orders with history)
scripts/seed/05-behavior-history.ts   ← AI required
scripts/seed/06-feature-snapshots.ts  ← AI required
scripts/seed/07-campaigns.ts
```

---

## Phase 2 — FastAPI AI Service (CRITICAL SECTION)

**Skill:** `/ai-ml-engineer`

### 2.1 Project Structure

```
apps/ai-service/
├── app/
│   ├── main.py              # FastAPI app, lifespan events
│   ├── config.py            # pydantic-settings (env vars)
│   ├── dependencies.py      # Shared DI (model registry, MongoDB)
│   │
│   ├── api/
│   │   ├── recommend.py     # POST /recommend
│   │   ├── features.py      # POST /features/update
│   │   ├── internal.py      # POST /internal/reload-model
│   │   └── health.py        # GET /health
│   │
│   ├── ml/
│   │   ├── train_cf.py      # LightFM CF training
│   │   ├── train_cbf.py     # TF-IDF CBF training
│   │   ├── evaluate.py      # Metrics: precision@10, recall@10
│   │   ├── hybrid.py        # α-weighted hybrid scoring
│   │   └── features.py      # Feature matrix builder from MongoDB
│   │
│   ├── services/
│   │   ├── model_registry.py   # Load/swap models in-memory
│   │   ├── r2_client.py        # Cloudflare R2 (boto3 S3 compat)
│   │   └── mongo_client.py     # Motor async MongoDB client
│   │
│   └── schemas/
│       ├── recommend.py     # Pydantic request/response
│       └── features.py
│
├── scripts/
│   └── train_pipeline.py    # Entry point for GitHub Actions
├── tests/
├── pyproject.toml
└── Dockerfile
```

### 2.2 Data Collection Pipeline (Express.js side)

**Step 1 — Behavioral Event Ingestion** (already in RecommendationModule):
```
POST /api/v1/events
{
  eventType: "view" | "click" | "add_to_cart" | "purchase" | "search" | "rec_click",
  productId: ObjectId,
  metadata: { sessionId?, placement?, query? }
}
→ Insert directly to MongoDB behavioral_events (TTL 90 days)
→ Update Redis: features:user:{userId} Hash (recent views, categories)
```

**Event weights for CF training:**
| Event | Weight |
|-------|--------|
| view | 1 |
| click | 1.5 |
| add_to_cart | 2 |
| purchase | 5 |
| rec_click | 1.5 |

**Step 2 — Feature Snapshot Generation** (daily cron in Express.js `@express/schedule`):
```
Daily 01:00 ICT → AnalyticsModule.generateFeatureSnapshots()
  → For each active user with events in last 90 days:
    → Aggregate behavioral_events: recentViews, purchasedCategories
    → Aggregate orders: avgOrderValue, purchaseFrequency, daysSinceLastPurchase
    → Compute RFM scores (R/F/M each 1-5)
    → Upsert feature_snapshots collection
  → This feeds the daily 02:00 ICT training pipeline
```

### 2.3 ML Training Pipeline — Step by Step

**Trigger:** GitHub Actions `.github/workflows/ml-training.yml` at `0 19 * * *` (UTC) = 02:00 ICT

**Entry point:** `python apps/ai-service/scripts/train_pipeline.py`

#### Step 1 — Fetch Features from MongoDB (`ml/features.py`)
```python
def fetch_training_data(mongo_uri: str, window_days: int = 90):
    # 1. Fetch behavioral_events (last 90 days)
    events = db.behavioral_events.find({
        "timestamp": { "$gte": datetime.now() - timedelta(days=90) },
        "userId": { "$ne": None }
    })
    
    # 2. Fetch latest feature_snapshots per user
    snapshots = db.feature_snapshots.aggregate([
        { "$sort": { "snapshotDate": -1 } },
        { "$group": { "_id": "$userId", "features": { "$first": "$$ROOT" } } }
    ])
    
    # 3. Build interaction matrix
    # users: list of unique userIds (index → user)
    # items: list of unique productIds (index → item)
    # interactions: scipy.sparse.coo_matrix of weighted interactions
    #   row = user_idx, col = item_idx, data = weight
    
    return interactions_matrix, user_index, item_index, product_features
```

#### Step 2 — Train CF Model with LightFM (`ml/train_cf.py`)
```python
from lightfm import LightFM
from lightfm.data import Dataset

def train_cf(interactions_matrix, item_features=None):
    dataset = Dataset()
    dataset.fit(
        users=user_ids,
        items=item_ids,
        item_features=item_feature_tuples  # category, price_tier, tags
    )
    
    # Build interaction matrix with weights
    (train_interactions, weights) = dataset.build_interactions(
        [(uid, iid, weight) for uid, iid, weight in events_weighted]
    )
    
    # Build item features (category one-hot + price tier + tag embeddings)
    item_features_matrix = dataset.build_item_features(
        [(iid, [category, price_tier] + tags) for iid, ... in products]
    )
    
    model = LightFM(
        loss='warp',           # WARP for implicit feedback
        learning_rate=0.05,
        no_components=128,     # Latent factor dimensions
        item_alpha=1e-6,       # L2 regularization
        user_alpha=1e-6,
        random_state=42
    )
    
    model.fit(
        interactions=train_interactions,
        item_features=item_features_matrix,
        sample_weight=weights,
        epochs=50,
        num_threads=4,         # GitHub Actions: 2-4 cores
        verbose=True
    )
    
    return model, dataset
```

#### Step 3 — Evaluate CF Model (`ml/evaluate.py`)
```python
from lightfm.evaluation import precision_at_k, recall_at_k

def evaluate(model, test_interactions, train_interactions, item_features, k=10):
    # Use last 7 days of interactions as holdout test set
    precision = precision_at_k(
        model, test_interactions, train_interactions,
        item_features=item_features, k=k, num_threads=4
    ).mean()
    
    recall = recall_at_k(
        model, test_interactions, train_interactions,
        item_features=item_features, k=k, num_threads=4
    ).mean()
    
    # Thresholds for promotion
    PRECISION_THRESHOLD = 0.30
    RECALL_THRESHOLD    = 0.20
    
    return {
        "precision_at_10": precision,
        "recall_at_10": recall,
        "meets_threshold": precision >= PRECISION_THRESHOLD and recall >= RECALL_THRESHOLD
    }
```

#### Step 4 — Promote if Better
```python
def promote_if_better(new_metrics, new_model, version):
    current = db.model_versions.find_one({"modelType": "cf", "isActive": True})
    
    if current is None or (
        new_metrics["precision_at_10"] >= current["metrics"]["precisionAt10"] and
        new_metrics["recall_at_10"]    >= current["metrics"]["recallAt10"]
    ):
        # Promote new model
        db.model_versions.update_one(
            {"modelType": "cf", "isActive": True},
            {"$set": {"isActive": False, "deprecatedAt": datetime.now()}}
        )
        db.model_versions.insert_one({
            "modelType": "cf",
            "version": version,           # YYYY-MM-DD
            "metrics": new_metrics,
            "artifactUrl": f"r2://models/cf/{version}/cf_model.pkl",
            "isActive": True,
            "promotedAt": datetime.now()
        })
        return True  # Upload + reload
    else:
        # Log failed promotion (for analysis)
        db.model_versions.insert_one({
            "modelType": "cf", "version": version,
            "metrics": new_metrics, "isActive": False
        })
        return False  # Keep current model
```

#### Step 5 — Rebuild CBF Similarity Matrix (`ml/train_cbf.py`)
```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import scipy.sparse as sp

def build_cbf_matrix(products: list[dict]):
    # 1. Build text corpus: name + description (Vietnamese whitespace split)
    corpus = [f"{p['name']} {p.get('description', '')} {' '.join(p.get('tags', []))}"
              for p in products]
    
    # 2. TF-IDF vectorization
    vectorizer = TfidfVectorizer(
        max_features=5000,    # Vocabulary cap
        ngram_range=(1, 2),   # Unigrams + bigrams
        min_df=2,             # Ignore terms in <2 docs
        sublinear_tf=True     # Log TF scaling
    )
    tfidf_matrix = vectorizer.fit_transform(corpus)  # (n_products, 5000)
    
    # 3. Category one-hot encoding
    from sklearn.preprocessing import OneHotEncoder
    categories = [p['categoryId'] for p in products]
    category_matrix = OneHotEncoder(sparse_output=True).fit_transform(
        [[c] for c in categories]
    )
    
    # 4. Price tier one-hot (low < 200k, medium < 1M, high >= 1M VND)
    price_tiers = [get_price_tier(p['price']) for p in products]
    price_matrix = OneHotEncoder(sparse_output=True).fit_transform(
        [[t] for t in price_tiers]
    )
    
    # 5. Concatenate feature vectors (horizontal stack)
    features = sp.hstack([tfidf_matrix, category_matrix * 2.0, price_matrix])
    # Category weighted 2x (more important than text)
    
    # 6. Precompute top-50 similar items per product (not full n×n matrix)
    cbf_similarity = {}
    for i, product in enumerate(products):
        scores = cosine_similarity(features[i], features).flatten()
        top_50 = scores.argsort()[-51:-1][::-1]  # Exclude self
        cbf_similarity[str(product['_id'])] = [
            {"productId": str(products[j]['_id']), "score": float(scores[j])}
            for j in top_50
        ]
    
    return cbf_similarity, vectorizer, features
```

#### Step 6 — Upload Artifacts to Cloudflare R2
```python
import pickle, boto3, json

def upload_artifacts(cf_model, dataset, cbf_similarity, vectorizer, version):
    s3 = boto3.client('s3',
        endpoint_url=f'https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        region_name='auto'
    )
    
    artifacts = {
        f"models/cf/{version}/cf_model.pkl":    pickle.dumps(cf_model),
        f"models/cf/{version}/cf_dataset.pkl":  pickle.dumps(dataset),
        f"models/cbf/{version}/cbf_top50.pkl":  pickle.dumps(cbf_similarity),
        f"models/cbf/{version}/vectorizer.pkl":  pickle.dumps(vectorizer),
        f"models/{version}/metadata.json":       json.dumps({"version": version}).encode()
    }
    
    for key, data in artifacts.items():
        s3.put_object(Bucket=R2_BUCKET, Key=key, Body=data)
```

#### Step 7 — Hot Reload FastAPI
```python
import httpx

async def trigger_reload(version: str):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{FASTAPI_URL}/internal/reload-model",
            json={"version": version},
            headers={"X-Internal-Secret": INTERNAL_SECRET},
            timeout=30.0
        )
        resp.raise_for_status()
```

### 2.4 FastAPI Inference Server (`api/recommend.py`)

```
POST /recommend
{
  "userId": "ObjectId | null",       # null = anonymous
  "placement": "homepage | pdp | cart | search",
  "n": 12,
  "filters": { "excludeOos": true, "minPrice": 0, "maxPrice": 5000000 }
}
→ Response: { "productIds": [...], "scores": [...], "model_version": "2026-04-05" }
```

**Alpha values by placement:**
| Placement | α (CF weight) | N | Cache TTL |
|-----------|---------------|---|-----------|
| homepage | 0.7 | 12 | 600s |
| pdp (similar items) | 0.3 | 8 | 600s |
| cart | 0.5 | 6 | 300s |
| anonymous (no userId) | 0.0 | 12 | 600s |

**Inference logic (`ml/hybrid.py`):**
```python
def get_recommendations(userId, placement, n, filters):
    alpha = ALPHA_MAP[placement]
    
    if userId and alpha > 0:
        # CF scores: LightFM predict for all items
        cf_scores = model.predict(
            user_ids=[user_idx],
            item_ids=all_item_indices,
            item_features=item_features_matrix
        )  # Shape: (n_items,)
    else:
        cf_scores = np.zeros(n_items)
    
    # CBF scores: lookup precomputed top-50 for user's recent views
    cbf_scores = np.zeros(n_items)
    if userId:
        recent_views = get_user_recent_views(userId)  # From Redis features:user:{id}
        for viewed_product_id in recent_views[:5]:
            if viewed_product_id in cbf_similarity:
                for entry in cbf_similarity[viewed_product_id]:
                    idx = item_index[entry["productId"]]
                    cbf_scores[idx] = max(cbf_scores[idx], entry["score"])
    
    # Normalize to [0, 1]
    cf_scores  = normalize(cf_scores)
    cbf_scores = normalize(cbf_scores)
    
    # Hybrid: α × CF + (1-α) × CBF
    hybrid_scores = alpha * cf_scores + (1 - alpha) * cbf_scores
    
    # Filter: out-of-stock, price range, already in cart
    mask = apply_filters(all_items, filters)
    hybrid_scores[~mask] = -1
    
    # Top-N
    top_n_indices = hybrid_scores.argsort()[-n:][::-1]
    return [all_items[i]["_id"] for i in top_n_indices], [hybrid_scores[i] for i in top_n_indices]
```

### 2.5 Model Registry & Hot Reload (`services/model_registry.py`)

```python
class ModelRegistry:
    def __init__(self):
        self.cf_model = None
        self.cf_dataset = None
        self.cbf_similarity = {}  # Dict: productId → [{productId, score}]
        self.current_version = None
        self._lock = asyncio.Lock()
    
    async def load_from_r2(self, version: str = None):
        """Called on startup and POST /internal/reload-model"""
        async with self._lock:
            if version is None:
                version = await self._get_active_version_from_mongo()
            cf_bytes  = await r2.get_object(f"models/cf/{version}/cf_model.pkl")
            cbf_bytes = await r2.get_object(f"models/cbf/{version}/cbf_top50.pkl")
            # Atomic in-memory swap
            self.cf_model       = pickle.loads(cf_bytes)
            self.cbf_similarity = pickle.loads(cbf_bytes)
            self.current_version = version

registry = ModelRegistry()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await registry.load_from_r2()  # Load on startup
    yield

app = FastAPI(lifespan=lifespan)
```

### 2.6 Cold Start Handling

| Scenario | CF α | Result |
|----------|-------|--------|
| New user (no events) | 0.0 | Pure CBF (popular in category) |
| User with <5 interactions | 0.2 | CBF-dominant |
| Active user (≥5 events) | placement α | Normal hybrid |
| New product | Excluded from CF | Included via TF-IDF features |

### 2.7 GitHub Actions ML Training Workflow

```yaml
# .github/workflows/ml-training.yml
name: Daily ML Training Pipeline
on:
  schedule:
    - cron: '0 19 * * *'   # 19:00 UTC = 02:00 ICT
  workflow_dispatch:         # Manual trigger

jobs:
  train:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - name: Install deps
        run: pip install -e apps/ai-service/[train]
      - name: Run training pipeline
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
          R2_ACCOUNT_ID: ${{ secrets.R2_ACCOUNT_ID }}
          R2_ACCESS_KEY: ${{ secrets.R2_ACCESS_KEY }}
          R2_SECRET_KEY: ${{ secrets.R2_SECRET_KEY }}
          R2_BUCKET: ${{ secrets.R2_BUCKET }}
          FASTAPI_URL: ${{ secrets.FASTAPI_URL }}
          INTERNAL_SECRET: ${{ secrets.INTERNAL_SECRET }}
        run: python apps/ai-service/scripts/train_pipeline.py
      - name: Upload training logs
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: training-logs-${{ github.run_id }}
          path: training_results.json
```

---

## Phase 3 — Next.js Frontend

**Skill:** `/frontend-nextjs`

### Rendering Strategy per Page

| Page | Strategy | Why |
|------|----------|-----|
| Home / Category listing | ISR (revalidate: 3600) | SEO + product catalog changes hourly |
| Product Detail | ISR (revalidate: 1800) | SEO-critical, price/stock updates |
| Search results | CSR (TanStack Query) | Real-time Meilisearch, user-specific |
| Cart / Checkout | CSR | Highly dynamic, user-specific |
| Order history | SSR | User-specific, always fresh |
| Admin dashboard | CSR | Real-time charts, auth-gated |
| AI Recommendations | CSR | Personalized per user |

### Key Pages to Build

```
app/
├── (shop)/
│   ├── page.tsx                    # Home: ISR, hero + AI recommendations
│   ├── products/[slug]/page.tsx    # PDP: ISR + CSR recommendations
│   ├── categories/[slug]/page.tsx  # Category: ISR product grid
│   ├── search/page.tsx             # CSR: Meilisearch results
│   └── cart/page.tsx               # CSR: cart + checkout flow
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (account)/
│   ├── orders/page.tsx             # SSR: order history
│   └── profile/page.tsx
└── (admin)/
    ├── dashboard/page.tsx          # Analytics
    ├── products/page.tsx           # CRUD
    ├── orders/page.tsx             # Order management
    └── marketing/page.tsx          # Campaigns
```

### State Management
- **TanStack Query** — server state (products, orders, recommendations)
- **Zustand** — client state (cart items, auth session, UI state)
- **shadcn/ui** — component library (Radix primitives + Tailwind)

---

## Phase 4 — DevOps & CI/CD

**Skill:** `/devops-ci`

### GitHub Actions Workflows

```
.github/workflows/
├── pr-gate.yml         # On PR: tsc → lint → jest → pytest
├── deploy-api.yml      # On main push: deploy Express.js to Render.com
├── deploy-web.yml      # On main push: deploy Next.js to Vercel
├── deploy-ai.yml       # On main push: deploy FastAPI to Render.com
└── ml-training.yml     # Daily 02:00 ICT: train CF + CBF
```

### Render.com Configuration (render.yaml)
- Express.js: `npm run build && npm run start:prod`, 512MB, Render free
- FastAPI: `uvicorn app.main:app --host 0.0.0.0 --port 8000`, 512MB, Render free
- UptimeRobot: pings `/health` every 5min to prevent spin-down

### Environment Variables Required
```
# Express.js
MONGODB_URI, JWT_PRIVATE_KEY, JWT_PUBLIC_KEY, REDIS_URL
MEILISEARCH_URL, MEILISEARCH_KEY
GMAIL_USER, GMAIL_APP_PASSWORD
VNPAY_TMN_CODE, VNPAY_HASH_SECRET
FASTAPI_URL, INTERNAL_SECRET
VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY

# FastAPI
MONGODB_URI, R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET
FASTAPI_URL, INTERNAL_SECRET

# Next.js
NEXT_PUBLIC_API_URL, NEXT_PUBLIC_MEILISEARCH_URL
NEXTAUTH_SECRET, NEXTAUTH_URL
```

---

## Execution Order & Skill Commands

```
# 1. Foundation
/devops-ci           → docker-compose.yml, GitHub Actions templates

# 2. Shared infrastructure
/database-manager    → 14 MongoDB schemas, 45 indexes, Redis key patterns
/backend-express      → SharedModule: guards, interceptors, redis.service.ts

# 3. Core business modules (in dependency order)
/architect           → Validate module boundaries before scaffolding
/backend-express      → AuthModule (users schema + JWT)
/api-contract        → Validate Auth endpoints vs API_SPECIFICATIONS.md
/security-guard      → JWT RS256, bcrypt config, rate limiting

/backend-express      → CatalogModule (products, categories, reviews)
/backend-express      → CartModule
/backend-express      → OrderModule (5-step transaction)
/backend-express      → PaymentModule (VNPay HMAC)
/backend-express      → NotificationModule (nodemailer events)

# 4. AI layer (most complex)
/ai-ml-engineer      → Feature store design + behavioral events API
/ai-ml-engineer      → FastAPI scaffold (main.py, model_registry.py)
/ai-ml-engineer      → LightFM training (train_cf.py)
/ai-ml-engineer      → TF-IDF CBF matrix (train_cbf.py)
/ai-ml-engineer      → Hybrid scoring (hybrid.py)
/ai-ml-engineer      → GitHub Actions ml-training.yml
/backend-express      → RecommendationModule (opossum circuit breaker)

# 5. Analytics & Marketing
/backend-express      → MarketingModule (RFM + campaigns)
/backend-express      → AnalyticsModule (read-only aggregations)

# 6. Seed data (required before frontend)
npm run seed         → 01→07 scripts (05+06 required for AI demo)

# 7. Frontend
/frontend-nextjs     → Next.js pages (Home ISR, PDP, Cart, Admin)

# 8. Quality gates
/security-guard      → Full OWASP review
/test-engineer       → Jest unit + e2e + pytest
/code-reviewer       → Redis budget audit + tsc + lint

# 9. Deploy
/devops-ci           → Render.com + Vercel deploy configs
```

---

## AI Layer — Verification Checklist

1. **Seed behavioral data:**
   ```bash
   npm run seed:ai    # 05-behavior-history + 06-feature-snapshots
   ```

2. **Test training pipeline locally:**
   ```bash
   cd apps/ai-service
   python scripts/train_pipeline.py
   # Expected: training_results.json with precision@10 ≥ 0.30
   ```

3. **Start FastAPI locally:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   # Should load model from R2 on startup
   ```

4. **Test inference endpoint:**
   ```bash
   curl -X POST http://localhost:8000/recommend \
     -H "Content-Type: application/json" \
     -d '{"userId": "65f4...", "placement": "homepage", "n": 12}'
   # Expected: {"productIds": [...12 ids...], "scores": [...], "model_version": "YYYY-MM-DD"}
   ```

5. **Test circuit breaker:**
   - Stop FastAPI → Express.js should serve `fallback:popular:homepage` from Redis
   - Restart FastAPI → Circuit should half-open after 60s, then close

6. **Test cold start:**
   - New user (no history) → α=0, pure CBF, returns 12 popular-in-category items

7. **Check Redis budget:**
   ```bash
   # After 24h of normal load — should be <9000 cmd/day
   /code-reviewer     # Redis budget audit
   ```

8. **Validate GitHub Actions training cron:**
   ```bash
   gh workflow run ml-training.yml    # Manual trigger
   gh run list --workflow=ml-training.yml
   ```

---

## Critical Files to Create (in order)

1. `libs/shared/src/constants/error-codes.ts` — error codes (first)
2. `libs/shared/src/constants/redis-keys.ts` — key builders
3. `libs/shared/src/types/` — shared TS interfaces
4. `apps/api/src/shared/` — SharedModule (DB, Redis, guards, interceptors)
5. `apps/api/src/modules/auth/` — AuthModule (9 files)
6. `apps/ai-service/app/ml/train_cf.py` — LightFM training
7. `apps/ai-service/app/ml/train_cbf.py` — TF-IDF CBF
8. `apps/ai-service/app/services/model_registry.py` — hot-reload
9. `apps/ai-service/scripts/train_pipeline.py` — orchestrator
10. `.github/workflows/ml-training.yml` — daily cron
11. `apps/api/src/modules/recommendation/services/recommendation.service.ts` — circuit breaker
12. `scripts/seed/05-behavior-history.ts` + `06-feature-snapshots.ts` — AI seed data
