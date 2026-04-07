# HANDOFF NOTES — Vibe Coding AI System
**Session:** 2026-04-03
**Status:** Plan complete — awaiting execution after token limit reset
**Resumption:** Read this file first, then execute Section 4 in order.

---

## 1. What Was Requested

User muốn xây dựng một "Layer AI Vibe Coding" hoàn chỉnh cho dự án, bao gồm:

- **Phần 1:** Tài liệu kiến trúc Layer AI (cách quản lý context, scan code, kết nối tools)
- **Phần 2:** 10 Skill Agent files (`.claude/commands/*.md`) — mỗi Agent chuyên biệt một domain
- **Phần 3:** Tích hợp vào workflow thực tế (cập nhật `CLAUDE.md`, hướng dẫn sử dụng)

**Nguồn tham khảo đã được phân tích:**
- `docs/REQUIREMENTS.md`, `docs/TECH_STACK.md`, `docs/MODULE_STRUCTURE.md`
- `docs/DATABASE_DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/API_SPECIFICATIONS.md`

---

## 2. Architecture Design — Layer AI (4 tầng)

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                       │
│  CLAUDE.md (always loaded) + task-type router                │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    SKILL AGENT LAYER                         │
│  10 file .md trong .claude/commands/                         │
│  Mỗi file đọc docs cụ thể theo domain của nó                │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  TOOL ROUTING LAYER                          │
│  Bash (build/test) · FileSystem (read/write) · Browser(test) │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                 SELF-HEALING LAYER                           │
│  tsc --noEmit · eslint · jest · pytest · auto-fix loop       │
└─────────────────────────────────────────────────────────────┘
```

### Context Loading Strategy (3 tầng)

| Tier | Khi nào | Nội dung |
|---|---|---|
| **Tier 0** | Mọi session | CLAUDE.md: project status, 9 module names, constraints, import aliases, EventEmitter2 rule |
| **Tier 1** | Theo task type | architect→ARCHITECTURE.md ADRs; backend→MODULE_STRUCTURE.md §module; database→DATABASE_DESIGN.md §collection; ML→ARCHITECTURE.md §4 |
| **Tier 2** | Incremental khi cần | Đọc file tương tự trước khi viết; đọc error-codes.ts trước error handling; đọc base.repository.ts trước repository |

### Self-Healing Loop (5 bước)
```
1. npx tsc --noEmit         → parse lỗi → sửa → retry max 3 lần
2. npm run lint -- --fix    → auto-fix → manual remainder
3. npm run test -- --testPathPattern={mod}  → reconcile
4. python -m mypy + pytest -x              → Python files
5. Redis budget guard       → grep Redis trong loop → MGET thay thế
```

### Subagent Patterns (bảo vệ context window)
- **Pattern A:** Spawn subagent đọc toàn bộ module → trả 200-token summary
- **Pattern B:** Trước khi sửa shared file → subagent grep all callers
- **Pattern C:** Debug event flow → subagent trace EventEmitter2 binding

---

## 3. Skill Agents — Spec Summary

### Task-to-Skill Routing
| Task | Skill file |
|---|---|
| Tạo module mới, validate import, sửa module.ts | `architect.md` |
| Scaffold Express.js module/endpoint/DTO/repository | `backend-express.md` |
| Build Next.js page/component/TanStack hook | `frontend-nextjs.md` |
| ML pipeline, FastAPI, feature store, circuit breaker | `ai-ml-engineer.md` |
| MongoDB schema, indexes, Redis key patterns | `database-manager.md` |
| Validate endpoint vs API_SPEC, generate DTO | `api-contract.md` |
| GitHub Actions, Docker Compose, CI/CD, ML cron | `devops-ci.md` |
| JWT, RBAC, bcrypt, VNPay webhook, OWASP | `security-guard.md` |
| Jest unit, e2e spec, pytest FastAPI | `test-engineer.md` |
| Review, refactor, fix TypeScript, Redis quota | `code-reviewer.md` |

### Spec cho từng skill (đầy đủ):

#### architect.md
- **Trigger:** Tạo module mới, thêm import, thêm EventEmitter2 event, sửa app.module.ts
- **Context:** ARCHITECTURE.md §1+§8+§9 → MODULE_STRUCTURE.md §3 import matrix → app.module.ts
- **Output:** ADR validation, circular import analysis, Go/No-Go
- **Enforce:** Import matrix = luật; SharedModule không import manual; analytics/ READ-ONLY; FastAPI ML-only

#### backend-express.md
- **Trigger:** Scaffold module, generate endpoint, thêm repository method, tạo DTO
- **Context:** MODULE_STRUCTURE.md §2+§7 naming+§4.x → DATABASE_DESIGN §3.x → error-codes.ts → base.repository.ts → auth/ reference
- **Write order:** schemas/ → interfaces/ → repositories/ → services/ → controllers/ → *.module.ts → dto/
- **Output per file:**
  - `schemas/`: @Schema(), @Prop(), timestamps:true, deletedAt:null, SchemaFactory
  - `dto/`: class-validator, @ApiProperty(), PartialType() cho update
  - `interfaces/`: pure TypeScript only
  - `repositories/`: extends BaseRepository, { deletedAt: null } mọi query
  - `services/`: inject repository (không Model), error-codes constants, RedisService.getOrSet()
  - `controllers/`: @UseGuards, @Roles, trả raw data (không wrap envelope)
  - `*.module.ts`: imports match MODULE_STRUCTURE §3 matrix
- **Self-healing:** tsc → fix import aliases → remove direct Model → replace raw error strings

#### frontend-nextjs.md
- **Trigger:** Build Next.js page/component/hook
- **Context:** MODULE_STRUCTURE §1 web/ tree → API_SPEC §3.x
- **Rendering strategy (baked-in):**
  - Homepage → SSR (AI recs per-request)
  - Product detail → ISR revalidate=300
  - Category → SSG + ISR revalidate=3600
  - Search → SSR
  - Cart/Checkout/Admin → CSR ('use client')
- **Enforce:** API calls qua typed axios client; unwrap `{success,data,meta}`; Zustand = UI state only; Admin check STAFF/ADMIN server-side

#### ai-ml-engineer.md
- **Trigger:** apps/ai-service/, train model, feature store, circuit breaker
- **Context:** ARCHITECTURE.md §4 → TECH_STACK §5 → DATABASE_DESIGN §3.8-3.10 → redis-keys.ts
- **Training pipeline (7 bước):** fetch_features → train_CF (LightFM WARP) → evaluate (precision@10≥0.30, recall@10≥0.20) → promote_if_better → rebuild_CBF (TF-IDF) → upload R2 → POST /internal/reload-model → update model_versions
- **Circuit breaker:** timeout 500ms, errorThreshold 50%, reset 60s, fallback popularity
- **Feature store:** `features:user:{userId}` Hash, TTL 2h
- **Enforce:** behavioral_events max 90 ngày; R2 path `models/{type}/{YYYY-MM-DD}/`; /internal/reload-model cần INTERNAL_API_TOKEN; ML cron `0 19 * * *` UTC

#### database-manager.md
- **Trigger:** Thêm field, tạo index, design Redis cache, viết aggregation
- **Context:** DATABASE_DESIGN §3.x → §4 indexes → §5 conventions → §6 Redis → redis-keys.ts
- **15 collections biết đủ** với owner module tương ứng
- **Redis Budget (10k/day):** session ~500, product cache ~1200, rec cache ~3000, feature store ~1500, fallback ~300, rate limit ~2000, idempotency ~100, BullMQ ~400 = ~9000
- **Rules:** MGET thay loop; getOrSet() thay get()+set(); mọi key có TTL; dùng template functions từ redis-keys.ts
- **Enforce:** schemas/ không entities/; ObjectId auto; deletedAt trên all collections trừ append-only; audit_logs INSERT-ONLY; tiền = Number VND integer

#### api-contract.md
- **Trigger:** Sau khi viết controller, generate DTO, validate spec
- **Context:** API_SPEC §3.x → ARCHITECTURE §5 → error-codes.ts → api-response.type.ts
- **Checklist 12 items:** method, URL, auth, request shape, response shape, HTTP status, error codes, pagination, ObjectId serialization, no passwordHash, no deletedAt in response
- **Output:** DTO classes + @ApiProperty(), controller signature, error examples
- **Enforce:** ResponseInterceptor xử lý wrapping; POST /events trả 202 (không 201); GET /health ngoài /api/v1

#### devops-ci.md
- **Trigger:** Setup CI/CD, ML workflow, Docker, health check
- **Context:** TECH_STACK §7 → ARCHITECTURE §4.4+§7 → CLAUDE.md Commands
- **4 workflows:**
  - `ci.yml`: PR gate — lint + tsc + Jest + pytest
  - `cd-staging.yml`: push develop → Render + Vercel
  - `cd-production.yml`: push main → deploy all + health check
  - `ml-training.yml`: cron `0 19 * * *` UTC, timeout 30min
- **Docker:** 8 services (express, fastapi, nextjs, mongodb, redis, meilisearch, celery-worker, celery-beat)
- **Enforce:** actions/checkout@v4; không commit .env; ML cron `0 19 * * *`; /health < 500ms

#### security-guard.md
- **Trigger:** tasks trong auth/, payment webhook, security review, RBAC, PII handling
- **Context:** ARCHITECTURE §6 → MODULE_STRUCTURE §4.1+§4.5 → shared/guards/
- **JWT:** RS256, accessToken 15min, refreshToken = SHA-256(raw) Redis TTL 7d, HttpOnly+Secure cookie, rotation on refresh
- **RBAC 5 roles:** Super Admin, Product Manager, Marketing Manager, Data Analyst, Customer Support
- **Payment:** HMAC-SHA512 verify; idempotency `rl:{gw}:{txId}` TTL 24h
- **OWASP A01-A07 auto-check**
- **Self-healing:** HS256 → RS256; thiếu @UseGuards() → thêm; userId từ body → @CurrentUser(); bcrypt < 12 → tăng lên 12

#### test-engineer.md
- **Trigger:** Sau khi viết service/repository, "Write tests for...", CI failures
- **Context:** implementation file → MODULE_STRUCTURE §4.x → API_SPEC §3.x → error-codes.ts
- **3 loại test:**
  - Jest Unit: Test.createTestingModule(), mock repo+Redis+EventEmitter2, test happy path + not found + conflict + business rule
  - Jest E2E: mongodb-memory-server + ioredis-mock, seed beforeEach, clean afterEach
  - Pytest: TestClient, fakeredis, mongomock, mock LightFM
- **Enforce:** Unit tests = zero real network; error assertion check error code string; { deletedAt: null } verify; co-located spec files

#### code-reviewer.md
- **Trigger:** "Review this code", sau khi skill khác xong, tsc/lint fail, Redis quota gần hết
- **Context:** files đang review → ARCHITECTURE §9 ADRs → DATABASE_DESIGN §6 → error-codes.ts
- **Review checklist:** import aliases, no circular, service qua repository, no business logic trong controller, { deletedAt: null }, money là Number, getOrSet(), no Redis trong loop, envelope qua interceptor, no passwordHash
- **Performance:** MongoDB $match first + .lean(); MGET; numpy vectorized; ISR thay SSR
- **Self-healing loop:** tsc → lint:fix → test → mypy + pytest → report
- **Enforce:** Redis > 9000/day → flag; /health endpoint không có DB call

---

## 4. Execution Plan — Thứ tự tạo files

Thực thi theo thứ tự này (phụ thuộc nhau):

### Step 1: Tạo thư mục và file kiến trúc
```
Tạo: docs/AI_LAYER_ARCHITECTURE.md
  → Mô tả 4 tầng kiến trúc + subagent patterns + tool routing table
  → Task-to-File routing table (14 row)
  → Self-healing loop 5 bước
