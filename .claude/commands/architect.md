---
description: Architecture guardian for the SMART-ECOMMERCE system. Validates new modules against ADRs and the module dependency matrix, detects circular imports, proposes EventEmitter2 alternatives, and produces Go/No-Go decisions before any significant structural change.
---

# System Architect

## When to Use This Skill
- Before creating a new Express.js module
- When adding an import between two feature modules
- When proposing a new EventEmitter2 cross-module event
- When touching `app.module.ts` or any `*.module.ts`
- When proposing a new shared utility or service
- As the **first** step in any feature development workflow
- When reviewing a PR that crosses module boundaries

## Context to Read First (in order)
1. `docs/ARCHITECTURE.md` §1 (Architecture style — why Modular Monolith), §8 (9 SPOFs), §9 (all ADRs)
2. `docs/MODULE_STRUCTURE.md` §3 (Module dependency map + approved import matrix)
3. `apps/api/src/app.module.ts` (current module registrations — once scaffolded)
4. Any `*.module.ts` files mentioned in the task

---

## Module Import Matrix (Source of Truth)

This is the approved dependency graph. Any import NOT in this table requires a new ADR.

| Module | Approved Imports |
|---|---|
| AuthModule | SharedModule only |
| CatalogModule | SharedModule only |
| CartModule | SharedModule, CatalogModule |
| OrderModule | SharedModule, CartModule |
| PaymentModule | SharedModule, OrderModule |
| RecommendationModule | SharedModule, CatalogModule |
| MarketingModule | SharedModule, NotificationModule |
| NotificationModule | SharedModule only |
| AnalyticsModule | SharedModule only |

**Golden Rules:**
1. `SharedModule` is `@Global()` — **never add it to `imports[]`** in feature modules
2. No circular imports. Period.
3. Cross-module service injection only when listed above. Otherwise: EventEmitter2.
4. `AnalyticsModule` is READ-ONLY — it listens to events but never emits write events to other modules
5. FastAPI is ML-only — no business logic lives in `apps/ai-service/`

---

## Cross-Module EventEmitter2 Event Table

These events are approved for cross-module async communication:

| Event | Emitter | Listeners | Payload |
|---|---|---|---|
| `order.placed` | OrderModule | NotificationModule, AnalyticsModule | `{ orderId, userId, email, items[] }` |
| `order.status.changed` | OrderModule | NotificationModule, AnalyticsModule | `{ orderId, oldStatus, newStatus, userId }` |
| `order.cancelled` | OrderModule | NotificationModule | `{ orderId, userId, reason }` |
| `payment.confirmed` | PaymentModule | OrderModule | `{ orderId, transactionId, amount }` |
| `behavioral.event.stored` | RecommendationModule | AnalyticsModule | `{ userId, eventType, productId, timestamp }` |
| `campaign.send` | MarketingModule | NotificationModule | `{ campaignId, segmentId, channel, templateId }` |
| `cart.abandoned` | CartModule (scheduled) | MarketingModule | `{ userId, cartId, items[], abandonedAt }` |
| `user.registered` | AuthModule | CartModule, NotificationModule | `{ userId, email, fullName }` |
| `product.created` | CatalogModule | (none currently) | `{ productId, categoryId, name }` |
| `stock.low` | CatalogModule | NotificationModule | `{ productId, variantSku, currentStock, threshold }` |

---

## Circular Import Detection

Before accepting any new import, draw the dependency graph and check for cycles:

```
Example: "Can NotificationModule import from OrderModule?"

Current graph:
  OrderModule → CartModule → CatalogModule
  NotificationModule (no outgoing imports)

Check: OrderModule → ... → NotificationModule? 
  OrderModule emits events to NotificationModule (EventEmitter2 — not an import)
  NotificationModule does NOT import OrderModule currently

Proposed: NotificationModule imports OrderModule
  New graph: NotificationModule → OrderModule → CartModule → CatalogModule
  Does OrderModule import NotificationModule?
  → OrderModule emits events → NotificationModule (via EventEmitter2, not import)
  
Go/No-Go: NO — even though there's no direct circular import today, 
  OrderModule could never import NotificationModule in the future.
  Better: if NotificationModule needs order data, pass it in the event payload.
```

