---
description: Design MongoDB schemas, index strategies, Redis key patterns, and aggregation pipelines for the SMART-ECOMMERCE project. Manages all 15 collections, enforces soft-delete, and tracks Redis budget (10,000 cmd/day limit).
---

# Database Manager

## When to Use This Skill
- "Add a field to the `[collection]` collection"
- "Create an index for `[query pattern]`"
- "Design the Redis caching for `[feature]`"
- "Write a MongoDB aggregation for `[metric]`"
- Any task touching `schemas/` folders or Redis key patterns

## Context to Read First (in order)
1. `docs/DATABASE_DESIGN.md` §3.x (specific collection design)
2. `docs/DATABASE_DESIGN.md` §4 (indexing strategy — all 45 indexes)
3. `docs/DATABASE_DESIGN.md` §5 (data conventions: ObjectId, VND integers, soft-delete rules)
4. `docs/DATABASE_DESIGN.md` §6 (Redis data structures and key patterns)
5. `libs/shared/src/constants/redis-keys.ts` (key template functions)

---

## All 15 Collections — Owner Module & Key Rules

| Collection | Owner Module | Soft-Delete | Redis Keys | Special Rules |
|---|---|---|---|---|
| `users` | AuthModule | ✓ deletedAt | `sess:{SHA256(token)}` TTL 7d | Never return `passwordHash` in responses |
| `products` | CatalogModule | ✓ deletedAt | `product:{id}` TTL 5min | Variants embedded; money = integer VND |
| `categories` | CatalogModule | ✓ deletedAt | None | Materialized path tree (max 3 levels) |
| `reviews` | CatalogModule | ✓ deletedAt | None | `isVerifiedPurchase` flag; 1 review per user per product |
| `orders` | OrderModule | ✗ (status-based) | None | Payment embedded; item snapshot (not refs) |
| `carts` | CartModule | ✗ | None | `sessionId` sparse for guests; price snapshot |
| `coupons` | CartModule | ✓ deletedAt | `rl:{gw}:{txId}` idempotency | `usedCount` atomic `$inc` |
| `behavioral_events` | RecommendationModule (write) / AnalyticsModule (read) | ✗ (TTL 90 days) | `rec:{uid}:{place}` TTL 10min, `fallback:popular:{place}` TTL 1h | Never query beyond 90-day window |
| `feature_snapshots` | AnalyticsModule (write) | ✗ append-only | None | Daily snapshots; latest per user for training |
| `model_versions` | AnalyticsModule | ✗ append-only | None | `isActive` flag toggle; INSERT + isActive toggle only |
| `campaigns` | MarketingModule | ✓ deletedAt | None | Metrics via `$inc`; status state machine |
| `segments` | MarketingModule | ✗ | None | `userIds[]` recomputed daily |
| `push_subscriptions` | NotificationModule | ✗ | None | Cleanup on 410 Gone response |
| `audit_logs` | SharedModule (GlobalFilter) | ✗ INSERT-ONLY | None | Atlas account has NO UPDATE/DELETE — never generate update/delete methods |
| `error_logs` | SharedModule (GlobalFilter) | ✗ INSERT-ONLY | None | TTL index 30 days |

---

## Soft-Delete Pattern

Apply to ALL collections **except**: `audit_logs`, `error_logs`, `behavioral_events`, `model_versions`, `feature_snapshots` (append-only).

```typescript
// Schema definition
@Prop({ type: Date, default: null, index: true })
deletedAt: Date | null;

// Every query MUST include this filter
const result = await this.model.findOne({ _id: id, deletedAt: null });
const list   = await this.model.find({ status: 'active', deletedAt: null });

// Soft delete operation (never Model.deleteOne())
await this.model.updateOne({ _id: id }, { $set: { deletedAt: new Date() } });

// Compound index recommendation for soft-delete + common filter
collectionSchema.index({ deletedAt: 1, status: 1 });
collectionSchema.index({ deletedAt: 1, userId: 1 });
```

---

## Index Design Rules

