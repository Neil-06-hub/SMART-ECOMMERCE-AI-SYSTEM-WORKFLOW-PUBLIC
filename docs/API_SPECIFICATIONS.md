# API & DATA MODEL CONTRACT
**Project:** SMART ECOMMERCE AI SYSTEM
**Version:** 1.1.0
**Target Audience:** Frontend (FE) & Backend (BE) Teams

---

## 1. Overview
Tài liệu này là bản đặc tả (Specification) thống nhất giữa Backend và Frontend, định nghĩa rõ cấu trúc dữ liệu cơ sở, chuẩn giao tiếp API, và chi tiết Request/Response Schema.

*(...Các phần 1.2, 1.3, 1.4 giữ nguyên cấu trúc chuẩn hóa, ưu tiên đi sâu vào Section 4...)*

---

## 2. API Common Types (TypeScript)
Để dùng chung cho toàn bộ spec, dưới đây là các Generic Interface:

```typescript
// Envelope chuẩn của hệ thống
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    requestId: string;
    [key: string]: any;
  };
}

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    requestId: string;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
  }
  meta: { requestId: string; }
}

interface MetaPagination {
  page?: number;     // default: 1
  limit?: number;    // default: 20
  sort?: string;     // default: 'createdAt'
  order?: 'asc' | 'desc'; // default: 'desc'
}
```

---

## 3. Detailed API Endpoints

### 3.1. Auth Module

#### 3.1.1. User Registration
- **Method:** `POST`
- **URL:** `/api/v1/auth/register`
- **Mô tả:** Khởi tạo tài khoản Buyer mới.

**Schemas & Interfaces:**
```typescript
// Request Body
interface RegisterRequest {
  email: string;     // Mẫu: email hợp lệ
  password: string;  // Min 8 chars, 1 uppercase, 1 special
  fullName: string;
}

// Response Data
interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
}
```

**Ví dụ:**
```json
// --- Request Body ---
{
  "email": "buyer@example.com",
  "password": "Password@123",
  "fullName": "Nguyen Van A"
}

// --- Success Response (201 Created) ---
{
  "success": true,
  "data": {
    "id": "60d0fe4f5311236168a109ca",
    "email": "buyer@example.com",
    "fullName": "Nguyen Van A"
  },
  "meta": { "requestId": "req-111" }
}

// --- Error Response (409 Conflict) ---
{
  "success": false,
  "error": {
    "code": "AUTH_EMAIL_EXISTS",
    "message": "Email đã tồn tại trong hệ thống"
  },
  "meta": { "requestId": "req-111" }
}
```

#### 3.1.2. User Login
- **Method:** `POST`
- **URL:** `/api/v1/auth/login`
- **Mô tả:** Đăng nhập Account. Backend trả Access Token qua JSON Body và tự lưu Refresh Token vào HttpOnly Cookie.

**Schemas & Interfaces:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
  }
}
```

**Ví dụ:**
```json
// --- Request Body ---
{
  "email": "buyer@example.com",
  "password": "Password@123"
}

// --- Success Response (200 OK) ---
// Note: Header trả kèm `Set-Cookie: refreshToken=...; HttpOnly; Secure`
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUz...",
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "email": "buyer@example.com",
      "fullName": "Nguyen Van A",
      "roles": ["buyer"]
    }
  },
  "meta": { "requestId": "req-222" }
}
```

---

### 3.2. Catalog Module

#### 3.2.1. Lấy danh sách sản phẩm
- **Method:** `GET`
- **URL:** `/api/v1/products`
- **Mô tả:** Phân trang, Search, Filter sản phẩm. Hoạt động trên mọi Role.

**Schemas & Interfaces:**
```typescript
// Request Query Params
interface GetProductsParams extends MetaPagination {
  q?: string;           // Search keyword
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  avgRating: number;
  images: string[];
  price: number;       // Trích xuất từ Default Variant
  comparePrice?: number; 
}
// Response là: ApiListResponse<ProductItem>
```

**Ví dụ:**
```http
// --- Request ---
GET /api/v1/products?categoryId=cat-123&page=1&limit=20&sort=price&order=asc
```
```json
// --- Success Response (200 OK) ---
{
  "success": true,
  "data": [
    {
      "id": "prod-1",
      "sku": "TSHIRT-01",
      "name": "Áo Thun Basic",
      "avgRating": 4.8,
      "images": ["https://r2.../img1.png"],
      "price": 199000,
      "comparePrice": 250000
    }
  ],
  "meta": {
    "requestId": "req-333",
    "total": 105,
    "page": 1,
    "limit": 20,
    "totalPages": 6
  }
}
```

#### 3.2.2. Chi tiết sản phẩm
- **Method:** `GET`
- **URL:** `/api/v1/products/:id`
- **Mô tả:** Xem chi tiết 1 sản phẩm chứa mảng Variants (Màu, Size, Giá tương ứng).

**Schemas & Interfaces:**
```typescript
interface ProductVariant {
  sku: string;
  attributes: Record<string, string>; // { "size": "L", "color": "Red" }
  price: number;
  comparePrice?: number;
  stock: number;
  images: string[];
}

