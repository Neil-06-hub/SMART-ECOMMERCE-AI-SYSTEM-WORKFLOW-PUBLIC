# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Status

This repository currently contains **design documentation only** — no application source code has been scaffolded yet. All docs live in `docs/`. The planned monorepo will have three deployable units:

```
apps/api/          ← NestJS 10 (Render.com)
apps/web/          ← Next.js 15 (Vercel)
apps/ai-service/   ← FastAPI 0.111 + Celery (Render.com)
libs/shared/       ← Shared TypeScript types + constants
infra/             ← docker-compose.yml, nginx config
scripts/           ← seed/, migrations/
```

---

## Design Documents

Read these before writing any code:

| Doc | What It Decides |
|---|---|
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | 62 FRs (Must/Should/Could), 7 business goals with targets, 4 personas |
| [`docs/TECH_STACK.md`](docs/TECH_STACK.md) | Every technology choice + why-not alternatives, $0/month free tier breakdown |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System diagram, 9 SPOFs, 3 ADRs, API response envelope, RBAC, circuit breaker |
| [`docs/MODULE_STRUCTURE.md`](docs/MODULE_STRUCTURE.md) | Exact monorepo tree, 9 NestJS module file lists, dependency rules, naming conventions, tsconfig aliases |
| [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md) | 14 MongoDB collections, full Mongoose schemas (TypeScript), 45 indexes, Redis key patterns, 5 query patterns |

---

## Commands

Once the codebase is scaffolded, the following commands apply.

### NestJS API (`apps/api/`)
```bash
npm run start:dev      # hot reload
npm run build          # tsc compile
npm run test           # Jest unit tests
npm run test:e2e       # e2e suite
npm run test -- --testPathPattern=auth   # single module tests
npm run lint
npx tsc --noEmit       # type check without build
```

### Next.js Frontend (`apps/web/`)
```bash
npm run dev
npm run build
npm run lint
```

### FastAPI AI Service (`apps/ai-service/`)
```bash
uvicorn main:app --reload --port 8000
celery -A tasks worker --loglevel=info
celery -A tasks beat --loglevel=info    # daily 02:00 ICT ML pipeline
pytest
pytest --cov=. --cov-report=html
```

### Local Full Stack (`infra/docker-compose.yml`)
```bash
docker compose up -d                         # all 8 services
docker compose up -d mongodb redis meilisearch   # infra only
docker compose logs -f nestjs
docker compose down -v                       # reset including volumes
```

### Database Seeding
```bash
npm run seed            # all 7 scripts in order (01→07)
npm run seed:ai         # only 05-behavior-history + 06-feature-snapshots (required for AI)
```

### Migrations
```bash
DRY_RUN=true npx ts-node scripts/migrations/YYYYMMDD_description.ts
npx ts-node scripts/migrations/YYYYMMDD_description.ts
```

---

## Architecture

### Two Deployable Units + One Frontend

```
Browser → Cloudflare → Vercel (Next.js SSR/SSG)
                     → Render.com: NestJS :3000 ──internal HTTP──→ FastAPI :8000
                                      │                                   │
                                  MongoDB Atlas M0              Celery Worker + Beat
                                  Upstash Redis 7
                                  Meilisearch Cloud
```

NestJS and FastAPI are the only two server processes. Everything else is a managed service. FastAPI is purely for ML inference and training — no business logic lives there.

### NestJS Module Boundaries

Nine feature modules, each owning its MongoDB collections and BullMQ queues:

| Module | Collections | Communicates With |
|---|---|---|
| `AuthModule` | `users` | exports `JwtAuthGuard`, `RolesGuard` |
| `CatalogModule` | `products`, `categories`, `reviews` | exports `ProductService` |
| `CartModule` | `carts` | imports `CatalogModule` |
| `OrderModule` | `orders` | imports `CartModule` |
| `PaymentModule` | — | imports `OrderModule` |
| `RecommendationModule` | `behavioral_events` | imports `CatalogModule` |
| `MarketingModule` | `campaigns`, `segments` | imports `NotificationModule` |
| `NotificationModule` | `push_subscriptions` | exports `NotificationService` |
| `AnalyticsModule` | `behavioral_events`, `feature_snapshots`, `model_versions` | read-only |

Cross-module async communication uses `EventEmitter2` exclusively (no direct service injection across modules). `SharedModule` is `@Global()` and provides DB, Redis, config, guards, and utils to all modules.

### AI Recommendation Flow

```
Browser event → POST /api/v1/events → Redis XADD behavioral:events (MAXLEN 50k)
             ← [batch every 5s/500 events] → Celery consumer → MongoDB bulk insert

GET /recommendations → NestJS RecommendationModule
  → opossum circuit breaker (500ms timeout)
  → [OPEN] FastAPI /recommend/{userId} (LightFM CF + sklearn CBF, α-weighted)
  → [CLOSED/fallback] Redis fallback:popular:{placement}
  → cache result in Redis rec:{userId}:{placement} TTL 10min
```

### ML Training Pipeline (daily 02:00 ICT via Celery Beat)
```
fetch_features_from_mongo → train_CF_model (LightFM ~10min) → evaluate
→ promote_if_better → rebuild_CBF_matrix → upload .pkl to Cloudflare R2
→ update model_versions collection → notify_health_endpoint
```

---

## Key Non-Obvious Constraints

**MongoDB only — no SQL.**
- `_id` is always `ObjectId` (auto). Never use UUID or auto-increment.
- Money fields are `Number` (integer VND, no decimals). No `Decimal128`.
- All deletes are soft: `deletedAt: Date | null`. Default queries always include `{ deletedAt: null }`.
- `audit_logs` is **INSERT-only**. The Atlas app service account has no update/delete permission on that collection.
- Schema files live in `schemas/` not `entities/`. Mongoose, not TypeORM.

**Module dependency rules (never violate):**
- No circular imports between modules.
- Async cross-module communication = `EventEmitter2` only. Never inject another module's service unless it's in the approved import list in `docs/MODULE_STRUCTURE.md` §3.
- `SharedModule` is global — never import it manually in feature modules.

**Free tier limits that affect code decisions:**
- Upstash Redis: 10,000 commands/day → use `getOrSet()` helper pattern; never call Redis in a loop.
- Meilisearch Cloud: 100,000 documents → only index `{ status: 'active' }` products.
- behavioral_events TTL index = 90 days → Celery job auto-purges; do not query beyond 90-day window.

**Import aliases in `apps/api/`:**
```typescript
@modules/*   → src/modules/*
@shared/*    → src/shared/*
@config/*    → src/shared/config/*
@lib/*       → libs/shared/src/*
```

**All API responses must use the standard envelope:**
```typescript
// Success:    { success: true,  data: T,   meta: { requestId } }
// Paginated:  { success: true,  data: T[], meta: { total, page, limit, totalPages } }
// Error:      { success: false, error: { code: string, message: string } }
```
Error codes are defined in `libs/shared/src/constants/error-codes.ts` — never use raw strings.

**Render.com spin-down:** Both NestJS and FastAPI sleep after 15min idle. UptimeRobot pings `GET /health` every 5 minutes in production to prevent this.