---

## Architecture Decision Record (ADR) Template

When a change requires deviating from the current architecture, produce an ADR:

```markdown
## ADR-00X — [Decision Title]

**Status:** Proposed | **Date:** YYYY-MM-DD

**Context:**
[Why this change is being considered]

**Decision:**
[What we decided to do]

**Consequences:**
✓ [Positive outcomes]
✗ [Negative outcomes or trade-offs]

**Revisit trigger:**
[The condition that would make us reconsider]
```

---

## Go/No-Go Decision Framework

For every proposed structural change, evaluate:

| Question | If Yes → | If No → |
|---|---|---|
| Is the proposed import in the approved matrix? | Go | Propose EventEmitter2 event OR write ADR |
| Does the import create a cycle? | No-Go, must refactor | Continue evaluation |
| Is this adding business logic to FastAPI? | No-Go, belongs in Express.js | Continue evaluation |
| Does this add a new direct dependency on SharedModule? | No-Go (it's Global) | Continue evaluation |
| Does AnalyticsModule emit a write event? | No-Go (READ-ONLY) | Continue evaluation |
| Is a new `@Global()` module being proposed? | No-Go (only SharedModule is Global) | Continue evaluation |

---

## EventEmitter2 Event Class Pattern

When cross-module communication is needed but direct import is not approved:

```typescript
// apps/api/src/modules/{emitter-module}/events/{event-name}.event.ts
// Pure TypeScript — NO Express.js or Mongoose imports
export class OrderPlacedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly email: string,
    public readonly items: Array<{ productId: string; qty: number; price: number }>,
  ) {}
}

// In emitter service
import { EventEmitter2 } from '@express/event-emitter';
constructor(private readonly eventEmitter: EventEmitter2) {}

this.eventEmitter.emit('order.placed', new OrderPlacedEvent(
  order._id.toString(),
  order.userId.toString(),
  user.email,
  order.items,
));

// In listener service (NotificationModule)
import { OnEvent } from '@express/event-emitter';

@OnEvent('order.placed')
async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
  await this.emailService.sendOrderConfirmation(event.email, event.orderId);
}
```

---

## SPOF Impact Analysis

Before adding a new external dependency or service, evaluate against the 9 known SPOFs:

| SPOF | Severity | Current Mitigation |
|---|---|---|
| MongoDB Atlas M0 | HIGH | Mongoose auto-reconnect, 99.9% SLA |
| Render Express.js | HIGH | UptimeRobot ping, rolling deploy |
| Render FastAPI | MEDIUM | Circuit breaker → popularity fallback |
| Render spin-down | LOW | UptimeRobot pings /health every 5 min |
| Upstash Redis | MEDIUM | Graceful degradation to MongoDB fallback |
| Cloudflare R2 | LOW | FastAPI keeps model in-memory |
| Vercel | MEDIUM | 99.99% SLA, instant rollback |
| GitHub Actions | LOW | Previous model version stays active |
| Gmail SMTP | LOW | BullMQ 3× retry with 5-min backoff |

Any new dependency that creates a 10th SPOF requires explicit ADR approval.

---

## Validation Output Format

```
## Architecture Review

### Proposed change:
[Summary of what's being proposed]

### Import matrix check:
[Approved/Violation + reason]

### Circular import analysis:
[Graph traversal result]

### EventEmitter2 event table:
[New event added / no change needed]

### SPOF impact:
[Any new failure points introduced]

### ADR reference:
[Existing ADR that covers this / New ADR needed]

### VERDICT: GO ✓ | NO-GO ✗
[Reason + recommended alternative if No-Go]
```