interface ProductDetail extends ProductItem {
  description: string;
  attributes: Record<string, any>;
  variants: ProductVariant[];
  categoryId: string;
}
// Response: ApiResponse<ProductDetail>
```

**Ví dụ:**
```json
// --- Success Response (200 OK) ---
{
  "success": true,
  "data": {
    "id": "prod-1",
    "sku": "TSHIRT-01",
    "name": "Áo Thun Basic",
    "description": "Áo thun cotton mát mẻ...",
    "avgRating": 4.8,
    "images": ["https://r2.../img1.png"],
    "price": 199000,
    "attributes": { "material": "Cotton 100%" },
    "categoryId": "cat-88",
    "variants": [
      {
        "sku": "TSHIRT-01-RED-L",
        "attributes": { "size": "L", "color": "Red" },
        "price": 199000,
        "stock": 25,
        "images": []
      }
    ]
  },
  "meta": { "requestId": "req-444" }
}
```

---

### 3.3. Cart Module

#### 3.3.1. Cập nhật Giỏ Hàng
- **Method:** `PUT`
- **URL:** `/api/v1/cart/items`
- **Mô tả:** Thêm Item hoặc sửa Số lượng. Nếu Client là Guest, dùng Header `x-session-id`.

**Schemas & Interfaces:**
```typescript
// Headers
interface CartHeaders {
  Authorization?: string; // Cho logged in user
  "x-session-id"?: string; // Cho Guest user
}

// Request Body
interface UpdateCartItemRequest {
  productId: string;
  variantSku: string;
  qty: number; // Gọi qty = 0 đồng nghĩa với xóa item đó
}

// Response Data
interface CartResponse {
  items: Array<{
    productId: string;
    variantSku: string;
    qty: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount: number;
  total: number;
}
```

**Ví dụ:**
```json
// --- Request ---
// Headers: { "x-session-id": "guest-uuid-1234" }
{
  "productId": "prod-1",
  "variantSku": "TSHIRT-01-RED-L",
  "qty": 2
}

// --- Success Response (200 OK) ---
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "prod-1",
        "variantSku": "TSHIRT-01-RED-L",
        "qty": 2,
        "price": 199000,
        "subtotal": 398000
      }
    ],
    "subtotal": 398000,
    "discount": 0,
    "total": 398000
  },
  "meta": { "requestId": "req-555" }
}

// --- Error Response (422 Unprocessable Entity - Out of Stock) ---
{
  "success": false,
  "error": {
    "code": "PRODUCT_OUT_OF_STOCK",
    "message": "Sản phẩm không đủ tồn kho",
    "details": [{ "variantSku": "TSHIRT-01-RED-L", "availableStock": 1 }]
  },
  "meta": { "requestId": "req-666" }
}
```

---

### 3.4. Order & Checkout Module

#### 3.4.1. Khởi tạo Đơn Hàng (Checkout)
- **Method:** `POST`
- **URL:** `/api/v1/orders`
- **Mô tả:** Đặt hàng từ dữ liệu trong Cart hiện tại của User.

**Schemas & Interfaces:**
```typescript
// Request Body
interface CreateOrderRequest {
  shippingAddressId: string; // Khóa ngoại reference tới User.addresses
  paymentMethod: 'vnpay' | 'cod';
  note?: string;
  couponCode?: string; // Tùy chọn (Nếu frontend muốn gửi chốt lần cuối)
}

