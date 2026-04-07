---
description: Quick reference for all AI skill commands in this project. Shows every skill, when to use it, and example invocation patterns.
---

# SMART-ECOMMERCE — Skill Commands Cheatsheet

## Standard Feature Workflow (run in this order)
```
/architect       → 1. Validate approach + module boundaries
/database-manager → 2. Design schema + indexes + Redis keys
/backend-express  → 3. Scaffold Express.js files
/api-contract    → 4. Validate endpoints vs API_SPECIFICATIONS.md
/security-guard  → 5. Check auth guards + RBAC
/test-engineer   → 6. Generate tests
/code-reviewer   → 7. Final self-heal + quality gate
```

---

## All 10 Skills

### `/architect`
**When:** New module, new cross-module import, new EventEmitter2 event
```
/architect validate: can MarketingModule import from OrderModule?
/architect I want to add a WishlistModule, is this safe?
/architect review the dependency graph before I start Sprint 3
```

### `/backend-express`
**When:** Scaffold module, write endpoint, create DTO, add repository method
```
/backend-express scaffold the complete CartModule
/backend-express generate a PATCH /products/:id/inventory endpoint
/backend-express create UpdateOrderStatusDto for the order module
/backend-express add a findByEmail method to UserRepository
```

### `/frontend-nextjs`
**When:** Build page, create component, add TanStack Query hook
```
/frontend-nextjs build the product detail page /products/[slug]
/frontend-nextjs create a ProductCard component with add-to-cart
/frontend-nextjs add a useRecommendationsQuery hook for homepage
/frontend-nextjs build the admin order management page
```

### `/ai-ml-engineer`
**When:** FastAPI routes, ML training, feature store, circuit breaker debug
```
/ai-ml-engineer implement the POST /recommend endpoint in FastAPI
/ai-ml-engineer the circuit breaker trips every morning, why?
/ai-ml-engineer update the feature store when a user makes a purchase
/ai-ml-engineer add a new placement type: "similar_brands"
```

### `/database-manager`
**When:** Schema design, index, Redis key, aggregation pipeline
```
/database-manager design the reviews collection schema and indexes
/database-manager add a wishlist field to the users collection
/database-manager design Redis caching for the search results page
/database-manager write an aggregation for top-selling products this week
```

### `/api-contract`
**When:** Validate controller vs spec, generate DTOs, check error codes
```
/api-contract validate the CartController against API_SPECIFICATIONS.md
/api-contract generate request + response DTOs for POST /api/v1/orders
/api-contract what error codes should GET /products/:id return?
/api-contract [paste controller code] — does this match the spec?
```

### `/devops-ci`
**When:** GitHub Actions, Docker, Render deploy, health check
```
/devops-ci create all 4 GitHub Actions workflow files
/devops-ci create the docker-compose.yml for local development
/devops-ci configure Render deployment for Express.js and FastAPI
/devops-ci add post-deploy health check to cd-production.yml
```

### `/security-guard`
**When:** Auth review, RBAC, payment webhook, PII handling
```
/security-guard [paste controller] — is this endpoint secure?
/security-guard implement the VNPay webhook handler securely
/security-guard add rate limiting to the login endpoint
/security-guard review the JWT configuration in auth.module.ts
```

### `/test-engineer`
**When:** After writing service/repository, need tests for CI
```
/test-engineer write unit tests for CartService
/test-engineer write e2e tests for POST /api/v1/auth/register
/test-engineer write pytest for the /recommend FastAPI endpoint
/test-engineer write repository tests that verify soft-delete filter
```

### `/code-reviewer`
**When:** Fix TypeScript errors, review before PR, Redis quota check
```
/code-reviewer fix TypeScript errors in apps/api/src/modules/catalog/
/code-reviewer review all files changed in the order module
/code-reviewer check Redis budget — are we within 10k commands/day?
/code-reviewer final review before opening the PR for Sprint 2
```

---

## Invocation Patterns

| Pattern | Example |
|---|---|
| Slash + task | `/backend-express scaffold CartModule` |
| Slash + paste code | `/security-guard [paste code here]` |
| Slash alone | `/architect` → Claude will ask what you need |
| Natural language | "dùng /database-manager design schema cho reviews" |
| Chain (sequential) | Run `/architect` → then `/backend-express` → then `/test-engineer` |

---

## Quick Reference Cards

### Which skill for which file?
| File/Folder | Skill to use |
|---|---|
| `apps/api/src/modules/*/schemas/` | `/database-manager` |
| `apps/api/src/modules/*/services/` | `/backend-express` |
| `apps/api/src/modules/*/controllers/` | `/backend-express` + `/api-contract` |
| `apps/api/src/modules/*/dto/` | `/api-contract` |
| `apps/api/src/shared/guards/` | `/security-guard` |
| `apps/web/app/` | `/frontend-nextjs` |
| `apps/ai-service/` | `/ai-ml-engineer` |
| `.github/workflows/` | `/devops-ci` |
| `*.spec.ts` / `test_*.py` | `/test-engineer` |
| Any TypeScript error | `/code-reviewer` |

### Which skill first?
| Situation | Start with |
|---|---|
| Starting a new feature | `/architect` |
| Fixing a bug | `/code-reviewer` |
| Performance issue | `/code-reviewer` |
| Security concern | `/security-guard` |
| Deployment issue | `/devops-ci` |
| ML model not working | `/ai-ml-engineer` |
| Frontend UI task | `/frontend-nextjs` |
| Database query slow | `/database-manager` |