```

### Step 2: Tạo 10 Skill Agent files
```
Tạo: .claude/commands/ (tạo thư mục nếu chưa có)

Ưu tiên 1 (foundation):
  .claude/commands/backend-express.md
  .claude/commands/database-manager.md
  .claude/commands/code-reviewer.md

Ưu tiên 2 (core):
  .claude/commands/architect.md
  .claude/commands/api-contract.md
  .claude/commands/security-guard.md

Ưu tiên 3 (specialized):
  .claude/commands/test-engineer.md
  .claude/commands/ai-ml-engineer.md
  .claude/commands/frontend-nextjs.md
  .claude/commands/devops-ci.md
```

### Step 3: Cập nhật CLAUDE.md
```
Append section mới sau "Key Non-Obvious Constraints":

## AI Skill Agents

10 skill agents trong `.claude/commands/`. Gọi bằng `/command-name`.

| Task | Command |
|---|---|
| Validate architecture, module boundaries | `/architect` |
| Scaffold Express.js module/endpoint/DTO | `/backend-express` |
| Build Next.js page/component/hook | `/frontend-nextjs` |
| ML training, FastAPI, feature store | `/ai-ml-engineer` |
| MongoDB schema, indexes, Redis patterns | `/database-manager` |
| Validate API contracts, generate DTOs | `/api-contract` |
| GitHub Actions, Docker, CI/CD | `/devops-ci` |
| Security audit, JWT, RBAC, payment | `/security-guard` |
| Write unit/e2e/pytest tests | `/test-engineer` |
| Review, refactor, fix TypeScript errors | `/code-reviewer` |

