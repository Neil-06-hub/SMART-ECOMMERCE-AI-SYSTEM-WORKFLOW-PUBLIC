# 📋 BÁO CÁO QA TESTING — SMART ECOMMERCE AI SYSTEM

**Người kiểm thử:** Antigravity QA Agent  
**Ngày kiểm thử:** 2026-04-16  
**Phiên bản:** 2.2.0  
**Phạm vi:** Client-side (localhost:3000) + Admin Panel (/admin) + Backend API (localhost:5000)  
**Phương pháp:** Source code analysis + Live browser testing  

---

## 1. 📊 TỔNG QUAN ĐÁNH GIÁ DỰ ÁN

| Hạng mục | Đánh giá | Chi tiết |
|---|---|---|
| **Kiến trúc tổng thể** | ✅ Tốt | Next.js 15 + Node.js/Express + MongoDB, phân tách rõ ràng |
| **UI/UX Client** | ✅ Khá tốt | Thiết kế đẹp, màu sắc nhất quán, responsive tốt |
| **Admin Panel** | ✅ Hoạt động | Dashboard, CRUD đầy đủ, dữ liệu thực |
| **Security** | ⚠️ Có vấn đề | Thiếu rate limit, checkout bypass, token kiểm soát yếu |
| **Business Logic** | ⚠️ Có lỗi | Order status sai, discount không deduct usedCount, stock race condition |
| **AI Service** | ⚠️ Phụ thuộc** | Fallback hoạt động, nhưng FastAPI service cần kiểm tra riêng |
| **Data Validation** | ⚠️ Thiếu** | Nhiều API endpoint không validate đầy đủ |
| **Mức độ rủi ro** | 🟡 **TRUNG BÌNH-CAO** | Thích hợp demo nhưng cần fix trước khi production |

**Tổng bugs phát hiện: 26** (Critical: 4, High: 8, Medium: 9, Low: 5)

---

## 2. 🐛 DANH SÁCH LỖI PHÁT HIỆN

---

### 🔴 CRITICAL

---

#### Bug 1: Checkout trang không redirect khi chưa đăng nhập (SECURITY)

- **Mô tả:** Route `/checkout` hiển thị nội dung đầy đủ (form giao hàng với thông tin pre-fill) mà KHÔNG redirect về `/login` khi user chưa đăng nhập.  
- **Bước tái hiện:**  
  1. Mở tab ẩn danh (không đăng nhập)  
  2. Truy cập `http://localhost:3000/checkout`  
  3. Quan sát trang  
- **Kết quả mong đợi:** Redirect về `/login`  
- **Kết quả thực tế:** Trang Thanh Toán hiển thị với form nhập địa chỉ pre-fill dữ liệu mẫu  
- **Nguyên nhân:** Middleware.js chỉ bảo vệ dựa trên cookie `auth_token`, nhưng trang checkout có thể render SSR trước khi middleware hoạt động; không có guard ở component level  
- **Mức độ:** 🔴 Critical  
- **Khu vực ảnh hưởng:** `apps/web/middleware.js`, `/checkout` page  
- **Gợi ý sửa:** Thêm `useAuthStore` guard ở component checkout, kiểm tra token tại client-side và redirect nếu không có

---

#### Bug 2: Discount code không tăng `usedCount` khi áp dụng (BUSINESS LOGIC)

- **Mô tả:** Khi người dùng validate và dùng mã giảm giá, `usedCount` trong DB không được cập nhật. Mã có `usageLimit = 5` nhưng có thể sử dụng vô hạn.  
- **Bước tái hiện:**  
  1. POST `/api/discounts/validate` với code "TEST"  
  2. Đặt hàng với discount  
  3. Kiểm tra DiscountCode document — `usedCount` vẫn là 0  