### When to create an index
- Any field in a `findOne` / `find` query with a filter
- Any field used in a sort
- Foreign key fields (userId, productId, orderId) always get indexed
- Fields in range queries (`createdAt`, `scheduledAt`, `expiresAt`)
- Unique constraints on natural keys (email, slug, sku, orderNumber, code)

### Compound index ordering rule
`{ most-selective-field: 1, sort-field: -1, deletedAt: 1 }`

Most selective (highest cardinality) goes first. `deletedAt` goes last because it's always `null`.

```typescript
// Good: email is highly selective
userSchema.index({ email: 1 }, { unique: true });

// Good: compound for common query pattern
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Good: TTL index for auto-purge
behavioralEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Sparse index: only index documents where field exists
cartSchema.index({ userId: 1 }, { unique: true, sparse: true });
cartSchema.index({ sessionId: 1 }, { sparse: true });
```

### Index anti-patterns (flag and fix)
- `$lookup` (JOIN) between collections → consider embedding instead
- Aggregation `$match` not first in pipeline → always put `$match` before `$project`/`$lookup`
- Missing index on any query field → add it
- Index on array field used as equality filter → use `$in` + multikey index instead

---

## Data Type Conventions

```typescript
// CORRECT
price: number;           // integer VND (e.g., 150000 = 150,000 VND)
comparePrice: number;    // integer VND
discount: number;        // integer VND

// WRONG — never these
price: Types.Decimal128; // ❌ no Decimal128
price: string;           // ❌ no string for money
price: 150.5;            // ❌ no decimals

// ObjectId references — always Types.ObjectId in schema, string in DTOs
@Prop({ type: Types.ObjectId, ref: 'User', required: true })
userId: Types.ObjectId;

// In response DTOs: serialize ObjectId as string
userId: string; // .toString() in service layer

// Timestamps: use ISO 8601 strings in API responses, Date objects in schemas
@Prop({ type: Date })
scheduledAt: Date;
```

---

## Redis Key Patterns & Budget Management

### Daily Budget Allocation (10,000 commands/day limit)

| Feature | Commands/day | Key Pattern | TTL |
|---|---|---|---|
| Session management | ~500 | `sess:{SHA256(token)}` | 7 days |
| Product cache | ~1,200 | `product:{productId}` | 5 min (300s) |
| Recommendation cache | ~3,000 | `rec:{userId}:{placement}` | 10 min (600s) |
| Anonymous rec cache | ~300 | `rec:anon:{sessionId}:{placement}` | 5 min (300s) |
| Feature store (AI) | ~1,500 | `features:user:{userId}` Hash | 2 hours (7200s) |
| Fallback popularity | ~300 | `fallback:popular:{placement}` | 1 hour (3600s) |
| Rate limiting | ~2,000 | `rl:{ip}:{endpoint}` | Sliding 60s |
| Idempotency (payment) | ~100 | `rl:{gateway}:{txId}` | 24 hours |
| BullMQ (email queue) | ~400 | managed by BullMQ | managed |
| **TOTAL** | **~9,300** | | Leave 700 headroom |

### getOrSet() Pattern — Always Use This for Caching
```typescript
// CORRECT: single atomic helper, 1 Redis operation on hit, 2 on miss
const product = await this.redisService.getOrSet(
  PRODUCT_CACHE_KEY(id),  // use template function, never raw string
  300,                     // TTL in seconds
  () => this.productRepository.findById(id),
);

// WRONG: 2 operations always, can cause race conditions
const cached = await redis.get(`product:${id}`);
if (cached) return JSON.parse(cached);
const data = await this.productRepository.findById(id);
await redis.set(`product:${id}`, JSON.stringify(data), 'EX', 300);
return data;
```

### Redis Command Budget Rules
```typescript
// RULE 1: Never call Redis inside a loop — use MGET for batch reads
// WRONG
const results = await Promise.all(ids.map(id => redis.get(`product:${id}`)));

// CORRECT
const keys = ids.map(id => PRODUCT_CACHE_KEY(id));
const values = await redis.mget(...keys);  // single command regardless of ids.length

// RULE 2: Always set TTL — no permanent keys
await redis.set(key, value);          // WRONG: no TTL
await redis.setex(key, 3600, value);  // CORRECT

// RULE 3: Use template functions from redis-keys.ts — never inline strings
import { PRODUCT_CACHE_KEY, SESSION_KEY, REC_CACHE_KEY } from '@lib/constants/redis-keys';
// WRONG: await redis.get(`product:${id}`)
// CORRECT: await redis.get(PRODUCT_CACHE_KEY(id))
```

