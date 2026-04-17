# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Status

**Fully implemented** — All three deployable units are scaffolded and functional.

```
backend/           ← Express.js 4 + Node.js 20 (Render.com)  [JavaScript, not TypeScript]
apps/web/          ← Next.js 15 + React 18 (Vercel)
apps/ai-service/   ← FastAPI 0.111 + LightFM (Render.com)
```

Deployment configs: `docker-compose.yml`, `render.yaml`, `.github/workflows/`

---

## Design Documents

| Doc | What It Decides |
|---|---|
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | 62 FRs (Must/Should/Could), 7 business goals, 4 personas |
| [`docs/TECH_STACK.md`](docs/TECH_STACK.md) | Technology choices + rationale, $0/month free tier constraints |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System diagram, circuit breaker, RBAC, API envelope |
| [`docs/MODULE_STRUCTURE.md`](docs/MODULE_STRUCTURE.md) | Monorepo layout, module file lists, naming conventions |
| [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md) | 10 MongoDB collections, Mongoose schemas, index design |
| [`docs/AI_LAYER_ARCHITECTURE.md`](docs/AI_LAYER_ARCHITECTURE.md) | 4-layer AI system: data pipeline → training → inference → feedback |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | Phase-by-phase build order and verification checklist |

---

## Commands

### Express.js Backend (`backend/`)
```bash
npm run dev         # nodemon server.js — hot reload, port 5000
npm run start       # node server.js — production
npm run seed        # Reset DB + seed ALL data (products, users, behavioral events, feature snapshots)
npm run seed:ai     # Only seeds 05-behavior-history + 06-feature-snapshots (standalone)
```

### Next.js Frontend (`apps/web/`)
```bash
npm run dev         # localhost:3000
npm run build
npm run lint
```

### FastAPI AI Service (`apps/ai-service/`)
```bash
# Run inference server
python -m uvicorn app.main:app --reload --port 8000

# Run ML training pipeline (normally triggered by GitHub Actions)
python apps/ai-service/scripts/train_pipeline.py

# Tests
pytest apps/ai-service/tests/
```

### Local Full Stack (Docker Compose)
```bash
docker compose up -d                    # Start all 4 services
docker compose up -d mongodb            # Infrastructure only
docker compose logs -f backend          # Stream backend logs
docker compose down -v                  # Reset including volumes
```

### Database Seeding
```bash
cd backend
npm run seed          # Full seed: products → users → behavioral events → feature snapshots
npm run seed:ai       # Only AI seed data (05 + 06), requires products/users to already exist
```

---

## Architecture

### Deployable Units

```
Browser → Vercel (Next.js SSR/ISR/CSR)
        → Render.com: Express.js :5000 ──opossum──→ FastAPI :8000
                          │                              │
                      MongoDB Atlas M0           GitHub Actions cron
                      Cloudinary (images)        Cloudflare R2 (model PKLs)
                      Gmail SMTP (email)         MongoDB (model registry)
```

**No Redis, no Celery, no Meilisearch** — eliminated to stay within Render.com 512MB RAM limit and simplify deployment.

### Actual Directory Structure