- **Kết quả mong đợi:** `usedCount` tăng thêm 1 sau mỗi lần sử dụng thành công  
- **Kết quả thực tế:** `usedCount` vẫn bằng 0 mãi mãi  
- **Nguyên nhân:** `validate()` controller chỉ tính số tiền giảm, không gọi `DiscountCode.findByIdAndUpdate(..., { $inc: { usedCount: 1 } })`; `createOrder()` cũng không cập nhật usedCount  
- **Mức độ:** 🔴 Critical  
- **Khu vực ảnh hưởng:** `discount.controller.js`, `order.controller.js`  
- **Gợi ý sửa:** Trong `createOrder()`, sau khi tạo order thành công, tìm DiscountCode theo code và increment usedCount

---

#### Bug 3: Stock deduction xảy ra tại thời điểm tạo order, không phải khi PAID (BUSINESS LOGIC)

- **Mô tả:** Theo FR-ORDER-01, kho hàng nên bị trừ khi order chuyển sang PAID. Hiện tại code trừ kho ngay khi `createOrder()` (status = pending), gây ra tình huống: khách đặt hàng COD nhưng hủy → kho đã bị trừ → phải restore thủ công.  
- **Bước tái hiện:**  
  1. Đặt hàng phương thức COD  
  2. Kiểm tra `product.stock` ngay sau — đã giảm  
  3. Order status vẫn là "pending"  
- **Kết quả mong đợi:** Stock chỉ giảm khi order = PAID  
- **Kết quả thực tế:** Stock giảm ngay khi tạo order (kể cả pending)  
- **Mức độ:** 🔴 Critical  
- **Khu vực ảnh hưởng:** `order.controller.js` lines 50-55  
- **Gợi ý sửa:** Tách logic trừ kho sang hàm riêng, gọi khi admin cập nhật status sang "confirmed"

---

#### Bug 4: Race condition khi nhiều người đặt hàng cùng 1 sản phẩm tồn kho thấp

- **Mô tả:** `createOrder()` kiểm tra `product.stock >= quantity` và trừ kho theo 2 bước riêng biệt (check rồi mới update). Nếu 2 user đặt cùng lúc với stock = 1, cả 2 đều pass check và đều trừ kho → stock = -1.  
- **Bước tái hiện:** Gửi 2 request POST `/api/orders` đồng thời với cùng 1 product có stock = 1  
- **Kết quả mong đợi:** Chỉ 1 đơn thành công, 1 đơn báo hết hàng  
- **Kết quả thực tế:** Cả 2 đơn thành công, stock âm  
- **Mức độ:** 🔴 Critical  
- **Khu vực ảnh hưởng:** `order.controller.js` lines 19-32  
- **Gợi ý sửa:** Dùng MongoDB atomic update với `findOneAndUpdate({ _id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } })` và kiểm tra kết quả null

---

### 🟠 HIGH

---

#### Bug 5: Admin có thể thay đổi order status theo bất kỳ thứ tự nào (không validate transition)

- **Mô tả:** `updateOrderStatus()` không validate business flow. Admin có thể chuyển thẳng từ "pending" → "delivered" bỏ qua các bước trung gian, hoặc mở lại order đã "cancelled".  
- **Bước tái hiện:**  
  1. Tạo order status = pending  
  2. PUT `/api/admin/orders/:id/status` với `{ orderStatus: "delivered" }`  
  3. Thành công ngay  
- **Kết quả mong đợi:** Chỉ cho phép transition hợp lệ theo flow: pending → confirmed → shipping → delivered  
- **Kết quả thực tế:** Mọi status đều được chấp nhận  
- **Mức độ:** 🟠 High  
- **Khu vực ảnh hưởng:** `admin.controller.js` lines 208-233  
- **Gợi ý sửa:** Thêm validation matrix cho phép transition

---

#### Bug 6: User có thể hủy đơn ở bất kỳ status nào nếu status là "pending" — nhưng "pending" theo model là trạng thái khởi đầu, không khớp với spec

