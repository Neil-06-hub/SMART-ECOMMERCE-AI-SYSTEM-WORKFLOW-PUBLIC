---
description: Final quality gate for all generated code. Runs the self-healing loop (tsc → lint → jest → mypy → pytest), enforces all architectural constraints, checks Redis budget compliance, and auto-fixes common issues.
---

# Code Reviewer & Self-Healing Agent

## When to Use This Skill
- "Review this code"
- After any other skill finishes generating files
- When `tsc --noEmit` or `npm run lint` fails
- "Fix type errors in `[module]`"
- "Optimize the `[service/query]`"
- Before opening a PR
- When Upstash Redis quota is approaching the 10,000/day limit

## Context to Read First (in order)
1. The files being reviewed (always read before commenting — never review blindly)
2. `docs/ARCHITECTURE.md` §9 (ADRs — architectural compliance check)
3. `docs/DATABASE_DESIGN.md` §6 (Redis patterns — budget compliance)
4. `libs/shared/src/constants/error-codes.ts` (valid error code constants)
5. `apps/api/src/shared/database/base.repository.ts` (correct repository usage)

---

## Review Checklist

Run through every file in scope:

### Architecture
- [ ] All import paths use aliases (`@modules/*`, `@shared/*`, `@config/*`, `@lib/*`) — no relative paths crossing boundaries
- [ ] No circular imports (verify against MODULE_STRUCTURE.md §3 import matrix)
- [ ] Service does not inject Mongoose Model directly (must go through repository layer)
- [ ] Controller has no business logic (if/else, calculations → move to service)
- [ ] EventEmitter2 used for cross-module communication — no direct service injection across modules
- [ ] `SharedModule` not in feature module's `imports[]` (it's `@Global()`)
- [ ] `analytics/` module emits no write events to other modules (READ-ONLY)
- [ ] FastAPI `ai-service/` has no business logic (ML inference only)

### Database
- [ ] Every query on a soft-delete collection includes `{ deletedAt: null }`
- [ ] Money fields are `Number` (integer VND) — not `Decimal128`, not `string`
- [ ] `_id` is never manually assigned (MongoDB auto-generates ObjectId)
- [ ] `audit_logs` has no `updateOne`/`deleteOne` — INSERT-ONLY
- [ ] `behavioral_events` queries don't reference data older than 90 days
- [ ] Aggregation pipelines have `$match` as the first stage
- [ ] `.lean()` used on read-only queries

### Redis
- [ ] `getOrSet()` used instead of `get()` + `set()` separately
- [ ] No Redis calls inside loops (`items.map()` with `redis.get()`)
- [ ] All Redis keys use template functions from `@lib/constants/redis-keys.ts`
- [ ] All Redis keys have TTL set (no permanent keys)
- [ ] Daily command estimate stays under 9,000 (leave 1,000 headroom)

### API
- [ ] Controllers return raw data — `ResponseInterceptor` handles envelope, not the controller
- [ ] Error codes from `@lib/constants/error-codes.ts` constants — never raw strings
- [ ] Paginated responses include all meta fields: `total`, `page`, `limit`, `totalPages`
- [ ] ObjectId fields serialized as strings in response DTOs
- [ ] `passwordHash` never appears in any response DTO
- [ ] `deletedAt` never appears in any public response DTO
- [ ] `__v` excluded from response DTOs

### Security
- [ ] Non-public endpoints have `@UseGuards(JwtAuthGuard)`
- [ ] Role-restricted endpoints have `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)`
- [ ] `userId` read from `@CurrentUser()` decorator — never from `req.body`
- [ ] Payment webhook handlers verify HMAC-SHA512 signature before any processing
- [ ] `bcrypt` cost factor is 12 (never less)

---

## Self-Healing Loop (run in order)

### Step 1 — TypeScript Check
```bash
cd apps/api && npx tsc --noEmit 2>&1
```

**Common TypeScript errors and their fixes:**

| Error | Fix |
|---|---|
| `Cannot find module '@modules/...'` | Verify alias in `tsconfig.json` `paths`; check file actually exists |
| `Property 'x' does not exist on type` | Add property to interface/schema; or use correct type |
| `Type 'X' is not assignable to 'Y'` | Align types; add type assertion if intentional |
| `Module 'X' has no exported member 'Y'` | Check export in source file; update barrel `index.ts` |
| `Argument of type 'X' is not assignable` | Add missing field to DTO or relax type |

Loop: parse error → read file → apply fix → re-run. Max 3 iterations before escalating to user.

### Step 2 — Lint
```bash
npm run lint -- --fix                  # auto-fixable
npm run lint -- --max-warnings 0       # check remainder
```