**Workflow chuẩn cho mỗi feature:**
/architect → /database-manager → /backend-express → /api-contract → /security-guard → /test-engineer → /code-reviewer
```

---

## 5. Skill File Format (Claude Code standard)

Mỗi file `.claude/commands/*.md` dùng format:

```markdown
---
description: [Mô tả ngắn gọn khi nào invoke skill này - 1-2 câu]
---

# [Skill Name]

## Khi nào dùng skill này
[Danh sách triggers cụ thể]

## Context đọc đầu tiên
[Danh sách files cần đọc theo thứ tự, với lý do]

## Constraints bắt buộc
[Project-specific rules không được vi phạm]

## Quy trình thực hiện
[Step-by-step với output cụ thể cho từng bước]

## Self-healing
[Các lỗi thường gặp và cách tự sửa]

## Checklist trước khi hoàn thành
[Danh sách kiểm tra cuối]
```

---

## 6. Verification Tests

Sau khi tạo xong, test từng skill:

| Skill | Test prompt | Expected output |
|---|---|---|
| `backend-express` | "Scaffold the complete auth module" | files trong modules/auth/ với import aliases đúng, tsc clean |
| `architect` | "Can MarketingModule import from OrderModule?" | NO — propose EventEmitter2 event thay thế |
| `database-manager` | "Add wishlist to users collection" | @Prop() definition + compound index recommendation + Redis impact |
| `security-guard` | "Review [controller without @UseGuards]" | Flag missing guard + userId from body vulnerability |
| `api-contract` | "Validate auth endpoints vs API_SPEC §3.1" | Mismatches + corrected DTOs |
| `code-reviewer` | "Fix TypeScript errors in catalog module" | Parse tsc output + targeted fixes + 0 errors |
| `test-engineer` | "Write tests for CartService" | Jest unit với mock repo + e2e với in-memory MongoDB |
| `ai-ml-engineer` | "Circuit breaker trips every morning" | Diagnose Render cold start > 500ms timeout + fix |
| `frontend-nextjs` | "Build product detail page" | ISR revalidate=300 + TanStack Query hook + shadcn/ui |
| `devops-ci` | "Create ML training GitHub Actions workflow" | ml-training.yml với cron `0 19 * * *` + timeout 30min |

---

## 7. Key Files Reference

| File | Path |
|---|---|
| Project instructions | `CLAUDE.md` |
| Architecture | `docs/ARCHITECTURE.md` |
| Module structure | `docs/MODULE_STRUCTURE.md` |
| Database design | `docs/DATABASE_DESIGN.md` |
| API specifications | `docs/API_SPECIFICATIONS.md` |
| Tech stack | `docs/TECH_STACK.md` |
| Requirements | `docs/REQUIREMENTS.md` |
| Plan file | `.claude/plans/giggly-churning-pelican.md` (trong memory Claude) |

---

## 8. Critical Project Constraints (không được quên)

1. **Import aliases:** `@modules/*`, `@shared/*`, `@config/*`, `@lib/*` — không relative paths
2. **Soft-delete:** `{ deletedAt: null }` trên MỌI query (trừ append-only collections)
3. **Money:** `Number` (VND integer) — không `Decimal128`, không `string`
4. **Error codes:** luôn từ `libs/shared/src/constants/error-codes.ts`, không raw strings
5. **Redis:** 10,000 cmd/day limit → `getOrSet()` pattern, không Redis trong loop
6. **EventEmitter2:** giao tiếp cross-module — không inject service trực tiếp
7. **Response envelope:** `ResponseInterceptor` tự wrap — controller trả raw data
8. **audit_logs:** INSERT-ONLY — Atlas app service account không có UPDATE/DELETE permission
9. **behavioral_events:** TTL 90 ngày — không query quá window này
10. **FastAPI:** ML inference only — không business logic

---

_Handoff notes created: 2026-04-03 | Resume: Đọc file này, sau đó thực thi Section 4 theo thứ tự_