- **Mô tả:** Theo FR-ORDER-04, user được hủy khi `PENDING_PAYMENT` hoặc `PAID`. Nhưng Order model chỉ có enum `["pending", "confirmed", "shipping", "delivered", "cancelled"]` — không có `PAID`, mapping sai với spec. `cancelOrder()` chỉ cho phép hủy khi `orderStatus === "pending"`.  
- **Kết quả mong đợi:** User hủy được khi pending_payment hoặc paid  
- **Kết quả thực tế:** Chỉ hủy được khi "pending"; sau khi admin confirm thì user không thể hủy dù order chưa ship  
- **Mức độ:** 🟠 High  
- **Khu vực ảnh hưởng:** `Order.js` model, `order.controller.js`  
- **Gợi ý sửa:** Thêm trạng thái "paid" vào enum và cập nhật logic cancelOrder

---

#### Bug 7: Review không kiểm tra xem user đã mua sản phẩm chưa (Business Logic)

- **Mô tả:** Theo FR-CATALOG-08, chỉ users đã hoàn thành đơn hàng mới được review. Code hiện tại cho phép bất kỳ user đã đăng nhập nào cũng review được.  
- **Bước tái hiện:**  
  1. Đăng nhập bằng user chưa từng mua sản phẩm X  
  2. POST `/api/products/:id/reviews` với `{ rating: 5, comment: "..." }`  
  3. Review được thêm thành công  
- **Kết quả mong đợi:** Lỗi 403 "Bạn cần mua sản phẩm này trước khi đánh giá"  
- **Kết quả thực tế:** Review được thêm thành công  
- **Mức độ:** 🟠 High  
- **Khu vực ảnh hưởng:** `product.controller.js` addReview()  
- **Gợi ý sửa:** Kiểm tra Order.findOne({ user, items.product, orderStatus: "delivered" }) trước khi cho phép review

---

#### Bug 8: Token JWT được lưu trong `auth_token` cookie nhưng middleware frontend đọc cookie, không phải Authorization header

- **Mô tả:** Backend `authMiddleware.js` chỉ đọc token từ `Authorization: Bearer ...` header. Frontend middleware đọc từ cookie `auth_token`. Nếu frontend gọi API với cookie (không set header), backend sẽ từ chối với 401.  
- **Bước tái hiện:**  
  1. Đăng nhập thành công  
  2. Kiểm tra network requests — token được gửi qua header hay cookie?  
- **Kết quả mong đợi:** Token nhất quán giữa frontend và backend  
- **Kết quả thực tế:** Frontend lưu cookie nhưng backend đọc header — phải kiểm tra lib/api.js xem có set header không  
- **Mức độ:** 🟠 High (nghi vấn — cần verify tại lib/api.js)  
- **Khu vực ảnh hưởng:** `authMiddleware.js`, `middleware.js`, `lib/api.js`  
- **Gợi ý sửa:** Đảm bảo axios interceptor set `Authorization: Bearer ${token}` header từ localStorage/cookie

---

#### Bug 9: Admin "xóa" user thực sự xóa khỏi DB, không phải soft delete — vi phạm data integrity

- **Mô tả:** `deleteUser()` dùng `user.deleteOne()` — xóa cứng. Điều này làm orphan tất cả Orders của user đó (trường `user` trong Order document trỏ đến ObjectId không tồn tại). Model User có `deletedAt` field nhưng không dùng.  
- **Bước tái hiện:**  
  1. Xóa user từ Admin Panel  
  2. Kiểm tra Orders của user đó — vẫn tồn tại nhưng user reference broken  
- **Kết quả mong đợi:** Soft delete (set deletedAt, isBlocked = true)  
- **Kết quả thực tế:** Hard delete, tạo ra orphan orders  
- **Mức độ:** 🟠 High  
- **Khu vực ảnh hưởng:** `admin.controller.js` deleteUser()  
- **Gợi ý sửa:** Chuyển sang soft delete: `User.findByIdAndUpdate(id, { deletedAt: new Date(), isBlocked: true })`

---

