---
description: Validate Express.js controller endpoints against API_SPECIFICATIONS.md, generate correctly-typed DTOs with class-validator decorators, and ensure all error codes, response shapes, and HTTP status codes match the project contract.
---

# API Contract Enforcer

## When to Use This Skill
- After writing a controller
- "Does this endpoint match the spec?"
- "Generate the DTO for the `[endpoint]` request/response"
- "What error codes does `[endpoint]` return?"
- Before merging any controller changes
- When a frontend developer reports a response shape mismatch

## Context to Read First (in order)
1. `docs/API_SPECIFICATIONS.md` §3.x (specific module endpoints — this is the ground truth)
2. `docs/ARCHITECTURE.md` §5 (URL conventions, response envelope, error code registry, pagination)
3. `libs/shared/src/constants/error-codes.ts` (all valid error code constants)
4. `libs/shared/src/types/api-response.type.ts` (ApiResponse<T>, PaginatedResponse<T>)
5. The controller file being validated (read before commenting)

---

## API Contract Rules

### URL Conventions
```
Base:        /api/v1
Resources:   /api/v1/{plural-noun}           GET (list), POST (create)
Single:      /api/v1/{plural-noun}/:id        GET, PATCH, DELETE
Nested:      /api/v1/{parent}/:id/{child}     GET /products/:id/reviews
Special:     /api/v1/search/products?q=...    GET
Events:      /api/v1/events                  POST (fire-and-forget)
Recs:        /api/v1/recommendations?placement=homepage&n=12
Health:      /health  (NOT under /api/v1)
```

### Standard Response Envelope
**All API responses use `ResponseInterceptor` — controllers return raw data:**
```typescript
// Success (single resource):
{ success: true, data: T, meta: { requestId: string } }

// Success (paginated list):
{ success: true, data: T[], meta: { requestId, total, page, limit, totalPages } }

// Error:
{ success: false, error: { code: string, message: string, details?: any }, meta: { requestId } }
```

**Critical:** Controllers return raw `data` — they do NOT return `{ success: true, data: ... }`. The `ResponseInterceptor` wraps it automatically.

### HTTP Status Codes
| Status | When to use |
|---|---|
| 200 | Successful GET, PATCH |
| 201 | Successful POST (resource created) |
| 202 | Accepted — fire-and-forget (POST /api/v1/events) |
| 204 | Successful DELETE with no body |
| 400 | Bad request / malformed input |
| 401 | Unauthenticated — no valid JWT |
| 403 | Authenticated but insufficient role |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, duplicate SKU) |
| 422 | Validation error (invalid input shape) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## 12-Item Contract Validation Checklist

For each endpoint being validated:

1. **HTTP method** — matches spec (GET/POST/PATCH/DELETE)
2. **URL path** — matches exactly: `/api/v1/{resource}` pattern, kebab-case, plural noun
3. **Auth requirement** — Public (no guard) / JWT-only / JWT+Role
4. **Request body shape** — all required fields present, correct types, validation decorators
5. **Response data shape** — matches spec interface exactly
6. **HTTP status codes** — correct success code (200/201/202/204) + error codes
7. **Error codes** — from `libs/shared/src/constants/error-codes.ts` — never raw strings
8. **Pagination** — `page`, `limit` (default 20), `sort`, `order` query params when applicable
9. **Paginated response meta** — includes `total`, `page`, `limit`, `totalPages`
10. **ObjectId serialization** — all ObjectId fields returned as `string` (never raw ObjectId)
11. **Sensitive fields excluded** — `passwordHash`, `deletedAt`, `__v` never in public responses
12. **Rate limiting** — auth endpoints use 10/min/IP; general API uses 100/min/user

---

## DTO Generation Patterns

### Request DTO
```typescript
import { IsString, IsNotEmpty, IsEmail, IsNumber, Min, Max, IsOptional, IsEnum, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@express/swagger';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'iPhone 15 Pro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Price in VND (integer)', example: 29990000 })
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Math.round(value))  // ensure integer
  price: number;

  @ApiPropertyOptional({ description: 'Compare-at price in VND', example: 32000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @ApiProperty({ description: 'Category ObjectId', example: '64a7b2c3d4e5f6a7b8c9d0e1' })
  @IsString()
  @IsMongoId()  // validates ObjectId format
  categoryId: string;
}

// Update DTO: PartialType makes all fields optional — no duplication
import { PartialType } from '@express/mapped-types';
export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

### Query DTO (Pagination + Filter)
```typescript
import { IsOptional, IsNumber, IsString, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@express/swagger';

export class ProductQueryDto {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Category ID filter' })
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['price', 'createdAt', 'avgRating', 'soldCount'] })
  @IsOptional()
  @IsIn(['price', 'createdAt', 'avgRating', 'soldCount'])
  sort?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