```
backend/
├── server.js                      ← Express app entry (port 5000)
├── config/
│   ├── db.js                      ← Mongoose connect
│   └── cloudinary.js              ← Cloudinary SDK init
├── middleware/
│   ├── authMiddleware.js          ← protect (JWT verify), adminOnly (role check)
│   └── errorMiddleware.js         ← global error handler
├── models/                        ← 10 Mongoose schemas (JavaScript)
│   ├── User.js, Product.js, Order.js, Activity.js
│   ├── BehavioralEvent.js, FeatureSnapshot.js, ModelVersion.js
│   ├── DiscountCode.js, Notification.js, MarketingLog.js
├── controllers/                   ← 8 controllers
│   ├── auth.controller.js, product.controller.js, order.controller.js
│   ├── ai.controller.js           ← circuit breaker + BehavioralEvent tracking
│   ├── admin.controller.js, discount.controller.js
│   ├── wishlist.controller.js, notification.controller.js
├── routes/                        ← 9 route files
├── services/
│   ├── recommendation.service.js  ← Content-based fallback (MongoDB only)
│   ├── gemini.service.js          ← Google Gemini AI (email copy)
│   ├── email.service.js           ← Nodemailer Gmail SMTP
│   └── marketing.service.js       ← AI-generated campaign emails
├── jobs/
│   └── marketing.cron.js          ← Abandoned cart (hourly) + newsletter (weekly Mon)
└── seeds/
    ├── 05-behavior-history.js     ← exports seedBehavioralEvents()
    └── 06-feature-snapshots.js    ← exports seedFeatureSnapshots()

apps/ai-service/
├── app/
│   ├── main.py                    ← FastAPI app, lifespan startup (load model from R2)
│   ├── config.py                  ← pydantic-settings (env vars, alpha weights)
│   ├── dependencies.py            ← shared DI (ModelRegistry, MongoDB)
│   ├── api/
│   │   ├── recommend.py           ← POST /recommend (hybrid inference)
│   │   ├── features.py            ← POST /features/update
│   │   ├── internal.py            ← POST /internal/reload-model
│   │   └── health.py              ← GET /health
│   ├── ml/
│   │   ├── features.py            ← fetch_training_data() from MongoDB
│   │   ├── train_cf.py            ← LightFM WARP, 128 components, 50 epochs
│   │   ├── train_cbf.py           ← TF-IDF (5000 vocab) + category one-hot
│   │   ├── evaluate.py            ← precision@10, recall@10
│   │   └── hybrid.py              ← α×CF + (1-α)×CBF scoring
│   └── services/
│       ├── model_registry.py      ← in-memory singleton + asyncio.Lock hot-reload
│       ├── r2_client.py           ← boto3 S3-compat Cloudflare R2
│       └── mongo_client.py        ← Motor async MongoDB
└── scripts/
    └── train_pipeline.py          ← GitHub Actions entry point (daily 02:00 ICT)

apps/web/app/
├── (client)/
│   ├── page.jsx                   ← Home: ISR + AI recommendations
│   ├── shop/page.jsx              ← CSR: product catalog + filters
│   ├── products/[id]/page.jsx     ← ISR: product detail + similar items
│   ├── cart/page.jsx              ← CSR: cart + checkout
│   ├── checkout/page.jsx          ← CSR: payment
│   ├── orders/page.jsx, wishlist/page.jsx, profile/page.jsx, ai-suggest/page.jsx
│   └── client-page.jsx            ← shared client wrapper
└── admin/
    ├── dashboard/page.jsx, products/page.jsx, orders/page.jsx
    ├── users/page.jsx, discounts/page.jsx, marketing/page.jsx
```

### Route → Controller Map

| Route File | Prefix | Auth | Purpose |
|---|---|---|---|
| `auth.routes.js` | `/api/auth` | Public + Protected | register, login, getMe |
| `product.routes.js` | `/api/products` | Public read, Admin write | CRUD + reviews |
| `order.routes.js` | `/api/orders` | User required | create, list, cancel |
| `ai.routes.js` | `/api/ai` | Protected + Public track | recommendations + event tracking |
| `admin.routes.js` | `/api/admin` | Admin only | dashboard, analytics, users |
| `wishlist.routes.js` | `/api/wishlist` | User required | add/remove/list |
| `notification.routes.js` | `/api/notifications` | User required | list, mark read |
| `discount.routes.js` | `/api/admin/discounts` | Admin only | CRUD discount codes |
| `discount.public.routes.js` | `/api/discounts` | Public | validate discount code |

### AI Recommendation Flow