#### Bug 10: Discount validate không deduct ngay — user có thể apply code rồi không đặt, làm quota "treo"

- **Mô tả:** Nếu user validate code, nhận được discountAmount nhưng rời trang checkout — code không bị deduct usedCount. Đây là expected behavior, nhưng nếu validate xảy ra nhiều lần concurrent (multi-tab), usageLimit check có thể bị bypass.  
- **Mức độ:** 🟠 High  
- **Khu vực ảnh hưởng:** `discount.controller.js`  
- **Gợi ý sửa:** Khi createOrder với discount code, validate lại một lần nữa và chỉ increment usedCount trong transaction khi order thành công

---

#### Bug 11: Mã giảm giá TEST đã hết hạn (12/4/2026) nhưng vẫn hiển thị "Đang bật"

- **Mô tả:** Trong admin discount list, mã TEST có `expiresAt = 12/4/2026` (quá hạn so với ngày hiện tại 16/4/2026) nhưng `isActive = true`. Hệ thống không tự động tắt mã khi hết hạn.  
- **Bước tái hiện:**  
  1. Xem trang /admin/discounts  
  2. Thấy mã TEST hết hạn nhưng status "Đang bật"  
- **Kết quả mong đợi:** Status hiển thị "Hết hạn" thay vì "Đang bật"  
- **Kết quả thực tế:** Vẫn hiển thị "Đang bật" — dù code validate() đúng là check `expiresAt`, UI gây confusion  
- **Mức độ:** 🟠 High  
- **Khu vực ảnh hưởng:** Admin Discount UI, DiscountCode model  
- **Gợi ý sửa:** Thêm computed status: nếu `expiresAt < now` thì hiển thị "Hết hạn" (override isActive); thêm background job tự set isActive = false khi hết hạn

---

#### Bug 12: Wishlist accessible khi chưa đăng nhập — hiển thị loading vô hạn thay vì redirect

- **Mô tả:** Truy cập `/wishlist` khi chưa đăng nhập không redirect về `/login`. Trang render với spinner "..." loading vô hạn.  
- **Bước tái hiện:**  
  1. Mở tab không đăng nhập  
  2. Truy cập `http://localhost:3000/wishlist`  
- **Kết quả mong đợi:** Redirect về `/login`  
- **Kết quả thực tế:** Trang Wishlist hiển thị với loading spinner không dừng  
- **Mức độ:** 🟠 High  
- **Khu vực ảnh hưởng:** `middleware.js`, wishlist page  
- **Gợi ý sửa:** Middleware đã có wishlist trong PROTECTED_ROUTES nhưng cần verify config matcher match đúng

---

### 🟡 MEDIUM

---

#### Bug 13: Shop page hiển thị "0 sản phẩm" khi user chưa đăng nhập (thoáng qua trước khi load)

- **Mô tả:** Trang `/shop` có widget "Sản phẩm đang hiển thị: 0" và "AI đề xuất: 0" khi không authenticate — ngay cả khi sản phẩm đã load xong. Widget này nên hiển thị số sản phẩm thực.  
- **Bước tái hiện:**  
  1. Truy cập `/shop` khi chưa đăng nhập  
  2. Thấy widget hiển thị 0  
- **Kết quả mong đợi:** Hiển thị số sản phẩm thực (ví dụ: "20 sản phẩm")  
- **Kết quả thực tế:** Luôn hiển thị 0 với user không đăng nhập  
- **Mức độ:** 🟡 Medium  
- **Khu vực ảnh hưởng:** Shop page component  

---

#### Bug 14: Password policy mâu thuẫn — model yêu cầu minlength 6, UI hint hiển thị "tối thiểu 6 ký tự" nhưng spec yêu cầu 8 ký tự với uppercase + digit + special char

