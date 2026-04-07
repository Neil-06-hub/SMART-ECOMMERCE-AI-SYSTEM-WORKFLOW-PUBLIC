# Backend — Claude Context

> Stack: **Node.js 20 + Express 4 + MongoDB (Mongoose) + JWT**
> Entry: `server.js` (Express init, MongoDB connect, mount routes, start cron jobs)

## Quick Commands
```bash
npm run dev     # nodemon server.js — port 5000
node seed.js    # Reset DB + seed sample data (hữu ích khi demo)
```

## Route → Controller Map

| Route File | Controller | Base Prefix | Auth |
|-----------|-----------|-------------|------|
| `routes/auth.routes.js` | `auth.controller.js` | `/api/auth` | Public/Protected |
| `routes/product.routes.js` | `product.controller.js` | `/api/products` | Public + Admin |
| `routes/order.routes.js` | `order.controller.js` | `/api/orders` | User |
| `routes/ai.routes.js` | `ai.controller.js` | `/api/ai` | User |
| `routes/admin.routes.js` | `admin.controller.js` | `/api/admin` | Admin only |
| `routes/wishlist.routes.js` | `wishlist.controller.js` | `/api/wishlist` | User |
| `routes/notification.routes.js` | `notification.controller.js` | `/api/notifications` | User |
| `routes/discount.routes.js` | `discount.controller.js` | `/api/admin/discounts` | Admin only |

→ Chi tiết middleware: `middleware/CLAUDE.md`

## Controller Pattern Chuẩn
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

exports.create = async (req, res) => {
  try {
    const item = await Example.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
```

## HTTP Status Code Conventions
| Code | Khi nào dùng |
|------|-------------|
| 200 | GET/PUT thành công |
| 201 | POST tạo mới thành công |
| 400 | Validation error, bad request |
| 401 | Chưa đăng nhập (no/invalid token) |
| 403 | Không đủ quyền (isBlocked, not admin) |
| 404 | Resource không tìm thấy |
| 500 | Lỗi server không lường trước |

## Response Format
```js
// Success
{ success: true, data: {}, message: 'Thành công' }

// Error
{ success: false, message: 'Mô tả lỗi cụ thể' }
```

## Models Summary
→ Chi tiết đầy đủ: `models/CLAUDE.md`

| Model | Key Business Fields |
|-------|-------------------|
| `User` | role(customer/admin), **isBlocked**, wishlist[], preferences[] |
| `Product` | **isActive** (soft delete), tags[], featured, stock |
| `Order` | orderStatus(pending/confirmed/shipping/delivered/cancelled), paymentMethod |
| `Activity` | action(view/add_cart/purchase/remove_cart) — dùng cho AI |
| `MarketingLog` | type, status, aiGenerated |
| `Notification` | type(order/wishlist/promotion/system/new_product/ai), isRead |
| `DiscountCode` | type(percent/fixed), usageLimit, usedCount, expiresAt |

## Key Business Rules
```js
// Soft delete — không xóa thật
await Product.findByIdAndUpdate(id, { isActive: false });
// Query phải filter: Product.find({ isActive: true })

// Notification helper — dùng ở bất kỳ controller nào
const { createNotification } = require('./notification.controller');
await createNotification(userId, {
  type: 'order',      // 'order'|'wishlist'|'promotion'|'system'|'new_product'|'ai'
  title: 'Tiêu đề',
  message: 'Nội dung thông báo',
  link: '/orders/abc123'
});

// User blocking — protect middleware tự xử lý
// Nếu user.isBlocked === true → 403 Forbidden (admin exempt)
```

## Middleware
→ Chi tiết: `middleware/CLAUDE.md`
```
protect     → verify JWT, attach req.user (check isBlocked)
adminOnly   → check req.user.role === 'admin'
upload      → multer memory storage → Cloudinary stream
```

## Services
→ Chi tiết: `services/CLAUDE.md`

| Service | Chức năng |
|---------|----------|
| `gemini.service.js` | Gọi Gemini API, strip markdown, parse JSON |
| `recommendation.service.js` | Content-based (tags) + Collaborative (activity) |
| `marketing.service.js` | AI-generated email subject + HTML body |
| `email.service.js` | Gửi qua Nodemailer Gmail SMTP |

## Cron Jobs (`jobs/marketing.cron.js`)
| Schedule | Task |
|----------|------|
| `0 * * * *` | Abandoned cart emails (cart không empty + last activity >24h) |
| `0 9 * * 1` | Weekly newsletter hàng tuần (Thứ Hai 9:00 AM) |

## Environment Variables
→ Template đầy đủ: `.env.example`
```
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/smart-ecommerce
JWT_SECRET=<random 32+ chars>
JWT_EXPIRE=7d
GEMINI_API_KEY=<from Google AI Studio>
CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET
EMAIL_USER=<gmail>
EMAIL_PASS=<16-char app password từ Google Account Settings>
```

## Config Files
| File | Nội dung |
|------|---------|
| `config/db.js` | MongoDB connect với Mongoose |
| `config/cloudinary.js` | Cloudinary SDK init |
