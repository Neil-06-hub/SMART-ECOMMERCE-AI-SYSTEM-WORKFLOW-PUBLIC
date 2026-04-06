---
description: Security specialist for the SMART-ECOMMERCE system. Validates JWT patterns (RS256), RBAC guards, bcrypt configuration, VNPay HMAC webhook verification, OWASP Top 10 compliance, and audit logging. Auto-fixes common security vulnerabilities.
---

# Security Guard

## When to Use This Skill
- Any task touching `auth/` module
- When writing payment webhook handlers (VNPay, Momo)
- "Is this endpoint secure?"
- "Add rate limiting to `[endpoint]`"
- "Review the RBAC for `[feature]`"
- Any task handling user PII (passwords, email, payment tokens)
- Before merging any auth-related PR

## Context to Read First (in order)
1. `docs/ARCHITECTURE.md` §6 (Security architecture: JWT flow, RBAC, data security, payment security)
2. `docs/MODULE_STRUCTURE.md` §4.1 (AuthModule detail: JWT payload, session management, guards)
3. `docs/MODULE_STRUCTURE.md` §4.5 (PaymentModule: HMAC-SHA512 verify, idempotency, webhook)
4. `apps/api/src/shared/guards/` (existing guard implementations — read before modifying)

---

## JWT Authentication Pattern

### Access Token
```typescript
// Algorithm: RS256 (asymmetric — private key signs, public key verifies)
// NEVER use HS256 — project ADR mandates RS256
// Expiry: 15 minutes
// Payload: { sub: userId, roles: string[], iat: number, exp: number }

// apps/api/src/shared/config/jwt.config.ts
export default registerAs('jwt', () => ({
  privateKey: process.env.JWT_PRIVATE_KEY,  // RSA private key (PEM format)
  publicKey: process.env.JWT_PUBLIC_KEY,    // RSA public key (PEM format)
  expiresIn: '15m',
  algorithm: 'RS256',
}));

// JwtStrategy
validate(payload: JwtPayload) {
  return { sub: payload.sub, roles: payload.roles };
  // Never include passwordHash, refreshToken, or PII in JWT payload
}
```

### Refresh Token
```typescript
// Generate: crypto.randomUUID() — raw token sent to client in HttpOnly cookie
// Store: SHA-256 hash in Redis (never raw token)
import { createHash } from 'crypto';
const hash = createHash('sha256').update(rawToken).digest('hex');

// Redis key: sess:{hash}   TTL: 7 days (604800s)
// Value: JSON{ userId, roles, createdAt }

// Cookie: HttpOnly + Secure + SameSite=Strict
res.cookie('refreshToken', rawToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in ms
  path: '/api/v1/auth/refresh',       // restrict to refresh endpoint
});

// Rotation: on every refresh, delete old Redis key, issue new token
// This prevents refresh token replay attacks
```

### Password Security
```typescript
// bcrypt cost factor: 12 (never less — project minimum)
// ~250ms hash time at cost 12 (intentionally slow for brute-force resistance)
const hash = await bcrypt.hash(plainPassword, 12);
const valid = await bcrypt.compare(plainPassword, storedHash);

// NEVER:
// - Store plaintext password anywhere
// - Return passwordHash in any response
// - Use cost < 12
// - Use MD5/SHA1/SHA256 directly for passwords
```

---

## RBAC Implementation

### 5 System Roles
```typescript
export enum Role {
  BUYER = 'buyer',
  STAFF = 'staff',
  ADMIN = 'admin',
  // Sub-roles for staff:
  PRODUCT_MANAGER = 'product_manager',
  MARKETING_MANAGER = 'marketing_manager',
  DATA_ANALYST = 'data_analyst',
  CUSTOMER_SUPPORT = 'customer_support',
}
```