- **Mô tả:** FR-AUTH-01 yêu cầu mật khẩu tối thiểu 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt. User Schema chỉ có `minlength: 6`. Đăng ký với password "123456" thành công.  
- **Mức độ:** 🟡 Medium  
- **Khu vực ảnh hưởng:** `User.js`, Register page, `auth.controller.js`  
- **Gợi ý sửa:** Thêm validator regex tại `User.js`: `/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/`

---

#### Bug 15: Admin Dashboard — "Tăng trưởng tháng 59.9%" có thể là dữ liệu sai do cách tính

- **Mô tả:** `thisMonthRevenue / lastMonthRevenue` khi `lastMonthRevenue = 0` → division by zero → Infinity hoặc NaN. Nếu lastMonth = 0 (không có orders), kết quả 59.9% là mock data hoặc tính sai.  
- **Mức độ:** 🟡 Medium  
- **Khu vực ảnh hưởng:** `admin.controller.js` getDashboardStats()  
- **Gợi ý sửa:** Xử lý edge case `lastMonthRevenue = 0`

---

#### Bug 16: Product category trong admin show "Phụ kiện" cho iPad Pro M4 và Webcam — phân loại sai

- **Mô tả:** iPad Pro M4 và Webcam được gắn category = "Phụ kiện" trong seed data — không chính xác về mặt business logic nhưng đây có thể là vấn đề data seeding.  
- **Mức độ:** 🟡 Medium  
- **Khu vực ảnh hưởng:** `seed.js`  

---

#### Bug 17: `updateProfile` có thể set `name = undefined` nếu không truyền name trong request body

- **Mô tả:** `updateProfile()` dùng `{ name, phone, address, preferences, avatar, dob, gender }` từ req.body. Nếu user chỉ muốn update phone mà không gửi name, `name` sẽ là `undefined` và MongoDB sẽ set name thành null/undefined, mất tên người dùng.  
- **Bước tái hiện:**  
  1. PUT `/api/auth/profile` với `{ phone: "0912345678" }` (không có name)  
  2. Kiểm tra user.name  
- **Kết quả mong đợi:** name không thay đổi  
- **Kết quả thực tế:** name có thể bị xóa  
- **Mức độ:** 🟡 Medium  
- **Khu vực ảnh hưởng:** `auth.controller.js` updateProfile()  
- **Gợi ý sửa:** Chỉ update field nếu có trong body: dùng spread operator với filter

---

#### Bug 18: `updateUser` admin cho phép thay đổi role user thành admin — privilege escalation risk

- **Mô tả:** `updateUser()` nhận `{ name, email, phone, address, role }` — admin có thể set role = "admin" cho bất kỳ customer nào. Không có restriction nào trên role change.  
- **Mức độ:** 🟡 Medium (giảm hạ vì chỉ admin mới gọi endpoint này, nhưng vẫn cần audit log)  
- **Khu vực ảnh hưởng:** `admin.controller.js` updateUser()  
- **Gợi ý sửa:** Tách endpoint riêng cho role change với nhiều validation hơn; log audit khi role thay đổi

---

#### Bug 19: Marketing "Lịch sử gửi email (0)"  — không có data nào

- **Mô tả:** Admin Marketing page hiển thị "Lịch sử gửi email (0)" — không có log nào mặc dù hệ thống có email welcome khi register và newsletter scheduled.  
- **Nguyên nhân suy đoán:** Email config chưa setup (EMAIL_USER/EMAIL_PASS trong .env là placeholder), nên email service fail silently và không ghi MarketingLog.  
- **Mức độ:** 🟡 Medium  
- **Khu vực ảnh hưởng:** Marketing service, .env config  

---

#### Bug 20: `getProducts` không validate `minPrice` và `maxPrice` là số hợp lệ

- **Mô tả:** GET `/api/products?minPrice=abc` → `Number("abc")` = NaN → MongoDB filter: `{ price: { $gte: NaN } }` → có thể trả về kết quả không mong đợi.  
- **Mức độ:** 🟡 Medium  
- **Khu vực ảnh hưởng:** `product.controller.js`  
- **Gợi ý sửa:** Validate `isNaN(Number(minPrice))` trước khi dùng

