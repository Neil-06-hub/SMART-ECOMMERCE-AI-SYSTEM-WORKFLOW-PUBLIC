# AI Layer Architecture — SMART ECOMMERCE Vibe Coding System
**Version:** 1.0.0 | **Date:** 2026-04-04

This document describes the AI orchestration layer for the SMART-ECOMMERCE AI SYSTEM development workflow. The system consists of 4 layers, 10 specialized Skill Agents, and context-window protection patterns.

---

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATION LAYER                          │
│  CLAUDE.md (always loaded) — project constraints + routing       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ routes to
┌──────────────────────────▼──────────────────────────────────────┐
│                      SKILL AGENT LAYER                           │
│  10 .md files in .claude/commands/                               │
│  Each Agent deeply understands one domain, reads its docs first  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ uses
┌──────────────────────────▼──────────────────────────────────────┐
│                     TOOL ROUTING LAYER                           │
│  Bash (build/validate) · FileSystem (read/write) · Browser (test)│
└──────────────────────────┬──────────────────────────────────────┘
                           │ protected by
┌──────────────────────────▼──────────────────────────────────────┐
│                    SELF-HEALING LAYER                            │
│  tsc --noEmit · eslint · jest · mypy · pytest · auto-fix loop    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer 1 — Context Management

### Problem
The context window is finite. Loading all 5 design docs + all generated code on every request would exhaust it immediately. The system must be surgically selective.

### 3-Tier Context Loading Strategy

| Tier | When | Content |
|---|---|---|
| **Tier 0** | Every session | `CLAUDE.md`: project status, 9 module names, key constraints, import aliases (`@modules/*`, `@shared/*`, `@config/*`, `@lib/*`), EventEmitter2 rule, soft-delete rule, Redis 10k/day limit |
| **Tier 1** | By task type — loaded when skill is invoked | `architect` → `ARCHITECTURE.md` ADRs; `backend` → `MODULE_STRUCTURE.md §4.x`; `database` → `DATABASE_DESIGN.md §3.x`; `ML/AI` → `ARCHITECTURE.md §4`; `frontend` → web/ directory tree |
| **Tier 2** | Incremental — loaded as needed during generation | Read a similar existing file before writing; read `error-codes.ts` before any error handling; read `base.repository.ts` before every new repository |

### Context Window Protection Rules
1. When exploring an unknown module → spawn a subagent; never read 10 files sequentially in the main context
2. When a task spans multiple modules → decompose into subtasks, solve one module per turn
3. Main agent holds the plan; subagents hold the implementation details

---

## Layer 2 — Project Scanner (Task-to-File Routing)

Mapping from task category → docs to read + code to scan:

| Task Category | Primary Docs | Code to Scan | Secondary Checks |
|---|---|---|---|
| Auth feature | `MODULE_STRUCTURE §4.1`, `API_SPEC §3.1` | `modules/auth/` | `error-codes.ts` (AUTH_*) |
| Catalog feature | `MODULE_STRUCTURE §4.2`, `DATABASE_DESIGN §3.2` | `modules/catalog/` | `redis-keys.ts` (product:*) |
| Cart feature | `MODULE_STRUCTURE §4.3`, `DATABASE_DESIGN §3.5-3.7` | `modules/cart/` | CatalogModule exports |
| Order feature | `MODULE_STRUCTURE §4.4`, `ARCHITECTURE §3.4` FSM | `modules/order/` | EventEmitter2 events table |
| Payment feature | `MODULE_STRUCTURE §4.5` | `modules/payment/` | VNPay HMAC, idempotency keys |
| Recommendation | `ARCHITECTURE §4.2` flow + `§4.3` circuit breaker | `modules/recommendation/`, `ai-service/routers/` | Redis feature store keys |
| ML Training | `ARCHITECTURE §4.4` pipeline, `TECH_STACK §5` | `ai-service/ml/`, `scripts/train_pipeline.py` | `.github/workflows/ml-training.yml` |
| Frontend page | `MODULE_STRUCTURE §1` web/ tree | `apps/web/app/(shop)/` or `(admin)/` | Zustand stores, TanStack Query hooks |
| New Express.js module | `MODULE_STRUCTURE §2` template + `§7` naming | `modules/auth/` (reference) | `MODULE_STRUCTURE §3` dependency map |
| Database schema | `DATABASE_DESIGN §3.x`, `§4` indexes | `shared/database/base.schema.ts` | `DATABASE_DESIGN §5` conventions |
| Redis usage | `DATABASE_DESIGN §6`, `ARCHITECTURE §4.5` | `shared/redis/redis.service.ts` | `libs/shared/src/constants/redis-keys.ts` |
| GitHub Actions | `TECH_STACK §7` DevOps, `ARCHITECTURE §4.4` | `.github/workflows/` | Render deploy hooks |
| Security/Guards | `ARCHITECTURE §6`, `MODULE_STRUCTURE §4.1` | `shared/guards/` | RBAC matrix |
| Error handling | `ARCHITECTURE §5.3` error codes | `libs/shared/src/constants/error-codes.ts` | `shared/filters/global-exception.filter.ts` |

