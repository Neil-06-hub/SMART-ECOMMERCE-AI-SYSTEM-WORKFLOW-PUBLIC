# Models — Claude Context

> Tất cả models dùng **Mongoose** ODM. File trong `models/`.
> Quy tắc chung: **không hard delete** — dùng soft delete (`isActive: false`) cho Product.

## User Model (`User.js`)

| Field | Type | Default | Mô tả |
|-------|------|---------|-------|
| `name` | String | required | Họ tên |
| `email` | String | required, unique | Email đăng nhập |
| `password` | String | required | Bcrypt hashed |
| `role` | String | `'customer'` | `'customer'` \| `'admin'` |
| `avatar` | String | '' | URL ảnh đại diện |
| `phone` | String | '' | Số điện thoại |
| `address` | String | '' | Địa chỉ giao hàng mặc định |
| `dob` | Date | - | Ngày sinh |
| `gender` | String | - | `'male'` \| `'female'` \| `'other'` |
| `preferences` | [String] | [] | Danh mục yêu thích (cho AI recommendation) |
| `wishlist` | [ObjectId] → Product | [] | IDs sản phẩm trong wishlist |
| `isBlocked` | Boolean | `false` | Admin block user → protect middleware check |
| `emailConsent` | Boolean | `true` | Đồng ý nhận marketing email |
| `cartAbandonedAt` | Date | - | Thời điểm cuối cùng thêm vào cart |
| `cartAbandonedNotified` | Boolean | `false` | Đã gửi abandoned cart email chưa |

**Business Rules**:
- Password hash với bcrypt trước `save` (pre-save hook)
- `isBlocked: true` → `protect` middleware trả 403 (trừ admin)
- `cartAbandonedAt` update mỗi khi user thêm item vào giỏ (client-side track hoặc qua activity)

## Product Model (`Product.js`)

| Field | Type | Default | Mô tả |
|-------|------|---------|-------|
| `name` | String | required | Tên sản phẩm |
| `description` | String | required | Mô tả chi tiết |
| `price` | Number | required | Giá bán |
| `originalPrice` | Number | - | Giá gốc (để tính % giảm) |
| `category` | String | required | Danh mục chính |
| `tags` | [String] | [] | Tags cho AI content-based filtering |
| `image` | String | required | Cloudinary URL |
| `stock` | Number | required | Số lượng tồn kho |
| `sold` | Number | `0` | Số lượng đã bán |
| `reviews` | [ReviewSchema] | [] | Embedded reviews |
| `rating` | Number | `0` | Điểm đánh giá trung bình |
| `numReviews` | Number | `0` | Tổng số review |
| `featured` | Boolean | `false` | Hiển thị ở trang chủ |
| `isActive` | Boolean | `true` | **Soft delete flag** |

**Business Rules**:
- Query public products: `Product.find({ isActive: true })`
- Soft delete: `Product.findByIdAndUpdate(id, { isActive: false })`
- Tags array là input cho `$setIntersection` trong recommendation aggregation
- `rating` & `numReviews` tự cập nhật sau mỗi review mới

## Order Model (`Order.js`)

| Field | Type | Mô tả |
|-------|------|-------|
| `user` | ObjectId → User | required |
| `items` | [{ product, name, price, image, quantity }] | required |
| `shippingAddress` | { name, phone, address, city } | required |
| `paymentMethod` | String | `'COD'` \| `'banking'` \| `'momo'` |
| `paymentStatus` | String | `'pending'` \| `'paid'` |
| `orderStatus` | String | `'pending'` → `'confirmed'` → `'shipping'` → `'delivered'` / `'cancelled'` |
| `subtotal` | Number | Giá trước discount + shipping |
| `shippingFee` | Number | Phí ship |
| `discount` | Number | Số tiền được giảm |
| `totalAmount` | Number | Tổng thanh toán cuối cùng |
| `note` | String | Ghi chú của khách |
| `discountCode` | String | Mã giảm giá đã áp dụng |

**Order Status Flow**:
```
pending → confirmed → shipping → delivered
        ↘ cancelled (có thể cancel ở bước pending/confirmed)
```

## Activity Model (`Activity.js`)

| Field | Type | Mô tả |
|-------|------|-------|
| `user` | ObjectId → User | required |
| `product` | ObjectId → Product | required |
| `action` | String | `'view'` \| `'add_cart'` \| `'purchase'` \| `'remove_cart'` |
| `createdAt` | Date | Auto (timestamps: true) |

**Dùng cho**:
- Collaborative filtering (tìm user có hành vi tương tự)
- Abandoned cart detection (user.cartAbandonedAt tracking)

## Notification Model (`Notification.js`)

| Field | Type | Mô tả |
|-------|------|-------|
| `user` | ObjectId → User | required |
| `type` | String | `'order'`\|`'wishlist'`\|`'promotion'`\|`'system'`\|`'new_product'`\|`'ai'` |
| `title` | String | Tiêu đề hiển thị |
| `message` | String | Nội dung chi tiết |
| `link` | String | URL để navigate khi click |
| `isRead` | Boolean | `false` default |

**Cách tạo**:
```js
const { createNotification } = require('../controllers/notification.controller');
await createNotification(userId, { type, title, message, link });
```

## DiscountCode Model (`DiscountCode.js`)

| Field | Type | Mô tả |
|-------|------|-------|
| `code` | String | unique, uppercase (enforced) |
| `type` | String | `'percent'` \| `'fixed'` |
| `value` | Number | Phần trăm hoặc số tiền giảm |
| `minOrderAmount` | Number | Đơn tối thiểu để áp dụng |
| `maxDiscount` | Number | Giảm tối đa (cho percent type) |
| `usageLimit` | Number | Số lần dùng tối đa |
| `usedCount` | Number | Số lần đã dùng |
| `isActive` | Boolean | Admin bật/tắt |
| `expiresAt` | Date | Hạn hết hiệu lực |
| `description` | String | Mô tả nội bộ |

## MarketingLog Model (`MarketingLog.js`)

| Field | Type | Mô tả |
|-------|------|-------|
| `type` | String | `'abandoned_cart'` \| `'newsletter'` \| `'manual'` |
| `recipient` | String | Email người nhận |
| `recipientName` | String | Tên người nhận |
| `subject` | String | Tiêu đề email |
| `content` | String | Nội dung HTML |
| `status` | String | `'sent'` \| `'failed'` \| `'skipped'` |
| `aiGenerated` | Boolean | Content có được tạo bởi Gemini không |

## Index Strategy

```js
// Indexes cần thiết cho performance
User:         email (unique), isBlocked
Product:      isActive, category, tags, featured
Order:        user, orderStatus, createdAt
Activity:     user + product (compound), createdAt
Notification: user + isRead (compound)
DiscountCode: code (unique), isActive, expiresAt
```