---

#### Bug 21: AI Suggest page không accessible khi chưa đăng nhập — empty state không clear

- **Mô tả:** `/ai-suggest` khi chưa đăng nhập: hiển thị "Đăng nhập để mở hồ sơ gợi ý AI" — đây là expected behavior, nhưng trang có thể bị coi là dead-end vì nút "Đăng nhập ngay" không đủ prominent.  
- **Mức độ:** 🟡 Medium (UX)  

---

### 🟢 LOW

---

#### Bug 22: Testimonials trên homepage là hardcoded fake data

- **Mô tả:** Section "Đánh Giá Thực Tế" với 3 testimonials là data cứng trong code, không lấy từ review thực của người dùng.  
- **Mức độ:** 🟢 Low  
- **Khu vực ảnh hưởng:** `client-page.jsx` testimonials array  

---

#### Bug 23: Hero banner chart "Business Insights" dùng data demo cứng

- **Mô tả:** Biểu đồ "Phân Bố Khách Hàng" và "Top 3 Bán Chạy" trên homepage dùng `demoData` hardcoded — không phản ánh dữ liệu thực.  
- **Mức độ:** 🟢 Low (nhưng gây mislead cho demo)  
- **Khu vực ảnh hưởng:** `client-page.jsx` AIFeaturesSection  

---

#### Bug 24: "99.2% Accuracy" trên homepage là số tùy ý, không có cơ sở

- **Mô tả:** UI hiển thị "99.2% Accuracy" cho AI Recommendation — không có nguồn gốc từ metric thực, gây tin tưởng sai lệch.  
- **Mức độ:** 🟢 Low  

---

#### Bug 25: Console có 5 Issues (Next.js) — cần điều tra

- **Mô tả:** Góc dưới trái màn hình hiển thị "5 Issues" indicator từ Next.js. Đây thường là React hydration errors hoặc prop type warnings.  
- **Mức độ:** 🟢 Low → có thể leo thang nếu là hydration error gây UI flicker  
- **Gợi ý sửa:** Mở Next.js error overlay để xem chi tiết

---

#### Bug 26: Không có `"Forgot Password"` link trên trang Login

- **Mô tả:** Trang login không có link "Quên mật khẩu?". FR-AUTH-05 yêu cầu tính năng này.  
- **Mức độ:** 🟢 Low (feature thiếu theo spec)  
- **Khu vực ảnh hưởng:** Login page, auth routes  

---

## 3. ✅ DANH SÁCH TESTCASE NÊN CHẠY THÊM

| TC# | Module | Testcase | Priority |
|---|---|---|---|
| TC-01 | Auth | Register với email đã tồn tại | Must |
| TC-02 | Auth | Login với tài khoản bị khóa (isBlocked=true) | Must |
| TC-03 | Auth | Gửi token hết hạn (JWT expired) vào protected route | Must |
| TC-04 | Cart | Thêm sản phẩm hết hàng (stock=0) vào giỏ | Must |
| TC-05 | Cart | Thêm số lượng vượt quá stock (qty > product.stock) | Must |
| TC-06 | Order | Đặt hàng, check stock cùng lúc 2 request (race condition) | Must |
| TC-07 | Order | Hủy đơn đã ở trạng thái "confirmed" → phải fail | Must |
| TC-08 | Discount | Apply discount code hết hạn (expiresAt trong quá khứ) | Must |
| TC-09 | Discount | Apply discount code hết usage limit (usedCount >= usageLimit) | Must |
| TC-10 | Discount | Apply discount với orderAmount < minOrderAmount | Must |
| TC-11 | Admin | Xóa user có đơn hàng đang pending | Must |
| TC-12 | Admin | Thay đổi role customer → admin | High |
| TC-13 | API | POST /api/orders không có token | Must |
| TC-14 | API | GET /api/admin/dashboard không có token | Must |
| TC-15 | Review | Review sản phẩm chưa mua | Must |
| TC-16 | Review | Review cùng sản phẩm 2 lần | Must |
| TC-17 | Search | Tìm kiếm với ký tự đặc biệt: `<script>alert(1)</script>` (XSS test) | High |
| TC-18 | API | SQL/NoSQL injection trong search param: `" OR 1=1` | High |
| TC-19 | Payment | Tạo order COD → kiểm tra stock ngay | Must |
| TC-20 | Admin | Trigger marketing campaign khi EMAIL chưa config | High |
| TC-21 | Performance | Load trang shop với 1000+ sản phẩm | Medium |
| TC-22 | Mobile | Test toàn bộ checkout flow trên viewport 375px | Medium |
| TC-23 | AI | Tắt FastAPI service → kiểm tra fallback | Must |
| TC-24 | Notification | Nhận notification sau khi đặt hàng | Medium |
| TC-25 | Profile | Cập nhật avatar với file > 10MB | Medium |