---

## Layer 3 — Tool Routing

### Terminal (Bash) — Build & Validate

Run after writing any TypeScript file:
```bash
# TypeScript check — from apps/api/
cd apps/api && npx tsc --noEmit

# Lint
npm run lint -- --max-warnings 0
npm run lint -- --fix              # auto-fix first

# Unit tests — target single module
npm run test -- --testPathPattern={moduleName} --passWithNoTests

# Python check — from apps/ai-service/
cd apps/ai-service && python -m mypy app/ --ignore-missing-imports
pytest tests/ -x --tb=short
```

**Never use Bash to explore code** — use Read/Grep/Glob tools instead.

### File System — Code Generation

**Write order within a Express.js module (dependency order):**
```
schemas/      → @Schema() definition — no dependencies
interfaces/   → pure TypeScript types — depends on schemas
repositories/ → depends on schemas + BaseRepository
services/     → depends on repositories + RedisService
controllers/  → depends on services + guards/decorators
*.module.ts   → wires everything together
dto/          → can be written at any point in parallel
```

**Read-before-write protocol:**
1. Read `docs/MODULE_STRUCTURE.md` for the target module's file list
2. Read a similar existing file (e.g., `auth.service.ts`) to learn patterns
3. Read `libs/shared/src/constants/error-codes.ts` before writing any error handling
4. Write the new file
5. Run `tsc --noEmit` to verify

### Browser/API — Smoke Testing

Use after a complete module is running:
```
GET  /health                                    → expect { status: 'ok' }
POST /api/v1/auth/register (valid payload)      → expect 201 + envelope
POST /api/v1/auth/login                         → expect 200 + accessToken + cookie
GET  /api/v1/recommendations?placement=homepage → verify source field
```

---

## Layer 4 — Self-Healing Loop

5-step automatic error correction after code generation:

```
Step 1 — TypeScript Check:
  npx tsc --noEmit 2>&1
  → Parse errors: file path + line + error code
  → Read failing file → Apply fix (import alias, type annotation, missing property)
  → Re-run — loop max 3 times
  → If still failing after 3 tries → report specific error to user

Step 2 — Lint Check:
  npm run lint -- --fix          (auto-fixable rules)
  npm run lint -- --max-warnings 0  (check remaining)
  → Manual fix for non-auto-fixable rules

Step 3 — Unit Tests:
  npm run test -- --testPathPattern={moduleName} --passWithNoTests
  → If test fails: read test file + read implementation → reconcile
  → If no test file: generate minimal test alongside the implementation

Step 4 — Python Check (for FastAPI):
  python -m mypy app/ --ignore-missing-imports
  pytest tests/ -x --tb=short
  → Parse traceback → read relevant file → fix

Step 5 — Redis Budget Guard:
  Grep all getOrSet() calls vs direct get()/set() calls
  Flag any Redis call inside a loop (e.g., items.map() with redis.get())
  Suggest batch MGET pattern if loop detected
```

---