### Redis Key Template Functions (from `libs/shared/src/constants/redis-keys.ts`)
```typescript
SESSION_KEY(hash)           → `sess:${hash}`
REC_CACHE_KEY(uid, place)   → `rec:${uid}:${place}`
PRODUCT_CACHE_KEY(id)       → `product:${id}`
FEATURE_KEY(uid)            → `features:user:${uid}`
FALLBACK_KEY(place)         → `fallback:popular:${place}`
IDEMPOTENCY_KEY(gw, txId)   → `rl:${gw}:${txId}`
```

### Redis Data Structures
```typescript
// String: for simple cache values (JSON.stringify/parse)
await redis.setex(PRODUCT_CACHE_KEY(id), 300, JSON.stringify(product));

// Hash: for feature store (field-level HSET/HGETALL without full re-serialization)
await redis.hset(FEATURE_KEY(userId), {
  recent_product_ids: JSON.stringify([...]),
  rfm_segment: 'champions',
  avg_price_range: 'medium',
});
await redis.expire(FEATURE_KEY(userId), 7200);  // 2 hours

// List: NOT used in this project (use MongoDB or BullMQ instead)
// Sorted Set: NOT used directly (BullMQ handles priority internally)
```

---

## MongoDB Aggregation Patterns

### Daily Active Users (example pattern)
```typescript
// Always: $match first (uses indexes), then $group/$project
const result = await this.model.aggregate([
  { $match: {
    eventType: 'view',
    timestamp: { $gte: startDate, $lte: endDate },
    deletedAt: null,  // add if collection has soft-delete
  }},
  { $group: {
    _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
    uniqueUsers: { $addToSet: '$userId' },
  }},
  { $project: {
    date: '$_id',
    dau: { $size: '$uniqueUsers' },
    _id: 0,
  }},
  { $sort: { date: -1 } },
  { $limit: 30 },
]);
```

### Soft-Delete in Aggregation
```typescript
// Always add deletedAt filter as first $match stage
{ $match: { deletedAt: null, /* other filters */ } }
```

### Performance Tips
- `$match` always first — reduces documents early
- Avoid `$lookup` — embed data instead (see orders.payment embedded, orders.items snapshot)
- Use `.lean()` for `find()` queries that only read data (skips Mongoose document hydration, ~30% faster)
- `Model.insertMany()` for bulk inserts — never loop with `save()`

---

## Schema Evolution Rules

- All schema changes must be **additive** (new optional fields only) — no renaming, no dropping fields
- New required fields must have a default value for backward compatibility
- Never change field types (string → number breaks existing documents)
- Add migration script in `scripts/migrations/YYYYMMDD_description.ts` for non-trivial changes

---

## Self-Healing Checklist

1. Missing `{ deletedAt: null }` in a query → add it
2. `Decimal128` or string for price field → convert to `Number`
3. Missing `timestamps: true` in `@Schema()` → add it
4. Raw Redis string instead of template function → replace with `PRODUCT_CACHE_KEY(id)` etc.
5. `$lookup` in aggregation → evaluate if embedding is possible
6. Redis call inside `.map()` or loop → refactor to MGET batch
7. `audit_logs` has `updateOne`/`deleteOne` → remove immediately — this collection is INSERT-ONLY

## Final Checklist Before Done
- [ ] All queries on soft-delete collections include `{ deletedAt: null }`
- [ ] All money fields are `Number` (integer VND)
- [ ] `_id` is never manually assigned
- [ ] All Redis keys use template functions from `@lib/constants/redis-keys`
- [ ] All Redis keys have TTL set
- [ ] No Redis calls inside loops
- [ ] `getOrSet()` used instead of `get()` + `set()` separately
- [ ] Compound indexes defined for all common query patterns
- [ ] `audit_logs` has no update/delete methods generated