### Role Permission Matrix
| Action | buyer | staff | admin |
|---|---|---|---|
| Browse catalog, search, GET products | ✓ (Public) | ✓ | ✓ |
| Manage own cart, place order | ✓ (JWT) | ✓ | ✓ |
| View own orders, own profile | ✓ (JWT, ownership check) | ✓ | ✓ |
| Write product review (verified purchase only) | ✓ (JWT) | ✗ | ✓ |
| Create/update/delete products | ✗ | ✓ (PRODUCT_MANAGER+) | ✓ |
| Manage inventory, categories | ✗ | ✓ (PRODUCT_MANAGER+) | ✓ |
| View all orders, update order status | ✗ | ✓ (STAFF+) | ✓ |
| Create/send marketing campaigns | ✗ | ✓ (MARKETING_MANAGER+) | ✓ |
| View analytics dashboard | ✗ | ✓ (DATA_ANALYST+) | ✓ |
| User management, role assignment | ✗ | ✗ | ✓ |
| System configuration | ✗ | ✗ | ✓ |

### Guard Usage Patterns
```typescript
// Public endpoint (no auth required)
@Get()
async findAll() { ... }

// JWT-required (any authenticated user)
@Get('me')
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user: JwtPayload) { ... }

// Role-restricted
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STAFF, Role.ADMIN)  // either role is sufficient
async createProduct() { ... }

// Admin-only
@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
async deleteUser() { ... }

// Ownership check (buyer can only access own resources)
@Get(':id')
@UseGuards(JwtAuthGuard)
async getOrder(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
  const order = await this.orderService.findById(id);
  // Ownership check: buyer can only see own orders
  if (user.roles.includes(Role.BUYER) && order.userId.toString() !== user.sub) {
    throw new ForbiddenException(ErrorCodes.AUTH_INSUFFICIENT_ROLE);
  }
  return order;
}
```

---

## Payment Security (VNPay)

```typescript
// HMAC-SHA512 signature verification — MANDATORY before any order update
import { createHmac } from 'crypto';

verifyVNPaySignature(params: Record<string, string>, secretKey: string): boolean {
  // 1. Remove vnp_SecureHash from params
  const { vnp_SecureHash, ...sortableParams } = params;
  
  // 2. Sort remaining params alphabetically
  const sortedParams = Object.entries(sortableParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
  
  // 3. Build query string
  const queryString = new URLSearchParams(sortedParams).toString();
  
  // 4. Compute HMAC-SHA512
  const expectedHash = createHmac('sha512', secretKey)
    .update(queryString)
    .digest('hex')
    .toUpperCase();
  
  return vnp_SecureHash.toUpperCase() === expectedHash;
}

// In webhook handler:
@Post('webhook/vnpay')
async handleVNPayWebhook(@Body() body: Record<string, string>, @Req() req: Request) {
  // STEP 1: Verify signature FIRST — reject immediately if invalid
  const isValid = this.paymentService.verifyVNPaySignature(body, process.env.VNPAY_HASH_SECRET);
  if (!isValid) {
    throw new BadRequestException(ErrorCodes.PAYMENT_SIGNATURE_INVALID);
  }
  
  // STEP 2: Idempotency check — prevent double-processing
  const idempotencyKey = IDEMPOTENCY_KEY('vnpay', body.vnp_TxnRef);
  const alreadyProcessed = await this.redisService.get(idempotencyKey);
  if (alreadyProcessed) {
    return { RspCode: '02', Message: 'Already processed' };
  }
  await this.redisService.setex(idempotencyKey, 86400, '1');  // 24h TTL
  
  // STEP 3: Process the payment
  await this.paymentService.processVNPayCallback(body);
}
```

---

## OWASP Top 10 Compliance Checks

Run these checks on every security review:

### A01 — Broken Access Control
- [ ] Every non-public endpoint has `@UseGuards(JwtAuthGuard)` 
- [ ] BUYER resources include ownership check (`order.userId === user.sub`)
- [ ] No horizontal privilege escalation (userId from JWT, never request body)
- [ ] Admin actions write to `audit_logs` (immutable, INSERT-ONLY)

### A02 — Cryptographic Failures
- [ ] bcrypt cost = 12 (never less)
- [ ] JWT uses RS256 algorithm (never HS256)
- [ ] TLS enforced by Render.com and Vercel (auto-TLS)
- [ ] Refresh token stored as SHA-256 hash (never raw value)
- [ ] `passwordHash` never in API response

