# Backend — Claude Context

> Stack: **Node.js 20 + Express 4 + MongoDB (Mongoose) + JWT**
> Language: **JavaScript (CommonJS)** — not TypeScript
> Entry: `server.js` (Express init, MongoDB connect, mount routes, start cron jobs)
> Port: **5000**

## Quick Commands
```bash
npm run dev       # nodemon server.js — hot reload, port 5000
npm run start     # node server.js — production
npm run seed      # Reset DB + seed ALL data (products → users → behavioral events → feature snapshots)
npm run seed:ai   # Only seeds 05-behavior-history + 06-feature-snapshots (standalone)
```

## Route → Controller Map

| Route File | Controller | Base Prefix | Auth |
|-----------|-----------|-------------|------|
| `routes/auth.routes.js` | `auth.controller.js` | `/api/auth` | Public/Protected |
| `routes/product.routes.js` | `product.controller.js` | `/api/products` | Public + Admin |
| `routes/order.routes.js` | `order.controller.js` | `/api/orders` | User |
| `routes/ai.routes.js` | `ai.controller.js` | `/api/ai` | Mixed (see below) |
| `routes/admin.routes.js` | `admin.controller.js` | `/api/admin` | Admin only |
| `routes/wishlist.routes.js` | `wishlist.controller.js` | `/api/wishlist` | User |
| `routes/notification.routes.js` | `notification.controller.js` | `/api/notifications` | User |
| `routes/discount.routes.js` | `discount.controller.js` | `/api/admin/discounts` | Admin only |
| `routes/discount.public.routes.js` | `discount.controller.js` | `/api/discounts` | Public |

### AI Route Details (`/api/ai`)
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/ai/recommendations` | User (JWT) | Personalized AI recommendations via FastAPI |
| POST | `/api/ai/track` | User (JWT) | Track events → Activity + BehavioralEvent |
| POST | `/api/ai/track-public` | **Public** (no auth) | Anonymous event tracking → BehavioralEvent only |

## Controller Pattern
```js
// controllers/example.controller.js
const Example = require('../models/Example');

exports.getAll = async (req, res) => {
  try {
    const items = await Example.find({ isActive: true });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

## HTTP Status Codes
| Code | When |
|------|------|
| 200 | GET/PUT success |
| 201 | POST create success |
| 400 | Validation error, bad request |
| 401 | No/invalid JWT token |
| 403 | Insufficient role (isBlocked, not admin) |
| 404 | Resource not found |
| 500 | Unexpected server error |

## Response Format
```js
// Success
{ success: true, data: {}, message: 'Thành công' }

// Error
{ success: false, message: 'Mô tả lỗi cụ thể' }
```

## Models (10 Mongoose schemas)

| Model | Key Business Fields | Soft Delete |
|-------|-------------------|-------------|
| `User` | role(customer/admin), **isBlocked**, wishlist[], preferences[], cartAbandonedAt | deletedAt |
| `Product` | **isActive** (soft delete), tags[], featured, stock, sold | isActive flag |
| `Order` | orderStatus(pending/confirmed/shipping/delivered/cancelled), paymentMethod | deletedAt |
| `Activity` | action(view/add_cart/purchase/remove_cart) — for marketing cron | deletedAt |
| `BehavioralEvent` | eventType, weight, userId, productId, metadata — **for ML training** | TTL 90 days |
| `FeatureSnapshot` | rfmScores, recentViews, purchasedCategories — **for AI features** | TTL 180 days |
| `ModelVersion` | modelType(cf/cbf), version(YYYY-MM-DD), isActive, metrics, artifactUrl | — |
| `DiscountCode` | type(percent/fixed), usageLimit, usedCount, expiresAt | deletedAt |
| `Notification` | type(order/wishlist/promotion/system/new_product/ai), isRead | deletedAt |
| `MarketingLog` | type, status, aiGenerated — email audit log | — |

## Key Business Rules
```js
// Soft delete — never hard delete products
await Product.findByIdAndUpdate(id, { isActive: false });
Product.find({ isActive: true })  // always filter

// BehavioralEvent tracking (ML training pipeline reads this)
await BehavioralEvent.create({
  userId, productId,
  eventType: 'view',  // view | click | add_to_cart | purchase | rec_click
  weight: 1,          // view=1, click=1.5, add_to_cart=2, purchase=5, rec_click=1.5
  metadata: { placement: 'homepage' }
});

// AI circuit breaker (ai.controller.js)
// opossum: timeout=500ms, errorThreshold=50%, resetTimeout=60s
// Fallback: Product.find({ isActive: true, featured: true }).limit(n)

// Notification helper
const { createNotification } = require('./notification.controller');
await createNotification(userId, {
  type: 'order',   // 'order'|'wishlist'|'promotion'|'system'|'new_product'|'ai'
  title: 'Tiêu đề', message: 'Nội dung', link: '/orders/abc123'
});
```

## Middleware
```
protect     → verify JWT → attach req.user → check isBlocked (403 if blocked, admin exempt)
adminOnly   → check req.user.role === 'admin' → 403 if not
upload      → multer memory storage → Cloudinary stream upload
```

## Services

| Service | Purpose |
|---------|---------|
| `gemini.service.js` | Google Gemini 1.5 Flash — strip markdown, parse JSON response |
| `recommendation.service.js` | MongoDB content-based fallback (tag similarity + category match) |
| `marketing.service.js` | Gemini-generated email subject + HTML body |
| `email.service.js` | Nodemailer Gmail SMTP transport |

## Cron Jobs (`jobs/marketing.cron.js`)

| Schedule | Task |
|----------|------|
| `0 * * * *` | Abandoned cart detection (cartAbandonedAt >24h ago → send email) |
| `0 9 * * 1` | Weekly newsletter (Monday 9:00 AM) |

## Seed Pipeline
```bash
node seed.js
# Step 1: Clear products + users
# Step 2: Insert 100+ Vietnamese tech products
# Step 3: Create admin (admin@smartshop.com / admin123456)
# Step 4: Create 8 customers (customer@smartshop.com / customer123456)
# Step 5: seedBehavioralEvents() — ~2000 events for all users
# Step 6: seedFeatureSnapshots() — RFM + recentViews per user
```

Seeds 05-06 are also callable standalone:
```bash
node seeds/05-behavior-history.js
node seeds/06-feature-snapshots.js
```

## Environment Variables (see `.env.example`)
```
PORT=5000
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/smart-ecommerce
MONGODB_URI=mongodb+srv://...   # Atlas (production)
JWT_SECRET=<random 32+ chars>
JWT_EXPIRE=7d
FASTAPI_URL=http://localhost:8000
INTERNAL_SECRET=<random secret>
GEMINI_API_KEY=<from Google AI Studio>
CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET
EMAIL_USER=<gmail>
EMAIL_PASS=<16-char app password>
```