```

### Response DTO (exclude sensitive fields)
```typescript
import { Expose, Transform, Exclude } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  roles: string[];

  // Never expose these
  @Exclude() passwordHash: string;
  @Exclude() deletedAt: Date;
  @Exclude() __v: number;
}
```

---

## Special Endpoints

### `POST /api/v1/events` — Fire-and-Forget
```typescript
// MUST return 202 Accepted, not 201 Created
@Post()
@HttpCode(HttpStatus.ACCEPTED)  // 202
async trackEvent(@Body() dto: TrackEventDto): Promise<boolean> {
  // Async, fire-and-forget — don't await the MongoDB insert
  this.behavioralEventRepository.insertOne(dto).catch(err =>
    this.logger.error('Event insert failed', err)
  );
  return true;  // immediately return — ResponseInterceptor wraps as { success: true, data: true }
}
```

### `GET /health` — Outside `/api/v1`
```typescript
// In app.module.ts or a HealthController NOT prefixed with 'api/v1'
@Get('health')
health(): { status: string; uptime: number } {
  // NO database calls here — must respond even when DB is down
  return { status: 'ok', uptime: process.uptime() };
}
```

### `POST /internal/reload-model` — FastAPI Internal
```python
# In apps/ai-service/app/routers/internal.py
# Protected by X-Internal-Token header, NOT JWT
@router.post("/internal/reload-model")
async def reload_model(x_internal_token: str = Header(None)):
    if x_internal_token != settings.INTERNAL_API_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    # download from R2 + hot-reload in background thread
```

---

## Error Code Catalog (key codes by module)

```typescript
// From libs/shared/src/constants/error-codes.ts
// Auth
AUTH_EMAIL_EXISTS         → 409 (duplicate registration)
AUTH_INVALID_CREDENTIALS  → 401 (wrong password)
AUTH_TOKEN_EXPIRED        → 401 (access token expired)
AUTH_REFRESH_INVALID      → 401 (refresh token invalid/expired)
AUTH_INSUFFICIENT_ROLE    → 403 (role not permitted)

// Catalog
PRODUCT_NOT_FOUND         → 404
PRODUCT_OUT_OF_STOCK      → 422 (with details: [{ variantSku, availableStock }])
CATEGORY_NOT_FOUND        → 404

// Cart
CART_NOT_FOUND            → 404
COUPON_NOT_FOUND          → 404
COUPON_EXPIRED            → 422
COUPON_USAGE_EXCEEDED     → 422

// Order
ORDER_NOT_FOUND           → 404
ORDER_INVALID_TRANSITION  → 422 (FSM state machine violation)
ORDER_ALREADY_PAID        → 409

// Payment
PAYMENT_SIGNATURE_INVALID → 400 (VNPay HMAC mismatch)
PAYMENT_ALREADY_PROCESSED → 409 (idempotency check)

// General
VALIDATION_ERROR          → 422 (with details array)
RATE_LIMIT_EXCEEDED       → 429
INTERNAL_SERVER_ERROR     → 500

// AI
AI_SERVICE_UNAVAILABLE    → circuit breaker open (returns fallback, not error)
```

---

## Validation Report Format

```
## API Contract Validation Report

### Endpoint: [METHOD] [URL]

| Check | Status | Notes |
|---|---|---|
| HTTP method | ✓/✗ | |
| URL path | ✓/✗ | |
| Auth guard | ✓/✗ | |
| Request body | ✓/✗ | Missing: [fields] |
| Response shape | ✓/✗ | Mismatch: [fields] |
| HTTP status | ✓/✗ | |
| Error codes | ✓/✗ | Raw strings found: [list] |
| Pagination | ✓/✗ N/A | |
| Sensitive fields | ✓/✗ | Exposed: [fields] |

### Issues found: [N]
### Corrected DTOs: [attached below]
```