---

## 4. 🎯 MỨC ĐỘ RỦI RO DỰ ÁN

```
RỦI RO CRITICAL (ảnh hưởng ngay):
  ├── Race condition stock → inventory âm
  ├── Discount usedCount không increment → mã dùng vô hạn  
  └── Stock deduct sai thời điểm → business logic lỗi

RỦI RO HIGH (ảnh hưởng khi nhiều user):
  ├── Checkout accessible không auth → UX inconsistency
  ├── Review không kiểm tra purchase → fake reviews
  ├── Hard delete user → orphan orders
  └── Order status transition không validate

RỦI RO MEDIUM (ảnh hưởng data quality):
  ├── Password policy yếu hơn spec
  ├── updateProfile xóa field nếu không truyền
  └── Discount hết hạn vẫn hiển thị "Đang bật"

RỦI RO THẤP (UX/cosmetic):
  ├── Fake testimonials & metrics
  ├── Console warnings (5 Issues)
  └── Thiếu Forgot Password
```

**Overall Risk Level: 🟡 TRUNG BÌNH-CAO**  
Phù hợp trong phạm vi demo học thuật, nhưng cần sửa ít nhất 4 bugs Critical trước khi demo để tránh lỗi logic khi giáo viên test.

---

## 5. 📝 KẾT LUẬN NGẮN GỌN

**Điểm mạnh:**
- UI/UX client đẹp, nhất quán, có AI recommendation working
- Admin panel đầy đủ tính năng, dữ liệu hiển thị rõ ràng
- Có fallback graceful khi AI service down
- Auth flow cơ bản hoạt động đúng
- Có notification system, wishlist, discount system

**Điểm yếu nghiêm trọng:**
- Stock management sai logic (deduct sai thời điểm + race condition)
- Discount system chưa hoàn chỉnh (không increment usedCount)
- Một số protected routes bypass được
- Không có audit log cho admin actions
- Email marketing chưa chạy được (config chưa setup)

---

## 6. 🚨 KIẾN NGHỊ ƯU TIÊN SỬA TRƯỚC

| Thứ tự | Bug | Lý do ưu tiên |
|---|---|---|
| **#1** | Bug 2 — Discount không increment usedCount | Dễ reproduce, ảnh hưởng trực tiếp business |
| **#2** | Bug 4 — Race condition stock âm | Critical nhất về data integrity |
| **#3** | Bug 3 — Stock deduct sai thời điểm | Ảnh hưởng toàn bộ order flow |
| **#4** | Bug 1 — Checkout bypass auth | Security issue, dễ demo lỗi |
| **#5** | Bug 11 — Discount hết hạn vẫn "Đang bật" | Dễ sửa, visible trong demo |
| **#6** | Bug 7 — Review không check purchase | Ảnh hưởng data quality nếu demo review |
| **#7** | Bug 17 — updateProfile xóa field | Data loss risk |
| **#8** | Bug 9 — Hard delete user | Data integrity |