// Response
interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  paymentUrl?: string; // Trả về link VNPay ngay nếu chọn paymentMethod='vnpay'
}
```

**Ví dụ:**
```json
// --- Request Body ---
{
  "shippingAddressId": "addr-1",
  "paymentMethod": "vnpay",
  "note": "Giao giờ hành chính"
}

// --- Success Response (201 Created) ---
{
  "success": true,
  "data": {
    "orderId": "60d0fe...",
    "orderNumber": "ORD-202610-0099",
    "totalAmount": 398000,
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
  },
  "meta": { "requestId": "req-777" }
}
```

---

### 3.5. Recommendation Module

#### 3.5.1. Lấy Sản Phẩm Đề Xuất (AI Model)
- **Method:** `GET`
- **URL:** `/api/v1/recommendations`
- **Mô tả:** Gateway BE sẽ wrap lại request, gọi nội bộ sang model Python bằng gRPC/HTTP và Circuit Breaker.

**Schemas & Interfaces:**
```typescript
// Query Param
interface GetRecsParams {
  placement: 'homepage' | 'cart' | 'pdp';
  productId?: string; // Bắt buộc nếu placement là 'pdp'
  n?: number; // mặc định 10
}

// Result trả về đúng format của GET /products
// Response: ApiListResponse<ProductItem>
```

**Ví dụ:**
```http
// --- Request ---
// GET /api/v1/recommendations?placement=homepage&n=5
// Headers: { "x-session-id": "guest-uuid-1234" }
```
```json
// --- Success Response (200 OK) ---
{
  "success": true,
  "data": [
    { "id": "prod-9", "name": "Giày đi bộ", "price": 450000, "images": [] },
    { "id": "prod-12", "name": "Mũ Lưỡi Trai", "price": 95000, "images": [] }
  ],
  "meta": {
    "requestId": "req-888",
    "source": "model_lightfm",    // Hoặc "fallback_popular" nếu AI rớt mạng
    "total": 2, "page": 1, "limit": 5, "totalPages": 1
  }
}
```

#### 3.5.2. Ghi nhận Tracking Events
- **Method:** `POST`
- **URL:** `/api/v1/events`
- **Mô tả:** Client bắn Fire-And-Forget event tracking về Server. Không delay UI.

**Schemas & Interfaces:**
```typescript
interface SendEventRequest {
  eventType: 'view' | 'add_to_cart' | 'purchase' | 'search' | 'rec_click';
  productId?: string;  // ID sp phát sinh hành động
  metadata?: Record<string, any>; // Lưu trữ query search, cart_total, etc.
}
```

**Ví dụ:**
```json
// --- Request ---
{
  "eventType": "view",
  "productId": "prod-1",
  "metadata": {
    "referrer": "homepage_banner"
  }
}

// --- Success Response (201) ---
{
  "success": true,
  "data": true,
  "meta": { "requestId": "req-999" }
}
```

---

## 4. Error Code Dictionary

Liệt kê các mã lỗi Frontend phải map để làm nghiệp vụ hiển thị linh động. Do TS Response trả về field `error.code`.

| Error Code | HTTP Status | Use Case / Handle UI Action |
|---|---|---|
| `AUTH_TOKEN_EXPIRED` | 401 | Cấu hình axios Interceptors gọi refresh ngầm, sau đó repeat call. |
| `AUTH_REFRESH_INVALID` | 401 | Yêu cầu user login lại. Mất session. Xóa sạch persist store. |
| `VALIDATION_ERROR` | 422 | Loop qua `details[]` tô đỏ viền Form inputs nào nhập sai format. |
| `PRODUCT_NOT_FOUND` | 404 | Chuyển trang về màn 404 Empty State. |
| `PRODUCT_OUT_OF_STOCK` | 422 | Tồn kho không đủ. Reload giỏ hàng, báo Hết hàng item đó. |
| `ORDER_INVALID_TRANSITION` | 422 | FSM Block. Trạng thái Cancel -> Paid là vô lý. Alert lỗi Admin FE. |
| `RATE_LIMIT_EXCEEDED` | 429 | Freeze nút submit, hiện thông báo "Vui lòng chờ chậm lại...". |

---
_Đây là bộ Spec API Reference Detailed (v1.1). Dùng File này làm Ground Truth cho việc định hình dữ liệu TypeScript trong Front-End codebase._