## Subagent Patterns — Context Window Protection

### Pattern A — Module Discovery Subagent
**When to use:** Asked "what does module X do?" or need to understand an unknown module.

**How it works:**
1. Spawn subagent that reads `MODULE_STRUCTURE.md §4.x` for the target module
2. Subagent reads all files in `apps/api/src/modules/{module}/`
3. Subagent returns a ~200-token structured summary: exports, events emitted/listened, Redis keys, error codes
4. Main agent receives the summary instead of reading 8 files directly

### Pattern B — Impact Analysis Subagent
**When to use:** Before modifying a shared file (e.g., `base.repository.ts`, `error-codes.ts`).

**How it works:**
1. Spawn subagent that greps all files importing that path
2. Subagent identifies all affected call sites
3. Subagent returns a change-impact list
4. Main agent decides whether the change is safe

### Pattern C — Cross-Module Event Tracing Subagent
**When to use:** Debugging "why was event X not handled?"

**How it works:**
1. Spawn subagent that reads `ARCHITECTURE.md §3.5` (cross-module event table)
2. Subagent reads event class definition + module listeners
3. Subagent traces the EventEmitter2 binding
4. Subagent returns a diagnosis without polluting the main context

---

## Skill Agents — Routing Guide

| Command | When to invoke |
|---|---|
| `/architect` | Create a new module, add cross-module imports, validate circular dependencies |
| `/backend-express` | Scaffold Express.js module, generate endpoint, DTO, repository method |
| `/frontend-nextjs` | Build Next.js page, component, TanStack Query hook |
| `/ai-ml-engineer` | FastAPI routes, LightFM training, feature store, circuit breaker |
| `/database-manager` | MongoDB schema, index design, Redis key pattern, aggregation pipeline |
| `/api-contract` | Validate endpoint vs API_SPECIFICATIONS.md, generate DTOs |
| `/devops-ci` | GitHub Actions workflow, Docker Compose, Render deployment |
| `/security-guard` | JWT pattern, RBAC guards, bcrypt, VNPay webhook, OWASP review |
| `/test-engineer` | Jest unit tests, e2e specs, pytest for FastAPI |
| `/code-reviewer` | Final review, fix TypeScript errors, Redis quota audit |

### Standard Feature Development Workflow
```
1. /architect        → validate approach, check module boundaries
2. /database-manager → design schema + indexes + Redis keys
3. /backend-express   → scaffold module files (schema→repo→service→controller)
4. /api-contract     → validate endpoints match API_SPECIFICATIONS.md
5. /security-guard   → auth guards, RBAC, security review
6. /test-engineer    → generate unit + e2e tests
7. /code-reviewer    → final self-healing + quality gate
```

---

## Non-Negotiable Constraints

| Constraint | Rule |
|---|---|
| Import aliases | `@modules/*`, `@shared/*`, `@config/*`, `@lib/*` — no relative paths crossing module boundaries |
| Soft-delete | `{ deletedAt: null }` in EVERY MongoDB query (except append-only collections) |
| Currency | `Number` (integer VND) — never `Decimal128` or `string` |
| Error codes | Always from `libs/shared/src/constants/error-codes.ts` — never raw inline strings |
| Redis budget | 10,000 cmd/day → use `getOrSet()` pattern, never call Redis inside a loop |
| Cross-module comms | EventEmitter2 only — never inject another module's service directly |
| Response envelope | `ResponseInterceptor` handles wrapping — controllers return raw data only |
| `audit_logs` | INSERT-ONLY — Atlas app service account has no UPDATE/DELETE permission |
| `behavioral_events` | TTL 90 days — never query beyond this window |
| FastAPI | ML inference only — no business logic lives there |
| `/health` endpoint | No DB call — return only `{ status: 'ok', uptime: number }` |

---

*v1.0.0 — Generated from analysis of docs/REQUIREMENTS.md, docs/ARCHITECTURE.md, docs/MODULE_STRUCTURE.md, docs/DATABASE_DESIGN.md, docs/API_SPECIFICATIONS.md, docs/TECH_STACK.md*