### A03 — Injection
- [ ] Mongoose parameterized queries (no raw MongoDB shell strings)
- [ ] `ValidationPipe({ whitelist: true })` globally — unknown fields rejected
- [ ] No `$where` in MongoDB queries
- [ ] No raw SQL (project uses MongoDB only)

### A04 — Insecure Design
- [ ] Rate limiting on auth endpoints (10 req/min/IP for login/register)
- [ ] General API rate limiting (100 req/min/user)
- [ ] Payment webhooks verify signature before processing
- [ ] Refresh token rotation on every use

### A07 — Identification and Authentication Failures
- [ ] Refresh token rotated on every use (old invalidated immediately)
- [ ] Session invalidated on logout (Redis key deleted)
- [ ] 2FA available for users (`TOTP + SMS OTP` — FR-AUTH-03)
- [ ] Account lockout after N failed login attempts

### A09 — Security Logging and Monitoring Failures
- [ ] All STAFF/ADMIN mutations emit `audit_log` entry
- [ ] Authentication failures logged to `error_logs`
- [ ] Payment events logged (success + failure)

---

## Rate Limiting Configuration

```typescript
// apps/api/src/app.module.ts
ThrottlerModule.forRoot([
  {
    name: 'auth',
    ttl: 60000,  // 60 seconds
    limit: 10,   // 10 requests per IP
  },
  {
    name: 'api',
    ttl: 60000,  // 60 seconds
    limit: 100,  // 100 requests per user
  },
]),

// On auth endpoints (login, register, forgot-password)
@UseGuards(ThrottlerGuard)
@Throttle({ auth: { ttl: 60000, limit: 10 } })
async login() { ... }

// On general API endpoints (default throttler handles this globally)
```

---

## Audit Log Pattern

```typescript
// Every STAFF/ADMIN mutation must produce an audit log entry
// DO NOT use updateOne/deleteOne on audit_logs — it's INSERT-ONLY

interface AuditLogEntry {
  actor: string;        // userId (from JWT)
  actorRole: string;    // role at time of action
  action: string;       // SCREAMING_SNAKE_CASE: 'PRODUCT_CREATED', 'ORDER_CANCELLED'
  resource: string;     // collection name: 'products', 'orders'
  resourceId: string;   // ObjectId as string
  diff: {
    before: Record<string, any> | null;
    after: Record<string, any> | null;
  };
  ipAddress: string;
  userAgent: string;
  timestamp: Date;      // immutable — set once on insert, never updated
}

// Usage in service
await this.auditLogRepository.insertOne({
  actor: currentUser.sub,
  actorRole: currentUser.roles[0],
  action: 'PRODUCT_UPDATED',
  resource: 'products',
  resourceId: productId,
  diff: { before: beforeSnapshot, after: afterSnapshot },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  timestamp: new Date(),
});
```

---

## Self-Healing Auto-Fixes

| Red Flag | Auto-Fix |
|---|---|
| `algorithm: 'HS256'` in JWT config | Change to `'RS256'` + update key config |
| Missing `@UseGuards(JwtAuthGuard)` on non-public endpoint | Add guard |
| `userId = req.body.userId` | Replace with `@CurrentUser() user` + `user.sub` |
| `bcrypt.hash(pass, 10)` | Change rounds from 10 to 12 |
| No HMAC verify in VNPay webhook | Add signature verification as first step |
| `passwordHash` in response DTO | Add `@Exclude()` decorator |
| Missing ownership check for BUYER accessing own resource | Add `userId === user.sub` check |
| Audit log has `updateOne`/`deleteOne` | Remove — audit_logs is INSERT-ONLY |

## Final Security Checklist Before Done
- [ ] RS256 used (not HS256)
- [ ] bcrypt cost = 12
- [ ] `passwordHash` excluded from all response DTOs
- [ ] All non-public endpoints have `@UseGuards(JwtAuthGuard)`
- [ ] Ownership checks on BUYER resources
- [ ] VNPay HMAC-SHA512 verified before processing
- [ ] Payment idempotency key in Redis (24h TTL)
- [ ] Admin mutations write to `audit_logs`
- [ ] Rate limiting on auth endpoints
