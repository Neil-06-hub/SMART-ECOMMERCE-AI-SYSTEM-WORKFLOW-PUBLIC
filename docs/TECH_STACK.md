# Tech Stack Decision Record

**Project:** SMART ECOMMERCE AI SYSTEM
**Version:** 1.0.0
**Date:** 2026-03-24
**Author:** Solutions Architect
**Status:** Approved
**References:** `docs/REQUIREMENTS.md` v2.1.0

---

## Design Axioms

> **Axiom 1 — $0/month:** Mọi quyết định infrastructure phải thoả mãn free tier.
> Project là đồ án đại học. Không có thẻ tín dụng, không có ngân sách. Mọi dịch vụ phải có
> free tier thực sự (không hết hạn sau 14 ngày) hoặc tự host được bằng Docker.
>
> **Axiom 2 — Team fit over hype:** Stack TypeScript/Node.js (NestJS + Next.js) là primary.
> Python chỉ cho AI service. Không chọn công nghệ chỉ vì "trending" — phải justify
> bằng requirement cụ thể trong REQUIREMENTS.md.

---

## Mục Lục

1. [Quick Reference Summary](#1-quick-reference-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Frontend Layer](#3-frontend-layer)
4. [Backend Layer](#4-backend-layer)
5. [AI/ML Stack](#5-aiml-stack)
6. [Data Layer](#6-data-layer)
7. [Infrastructure & DevOps](#7-infrastructure--devops)
8. [Third-Party Services](#8-third-party-services)
9. [Decision Matrix — 3 Quyết Định Khó Nhất](#9-decision-matrix--3-quyết-định-khó-nhất)
10. [Cost Estimate](#10-cost-estimate)
11. [Security Mapping](#11-security-mapping)
12. [Sprint Alignment](#12-sprint-alignment)
13. [Glossary](#13-glossary)

---

## 1. Quick Reference Summary

| Layer | Công Nghệ | Version | Role | Hosted Where |
|---|---|---|---|---|
| Frontend Framework | Next.js (App Router) | 15.x | SSR/SSG/ISR/CSR hybrid | Vercel (free) |
| UI Library | Tailwind CSS + shadcn/ui | Tailwind 3.x | Utility-first styling + headless components | — |
| Client State | Zustand | 4.x | UI state (modal, drawer, auth step) | — |
| Server State | TanStack Query | 5.x | Data fetching, caching, optimistic updates | — |
| Backend Framework | NestJS | 10.x | Modular monolith REST API | Render.com (free) |
| Backend Language | TypeScript + Node.js | TS 5.x / Node 20 LTS | Primary language | — |
| AI Service Language | Python | 3.11 | ML training + inference | — |
| AI Inference Framework | FastAPI | 0.111.x | REST inference + model hot-reload | Render.com (free) |
| Recommendation (CF) | LightFM | 1.17 | Collaborative filtering, hybrid mode | — |
| Recommendation (CBF) | scikit-learn (TF-IDF + cosine sim) | sklearn 1.4 | Content-based filtering, Vietnamese text | — |
| ML Job Scheduler | GitHub Actions cron | — | Daily training pipeline (02:00 ICT) | GitHub (free) |
| Primary Database | MongoDB Atlas | 7.x (M0 free) | Document store, flexible schema | MongoDB Atlas M0 |
| ODM | Mongoose | 8.x | Schema validation + queries trong NestJS | — |
| Cache + Queue broker | Redis | 7.x | AI rec cache, feature store, BullMQ (email) | Upstash (free) |
| Background Jobs (Node) | BullMQ | 5.x | Email queue only | — |
| Search Engine | MongoDB Atlas Search | 7.x | Full-text search, Vietnamese collation | MongoDB Atlas M0 (included) |
| Object Storage | Cloudflare R2 | — | Product images + ML model artifacts | Cloudflare (free 10GB) |
| CDN | Cloudflare | — | Static assets, DDoS, SSL termination | Cloudflare (free) |
| Containerization | Docker + Docker Compose | 26.x | Local dev environment | Self-hosted |
| CI/CD | GitHub Actions | — | Lint, test, deploy pipeline | GitHub (free) |
| Error Tracking | Sentry | — | Exception monitoring FE + BE | Sentry (free 5k/mo) |
| Metrics | Admin Dashboard (in-app) | — | AI CTR + revenue metrics | Self-hosted ($0) |
| Email | Resend | — | Transactional + marketing email | Resend (free 3k/mo) |
| Push Notifications | Web Push VAPID | — | Browser push, order status (FR-NOTIF-03) | Self-hosted ($0) |
| Payment (VN) | VNPay | — | VN market payment (FR-CART-05) | Sandbox (free) |

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                 │
│         Browser — Next.js 15 (SSR / SSG / ISR / CSR)             │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│              Cloudflare  (CDN · DDoS · SSL termination)           │
└────────────────────────────┬─────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
┌─────────────────────┐       ┌──────────────────────────────┐
│   Next.js 15        │       │   NestJS REST API             │
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
  VNPay (sandbox) · Resend (email)

TRAINING PIPELINE (offline):
  GitHub Actions cron (daily 02:00 ICT)
    → Python script: fetch MongoDB → train LightFM + rebuild TF-IDF
    → upload .pkl to R2 → POST /internal/reload-model → FastAPI
```

**Luồng request chính:**
1. Browser → Cloudflare → Next.js (SSR/SSG page)
2. Client JS → Cloudflare → NestJS REST `/api/v1/*`
3. NestJS → MongoDB (read/write + Atlas Search) + Redis (AI cache hit)
4. NestJS → BullMQ → email-queue → Resend
5. NestJS → POST /api/v1/events → MongoDB async write (behavioral events)
6. FastAPI `/recommend` → Redis feature store (< 5ms) → LightFM + TF-IDF CBF → cache in Redis → return

---

## 3. Frontend Layer

### 3.1 Framework — Next.js 15 (App Router)

| Thuộc Tính | Giá Trị |
|---|---|
| **Version** | 15.x (App Router, React 19) |
| **Hosting** | Vercel free tier (100GB bandwidth, unlimited Edge functions) |
| **Why chosen** | Hybrid rendering: SSR + SSG + ISR + CSR trong cùng một project |

**Chiến lược rendering theo loại trang (FR-CATALOG-07 structured data, SEO):**

| Route | Chiến Lược | Revalidate | Lý Do |
|---|---|---|---|
| `/` (Homepage) | SSR | Per-request | AI recommendation per-user, không thể static |
| `/category/[slug]` | SSG + ISR | 3600s | SEO critical, content thay đổi hàng giờ |
| `/products/[slug]` | ISR | 300s | Balance SEO + inventory freshness |
| `/search` | SSR | Per-request | Dynamic params, SEO cho filtered URLs |
| `/cart`, `/checkout` | CSR | — | Auth-gated, không có SEO value |
| `/account/*` | CSR | — | Dữ liệu cá nhân, auth-gated |
| `/admin/*` | CSR | — | Internal tool, realtime data |

**Tại sao KHÔNG chọn:**
- **Vue/Nuxt:** Team background là React/TypeScript — context switch cost quá cao cho 16-week project
- **Remix:** Ecosystem plugin e-commerce nhỏ hơn Next.js; ít community resource hơn cho VN market
- **Vite SPA:** Mất SSR/SSG → mất SEO hoàn toàn — vi phạm FR-CATALOG-07 (structured data) và BG-01 (conversion rate phụ thuộc SEO traffic)
- **Astro:** Tốt cho static content, nhưng interactive AI recommendation UI rất phức tạp

**Trade-off:**
- Render.com free tier spin-down sau 15 min idle → cold start ~10-15s. Mitigate: UptimeRobot (free) ping `/health` mỗi 5 phút
- Vercel free tier: không bị spin-down, Next.js first-class support → frontend luôn responsive

---

### 3.2 UI Library — Tailwind CSS 3.x + shadcn/ui

**Lý do chọn:**
- **Tailwind:** utility-first, không có CSS-in-JS overhead, purge unused styles → bundle nhỏ
- **shadcn/ui:** headless components (không ship CSS, chỉ ship component code) → full control styling, ARIA-compliant, copy-paste vào project
- Kết hợp: tốc độ xây dựng UI nhanh mà không bị ràng buộc design system cứng nhắc

**Tại sao KHÔNG chọn:**
- **Material UI (MUI):** Bundle lớn (~300KB gzip), fighting Tailwind utility classes, opinionated styling khó override
- **Ant Design:** Heavy bundle, thiết kế enterprise không phù hợp e-commerce consumer UI, Tailwind conflict
- **Chakra UI:** Runtime CSS-in-JS → hydration issues với SSR Next.js App Router

---

### 3.3 State Management — Dual-Layer

#### Server State: TanStack Query (React Query) v5

| Use Case | Config |
|---|---|
| Product listings, search results | `staleTime: 60s`, background refetch |
| Cart data | `staleTime: 0`, realtime sync |
| AI recommendations | `staleTime: 600s` (match Redis TTL 10 phút) |
| Order history | `staleTime: 300s` |

- Optimistic mutations cho add-to-cart (FR-CART-01) → instant UI feedback
- `stale-while-revalidate` pattern — hiển thị cached data ngay, refetch ngầm

#### Client State: Zustand v4

- UI state thuần: modal open/close, cart drawer, multi-step checkout flow state, auth modal step
- Không persist server data trong Zustand → không duplicate state với TanStack Query

**Tại sao KHÔNG chọn Redux Toolkit:**
- Boilerplate quá nhiều cho team 1 người trong 16 tuần
- TanStack Query đã handle server state tốt → Redux chỉ cần cho UI state nhỏ → Zustand đủ

---

## 4. Backend Layer

### 4.1 Framework — NestJS 10.x

| Thuộc Tính | Giá Trị |
|---|---|
| **Version** | 10.x |
| **Language** | TypeScript 5.x trên Node.js 20 LTS |
| **Architecture** | Modular Monolith |
| **Hosting** | Render.com free tier (512MB RAM, 750 hrs/month) |

**Lý do chọn NestJS:**

1. **Module system maps 1:1 với FR modules:**
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
   - `@nestjs/swagger` → OpenAPI docs tự động (không tốn thời gian viết tay)
   - `Guards` → RBAC implementation (FR-AUTH-04)
   - `Interceptors` → Request logging, response transform
   - `Pipes` → Input validation via `class-validator`
   - `@nestjs/throttler` → Rate limiting (NFR-SEC-02)

3. **DI container:** Consistency khi làm việc solo — dễ mock trong tests

**API Style — REST only (không GraphQL):**
- Team familiar với REST
- HTTP caching headers đơn giản hơn với REST
- 500 req/s target dễ đạt với Node.js REST
- GraphQL over-engineering cho project scale này

**Background Jobs — BullMQ 5.x + Redis:**

| Queue | Trigger | Job |
|---|---|---|
| `email-queue` | Order placed, campaign, abandoned cart | Resend email via React Email template |

> **Giảm từ 4 queues xuống 1 để tiết kiệm Upstash Redis commands (10k/day limit).**
> Mỗi BullMQ job lifecycle = ~15 Redis commands (ADD + STATUS + COMPLETE + CLEANUP).
>
> Các job cũ chuyển sang cơ chế nhẹ hơn:
> - `inventory-queue` → `EventEmitter2` + in-process handler (không cần queue persistence)
> - `search-sync-queue` → Bỏ (dùng MongoDB Atlas Search — data đã trong MongoDB, không cần sync)
> - `analytics-queue` → `@nestjs/schedule` cron job (EOD aggregation chạy trực tiếp, không cần queue)

**Tại sao KHÔNG chọn:**
- **Express:** Không có DI, không có structure → mỗi developer tổ chức code khác nhau → khó maintain
- **Fastify:** Performance tốt hơn nhưng không có DI built-in, ecosystem plugin nhỏ hơn NestJS
- **Hono:** Edge-first framework, thiếu enterprise features (DI, Guards, Swagger) cần cho project này

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

| Thuộc Tính | Giá Trị |
|---|---|
| **Algorithm** | WARP loss (Weighted Approximate-Rank Pairwise) |
| **Input** | User-item interaction matrix (view, add-to-cart, purchase, rating) |
| **Item features** | Category one-hot + price tier + tag embeddings |
| **Training schedule** | Celery beat 02:00 ICT daily (MongoDB `behavioral_events` last 90 days) |
| **Cold start** | Hybrid mode: new user → α=0 (CBF only); new item → item features từ catalog |

**Tại sao KHÔNG chọn:**
- **Implicit (ALS):** Purely CF, không hỗ trợ item side features → không giải quyết cold-start (FR-REC-07)
- **Surprise library:** Chỉ CF thuần, không hybrid mode, ít maintained
- **PyTorch NCF:** Cần GPU, quá phức tạp cho free tier CPU-only inference
- **MLflow:** Adds separate tracking service — disproportionate overhead cho project này

---

### 5.3 Content-Based Filtering — scikit-learn TF-IDF

| Component | Chi Tiết |
|---|---|
| **Text model** | `TfidfVectorizer` (scikit-learn) — tokenize tiếng Việt bằng `underthesea` hoặc whitespace split |
| **Feature vector** | `[category_onehot] + [tfidf_text(name+description)] + [tag_overlap] + [price_tier_onehot]` |
| **Similarity** | Cosine similarity matrix (`sklearn.metrics.pairwise.cosine_similarity`) — rebuilt nightly |
| **Storage** | Similarity matrix `.npz` → Cloudflare R2, top-50 similar per item precomputed |

**Tại sao TF-IDF thay vì sentence-transformers:**
- `paraphrase-multilingual-MiniLM-L12-v2` cần ~470-500MB RAM chỉ cho model weights → **vượt Render.com 512MB free tier**
- TF-IDF + cosine similarity chỉ cần ~5-10MB memory — fit thoải mái trong 512MB
- Với scale demo (< 500 products), chất lượng TF-IDF đủ tốt cho similar items
- LightFM (CF) vẫn là model chính (α=0.7 cho homepage) → CBF chỉ bổ trợ

**Tại sao KHÔNG chọn sentence-transformers:**
- **Memory:** Model weights ~470MB + tokenizer + runtime > 512MB Render free tier
- **Cold start:** Load model mất 10-15s → ảnh hưởng Render spin-up time
- Overkill cho catalog < 10,000 items ở scale demo

---

### 5.4 ML Training Pipeline — GitHub Actions Cron

**Tại sao KHÔNG dùng Celery:**
- Celery Worker + Celery Beat = 2 process riêng biệt, mỗi process chiếm ~100-200MB RAM
- Cộng thêm FastAPI uvicorn → 3 processes trên 512MB Render → **OOM-kill**
- Celery cần Redis broker → thêm Redis commands vào quota 10k/day
- GitHub Actions free: 2,000 min/month, training ~15min/day = 450min/month — dư thừa

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
    # 4. promote_if_better (compare với model hiện tại)
    # 5. rebuild_CBF_similarity_matrix (TF-IDF, ~2 min)
    # 6. upload_artifacts_to_r2 (.pkl + .npz files)
    # 7. update_model_version_in_mongo
    # 8. POST /internal/reload-model → FastAPI hot-reload
```

**Model Registry — đơn giản, không cần MLflow:**
- Artifacts `.pkl` / `.npz` → Cloudflare R2: `models/{cf|cbf}/{YYYY-MM-DD}/`
- Metadata (version, metrics, promoted_at) → MongoDB collection `model_versions`
- FastAPI hot-reload: nhận internal POST signal → load model mới từ R2 → không cần restart

---

### 5.5 Feature Store — 2-tier

| Tier | Storage | TTL | Content |
|---|---|---|---|
| **Online** (inference) | Redis Hash `features:user:{id}` | 2h | recent_views[], purchase_categories[], price_range, segment_id |
| **Offline** (training) | MongoDB collection `feature_snapshots` | Append-only | Daily snapshot cho training dataset |

Freshness SLA: `@nestjs/schedule` cron job mỗi giờ cập nhật online features từ MongoDB → Redis. Alert nếu lag > 3h (FR-REC-10).

---

### 5.6 Behavioral Event Pipeline

```
Browser click/view/purchase
    → POST /api/v1/events (NestJS)
    → async MongoDB insertOne (fire-and-forget, không block response)
    → behavioral_events collection (TTL 90 days)
```

**Tại sao ghi trực tiếp MongoDB thay vì Redis Streams:**
- Scale demo: ~10-50 users → ~20-100 events/phút — MongoDB insertOne dư sức xử lý
- Bỏ Redis Streams = tiết kiệm ~500+ Redis commands/day (quan trọng với Upstash 10k limit)
- Bỏ Celery consumer = giảm 1 process, giảm complexity
- MongoDB `insertOne` async: ~2-5ms, không block web response
- Nếu cần batch insert sau này: dùng NestJS `@nestjs/schedule` cron job buffer

**Tại sao KHÔNG dùng Kafka:** (giữ nguyên lý do)
- Kafka minimum viable deployment: 3 broker nodes, ZooKeeper — zero free hosting
- Overkill cho scale demo

---

---

## 6. Data Layer

### 6.1 Primary Database — MongoDB Atlas M0

| Thuộc Tính | Giá Trị |
|---|---|
| **Version** | MongoDB 7.x |
| **Tier** | M0 (free forever — 512MB, shared cluster) |
| **ODM** | Mongoose 8.x via `@nestjs/mongoose` |
| **Region** | Singapore (ap-southeast-1) — gần VN nhất trên Atlas M0 |

**Collections:**

| Collection | Dữ Liệu | Key Schema Pattern |
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

**Tại sao MongoDB phù hợp cho E-Commerce:**

1. **Flexible schema cho product catalog:** Áo có attributes `{size, color, material}`, laptop có `{RAM, CPU, storage}` — với SQL cần EAV pattern (phức tạp) hoặc nhiều nullable columns. MongoDB embedded document tự nhiên hơn.

2. **Order document = 1 read thay vì 5 JOINs:** Order chứa embedded `items[]`, `shippingAddress`, `payment` — 1 `findById` đủ để render order detail page.

3. **Behavioral events write-heavy:** Insert ~167 events/sec — MongoDB bulk insert performance tốt, không cần schema migration khi thêm event type mới.

4. **MongoDB Atlas Search (included free):** Full-text search với Vietnamese Unicode support — alternative cho Meilisearch nếu muốn giảm số service.

5. **Aggregation Pipeline cho RFM:** `$group`, `$lookup`, `$bucket` đủ để compute RFM segments mà không cần data warehouse riêng ở scale demo.

6. **Multi-document transactions (v4.0+):** ACID cho order placement + inventory deduction.

**Tại sao KHÔNG chọn:**
- **PostgreSQL:** Atlas free tier (Neon, Supabase) chỉ free 90 ngày hoặc hạn chế; MongoDB M0 free forever. SQL migrations phức tạp hơn cho flexible product attributes.
- **MySQL:** Ít features hơn cả MongoDB lẫn PostgreSQL. Không có built-in full-text search cho Vietnamese.
- **Firebase Firestore:** Free tier nhỏ (1GB reads/day limit), vendor lock-in hoàn toàn vào Google ecosystem, không có aggregation pipeline, query bị hạn chế nghiêm (no `OR` queries cross-collection).
- **DynamoDB:** AWS free tier hết hạn sau 12 tháng, không có aggregation, ít flexible cho ad-hoc queries.

---

### 6.2 Cache Layer — Redis 7 (Upstash)

| Thuộc Tính | Giá Trị |
|---|---|
| **Provider** | Upstash (serverless Redis) |
| **Free tier** | 10,000 commands/day, 256MB |
| **Access** | HTTP REST API + Redis protocol |

**3 use cases duy nhất (tối ưu cho Upstash 10k commands/day):**

| Use Case | Key Pattern | TTL | Ước tính cmds/day |
|---|---|---|---|
| AI Rec cache | `rec:{userId}:{placement}` | 10 min | ~500-1,000 |
| Feature store | `features:user:{id}` | 2h | ~200-500 |
| BullMQ (email) | `bull:email-queue:*` | Managed | ~200-500 |
| Fallback popular | `fallback:popular:{placement}` | 1h | ~50-100 |
| **Tổng ước tính** | | | **~1,000-2,100** |

> **Giải thích tại sao giảm từ 7 xuống 3 use cases chính:**
>
> | Use case cũ | Chuyển sang | Lý do |
> |---|---|---|
> | Sessions (`sess:*`) | MongoDB collection `sessions` + JWT-only | Tiết kiệm ~300+ cmds/day; MongoDB TTL index tự cleanup |
> | Product cache (`product:*`) | `node-cache` (in-memory NestJS) | Tiết kiệm ~500+ cmds/day; TTL 5min; đủ cho single instance |
> | Category cache (`cat:*`) | `node-cache` (in-memory NestJS) | Ít categories, ít thay đổi → in-memory cache đủ |
> | Rate limiting (`rl:*`) | `@nestjs/throttler` memory store | Default behavior, không cần Redis; đủ cho single instance |
> | Redis Streams | Direct MongoDB async write | Tiết kiệm ~500+ cmds/day; scale demo không cần buffering |

**Upstash vs self-hosted Redis:**
- Upstash: serverless, free 10k cmd/day, không cần manage Redis server, HTTP REST API (phù hợp Render.com)
- Self-hosted: free nhưng cần 1 server slot trên Render (đã dùng cho NestJS và FastAPI)
- Với chiến lược tối ưu trên, **~2,000 cmds/day << 10,000 limit** — an toàn ngay cả khi demo đông người

---

### 6.3 Search Engine — MongoDB Atlas Search (thay Meilisearch)

| Thuộc Tính | Giá Trị |
|---|---|
| **Version** | MongoDB 7.x Atlas Search |
| **Hosting** | Included free trong MongoDB Atlas M0 |
| **Latency** | ~100-150ms (trong NFR target p95 < 300ms) |

**Tại sao chuyển từ Meilisearch sang Atlas Search:**
- **Giảm 1 external service** → giảm complexity, giảm số API keys cần quản lý
- Atlas Search **included free** trong M0 — không cần thêm account hay cấu hình riêng
- Data đã ở MongoDB → **không cần sync pipeline** (bỏ `search-sync-queue` khỏi BullMQ)
- Latency ~100-150ms vẫn tốt cho NFR target (p95 < 300ms)
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

**Tại sao KHÔNG chọn:**
- **Meilisearch Cloud:** Latency tốt hơn (~30ms) nhưng thêm 1 service + cần sync pipeline (BullMQ queue) → tốn thêm Redis commands trên Upstash 10k/day limit
- **Elasticsearch:** Free tier không tồn tại; self-host cần 2GB RAM minimum
- **Typesense Cloud:** Free tier chỉ 10k documents

### 6.4 Behavioral Event Ingestion — Direct MongoDB (thay Redis Streams)

Không cần message broker riêng cho behavioral events:
- **Scale demo:** ~20-100 events/phút — MongoDB `insertOne` async dư sức
- **Tiết kiệm Redis commands:** XADD + XREADGROUP + XACK = ~3 cmds/batch → tiết kiệm ~500+ cmds/day
- **Giảm complexity:** Bỏ Celery consumer, bỏ Redis Streams config
- **Đủ cho ML training:** GitHub Actions cron query trực tiếp MongoDB `behavioral_events` collection

---

## 7. Infrastructure & DevOps

### 7.1 Tổng Quan — $0/month, 100% Free Tier

| Service | Provider | Free Tier | Giới Hạn Cần Biết |
|---|---|---|---|
| Frontend (Next.js) | **Vercel** | 100GB bandwidth, unlimited SSR | — |
| API Server (NestJS) | **Render.com** | 750 hrs/month, 512MB RAM | Spin-down 15 min idle |
| AI Service (FastAPI) | **Render.com** | 750 hrs/month, 512MB RAM | Spin-down 15 min idle; ~270MB used |
| Primary DB + Search | **MongoDB Atlas M0** | 512MB, no expiry, Atlas Search included | Shared cluster, không replica set |
| Cache + Queue | **Upstash Redis** | 10k commands/day, 256MB | Chỉ dùng ~2k cmds/day (đã tối ưu) |
| Object Storage | **Cloudflare R2** | 10GB, 10M reads/month | — |
| CDN + SSL + DDoS | **Cloudflare** | Always free | — |
| CI/CD | **GitHub Actions** | 2,000 min/month | — |
| Error Tracking | **Sentry** | 5k events/month | — |
| Email | **Resend** | 3,000 emails/month | — |
| Payment | **VNPay sandbox** | Free (sandbox mode) | Không real money |
| Push Notification | **Web Push VAPID** | Self-hosted | $0 |
| ML Training | **GitHub Actions** | (shared with CI/CD) ~450 min/month | Daily 02:00 ICT |
| Uptime monitoring | **UptimeRobot** | 50 monitors, 5-min interval | Workaround Render spin-down |
| **TOTAL** | | | **$0/month** |

**Render.com spin-down workaround:**
UptimeRobot (free) ping `GET /health` mỗi 5 phút → service không bao giờ sleep trong giờ demo.

---

### 7.2 Deployment Environments

| Environment | Stack | Khi Nào |
|---|---|---|
| **Local Dev** | Docker Compose full stack | Sprint 1-3 (development) |
| **Cloud Demo** | Vercel + Render + Atlas | Sprint 4 (trước khi bảo vệ) |

---

### 7.3 Docker Compose (Local Dev)

```yaml
# docker-compose.yml — services:
services:
  mongodb:       # mongo:7 — port 27017
  redis:         # redis:7-alpine — port 6379
  nestjs:        # custom Dockerfile, hot-reload với ts-node-dev
  nextjs:        # custom Dockerfile, next dev
  fastapi:       # custom Dockerfile, uvicorn --reload
```

> **Đã bỏ:** `meilisearch` (dùng MongoDB Atlas Search), `celery` (dùng GitHub Actions cron)

**Multi-stage Dockerfiles:**
- `nestjs/Dockerfile`: `node:20-alpine` base → `npm ci` → `tsc build` → copy `dist/` → production image
- `fastapi/Dockerfile`: `python:3.11-slim` → pip layer (cached) → copy src → uvicorn

---

### 7.4 CI/CD — GitHub Actions (3 workflows)

```
ci.yml              (trigger: pull_request → any branch)
  ├── lint:          ESLint + Prettier check (NestJS + Next.js)
  ├── typecheck:     tsc --noEmit
  ├── test-unit:     Jest (NestJS) + pytest (FastAPI)
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

| Tool | Mục Đích | Metrics Quan Trọng |
|---|---|---|
| **Sentry** (free) | Exception tracking FE + BE | Error rate, source maps, stack traces |
| **Admin Dashboard** (in-app) | AI performance + business metrics | AI CTR (FR-REC-02), revenue, orders, cache hit rate |
| **Render.com dashboard** | Container health, deploy logs | CPU, memory, request count |
| **UptimeRobot** (free) | Availability monitoring | Uptime %, response time |

**In-app Admin Dashboard (thay Grafana Cloud):**
- Tích hợp trực tiếp trong AnalyticsModule → admin UI
- Data source: MongoDB aggregation pipeline trực tiếp
- Giảm 1 external service, dữ liệu realtime hơn

---

## 8. Third-Party Services

### 8.1 Payment — VNPay (sandbox only)

| Thuộc Tính | Chi Tiết |
|---|---|
| **Primary** | VNPay QR + ATM card (FR-CART-05) |
| **Architecture** | `IPaymentGateway` interface → `VNPayAdapter` (extensible cho Momo sau nếu cần) |
| **Phase 1** | Sandbox mode — không real money |
| **Webhook** | Signed HMAC-SHA512 callback → verify + update order status |

**Tại sao chỉ VNPay (bỏ Momo Phase 1):**
- VNPay đã cover QR + ATM + Internet Banking → đủ cho demo
- Thêm Momo = thêm 1 adapter + 1 sandbox account + webhook config → phức tạp không cần thiết
- `IPaymentGateway` interface cho phép thêm `MomoAdapter` sau mà không cần refactor

**Tại sao KHÔNG Stripe:** Không support VN cards; thẻ Visa quốc tế không phổ biến với target users VN.

---

### 8.2 Email — Resend

| Thuộc Tính | Chi Tiết |
|---|---|
| **Free tier** | 3,000 emails/month |
| **Templates** | React Email — JSX component → HTML email |
| **Use cases** | Order confirmation, shipping update, password reset, marketing campaigns |
| **Bounce handling** | Resend webhook → update `users.emailStatus` |

---

### 8.3 Push Notifications — Web Push VAPID

- Self-hosted, $0 — NestJS gửi trực tiếp tới browser
- `web-push` npm package
- Use cases: order status update (FR-NOTIF-03), price drop alert, cart abandonment reminder

---

### 8.4 SMS — Đã Loại Bỏ (Phase 1)

SMS (ESMS.vn) bị loại hoàn toàn khỏi Phase 1. Lý do: tính phí per-SMS, không có free tier. Email + Web Push đủ để cover FR-NOTIF-*.

---

### 8.5 Address — Static JSON (Bỏ Goong.io)

- Dùng `provinces-api` static JSON cho province/district/ward dropdowns — **không cần API call, $0**
- Giảm 1 external service dependency
- User nhập địa chỉ chi tiết (đường/số nhà) thủ công — đủ cho e-commerce demo
- Nếu cần autocomplete sau: thêm Goong.io adapter (200k calls/month free)

---

## 9. Decision Matrix — 3 Quyết Định Khó Nhất

### Decision 1 — Backend Framework

**Bối cảnh:** Team TypeScript/Node.js. Cần structure cho ~40 FRs. 16 tuần. Solo developer.

| Framework | Team Fit (30%) | Code Structure (30%) | Ecosystem (20%) | Performance (10%) | Learning Curve (10%) | **Tổng** |
|---|---|---|---|---|---|---|
| **NestJS 10** | 8 | **10** | 9 | 7 | 6 | **8.3** |
| Express 5 | 9 | 4 | 10 | 9 | 9 | 7.4 |
| Fastify 4 | 7 | 5 | 7 | 10 | 7 | 6.5 |
| Hono 4 | 5 | 4 | 5 | 10 | 6 | 5.2 |

**Verdict:** NestJS — DI + Module system = cấu trúc rõ ràng cho ~40 FRs, team không cần thoả thuận về architecture conventions.

---

### Decision 2 — Primary Database

**Bối cảnh:** Budget $0. Product catalog flexible attributes. E-commerce document model. Solo dev không muốn manage migrations.

| Database | Free Tier Forever (35%) | Schema Flexibility (25%) | Query Power (20%) | Team Familiarity (10%) | VN Latency (10%) | **Tổng** |
|---|---|---|---|---|---|---|
| **MongoDB Atlas M0** | **10** | **10** | 8 | 7 | 9 | **9.0** |
| PostgreSQL (Neon free) | 6 | 4 | 10 | 5 | 8 | 6.3 |
| Firebase Firestore | 7 | 8 | 4 | 6 | 9 | 6.6 |
| MySQL (PlanetScale free) | 5 | 4 | 8 | 5 | 8 | 5.6 |

**Verdict:** MongoDB Atlas M0 — free forever, flexible schema tự nhiên cho e-commerce catalog, Mongoose familiar với JS team.

*(Note: PlanetScale đã ngừng free tier từ 2024. Neon PostgreSQL free tier tồn tại nhưng có inactivity pause.)*

---

### Decision 3 — Frontend Rendering Strategy

**Bối cảnh:** AI recommendation homepage (per-user, cannot be static). SEO critical cho category/product pages. $0 hosting.

| Approach | SEO (30%) | AI Personalization (25%) | Dev Speed (20%) | Hosting Cost (15%) | Performance (10%) | **Tổng** |
|---|---|---|---|---|---|---|
| **Next.js 15 Hybrid** | **10** | **10** | 8 | 7 | 8 | **9.05** |
| Remix (SSR only) | 8 | 9 | 7 | 7 | 9 | 8.0 |
| Nuxt.js 3 (SSR/SSG) | 9 | 9 | 5 | 7 | 8 | 7.5 |
| Vite SPA (CSR only) | 3 | 10 | 9 | 9 | 7 | 6.6 |
| Astro (islands) | 8 | 5 | 6 | 9 | 10 | 7.1 |

**Verdict:** Next.js 15 — hybrid rendering là unique selling point: static catalog (SEO) + dynamic homepage (AI rec) + CSR cart (interactivity) trong cùng 1 codebase. Vercel free tier = best Next.js hosting.

---

## 10. Cost Estimate

### Phase 1 (MVP Demo) — $0/month

| Service | Provider | Tier | USD/month |
|---|---|---|---|
| Frontend (Next.js SSR/SSG/ISR) | Vercel | Free | $0 |
| API Server (NestJS REST) | Render.com | Free (750 hrs) | $0 |
| AI Service (FastAPI — no Celery) | Render.com | Free (750 hrs) | $0 |
| Primary Database + Search | MongoDB Atlas M0 | Free (512MB, Atlas Search included) | $0 |
| Cache + Queue (Redis) | Upstash | Free (10k cmd/day, ~2k used) | $0 |
| Object Storage (images + models) | Cloudflare R2 | Free (10GB, 10M reads) | $0 |
| CDN + DDoS + SSL | Cloudflare | Free | $0 |
| CI/CD | GitHub Actions | Free (2k min/month) | $0 |
| Error Tracking | Sentry | Free (5k events/month) | $0 |
| Email (transactional + marketing) | Resend | Free (3k/month) | $0 |
| Payment Gateway | VNPay | Free (sandbox) | $0 |
| Push Notification | Web Push VAPID | Self-hosted | $0 |
| ML Training | GitHub Actions cron | Free (shared w/ CI, ~450 min/month) | $0 |
| Uptime Monitor | UptimeRobot | Free | $0 |
| **TOTAL** | | | **$0/month** |

### Giới Hạn Free Tier Cần Lưu Ý

| Service | Giới Hạn | Nguy Cơ | Mitigation |
|---|---|---|---|
| Render.com | Spin-down 15 min idle | Demo bị cold start | UptimeRobot ping mỗi 5 min |
| MongoDB Atlas M0 | 512MB storage | Overflow nếu > 50k orders + full behavioral events | Purge behavioral_events > 90 days cũ |
| Upstash Redis | 10k cmd/day | Chỉ dùng ~2k/day (đã tối ưu: chỉ AI cache + feature store + email queue) | Monitor via Upstash dashboard |

### Nếu Cần Scale Sau Graduation

| Scenario | Stack Thay Đổi | Chi Phí Ước Tính |
|---|---|---|
| Production (1k users/day) | Render Starter ($7) + Atlas M10 ($57) + Upstash Pay-as-you-go | ~$70/month |
| Self-host trên VPS | $10-20/month VPS + MongoDB Community (free) + Redis OSS (free) | ~$15/month |
| Enterprise scale | AWS ECS + DocumentDB + ElastiCache + CloudSearch | ~$200-500/month |

---

## 11. Security Mapping

| NFR / Threat | Implementation | Công Nghệ |
|---|---|---|
| Authentication | JWT access token (15 min) + refresh token HTTP-only cookie (7 days) | `@nestjs/jwt`, `cookie-parser` |
| Password storage | bcrypt, cost factor 12 | `bcryptjs` |
| NoSQL injection | Mongoose schema validation; whitelist `$` operators; no raw `$where` | Mongoose 8.x |
| XSS | React automatic HTML escaping; CSP headers via Next.js `headers()` config | Next.js 15 |
| CSRF | SameSite=Strict cookie; CSRF token cho state-changing mutations | Custom NestJS Guard |
| Rate limiting | `@nestjs/throttler` memory store (default, single instance đủ dùng) | `@nestjs/throttler` |
| RBAC | `@Roles()` decorator + `RolesGuard` in NestJS; roles: `buyer`, `staff`, `admin` | NestJS Guards |
| HTTPS / TLS | Cloudflare TLS termination (TLS 1.2+, HSTS) | Cloudflare |
| Audit log immutability | MongoDB `audit_logs` collection — app service account chỉ có insert permission | MongoDB Atlas role |
| Secrets management | Environment variables, không commit `.env` — `.env.example` chỉ có key names | GitHub Actions secrets |
| Dependency scanning | `npm audit` + Dependabot alerts trong CI | GitHub |

---

## 12. Sprint Alignment

| Sprint | Tuần | Tech Được Giới Thiệu |
|---|---|---|
| **Sprint 1** | 1–4 | Docker Compose setup (MongoDB + Redis + NestJS + Next.js + FastAPI); MongoDB Atlas M0 + Mongoose schemas; NestJS modules scaffold (Auth, Catalog, Cart); Next.js App Router setup; Cloudflare R2 + CDN; GitHub Actions CI |
| **Sprint 2** | 5–8 | Order module + VNPay sandbox; BullMQ email queue + Resend; Atlas Search setup; Web Push VAPID; Admin Dashboard cơ bản; CD pipeline (Render + Vercel staging) |
| **Sprint 3** | 9–12 | FastAPI AI service bootstrap; LightFM training pipeline (GitHub Actions cron); Feature store 2-tier (Redis + MongoDB); TF-IDF CBF similarity matrix; Behavioral event ingestion (direct MongoDB); RFM segmentation (MongoDB aggregation) |
| **Sprint 4** | 13–16 | Hybrid recommendation scoring (α tuning); Marketing campaign MVP; Sentry error tracking; Performance tuning; Demo environment prep; Documentation final |

---

## 13. Glossary

| Thuật Ngữ | Định Nghĩa |
|---|---|
| **ALS** | Alternating Least Squares — thuật toán Matrix Factorization cho Collaborative Filtering |
| **BPR** | Bayesian Personalized Ranking — loss function trong LightFM |
| **CBF** | Content-Based Filtering — gợi ý dựa trên thuộc tính sản phẩm |
| **CF** | Collaborative Filtering — gợi ý dựa trên hành vi tập thể người dùng |
| **CSR** | Client-Side Rendering — render HTML trong browser bằng JavaScript |
| **DI** | Dependency Injection — design pattern inject dependencies thay vì khởi tạo trực tiếp |
| **ISR** | Incremental Static Regeneration — Next.js pattern: static page rebuild theo interval |
| **LLM** | Large Language Model — mô hình ngôn ngữ lớn (Gemini, GPT, Claude...) |
| **ODM** | Object Document Mapper — tương tự ORM nhưng cho NoSQL document DB (Mongoose) |
| **RBAC** | Role-Based Access Control — kiểm soát truy cập theo vai trò (buyer/staff/admin) |
| **RFM** | Recency-Frequency-Monetary — phương pháp phân khúc khách hàng theo giá trị |
| **SSG** | Static Site Generation — pre-render HTML tại build time |
| **SSR** | Server-Side Rendering — render HTML trên server theo từng request |
| **VAPID** | Voluntary Application Server Identification — chuẩn xác thực Web Push |
| **WARP** | Weighted Approximate-Rank Pairwise — loss function LightFM tối ưu cho top-N recommendation |

---

*TECH_STACK.md — v1.0.0 — 2026-03-24*
*Tài liệu này là Bước 2/5 trong workflow thiết kế hệ thống. Bước tiếp theo: `docs/SYSTEM_DESIGN.md`*