**Common lint issues:**
- Unused imports → remove them
- `any` type → add proper type annotation
- Missing `@ApiProperty()` on DTO field → add it
- Async function without `await` → remove `async` or add `await`

### Step 3 — Unit Tests
```bash
npm run test -- --testPathPattern={moduleName} --passWithNoTests
```

If tests fail:
1. Read the failing test file
2. Read the implementation being tested
3. Determine if test expectation is wrong or implementation is wrong
4. Fix the implementation if behavior is incorrect; update test only if expectation was wrong

### Step 4 — Python (FastAPI)
```bash
cd apps/ai-service
python -m mypy app/ --ignore-missing-imports
pytest tests/ -x --tb=short
```

**Common Python issues:**
- `ModuleNotFoundError` → check `requirements.txt`, run `pip install -r requirements.txt`
- `redis.ConnectionError` → use `fakeredis` in tests, not real Redis
- Type errors in mypy → add type hints to function signatures

### Step 5 — Redis Budget Audit
```bash
# Grep all Redis usage patterns
grep -rn "redis\.\(get\|set\|del\|incr\|expire\)" apps/api/src/ --include="*.ts"
grep -rn "getOrSet\|redis\." apps/api/src/ --include="*.ts" | grep -v "getOrSet"
```

Flag any:
- `redis.get()` or `redis.set()` not wrapped in `getOrSet()` → refactor
- Redis calls inside `for` loops or `.map()` → refactor to MGET
- Keys without TTL → add TTL
- Raw string keys → replace with template functions

---

## Performance Optimizations to Suggest

### MongoDB
```typescript
// 1. $match first in aggregation (uses indexes)
{ $match: { status: 'active', deletedAt: null } }  // ← first stage

// 2. .lean() for read-only queries (~30% faster)
return this.model.find({ deletedAt: null }).lean().exec();

// 3. Batch inserts instead of loop saves
await this.model.insertMany(items);  // not: for(item of items) await item.save()

// 4. Projection to fetch only needed fields
return this.model.find({}, { name: 1, price: 1, _id: 1 }).lean();
```

### Redis
```typescript
// MGET instead of multiple GET calls
const keys = ids.map(id => PRODUCT_CACHE_KEY(id));
const values = await redis.mget(...keys);  // 1 command instead of N

// Pipeline for multiple independent writes
const pipeline = redis.pipeline();
pipeline.setex(key1, 300, val1);
pipeline.setex(key2, 300, val2);
await pipeline.exec();  // 1 round-trip instead of 2
```

### Next.js / FastAPI
```typescript
// Use ISR instead of SSR for mostly-static pages
export const revalidate = 300;  // re-generate at most every 5 minutes

// FastAPI: numpy vectorized instead of Python loops
scores = alpha * cf_scores + (1 - alpha) * cbf_scores  // vectorized, not a loop

// Pre-compute cosine similarity at training time, not inference time
# In train_cbf.py: save the full similarity matrix to R2
# In cbf_service.py: just do matrix[item_idx][:n] at inference
```

---

## Project-Specific Red Flags (auto-fix or escalate)

| Red Flag | Action |
|---|---|
| `HS256` in JWT config | Flag: project uses RS256 asymmetric signing |
| `@InjectModel` in a service (not repository) | Move query to repository layer |
| `return { success: true, data: result }` in controller | Remove manual wrapping — ResponseInterceptor handles it |
| `throw new NotFoundException('product not found')` | Replace with `throw new NotFoundException(ErrorCodes.PRODUCT_NOT_FOUND)` |
| `import ... from '../../shared/...'` | Replace with `@shared/...` alias |
| `await redis.get(key)` then `await redis.set(key, ...)` | Refactor to `getOrSet()` |
| `for (const item of items) { await redis.get(...) }` | Refactor to MGET |
| Redis command count estimate > 9,000/day | Flag and suggest optimizations |
| `/health` endpoint queries MongoDB | Remove DB call — health must respond without dependencies |
| `bcrypt.hash(password, 10)` | Change rounds to 12 |
| `userId = req.body.userId` | Replace with `@CurrentUser() user: JwtPayload` + `user.sub` |

---

## Report Format

At the end of every review, produce a summary:

```
## Code Review Report

### Files reviewed: [list]

### Issues found and fixed:
- [file]:[line] — [issue] → [fix applied]

### Issues requiring manual attention:
- [file]:[line] — [issue] — [suggested fix]

### Test status:
- tsc: [0 errors | X errors remaining]
- lint: [0 warnings | X warnings remaining]
- jest: [X passing, 0 failing | X failing — details]
- pytest: [X passing, 0 failing | X failing — details]

### Redis command estimate: ~[N]/day ([OK | ⚠️ approaching limit])

### Verdict: [Ready to commit | Needs manual attention on N issues]
```
