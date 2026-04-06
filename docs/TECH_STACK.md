# Tech Stack Decision Record

**Project:** SMART ECOMMERCE AI SYSTEM
**Version:** 2.0.0
**Date:** 2026-04-01
**Author:** Solutions Architect
**Status:** Approved
**References:** `docs/REQUIREMENTS.md` v2.1.0

---

## Design Axioms

> **Axiom 1 — $0/month:** Every infrastructure decision must satisfy the free tier.
> This is a university capstone project. No credit card, no budget. Every service must have
> a genuinely free tier (not expiring after 14 days) or be self-hostable via Docker.
>
> **Axiom 2 — Team fit over hype:** The TypeScript/Node.js stack (Express.js + Next.js) is primary.
> Python is only for the AI service. Do not choose a technology just because it is "trending" —
> it must be justified by a specific requirement in REQUIREMENTS.md.

---

## Table of Contents

1. [Quick Reference Summary](#1-quick-reference-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Frontend Layer](#3-frontend-layer)
4. [Backend Layer](#4-backend-layer)
5. [AI/ML Stack](#5-aiml-stack)
6. [Data Layer](#6-data-layer)
7. [Infrastructure & DevOps](#7-infrastructure--devops)
8. [Third-Party Services](#8-third-party-services)
9. [Decision Matrix — 3 Hardest Decisions](#9-decision-matrix--3-hardest-decisions)
10. [Cost Estimate](#10-cost-estimate)
11. [Security Mapping](#11-security-mapping)
12. [Sprint Alignment](#12-sprint-alignment)
13. [Glossary](#13-glossary)

---

## 1. Quick Reference Summary

| Layer | Technology | Version | Role | Hosted Where |
|---|---|---|---|---|
| Frontend Framework | Next.js (App Router) | 15.x | SSR/SSG/ISR/CSR hybrid | Vercel (free) |
| UI Library | Tailwind CSS + shadcn/ui | Tailwind 3.x | Utility-first styling + headless components | — |
| Client State | Zustand | 4.x | UI state (modal, drawer, auth step) | — |
| Server State | TanStack Query | 5.x | Data fetching, caching, optimistic updates | — |
| Backend Framework | Express.js | 10.x | Modular monolith REST API | Render.com (free) |
| Backend Language | TypeScript + Node.js | TS 5.x / Node 20 LTS | Primary language | — |
| AI Service Language | Python | 3.11 | ML training + inference | — |
| AI Inference Framework | FastAPI | 0.111.x | REST inference + model hot-reload | Render.com (free) |
| Recommendation (CF) | LightFM | 1.17 | Collaborative filtering, hybrid mode | — |
| Recommendation (CBF) | scikit-learn (TF-IDF + cosine sim) | sklearn 1.4 | Content-based filtering, Vietnamese text | — |
| ML Job Scheduler | GitHub Actions cron | — | Daily training pipeline (02:00 ICT) | GitHub (free) |
| Primary Database | MongoDB Atlas | 7.x (M0 free) | Document store, flexible schema | MongoDB Atlas M0 |
| ODM | Mongoose | 8.x | Schema validation + queries in Express.js | — |
| Cache + Queue broker | Redis | 7.x | AI rec cache, feature store, BullMQ (email) | Upstash (free) |
| Background Jobs (Node) | BullMQ | 5.x | Email queue only | — |
| Search Engine | MongoDB Atlas Search | 7.x | Full-text search, Vietnamese collation | MongoDB Atlas M0 (included) |
| Object Storage | Cloudflare R2 | — | Product images + ML model artifacts | Cloudflare (free 10GB) |
| Containerization | Docker + Docker Compose | 26.x | Local dev environment | Self-hosted |
| CI/CD | GitHub Actions | — | Lint, test, deploy pipeline | GitHub (free) |
| Error Tracking | MongoDB `error_logs` (in-app) | — | Server-side exception logging | Self-hosted ($0) |
| Metrics | Admin Dashboard (in-app) | — | AI CTR + revenue metrics | Self-hosted ($0) |
| Email | Nodemailer + Gmail SMTP | — | Transactional + marketing email | Gmail SMTP (500 emails/day, free) |
| Push Notifications | Web Push VAPID | — | Browser push, order status (FR-NOTIF-03) | Self-hosted ($0) |
| Payment (VN) | VNPay | — | VN market payment (FR-CART-05) | Sandbox (free) |

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                 │
│         Browser — Next.js 15 (SSR / SSG / ISR / CSR)             │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS (TLS auto-provisioned by Vercel / Render)
              ┌──────────────┴──────────────┐
              ▼                             ▼
┌─────────────────────┐       ┌──────────────────────────────┐
│   Next.js 15        │       │   Express.js REST API             │
│   (Vercel — free)   │◄─────►│   TypeScript / Node 20 LTS   │
│   SSR homepage      │       │   Render.com (free)          │
│   SSG/ISR catalog   │       │   /api/v1/*                  │
│   CSR cart/account  │       └───────────────┬──────────────┘
└─────────────────────┘                       │
                                              │
              ┌───────────────────────────────┼──────────────┐
              ▼                               ▼              │
┌─────────────────────┐       ┌───────────────────────┐      │
│  MongoDB Atlas M0   │       │  Redis 7 (Upstash)    │      │
│  (free — 512MB)     │       │  (free — 10k cmd/day) │      │
│  Primary DB         │       │  ┌─────────────────┐  │      │
│  Mongoose ODM       │       │  │ Cache: AI rec   │  │      │
│  Atlas Search incl. │       │  │ Feature store   │  │      │
│  Aggregation pipe.  │       │  │ BullMQ (email)  │  │      │
└─────────────────────┘       │  └─────────────────┘  │      │
                              └───────────────────────┘      │
                                                             │ internal HTTP
                                                             ▼
                          ┌─────────────────────────────────┐
                          │   FastAPI AI Service             │
                          │   Python 3.11 — Render.com      │
                          │   ┌──────────────────────────┐  │
                          │   │  LightFM (CF — WARP/BPR) │  │
                          │   │  scikit-learn TF-IDF+CBF  │  │
                          │   │  ~270MB total memory      │  │
                          │   └──────────────────────────┘  │
                          └─────────────────┬───────────────┘
                                            │ model artifacts (.pkl/.npz)
                                            ▼
                               ┌──────────────────────┐
                               │   Cloudflare R2      │
                               │   Product images     │
                               │   ML model artifacts │
                               │   (free — 10GB)      │
                               └──────────────────────┘

EXTERNAL SERVICES:
  VNPay (sandbox) · Gmail SMTP via Nodemailer (email)

TRAINING PIPELINE (offline):
  GitHub Actions cron (daily 02:00 ICT)
    → Python script: fetch MongoDB → train LightFM + rebuild TF-IDF
    → upload .pkl to R2 → POST /internal/reload-model → FastAPI
```

**Main request flows:**
1. Browser → Vercel → Next.js (SSR/SSG page)
2. Client JS → Render.com → Express.js REST `/api/v1/*`
3. Express.js → MongoDB (read/write + Atlas Search) + Redis (AI cache hit)
4. Express.js → BullMQ → email-queue → Nodemailer → Gmail SMTP
5. Express.js → POST /api/v1/events → MongoDB async write (behavioral events)
6. FastAPI `/recommend` → Redis feature store (< 5ms) → LightFM + TF-IDF CBF → cache in Redis → return

---

## 3. Frontend Layer

### 3.1 Framework — Next.js 15 (App Router)

| Attribute | Value |
|---|---|
| **Version** | 15.x (App Router, React 19) |
| **Hosting** | Vercel free tier (100GB bandwidth, unlimited Edge functions) |
| **Why chosen** | Hybrid rendering: SSR + SSG + ISR + CSR within the same project |

**Rendering strategy by page type (FR-CATALOG-07 structured data, SEO):**

| Route | Strategy | Revalidate | Reason |
|---|---|---|---|
| `/` (Homepage) | SSR | Per-request | AI recommendation is per-user, cannot be static |
| `/category/[slug]` | SSG + ISR | 3600s | SEO critical, content changes hourly |
| `/products/[slug]` | ISR | 300s | Balance SEO + inventory freshness |
| `/search` | SSR | Per-request | Dynamic params, SEO for filtered URLs |
| `/cart`, `/checkout` | CSR | — | Auth-gated, no SEO value |
| `/account/*` | CSR | — | Personal data, auth-gated |
| `/admin/*` | CSR | — | Internal tool, realtime data |

**Why NOT chosen:**
- **Vue/Nuxt:** Team background is React/TypeScript — context switch cost is too high for a 16-week project
- **Remix:** Smaller e-commerce plugin ecosystem than Next.js; fewer community resources for the VN market
- **Vite SPA:** Loses SSR/SSG → loses SEO entirely — violates FR-CATALOG-07 (structured data) and BG-01 (conversion rate depends on SEO traffic)
- **Astro:** Good for static content, but interactive AI recommendation UI is very complex

**Trade-offs:**
- Render.com free tier spins down after 15 min idle → cold start ~10-15s. Mitigation: UptimeRobot (free) pings `/health` every 5 minutes
- Vercel free tier: no spin-down, first-class Next.js support → frontend is always responsive

---

### 3.2 UI Library — Tailwind CSS 3.x + shadcn/ui

**Why chosen:**
- **Tailwind:** utility-first, no CSS-in-JS overhead, purges unused styles → smaller bundle
- **shadcn/ui:** headless components (ships no CSS, only component code) → full styling control, ARIA-compliant, copy-paste into the project
- Combined: fast UI development without being locked into a rigid design system

**Why NOT chosen:**
- **Material UI (MUI):** Large bundle (~300KB gzip), conflicts with Tailwind utility classes, opinionated styling is hard to override
- **Ant Design:** Heavy bundle, enterprise design does not suit consumer e-commerce UI, conflicts with Tailwind
- **Chakra UI:** Runtime CSS-in-JS → hydration issues with SSR Next.js App Router

---

### 3.3 State Management — Dual-Layer

#### Server State: TanStack Query (React Query) v5

| Use Case | Config |
|---|---|
| Product listings, search results | `staleTime: 60s`, background refetch |
| Cart data | `staleTime: 0`, realtime sync |
| AI recommendations | `staleTime: 600s` (matches Redis TTL 10 min) |
| Order history | `staleTime: 300s` |

- Optimistic mutations for add-to-cart (FR-CART-01) → instant UI feedback
- `stale-while-revalidate` pattern — show cached data immediately, refetch in the background

#### Client State: Zustand v4

- Pure UI state: modal open/close, cart drawer, multi-step checkout flow state, auth modal step
- Server data is not persisted in Zustand → no duplicate state with TanStack Query

**Why NOT Redux Toolkit:**
- Too much boilerplate for a solo developer in 16 weeks
- TanStack Query already handles server state well → Redux would only be needed for small UI state → Zustand is sufficient

---

## 4. Backend Layer

### 4.1 Framework — Express.js 10.x

| Attribute | Value |
|---|---|
| **Version** | 10.x |
| **Language** | TypeScript 5.x on Node.js 20 LTS |
| **Architecture** | Modular Monolith |
| **Hosting** | Render.com free tier (512MB RAM, 750 hrs/month) |

**Why Express.js:**

1. **Module system maps 1:1 with FR modules:**
   ```
   AuthModule       → FR-AUTH-*
   CatalogModule    → FR-CATALOG-*
   CartModule       → FR-CART-*
   OrderModule      → FR-ORDER-*
   RecommendModule  → FR-REC-*
   MarketingModule  → FR-MKTG-*
   NotificationModule → FR-NOTIF-*
   AnalyticsModule  → FR-ANAL-*
   ```

2. **Built-in infrastructure:**
   - `@express/swagger` → automatic OpenAPI docs (no time wasted writing by hand)
   - `Guards` → RBAC implementation (FR-AUTH-04)
   - `Interceptors` → Request logging, response transform
   - `Pipes` → Input validation via `class-validator`
   - `@express/throttler` → Rate limiting (NFR-SEC-02)

3. **DI container:** Consistency when working solo — easy to mock in tests

**API Style — REST only (no GraphQL):**
- Team is familiar with REST
- HTTP caching headers are simpler with REST
- 500 req/s target is easily achievable with Node.js REST
- GraphQL is over-engineering for this project scale

**Background Jobs — BullMQ 5.x + Redis:**

| Queue | Trigger | Job |
|---|---|---|
| `email-queue` | Order placed, campaign, abandoned cart | Send email via Nodemailer + Gmail SMTP |

> **Reduced from 4 queues to 1 to conserve Upstash Redis commands (10k/day limit).**
> Each BullMQ job lifecycle = ~15 Redis commands (ADD + STATUS + COMPLETE + CLEANUP).
>
> Old jobs migrated to lighter mechanisms:
> - `inventory-queue` → `EventEmitter2` + in-process handler (no queue persistence needed)
> - `search-sync-queue` → Removed (using MongoDB Atlas Search — data is already in MongoDB, no sync needed)
> - `analytics-queue` → `@express/schedule` cron job (EOD aggregation runs directly, no queue needed)

**Why NOT chosen:**
- **Express:** No DI, no structure → every developer organizes code differently → hard to maintain
- **Fastify:** Better performance but no built-in DI, smaller plugin ecosystem than Express.js
- **Hono:** Edge-first framework, lacks enterprise features (DI, Guards, Swagger) needed for this project

---

## 5. AI/ML Stack

### 5.1 Recommendation Engine Architecture

**Hybrid approach: CF + CBF**

```
User request → FastAPI /recommend?user_id=X&placement=homepage
                    │
                    ├─ Redis cache hit?  → return cached (TTL 10 min)
                    │
                    └─ Cache miss →
                            │
                    ┌───────┴────────┐
                    ▼                ▼
              CF Score          CBF Score
              (LightFM)         (scikit-learn)
                    │                │
                    └───────┬────────┘
                            ▼
                   score = α × CF + (1-α) × CBF
                   α per placement:
                     homepage:     α = 0.7 (CF dominant)
                     PDP similar:  α = 0.3 (CBF dominant)
                     new user:     α = 0.0 (CBF only — cold start)
                            │
                    Post-filter:
                    - Remove out-of-stock (FR-REC-06)
                    - Deduplicate current cart
                    - Apply business rules (promoted items boost)
                            │
                    Cache in Redis rec:{uid}:{placement} TTL 10 min
                            │
                    Return top-N items (default N=12)
```

**Latency target: p95 < 200ms (FR-REC-05)**
- Cache hit path: ~5ms (Redis read)
- Cache miss path: ~150ms (feature read + inference + cache write)

---

### 5.2 Collaborative Filtering — LightFM 1.17

| Attribute | Value |
|---|---|
| **Algorithm** | WARP loss (Weighted Approximate-Rank Pairwise) |
| **Input** | User-item interaction matrix (view, add-to-cart, purchase, rating) |
| **Item features** | Category one-hot + price tier + tag embeddings |
| **Training schedule** | Celery beat 02:00 ICT daily (MongoDB `behavioral_events` last 90 days) |
| **Cold start** | Hybrid mode: new user → α=0 (CBF only); new item → item features from catalog |

**Why NOT chosen:**
- **Implicit (ALS):** Purely CF, does not support item side features → does not solve cold-start (FR-REC-07)
- **Surprise library:** Pure CF only, no hybrid mode, less maintained
- **PyTorch NCF:** Requires GPU, too complex for free-tier CPU-only inference
- **MLflow:** Adds a separate tracking service — disproportionate overhead for this project

---

### 5.3 Content-Based Filtering — scikit-learn TF-IDF

| Component | Details |
|---|---|
| **Text model** | `TfidfVectorizer` (scikit-learn) — tokenize Vietnamese using `underthesea` or whitespace split |
| **Feature vector** | `[category_onehot] + [tfidf_text(name+description)] + [tag_overlap] + [price_tier_onehot]` |
| **Similarity** | Cosine similarity matrix (`sklearn.metrics.pairwise.cosine_similarity`) — rebuilt nightly |
| **Storage** | Similarity matrix `.npz` → Cloudflare R2, top-50 similar per item precomputed |

**Why TF-IDF instead of sentence-transformers:**
- `paraphrase-multilingual-MiniLM-L12-v2` requires ~470-500MB RAM for model weights alone → **exceeds Render.com 512MB free tier**
- TF-IDF + cosine similarity only needs ~5-10MB memory — comfortably fits within 512MB
- At demo scale (< 500 products), TF-IDF quality is sufficient for similar items
- LightFM (CF) remains the primary model (α=0.7 for homepage) → CBF only supplements it

**Why NOT sentence-transformers:**
- **Memory:** Model weights ~470MB + tokenizer + runtime > 512MB Render free tier
- **Cold start:** Loading the model takes 10-15s → impacts Render spin-up time
- Overkill for a catalog < 10,000 items at demo scale

---

### 5.4 ML Training Pipeline — GitHub Actions Cron

**Why NOT Celery:**
- Celery Worker + Celery Beat = 2 separate processes, each consuming ~100-200MB RAM
- Adding FastAPI uvicorn → 3 processes on 512MB Render → **OOM-kill**
- Celery requires a Redis broker → adds Redis commands to the 10k/day quota
- GitHub Actions free: 2,000 min/month, training ~15min/day = 450min/month — plenty of headroom

**Task chain (GitHub Actions cron — daily 02:00 ICT):**
```yaml
# .github/workflows/ml-training.yml
schedule:
  - cron: '0 19 * * *'  # 19:00 UTC = 02:00 ICT (UTC+7)

steps:
  - checkout repo
  - pip install -r apps/ai-service/requirements.txt
  - python scripts/train_pipeline.py
    # 1. fetch_features_from_mongo (behavioral_events last 90 days)
    # 2. train_CF_model (LightFM WARP, ~10 min)
    # 3. evaluate_CF (precision@10, recall@10)
    # 4. promote_if_better (compare with current model)
    # 5. rebuild_CBF_similarity_matrix (TF-IDF, ~2 min)
    # 6. upload_artifacts_to_r2 (.pkl + .npz files)
    # 7. update_model_version_in_mongo
    # 8. POST /internal/reload-model → FastAPI hot-reload
```

**Model Registry — simple, no MLflow needed:**
- Artifacts `.pkl` / `.npz` → Cloudflare R2: `models/{cf|cbf}/{YYYY-MM-DD}/`
- Metadata (version, metrics, promoted_at) → MongoDB collection `model_versions`
- FastAPI hot-reload: receives internal POST signal → loads new model from R2 → no restart needed

---

### 5.5 Feature Store — 2-tier

| Tier | Storage | TTL | Content |
|---|---|---|---|
| **Online** (inference) | Redis Hash `features:user:{id}` | 2h | recent_views[], purchase_categories[], price_range, segment_id |
| **Offline** (training) | MongoDB collection `feature_snapshots` | Append-only | Daily snapshot for training dataset |

Freshness SLA: `@express/schedule` cron job updates online features from MongoDB → Redis every hour. Alert if lag > 3h (FR-REC-10).

---

### 5.6 Behavioral Event Pipeline

```
Browser click/view/purchase
    → POST /api/v1/events (Express.js)
    → async MongoDB insertOne (fire-and-forget, does not block response)
    → behavioral_events collection (TTL 90 days)
```

**Why write directly to MongoDB instead of Redis Streams:**
- Demo scale: ~10-50 users → ~20-100 events/minute — MongoDB insertOne handles it easily
- Eliminating Redis Streams saves ~500+ Redis commands/day (important given Upstash 10k limit)
- Eliminating the Celery consumer reduces 1 process and lowers complexity
- MongoDB `insertOne` async: ~2-5ms, does not block the web response
- If batch insert is needed later: use Express.js `@express/schedule` cron job buffer

**Why NOT Kafka:** (reasons retained)
- Kafka minimum viable deployment: 3 broker nodes, ZooKeeper — zero free hosting options
- Overkill for demo scale

---

---

## 6. Data Layer

### 6.1 Primary Database — MongoDB Atlas M0

| Attribute | Value |
|---|---|
| **Version** | MongoDB 7.x |
| **Tier** | M0 (free forever — 512MB, shared cluster) |
| **ODM** | Mongoose 8.x via `@express/mongoose` |
| **Region** | Singapore (ap-southeast-1) — closest to Vietnam on Atlas M0 |

**Collections:**

| Collection | Data | Key Schema Pattern |
|---|---|---|
| `users` | Accounts, addresses (embedded), wishlist | `{_id, email, passwordHash, addresses: [...], roles: []}` |
| `products` | Catalog, variants (embedded), images | `{_id, sku, name, variants: [{size, color, stock, price}], attributes: {}}` |
| `categories` | Tree structure (path materialization) | `{_id, name, slug, path, parentId}` |
| `orders` | Order + items (embedded) + payment info | `{_id, userId, items: [{productId, qty, price}], payment: {}, status}` |
| `carts` | Cart per user | `{_id, userId, items: [...], updatedAt}` |
| `reviews` | Product reviews | `{_id, productId, userId, rating, body}` |
| `campaigns` | Marketing campaigns | `{_id, name, segmentId, content, schedule, status, metrics: {}}` |
| `segments` | Customer segments (RFM) | `{_id, name, rules: {}, userIds: []}` |
| `behavioral_events` | Click, view, purchase events | `{_id, userId, eventType, productId, timestamp, metadata: {}}` |
| `feature_snapshots` | ML training data snapshots | `{_id, userId, features: {}, snapshotDate}` |
| `model_versions` | ML model registry | `{_id, modelType, version, metrics: {}, artifactUrl, promotedAt}` |
| `audit_logs` | Immutable audit trail | `{_id, actor, action, resource, timestamp, diff: {}}` |
| `coupons` | Discount codes | `{_id, code, type, value, usageLimit, usedCount, expiresAt}` |

**Why MongoDB suits E-Commerce:**

1. **Flexible schema for product catalog:** A shirt has attributes `{size, color, material}`, a laptop has `{RAM, CPU, storage}` — with SQL you need the EAV pattern (complex) or many nullable columns. MongoDB embedded documents handle this naturally.

2. **Order document = 1 read instead of 5 JOINs:** An order contains embedded `items[]`, `shippingAddress`, `payment` — a single `findById` is enough to render the order detail page.

3. **Behavioral events are write-heavy:** Inserting ~167 events/sec — MongoDB bulk insert performs well, and no schema migration is needed when adding a new event type.

4. **MongoDB Atlas Search (included free):** Full-text search with Vietnamese Unicode support — an alternative to Meilisearch if you want to reduce the number of services.

5. **Aggregation Pipeline for RFM:** `$group`, `$lookup`, `$bucket` are sufficient to compute RFM segments without a separate data warehouse at demo scale.

6. **Multi-document transactions (v4.0+):** ACID for order placement + inventory deduction.

**Why NOT chosen:**
- **PostgreSQL:** Atlas free tier (Neon, Supabase) is only free for 90 days or has limitations; MongoDB M0 is free forever. SQL migrations are more complex for flexible product attributes.
- **MySQL:** Fewer features than both MongoDB and PostgreSQL. No built-in full-text search for Vietnamese.
- **Firebase Firestore:** Small free tier (1GB reads/day limit), full vendor lock-in to Google ecosystem, no aggregation pipeline, queries are severely restricted (no `OR` queries cross-collection).
- **DynamoDB:** AWS free tier expires after 12 months, no aggregation, less flexible for ad-hoc queries.

---

### 6.2 Cache Layer — Redis 7 (Upstash)

| Attribute | Value |
|---|---|
| **Provider** | Upstash (serverless Redis) |
| **Free tier** | 10,000 commands/day, 256MB |
| **Access** | HTTP REST API + Redis protocol |

**3 sole use cases (optimized for Upstash 10k commands/day):**

| Use Case | Key Pattern | TTL | Estimated cmds/day |
|---|---|---|---|
| AI Rec cache | `rec:{userId}:{placement}` | 10 min | ~500-1,000 |
| Feature store | `features:user:{id}` | 2h | ~200-500 |
| BullMQ (email) | `bull:email-queue:*` | Managed | ~200-500 |
| Fallback popular | `fallback:popular:{placement}` | 1h | ~50-100 |
| **Total estimate** | | | **~1,000-2,100** |

> **Why reduced from 7 to 3 main use cases:**
>
> | Old use case | Replaced by | Reason |
> |---|---|---|
> | Sessions (`sess:*`) | MongoDB collection `sessions` + JWT-only | Saves ~300+ cmds/day; MongoDB TTL index handles cleanup automatically |
> | Product cache (`product:*`) | `node-cache` (in-memory Express.js) | Saves ~500+ cmds/day; TTL 5min; sufficient for a single instance |
> | Category cache (`cat:*`) | `node-cache` (in-memory Express.js) | Few categories, rarely changes → in-memory cache is sufficient |
> | Rate limiting (`rl:*`) | `@express/throttler` memory store | Default behavior, no Redis needed; sufficient for a single instance |
> | Redis Streams | Direct MongoDB async write | Saves ~500+ cmds/day; demo scale does not need buffering |

**Upstash vs self-hosted Redis:**
- Upstash: serverless, free 10k cmd/day, no Redis server to manage, HTTP REST API (suits Render.com)
- Self-hosted: free but requires 1 server slot on Render (already used by Express.js and FastAPI)
- With the optimized strategy above, **~2,000 cmds/day << 10,000 limit** — safe even during a busy demo

---

### 6.3 Search Engine — MongoDB Atlas Search (replacing Meilisearch)

| Attribute | Value |
|---|---|
| **Version** | MongoDB 7.x Atlas Search |
| **Hosting** | Included free in MongoDB Atlas M0 |
| **Latency** | ~100-150ms (within NFR target p95 < 300ms) |

**Why switching from Meilisearch to Atlas Search:**
- **Eliminates 1 external service** → reduces complexity, fewer API keys to manage
- Atlas Search is **included free** in M0 — no additional account or separate configuration
- Data is already in MongoDB → **no sync pipeline needed** (removes `search-sync-queue` from BullMQ)
- Latency ~100-150ms is still good for the NFR target (p95 < 300ms)
- Vietnamese Unicode collation support

**Atlas Search Index config:**

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": { "type": "string", "analyzer": "lucene.standard" },
      "description": { "type": "string", "analyzer": "lucene.standard" },
      "tags": { "type": "string", "analyzer": "lucene.keyword" },
      "categoryId": { "type": "objectId" },
      "status": { "type": "string" },
      "variants.price": { "type": "number" }
    }
  }
}
```

**Why NOT chosen:**
- **Meilisearch Cloud:** Better latency (~30ms) but adds 1 service + requires a sync pipeline (BullMQ queue) → consumes extra Redis commands against the Upstash 10k/day limit
- **Elasticsearch:** No free tier exists; self-hosting requires a minimum of 2GB RAM
- **Typesense Cloud:** Free tier is only 10k documents

### 6.4 Behavioral Event Ingestion — Direct MongoDB (replacing Redis Streams)

No separate message broker is needed for behavioral events:
- **Demo scale:** ~20-100 events/minute — MongoDB `insertOne` async handles it easily
- **Saves Redis commands:** XADD + XREADGROUP + XACK = ~3 cmds/batch → saves ~500+ cmds/day
- **Reduces complexity:** Eliminates the Celery consumer and Redis Streams configuration
- **Sufficient for ML training:** GitHub Actions cron queries the MongoDB `behavioral_events` collection directly

---

## 7. Infrastructure & DevOps

### 7.1 Overview — $0/month, 100% Free Tier

| Service | Provider | Free Tier | Limits to Know |
|---|---|---|---|
| Frontend (Next.js) | **Vercel** | 100GB bandwidth, unlimited SSR | — |
| API Server (Express.js) | **Render.com** | 750 hrs/month, 512MB RAM | Spin-down after 15 min idle |
| AI Service (FastAPI) | **Render.com** | 750 hrs/month, 512MB RAM | Spin-down after 15 min idle; ~270MB used |
| Primary DB + Search | **MongoDB Atlas M0** | 512MB, no expiry, Atlas Search included | Shared cluster, no replica set |
| Cache + Queue | **Upstash Redis** | 10k commands/day, 256MB | Only ~2k cmds/day used (optimized) |
| Object Storage | **Cloudflare R2** | 10GB, 10M reads/month | — |
| CI/CD | **GitHub Actions** | 2,000 min/month | — |
| Error Tracking | **MongoDB error_logs** (in-app) | Self-hosted, no limit | Append-only collection in Atlas M0 |
| Email | **Gmail SMTP (Nodemailer)** | 500 emails/day | No new service account needed |
| Payment | **VNPay sandbox** | Free (sandbox mode) | No real money |
| Push Notification | **Web Push VAPID** | Self-hosted | $0 |
| ML Training | **GitHub Actions** | (shared with CI/CD) ~450 min/month | Daily 02:00 ICT |
| Uptime monitoring | **UptimeRobot** | 50 monitors, 5-min interval | Workaround for Render spin-down |
| **TOTAL** | | | **$0/month** |

**Render.com spin-down workaround:**
UptimeRobot (free) pings `GET /health` every 5 minutes → service never sleeps during the demo.

---

### 7.2 Deployment Environments

| Environment | Stack | When |
|---|---|---|
| **Local Dev** | Docker Compose full stack | Sprint 1-3 (development) |
| **Cloud Demo** | Vercel + Render + Atlas | Sprint 4 (before defense) |

---

### 7.3 Docker Compose (Local Dev)

```yaml
# docker-compose.yml — services:
services:
  mongodb:       # mongo:7 — port 27017
  redis:         # redis:7-alpine — port 6379
  express:        # custom Dockerfile, hot-reload with ts-node-dev
  nextjs:        # custom Dockerfile, next dev
  fastapi:       # custom Dockerfile, uvicorn --reload
```

> **Removed:** `meilisearch` (using MongoDB Atlas Search), `celery` (using GitHub Actions cron)

**Multi-stage Dockerfiles:**
- `express/Dockerfile`: `node:20-alpine` base → `npm ci` → `tsc build` → copy `dist/` → production image
- `fastapi/Dockerfile`: `python:3.11-slim` → pip layer (cached) → copy src → uvicorn

---

### 7.4 CI/CD — GitHub Actions (3 workflows)

```
ci.yml              (trigger: pull_request → any branch)
  ├── lint:          ESLint + Prettier check (Express.js + Next.js)
  ├── typecheck:     tsc --noEmit
  ├── test-unit:     Jest (Express.js) + pytest (FastAPI)
  └── test-e2e:      Playwright smoke test (optional Sprint 4)

cd-staging.yml      (trigger: push → develop)
  ├── Build Docker images
  └── Deploy to Render.com staging service

cd-production.yml   (trigger: push → main)
  ├── Build + push images
  └── Deploy to Render.com production + Vercel production

ml-training.yml     (trigger: cron 0 19 * * * = 02:00 ICT daily)
  ├── Fetch behavioral_events from MongoDB
  ├── Train LightFM CF model + rebuild TF-IDF CBF matrix
  ├── Evaluate + promote if better
  ├── Upload artifacts to Cloudflare R2
  └── POST /internal/reload-model → FastAPI hot-reload
```

---

### 7.5 Monitoring

| Tool | Purpose | Key Metrics |
|---|---|---|
| **MongoDB `error_logs`** (in-app) | Server-side exception logging — replaces Sentry | Error type, stack trace, timestamp, request context, actor |
| **Admin Dashboard** (in-app) | AI performance + business metrics | AI CTR (FR-REC-02), revenue, orders, cache hit rate |
| **Render.com dashboard** | Container health, deploy logs | CPU, memory, request count |
| **UptimeRobot** (free) | Availability monitoring | Uptime %, response time |

> **Why drop Sentry:** Adds an external service account with no clear advantage over an append-only `error_logs` MongoDB collection at demo scale. The collection stores `{ level, message, stack, context, timestamp }` — searchable via Atlas and visible in the Admin Dashboard.

**In-app Admin Dashboard (replacing Grafana Cloud):**
- Integrated directly in AnalyticsModule → admin UI
- Data source: MongoDB aggregation pipeline directly
- Eliminates 1 external service, data is more realtime

---

## 8. Third-Party Services

### 8.1 Payment — VNPay (sandbox only)

| Attribute | Details |
|---|---|
| **Primary** | VNPay QR + ATM card (FR-CART-05) |
| **Architecture** | `IPaymentGateway` interface → `VNPayAdapter` (extensible for Momo later if needed) |
| **Phase 1** | Sandbox mode — no real money |
| **Webhook** | Signed HMAC-SHA512 callback → verify + update order status |

**Why VNPay only (dropping Momo Phase 1):**
- VNPay already covers QR + ATM + Internet Banking → sufficient for the demo
- Adding Momo = adding 1 adapter + 1 sandbox account + webhook config → unnecessary complexity
- `IPaymentGateway` interface allows adding `MomoAdapter` later without refactoring

**Why NOT Stripe:** Does not support VN cards; international Visa cards are not common among the VN target users.

---

### 8.2 Email — Nodemailer + Gmail SMTP

| Attribute | Details |
|---|---|
| **Free tier** | 500 emails/day via Google Workspace / personal Gmail with App Password |
| **Library** | `nodemailer` npm package — SMTP transport |
| **Templates** | Handlebars / inline HTML string — rendered server-side in Express.js |
| **Use cases** | Order confirmation, shipping update, password reset, marketing campaigns |
| **Bounce handling** | No webhook — track delivery failures via Nodemailer SMTP error callbacks; update `users.emailStatus` on hard bounce |

**Why switch from Resend to Nodemailer + Gmail SMTP:**
- Eliminates 1 external service account (no Resend API key to manage)
- Gmail SMTP is free (500 emails/day) — sufficient for an academic demo
- `nodemailer` is a well-known npm package, no new SDK to learn
- Consistent with the goal of minimizing 3rd-party dependencies

**Why NOT Resend:**
- Requires a separate account and API key
- Free tier (3k/month) is generous but introduces 1 more external dependency with no advantage at demo scale

---

### 8.3 Push Notifications — Web Push VAPID

- Self-hosted, $0 — Express.js sends directly to the browser
- `web-push` npm package
- Use cases: order status update (FR-NOTIF-03), price drop alert, cart abandonment reminder

---

### 8.4 SMS — Removed (Phase 1)

SMS (ESMS.vn) is fully removed from Phase 1. Reason: charged per SMS, no free tier. Email + Web Push is sufficient to cover FR-NOTIF-*.

---

### 8.5 Address — Static JSON (Dropping Goong.io)

- Uses `provinces-api` static JSON for province/district/ward dropdowns — **no API call needed, $0**
- Eliminates 1 external service dependency
- User enters the detailed address (street/house number) manually — sufficient for an e-commerce demo
- If autocomplete is needed later: add a Goong.io adapter (200k calls/month free)

---

## 9. Decision Matrix — 3 Hardest Decisions

### Decision 1 — Backend Framework

**Context:** TypeScript/Node.js team. Need structure for ~40 FRs. 16 weeks. Solo developer.

| Framework | Team Fit (30%) | Code Structure (30%) | Ecosystem (20%) | Performance (10%) | Learning Curve (10%) | **Total** |
|---|---|---|---|---|---|---|
| **Express.js 10** | 8 | **10** | 9 | 7 | 6 | **8.3** |
| Express 5 | 9 | 4 | 10 | 9 | 9 | 7.4 |
| Fastify 4 | 7 | 5 | 7 | 10 | 7 | 6.5 |
| Hono 4 | 5 | 4 | 5 | 10 | 6 | 5.2 |

**Verdict:** Express.js — DI + Module system = clear structure for ~40 FRs, the team does not need to agree on architecture conventions.

---

### Decision 2 — Primary Database

**Context:** Budget $0. Flexible product catalog attributes. E-commerce document model. Solo dev does not want to manage migrations.

| Database | Free Tier Forever (35%) | Schema Flexibility (25%) | Query Power (20%) | Team Familiarity (10%) | VN Latency (10%) | **Total** |
|---|---|---|---|---|---|---|
| **MongoDB Atlas M0** | **10** | **10** | 8 | 7 | 9 | **9.0** |
| PostgreSQL (Neon free) | 6 | 4 | 10 | 5 | 8 | 6.3 |
| Firebase Firestore | 7 | 8 | 4 | 6 | 9 | 6.6 |
| MySQL (PlanetScale free) | 5 | 4 | 8 | 5 | 8 | 5.6 |

**Verdict:** MongoDB Atlas M0 — free forever, flexible schema that naturally suits e-commerce catalog, Mongoose is familiar to the JS team.

*(Note: PlanetScale discontinued its free tier in 2024. Neon PostgreSQL free tier exists but has inactivity pause.)*

---

### Decision 3 — Frontend Rendering Strategy

**Context:** AI recommendation homepage (per-user, cannot be static). SEO critical for category/product pages. $0 hosting.

| Approach | SEO (30%) | AI Personalization (25%) | Dev Speed (20%) | Hosting Cost (15%) | Performance (10%) | **Total** |
|---|---|---|---|---|---|---|
| **Next.js 15 Hybrid** | **10** | **10** | 8 | 7 | 8 | **9.05** |
| Remix (SSR only) | 8 | 9 | 7 | 7 | 9 | 8.0 |
| Nuxt.js 3 (SSR/SSG) | 9 | 9 | 5 | 7 | 8 | 7.5 |
| Vite SPA (CSR only) | 3 | 10 | 9 | 9 | 7 | 6.6 |
| Astro (islands) | 8 | 5 | 6 | 9 | 10 | 7.1 |

**Verdict:** Next.js 15 — hybrid rendering is the unique selling point: static catalog (SEO) + dynamic homepage (AI rec) + CSR cart (interactivity) all in one codebase. Vercel free tier = best Next.js hosting.

---

## 10. Cost Estimate

### Phase 1 (MVP Demo) — $0/month

| Service | Provider | Tier | USD/month |
|---|---|---|---|
| Frontend (Next.js SSR/SSG/ISR) | Vercel | Free | $0 |
| API Server (Express.js REST) | Render.com | Free (750 hrs) | $0 |
| AI Service (FastAPI — no Celery) | Render.com | Free (750 hrs) | $0 |
| Primary Database + Search | MongoDB Atlas M0 | Free (512MB, Atlas Search included) | $0 |
| Cache + Queue (Redis) | Upstash | Free (10k cmd/day, ~2k used) | $0 |
| Object Storage (images + models) | Cloudflare R2 | Free (10GB, 10M reads) | $0 |
| CI/CD | GitHub Actions | Free (2k min/month) | $0 |
| Error Tracking | MongoDB error_logs (in-app) | Self-hosted in Atlas M0 | $0 |
| Email (transactional + marketing) | Gmail SMTP (Nodemailer) | Free (500/day) | $0 |
| Payment Gateway | VNPay | Free (sandbox) | $0 |
| Push Notification | Web Push VAPID | Self-hosted | $0 |
| ML Training | GitHub Actions cron | Free (shared w/ CI, ~450 min/month) | $0 |
| Uptime Monitor | UptimeRobot | Free | $0 |
| **TOTAL** | | | **$0/month** |

### Free Tier Limits to Watch

| Service | Limit | Risk | Mitigation |
|---|---|---|---|
| Render.com | Spin-down after 15 min idle | Cold start during demo | UptimeRobot ping every 5 min |
| MongoDB Atlas M0 | 512MB storage | Overflow if > 50k orders + full behavioral events | Purge behavioral_events older than 90 days |
| Upstash Redis | 10k cmd/day | Only ~2k/day used (optimized: only AI cache + feature store + email queue) | Monitor via Upstash dashboard |

### If Scaling Is Needed After Graduation

| Scenario | Stack Changes | Estimated Cost |
|---|---|---|
| Production (1k users/day) | Render Starter ($7) + Atlas M10 ($57) + Upstash Pay-as-you-go | ~$70/month |
| Self-host on VPS | $10-20/month VPS + MongoDB Community (free) + Redis OSS (free) | ~$15/month |
| Enterprise scale | AWS ECS + DocumentDB + ElastiCache + CloudSearch | ~$200-500/month |

---

## 11. Security Mapping

| NFR / Threat | Implementation | Technology |
|---|---|---|
| Authentication | JWT access token (15 min) + refresh token HTTP-only cookie (7 days) | `@express/jwt`, `cookie-parser` |
| Password storage | bcrypt, cost factor 12 | `bcryptjs` |
| NoSQL injection | Mongoose schema validation; whitelist `$` operators; no raw `$where` | Mongoose 8.x |
| XSS | React automatic HTML escaping; CSP headers via Next.js `headers()` config | Next.js 15 |
| CSRF | SameSite=Strict cookie; CSRF token for state-changing mutations | Custom Express.js Guard |
| Rate limiting | `@express/throttler` memory store (default, single instance is sufficient) | `@express/throttler` |
| RBAC | `@Roles()` decorator + `RolesGuard` in Express.js; roles: `buyer`, `staff`, `admin` | Express.js Guards |
| HTTPS / TLS | Vercel (frontend) + Render.com (backend) auto-provision TLS 1.2+/1.3; HSTS enabled | Vercel, Render.com |
| Audit log immutability | MongoDB `audit_logs` collection — app service account has insert-only permission | MongoDB Atlas role |
| Secrets management | Environment variables, never commit `.env` — `.env.example` contains key names only | GitHub Actions secrets |
| Dependency scanning | `npm audit` + Dependabot alerts in CI | GitHub |

---

## 12. Sprint Alignment

| Sprint | Weeks | Technologies Introduced |
|---|---|---|
| **Sprint 1** | 1–4 | Docker Compose setup (MongoDB + Redis + Express.js + Next.js + FastAPI); MongoDB Atlas M0 + Mongoose schemas; Express.js modules scaffold (Auth, Catalog, Cart); Next.js App Router setup; Cloudflare R2; GitHub Actions CI |
| **Sprint 2** | 5–8 | Order module + VNPay sandbox; BullMQ email queue + Nodemailer/Gmail SMTP; Atlas Search setup; Web Push VAPID; Basic Admin Dashboard; CD pipeline (Render + Vercel staging) |
| **Sprint 3** | 9–12 | FastAPI AI service bootstrap; LightFM training pipeline (GitHub Actions cron); 2-tier feature store (Redis + MongoDB); TF-IDF CBF similarity matrix; Behavioral event ingestion (direct MongoDB); RFM segmentation (MongoDB aggregation) |
| **Sprint 4** | 13–16 | Hybrid recommendation scoring (α tuning); Marketing campaign MVP; error_logs in-app monitoring; Performance tuning; Demo environment prep; Final documentation |

---

## 13. Glossary

| Term | Definition |
|---|---|
| **ALS** | Alternating Least Squares — Matrix Factorization algorithm for Collaborative Filtering |
| **BPR** | Bayesian Personalized Ranking — loss function in LightFM |
| **CBF** | Content-Based Filtering — recommendations based on product attributes |
| **CF** | Collaborative Filtering — recommendations based on collective user behavior |
| **CSR** | Client-Side Rendering — render HTML in the browser using JavaScript |
| **DI** | Dependency Injection — design pattern that injects dependencies instead of instantiating them directly |
| **ISR** | Incremental Static Regeneration — Next.js pattern: static page rebuilt on a set interval |
| **LLM** | Large Language Model — large language model (Gemini, GPT, Claude...) |
| **ODM** | Object Document Mapper — similar to ORM but for NoSQL document DBs (Mongoose) |
| **RBAC** | Role-Based Access Control — access control based on roles (buyer/staff/admin) |
| **RFM** | Recency-Frequency-Monetary — customer segmentation method based on value |
| **SSG** | Static Site Generation — pre-render HTML at build time |
| **SSR** | Server-Side Rendering — render HTML on the server per request |
| **VAPID** | Voluntary Application Server Identification — Web Push authentication standard |
| **WARP** | Weighted Approximate-Rank Pairwise — LightFM loss function optimized for top-N recommendations |

---

*TECH_STACK.md — v2.0.0 — 2026-04-01*
*This document is Step 2/5 in the system design workflow. Next step: `docs/SYSTEM_DESIGN.md`*