```
Browser → POST /api/ai/track (auth) or POST /api/ai/track-public (anon)
        → writes Activity + BehavioralEvent to MongoDB

GET /api/ai/recommendations
  → opossum circuit breaker (timeout: 500ms, resetTimeout: 60s, volumeThreshold: 5)
  → [CLOSED] POST http://fastapi:8000/recommend
      → hybrid.py: α×CF_scores + (1-α)×CBF_scores
      → α: homepage=0.7, pdp=0.3, cart=0.5, anonymous=0.0
  → [OPEN fallback] Product.find({ isActive: true, featured: true })
  → hydrate product details from MongoDB
```

### ML Training Pipeline (GitHub Actions daily 02:00 ICT)

```
.github/workflows/ml-training.yml (cron: 0 19 * * * UTC)
  → python apps/ai-service/scripts/train_pipeline.py
       Step 1: fetch_training_data() — behavioral_events last 90 days
       Step 2: train_cf() — LightFM WARP loss
       Step 3: evaluate() — precision@10, recall@10 (thresholds: ≥0.30, ≥0.20)
       Step 4: promote_if_better() — compare vs active model in modelversions
       Step 5: build_cbf_matrix() — TF-IDF + category/price one-hot
       Step 6: upload artifacts to Cloudflare R2 (.pkl files)
       Step 7: POST /internal/reload-model → hot-swap in FastAPI memory
       Step 8: write training_results.json (GitHub Actions artifact)
```

### Cold Start Handling

| Scenario | α (CF weight) | Behavior |
|---|---|---|
| Anonymous (no userId) | 0.0 | Pure CBF — popular items by category |
| New user (<5 events) | 0.2 | CBF-dominant |
| Active user (≥5 events) | placement α | Normal hybrid scoring |

---

## Key Non-Obvious Constraints

**Backend is JavaScript (not TypeScript):**
- Mongoose schemas in `models/` (not `schemas/` or `entities/`)
- No `tsconfig.json` in backend — plain Node.js with CommonJS `require()`
- Response format: `{ success: bool, data: any, message: string }` (no formal interceptor)

**MongoDB soft-delete:**
- Products: `isActive: true/false` (not `deletedAt`)
- Users, Orders: `deletedAt: Date | null`
- Always filter: `Product.find({ isActive: true })`

**Behavioral event tracking:**
- `POST /api/ai/track` (authenticated) — writes to both `Activity` (marketing) and `BehavioralEvent` (ML)
- `POST /api/ai/track-public` (anonymous) — writes to `BehavioralEvent` only
- Event weights: `view=1, click=1.5, add_to_cart=2, purchase=5, rec_click=1.5`
- TTL: 90 days on `behavioral_events` collection

**Seed order matters:**
```bash
node seed.js   # auto-calls: products → users → 05-behavior → 06-feature-snapshots
```
Seeds 05 and 06 must run AFTER products and users exist in MongoDB.

**Frontend:**
- UI library: Ant Design 5 (not shadcn/ui)
- State: Zustand (client) + TanStack Query v5 (server)
- Client URL patterns: Next.js App Router with `(client)` and `admin` route groups

**Circuit breaker config (ai.controller.js):**
```js
{ timeout: 500, errorThresholdPercentage: 50, resetTimeout: 60000, volumeThreshold: 5 }
```

**Render.com spin-down:** UptimeRobot should ping `/api/health` (Express) and `/health` (FastAPI) every 5min.

---

## AI Skill Agents

10 specialized skill agents in `.claude/commands/`. Invoke with `/command-name`.

| Task | Command |
|---|---|
| Validate architecture, module boundaries | `/architect` |
| Scaffold Express.js route/controller/service | `/backend-express` |
| Build Next.js page, TanStack Query hook | `/frontend-nextjs` |
| ML training, FastAPI routes, circuit breaker | `/ai-ml-engineer` |
| MongoDB schema, index, aggregation | `/database-manager` |
| Validate endpoints vs API_SPECIFICATIONS.md | `/api-contract` |
| GitHub Actions, Docker, Render/Vercel | `/devops-ci` |
| JWT, RBAC, bcrypt, security review | `/security-guard` |
| Jest unit tests, pytest | `/test-engineer` |
| Code review, Redis quota, lint | `/code-reviewer` |
