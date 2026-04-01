# Đặc Tả Yêu Cầu Hệ Thống (Requirements Specification)

**Project:** SMART ECOMMERCE AI SYSTEM
**Version:** 2.2.0
**Date:** 2026-04-01
**Course:** Môn Học Năm 4 - HK2
**Status:** Approved
**Language:** Tiếng Việt — thuật ngữ kỹ thuật giữ nguyên tiếng Anh

---

## Mục Lục

1. [Yêu Cầu Kinh Doanh (Business Requirements)](#1-yêu-cầu-kinh-doanh)
2. [Yêu Cầu Chức Năng (Functional Requirements)](#2-yêu-cầu-chức-năng)
3. [Yêu Cầu Phi Chức Năng (Non-Functional Requirements)](#3-yêu-cầu-phi-chức-năng)
4. [User Stories](#4-user-stories)
5. [Ràng Buộc & Giả Định (Constraints & Assumptions)](#5-ràng-buộc--giả-định)
6. [Ngoài Phạm Vi Phase 1 (Out of Scope)](#6-ngoài-phạm-vi-phase-1)
7. [Bảng Tóm Tắt (Summary)](#7-bảng-tóm-tắt)

---

## 1. Yêu Cầu Kinh Doanh

### 1.1 Phát Biểu Vấn Đề (Core Problem Statement)

Các nền tảng thương mại điện tử truyền thống đang thất bại ở hai điểm cốt lõi: người mua hàng phải tự tìm kiếm sản phẩm phù hợp trong catalog hàng nghìn SKU mà không được hỗ trợ cá nhân hóa, dẫn đến tỷ lệ bỏ trang cao và tỷ lệ chuyển đổi thấp; trong khi đó, team marketing phải thực hiện phân khúc khách hàng và soạn nội dung chiến dịch thủ công, tốn nhiều nhân lực mà hiệu quả không đo lường được chính xác. Hệ thống này giải quyết cả hai bài toán đồng thời bằng cách tích hợp AI recommendation engine cá nhân hóa trải nghiệm mua sắm và AI marketing automation tự động hóa toàn bộ vòng đời chiến dịch từ phân đoạn đến gửi nội dung tối ưu, nhằm tăng doanh thu và giữ chân khách hàng mà không tăng chi phí vận hành theo tuyến tính.

### 1.2 Mục Tiêu Kinh Doanh (Business Goals)

| Goal ID | Mục Tiêu | Chỉ Số Đo Lường | Target (Phase 1) |
|---|---|---|---|
| BG-01 | Tăng tỷ lệ chuyển đổi mua hàng | Conversion rate (visits → purchase) | >= 3.5% |
| BG-02 | Cải thiện hiệu quả AI Recommendation | CTR trên gợi ý AI | >= 5% |
| BG-03 | Tăng giá trị đơn hàng trung bình | Average Order Value (AOV) | +15% so với baseline |
| BG-04 | Giảm chi phí marketing | Chi phí thu hút / khách hàng quay lại | -20% so với chiến dịch thủ công |
| BG-05 | Nâng cao hiệu quả chiến dịch email | Email open rate | >= 20% |
| BG-06 | Giảm tỷ lệ bỏ giỏ hàng | Cart abandonment rate | <= 65% |
| BG-07 | Tăng hiệu quả vận hành admin | Thời gian xử lý 1 đơn hàng của admin | -30% so với baseline |

### 1.3 User Personas

---

#### Persona 1 — Buyer (Người Mua Hàng)

**Mô tả:** Người dùng cuối, 18–45 tuổi, mua sắm trực tuyến thường xuyên trên nhiều thiết bị. Bao gồm cả khách ẩn danh (guest) và tài khoản đã đăng ký.

**Goals:**
- Tìm được sản phẩm phù hợp nhanh chóng, không mất thời gian lướt dài
- Nhận ưu đãi đúng lúc, đúng sản phẩm đang quan tâm
- Biết trạng thái đơn hàng mà không cần liên hệ hỗ trợ
- Trải nghiệm mua sắm nhất quán trên mobile lẫn desktop

**Pain Points:**
- Bị tràn ngập sản phẩm không liên quan khi vào trang chủ
- Quy trình checkout nhiều bước, phải nhập lại thông tin
- Không nhận được thông báo khi sản phẩm yêu thích giảm giá hoặc có hàng trở lại
- Email marketing generic, không liên quan đến nhu cầu thực tế

**Key Needs:**
- Search thông minh hiểu tiếng Việt, bộ lọc nhanh
- Gợi ý AI cá nhân hóa trên homepage và trang sản phẩm
- Checkout nhanh với địa chỉ và thanh toán đã lưu
- Thông báo realtime trạng thái đơn hàng

---

#### Persona 2 — Seller / Product Manager (Người Quản Lý Sản Phẩm)

**Mô tả:** Nhân viên nội bộ chịu trách nhiệm quản lý catalog sản phẩm, giá, tồn kho. Có kiến thức nghiệp vụ nhưng không có kỹ năng kỹ thuật sâu.

**Goals:**
- Upload và cập nhật sản phẩm hàng loạt một cách nhanh chóng
- Luôn nắm được tình trạng tồn kho, không để hết hàng mà không biết
- Hiểu sản phẩm nào đang bán tốt để ra quyết định về giá và khuyến mãi

**Pain Points:**
- Phải tạo từng sản phẩm/variant thủ công khi catalog lớn
- Không có cảnh báo tự động khi stock sắp hết
- Thiếu insight về tại sao một sản phẩm view nhiều nhưng conversion thấp

**Key Needs:**
- Bulk import/export CSV với variant generation tự động
- Cảnh báo inventory tự động với ngưỡng cấu hình được
- Báo cáo hiệu suất sản phẩm: view, add-to-cart rate, conversion rate

---

#### Persona 3 — Marketing Manager

**Mô tả:** Chịu trách nhiệm chiến lược digital marketing, phân tích hành vi người dùng, tối ưu tỷ lệ chuyển đổi. Quen với các tool marketing nhưng không biết lập trình.

**Goals:**
- Tạo và tự động hóa chiến dịch marketing nhắm đúng đối tượng
- Sử dụng AI để tiết kiệm thời gian tạo nội dung
- Đo được ROI của từng chiến dịch một cách chính xác

**Pain Points:**
- Phân đoạn khách hàng thủ công tốn hàng ngày công sức
- Nội dung email generic, tỷ lệ mở thấp
- Không biết thời điểm tốt nhất để gửi thông báo cho từng nhóm khách hàng
- Kết quả A/B test phải tự tính toán trong spreadsheet

**Key Needs:**
- AI segmentation tự động (RFM) + custom segment builder
- LLM content generation cho email subject, body, push notification
- Send-time optimization dự đoán thời điểm gửi tốt nhất cho từng user
- Dashboard A/B test với statistical significance tự động

---

#### Persona 4 — Admin / System Administrator

**Mô tả:** Quản trị viên hệ thống, quản lý toàn bộ platform: người dùng, phân quyền, giám sát vận hành, xử lý sự cố.

**Goals:**
- Hệ thống hoạt động ổn định, biết ngay khi có vấn đề
- Phân quyền rõ ràng theo vai trò, không ai truy cập vượt quyền hạn
- Có đủ bằng chứng audit khi cần điều tra sự cố

**Pain Points:**
- Thiếu visibility vào hiệu suất của AI services
- Log phân tán ở nhiều chỗ, khó tìm nguyên nhân khi có lỗi
- Không có cơ chế rollback nhanh khi deploy có vấn đề

**Key Needs:**
- Centralized monitoring bao gồm cả AI model metrics
- Role-based access control chi tiết với audit trail đầy đủ
- Health dashboard và alerting khi metrics vượt ngưỡng

---

## 2. Yêu Cầu Chức Năng

> **Format:** `- [ ] **FR-[MODULE]-[ID]** \`Priority\`: [Mô tả chi tiết]`
> **Priority:** `Must` = bắt buộc trước demo | `Should` = quan trọng, làm nếu kịp | `Could` = nice-to-have
> Mỗi FR đủ rõ để developer implement mà không cần hỏi thêm.
> Không đề cập công nghệ cụ thể (xem `TECH_STACK.md`).
> **Tổng Must: 21 | Should: 27 | Could: 10**

---

### 2.1 FR-AUTH — Module Xác Thực & Người Dùng

- [ ] **FR-AUTH-01** `Must`: Đăng ký tài khoản bằng email và mật khẩu — hệ thống validate định dạng email hợp lệ, enforce password policy (tối thiểu 8 ký tự, ít nhất 1 chữ hoa, 1 chữ số, 1 ký tự đặc biệt), gửi email xác minh chứa link dùng một lần hết hạn sau 24 giờ; tài khoản chỉ được kích hoạt sau khi xác minh email thành công.
- [ ] **FR-AUTH-02** `Should`: Đăng ký và đăng nhập qua OAuth provider (Google, Facebook) — hệ thống nhận authorization code, trao đổi lấy access token từ provider, tạo tài khoản nội bộ mới nếu email chưa tồn tại hoặc liên kết với tài khoản hiện có nếu cùng email; không lưu mật khẩu của provider trong hệ thống.
- [ ] **FR-AUTH-03** `Could`: Xác thực hai lớp (2FA) — hỗ trợ TOTP (ứng dụng authenticator như Google Authenticator) và SMS OTP (6 chữ số, hết hạn sau 5 phút); người dùng bật/tắt 2FA trong phần cài đặt bảo mật; sau 5 lần nhập OTP sai liên tiếp, khóa đăng nhập 15 phút và thông báo qua email.
- [ ] **FR-AUTH-04** `Must`: Quản lý phiên đăng nhập — phát hành Access Token (thời hạn ngắn, configurable) và Refresh Token (thời hạn dài, lưu trong HTTP-only Secure cookie); hỗ trợ tính năng "logout từ tất cả thiết bị" thu hồi toàn bộ Refresh Token; người dùng xem danh sách active sessions (thiết bị, IP, thời gian đăng nhập lần cuối) và có thể thu hồi từng session.
- [ ] **FR-AUTH-05** `Should`: Quên mật khẩu và reset — người dùng nhập email, hệ thống gửi link reset chứa token dùng một lần hết hạn sau 1 giờ; sau khi đổi mật khẩu thành công, token bị vô hiệu hóa lập tức và tất cả Refresh Token hiện tại bị thu hồi; hiển thị thông báo thành công dù email tồn tại hay không (chống email enumeration).
- [ ] **FR-AUTH-06** `Should`: Quản lý hồ sơ cá nhân — người dùng chỉnh sửa tên hiển thị, số điện thoại (validate format Việt Nam), ảnh đại diện (upload file ảnh, hệ thống resize và crop về kích thước chuẩn server-side), quản lý tối đa 5 địa chỉ giao hàng (tỉnh/thành phố, quận/huyện, phường/xã, địa chỉ cụ thể, tên người nhận, SĐT nhận hàng); đánh dấu 1 địa chỉ là mặc định.
- [ ] **FR-AUTH-07** `Could`: Hệ thống điểm thưởng (Loyalty Points) — mỗi đơn hàng hoàn thành (trạng thái COMPLETED) cộng điểm theo tỷ lệ cấu hình được (ví dụ: 1 điểm / 10,000 VND); điểm có thể quy đổi thành voucher giảm giá (ví dụ: 100 điểm = 10,000 VND); người dùng xem lịch sử điểm đầy đủ với timestamp, lý do cộng/trừ, số điểm thay đổi, số dư sau giao dịch; điểm không có thời hạn sử dụng trong Phase 1.
- [ ] **FR-AUTH-08** `Should`: Danh sách yêu thích (Wishlist) — người dùng đã đăng nhập thêm/xóa sản phẩm (theo product ID, không phân biệt variant), xem toàn bộ wishlist với thông tin giá và trạng thái stock hiện tại, chuyển toàn bộ sản phẩm còn hàng trong wishlist vào giỏ hàng bằng 1 thao tác; wishlist được lưu persistent gắn với tài khoản.

---

### 2.2 FR-CATALOG — Module Catalog & Tìm Kiếm

- [ ] **FR-CATALOG-01** `Must`: CRUD sản phẩm đầy đủ — các trường bắt buộc: tên sản phẩm, mô tả ngắn (plain text), mô tả dài (rich text hỗ trợ heading/bold/list/image), giá niêm yết, SKU, trạng thái (draft / active / inactive); trường tùy chọn: giá khuyến mãi, barcode, thương hiệu, tags (tối đa 20 tag), hình ảnh (tối đa 10 ảnh/sản phẩm, hỗ trợ bulk upload, tự động resize về các kích thước chuẩn); admin có thể xem trước trang sản phẩm trước khi publish.
- [ ] **FR-CATALOG-02** `Must`: Quản lý danh mục đa cấp (Category Tree) — cấu trúc cây tối đa 3 cấp (ví dụ: Thời Trang > Nam > Áo sơ mi); CRUD category với tên, slug (auto-generate từ tên, có thể tùy chỉnh), mô tả, hình ảnh đại diện, thứ tự hiển thị; sản phẩm có thể thuộc nhiều category; category có meta title và meta description cho SEO.
- [ ] **FR-CATALOG-03** `Should`: Quản lý biến thể sản phẩm (Product Variants) — admin định nghĩa attribute groups (ví dụ: Size với các giá trị S/M/L/XL; Màu sắc với Đỏ/Xanh/Trắng); hệ thống tự động tạo matrix tất cả combinations thành các SKU riêng biệt; mỗi SKU có giá, tồn kho, và ảnh riêng; giao diện matrix editor cho phép set giá/stock hàng loạt theo hàng/cột.
- [ ] **FR-CATALOG-04** `Must`: Full-text search hỗ trợ tiếng Việt — tìm kiếm theo tên sản phẩm, mô tả, SKU, tag, tên thương hiệu; xử lý dấu tiếng Việt (tìm "ao so mi" khớp "áo sơ mi"); hỗ trợ tìm kiếm mờ (fuzzy search) cho typo phổ biến; kết quả được xếp hạng theo relevance score kết hợp với popularity; thời gian phản hồi p95 < 300ms.
- [ ] **FR-CATALOG-05** `Should`: Bộ lọc nâng cao (Advanced Filters) — các bộ lọc: danh mục (multi-select), khoảng giá (range slider với min/max), đánh giá (>= X sao), thương hiệu (multi-select), trạng thái còn hàng (toggle), thuộc tính tùy chỉnh theo danh mục (ví dụ: Size chỉ hiện khi lọc Thời Trang); kết hợp nhiều filter bằng AND logic; trạng thái filter được phản ánh vào URL query parameters để có thể bookmark và share.
- [ ] **FR-CATALOG-06** `Should`: Sắp xếp kết quả (Sorting) — các tùy chọn sắp xếp: giá tăng dần, giá giảm dần, mới nhất, bán chạy nhất, đánh giá cao nhất, độ liên quan AI (chỉ cho user đã đăng nhập); mặc định: AI relevance cho user đăng nhập, bán chạy nhất cho guest; thứ tự sắp xếp được giữ khi thay đổi filter.
- [ ] **FR-CATALOG-07** `Must`: Trang chi tiết sản phẩm (Product Detail Page) — hiển thị: gallery ảnh với thumbnail và zoom khi hover, selector biến thể cập nhật giá/stock/ảnh realtime khi chọn, badge "Hết hàng" khi stock = 0, countdown timer nếu đang có flash sale, breadcrumb navigation phản ánh category path, structured data markup (JSON-LD Schema.org/Product) cho SEO.
- [ ] **FR-CATALOG-08** `Should`: Đánh giá và nhận xét (Review & Rating) — chỉ user đã mua sản phẩm thành công (đơn hàng trạng thái COMPLETED) mới được viết review; rating 1–5 sao, tiêu đề ngắn (tùy chọn), nội dung (tùy chọn), tối đa 5 ảnh kèm; trang sản phẩm hiển thị rating trung bình, tổng số review, histogram phân phối sao; admin ẩn/xóa review vi phạm với ghi chú lý do; review được sắp xếp theo mới nhất, hữu ích nhất (dựa trên upvote).
- [ ] **FR-CATALOG-09** `Should`: Quản lý tồn kho (Inventory Management) — admin cập nhật stock theo từng variant; cảnh báo tự động (email/notification trong dashboard) khi stock của bất kỳ variant nào giảm xuống dưới ngưỡng cấu hình được (mặc định: 10); trạng thái "Hết hàng" tự động khi stock = 0, tự động "Còn hàng" khi stock > 0; lịch sử nhập/xuất kho với timestamp, lý do thay đổi, và actor.
- [ ] **FR-CATALOG-10** `Could`: Flash Sale & Khuyến Mãi Theo Thời Gian — admin tạo promotion với: tên, loại giảm (% hoặc số tiền cố định), thời gian bắt đầu và kết thúc (chính xác đến giây), áp dụng cho sản phẩm cụ thể hoặc toàn bộ category; trang sản phẩm hiển thị giá gốc gạch ngang, giá sau giảm, countdown timer đến khi kết thúc; giá khuyến mãi tự động có hiệu lực và hết hiệu lực đúng thời điểm cấu hình, không cần can thiệp thủ công.

---

### 2.3 FR-CART — Module Giỏ Hàng, Checkout & Thanh Toán

- [ ] **FR-CART-01** `Must`: Quản lý giỏ hàng — thêm sản phẩm vào giỏ kèm variant đã chọn và số lượng, cập nhật số lượng từng item, xóa từng item hoặc xóa toàn bộ; giỏ hàng của user đã đăng nhập được lưu persistent trên server; khi user đăng nhập sau khi đã có giỏ hàng ẩn danh, hệ thống merge (ưu tiên giữ item của cả hai, cộng số lượng nếu trùng sản phẩm); tổng tiền cập nhật realtime khi thay đổi số lượng.
- [ ] **FR-CART-02** `Should`: Áp mã giảm giá (Coupon/Voucher) — user nhập mã, hệ thống validate đồng thời: mã tồn tại, còn trong thời hạn, đúng điều kiện áp dụng (tổng giỏ hàng >= giá trị tối thiểu, sản phẩm/category áp dụng, user chưa dùng quá giới hạn lượt/user); hiển thị rõ số tiền được giảm; nếu không hợp lệ, hiển thị thông báo lý do cụ thể (hết hạn / đã dùng / không đủ điều kiện).
- [ ] **FR-CART-03** `Should`: Tính phí vận chuyển — khi user nhập địa chỉ giao hàng (hoặc chọn từ địa chỉ đã lưu), hệ thống tính phí vận chuyển dựa trên tỉnh/thành phố đích và tổng trọng lượng đơn hàng; hiển thị nhiều phương thức vận chuyển với giá và thời gian giao hàng dự kiến khác nhau (ví dụ: Giao hàng tiêu chuẩn 3–5 ngày / Giao hàng nhanh 1–2 ngày); hiển thị ngưỡng miễn phí vận chuyển và số tiền còn thiếu để đạt ngưỡng.
- [ ] **FR-CART-04** `Must`: Quy trình Checkout nhiều bước — flow: (1) Địa chỉ giao hàng, (2) Phương thức vận chuyển, (3) Phương thức thanh toán, (4) Xác nhận đơn hàng; user có thể quay lại bước trước mà không mất dữ liệu đã nhập; bước xác nhận hiển thị đầy đủ: danh sách sản phẩm, địa chỉ, phương thức vận chuyển, phí, giảm giá, tổng thanh toán; tiến trình được hiển thị qua step indicator.
- [ ] **FR-CART-05** `Must`: Thanh toán đa phương thức — hỗ trợ: (1) COD (Cash on Delivery): tạo đơn hàng ngay, thanh toán khi nhận; (2) QR Pay qua cổng nội địa (tích hợp adapter cho Momo, VNPay): hiển thị QR code, hệ thống poll hoặc nhận webhook để xác nhận; (3) Thẻ quốc tế (Visa/Mastercard) qua payment gateway: redirect sang trang payment gateway, nhận kết quả qua callback URL; trạng thái thanh toán được cập nhật tự động qua webhook, không yêu cầu user tải lại trang.
- [ ] **FR-CART-06** `Must`: Xác nhận đơn hàng tức thì — ngay sau khi tạo đơn hàng thành công, hệ thống gửi email xác nhận chứa: order ID, danh sách sản phẩm kèm ảnh và giá, địa chỉ giao hàng, phương thức thanh toán, tổng tiền, thời gian giao hàng dự kiến, link theo dõi đơn hàng; nếu user cung cấp số điện thoại, gửi thêm SMS với nội dung tóm tắt.
- [ ] **FR-CART-07** `Could`: Lưu phương thức thanh toán (Saved Payment) — user có thể chọn lưu phương thức thanh toán sau khi giao dịch thành công; số thẻ/tài khoản được tokenize qua payment gateway, hệ thống chỉ lưu token và 4 chữ số cuối (không lưu raw data); lần sau user chọn phương thức đã lưu và chỉ cần xác nhận (không nhập lại); user có thể xóa phương thức đã lưu bất kỳ lúc nào.
- [ ] **FR-CART-08** `Should`: Xử lý lỗi thanh toán — nếu payment gateway trả về lỗi hoặc timeout, đơn hàng giữ trạng thái PENDING_PAYMENT, stock không bị deduct; hiển thị thông báo lỗi rõ ràng và lý do (nếu có từ gateway); user có thể thử lại với cùng phương thức hoặc chọn phương thức khác mà không cần nhập lại thông tin đơn hàng; sau 30 phút không thanh toán, đơn hàng tự động hủy và giỏ hàng được khôi phục.

---

### 2.4 FR-ORDER — Module Quản Lý Đơn Hàng

- [ ] **FR-ORDER-01** `Must`: Vòng đời đơn hàng (Order Lifecycle) — 6 trạng thái: `PENDING_PAYMENT` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED` → `COMPLETED`; ngoài ra có trạng thái ngoài luồng: `CANCELLED` và `REFUNDED`; mỗi transition ghi lại: trạng thái mới, thời gian, actor (user / admin / system), ghi chú tùy chọn; stock bị deduct khi chuyển sang CONFIRMED; stock được hoàn khi CANCELLED hoặc khi return được approve.
- [ ] **FR-ORDER-02** `Should`: Theo dõi đơn hàng (Order Tracking) — user xem trang theo dõi từ link trong email hoặc từ trang "Đơn hàng của tôi"; hiển thị: timeline trực quan các bước đã qua và bước tiếp theo, trạng thái hiện tại, mã vận đơn (tracking number) và tên đơn vị vận chuyển, link deep-link đến trang tracking của đơn vị vận chuyển (nếu có tích hợp); cập nhật trạng thái realtime qua webhook từ đối tác logistics khi có.
- [ ] **FR-ORDER-03** `Should`: Thông báo thay đổi trạng thái — hệ thống tự động gửi thông báo khi đơn hàng chuyển sang các trạng thái quan trọng: CONFIRMED (đã xác nhận), SHIPPED (đang giao kèm mã vận đơn), DELIVERED (đã giao), CANCELLED (đã hủy); kênh thông báo: email (bắt buộc) + SMS (nếu có số điện thoại); nội dung email sử dụng template có thể tùy chỉnh, tự động điền thông tin đơn hàng; admin có thể gửi thông báo thủ công kèm ghi chú tùy chỉnh.
- [ ] **FR-ORDER-04** `Should`: Hủy đơn hàng — user có thể hủy khi đơn hàng ở trạng thái PENDING_PAYMENT hoặc CONFIRMED; admin có thể hủy bất kỳ đơn nào trước khi trạng thái đạt SHIPPED; khi hủy: stock được hoàn về ngay lập tức, nếu đã thanh toán thì tạo refund request tự động; lý do hủy là bắt buộc (dropdown + ghi chú tự do); user nhận email xác nhận hủy.
- [ ] **FR-ORDER-05** `Should`: Hoàn tiền (Refund) — refund được tạo tự động khi hủy đơn đã thanh toán, hoặc tạo thủ công bởi admin sau khi approve return request; hỗ trợ hoàn tiền toàn bộ hoặc một phần (nhập số tiền cụ thể); phương thức hoàn: về phương thức thanh toán gốc (xử lý qua payment gateway) hoặc về tài khoản điểm thưởng (cộng ngay); trạng thái refund: PENDING → PROCESSING → COMPLETED / FAILED; user nhận email thông báo kết quả refund.
- [ ] **FR-ORDER-06** `Could`: Trả hàng & Hoàn đổi (Return/Exchange) — user tạo return request trong vòng N ngày (configurable, mặc định 7 ngày) sau khi trạng thái DELIVERED; bắt buộc chọn lý do (hàng lỗi / sai sản phẩm / không đúng mô tả / đổi ý) và upload ít nhất 1 ảnh minh chứng; admin review và approve/reject với ghi chú lý do; nếu approve: tạo return shipping label, cập nhật trạng thái về REFUNDED, stock được cộng lại sau khi ghi nhận nhận hàng.
- [ ] **FR-ORDER-07** `Must`: Quản lý đơn hàng (Admin) — admin xem danh sách đơn hàng với filter theo: trạng thái, ngày đặt (range picker), giá trị đơn hàng, phương thức thanh toán, kênh bán; sort theo ngày, giá trị; xem chi tiết từng đơn; cập nhật trạng thái thủ công kèm ghi chú; in phiếu xuất kho (packing slip) bao gồm: order ID, danh sách sản phẩm, địa chỉ giao hàng, barcode; thêm ghi chú nội bộ (không hiển thị cho user).
- [ ] **FR-ORDER-08** `Should`: Lịch sử đơn hàng (User Side) — user xem danh sách tất cả đơn hàng đã đặt, filter theo trạng thái, tìm kiếm theo order ID hoặc tên sản phẩm; xem chi tiết đơn: toàn bộ sản phẩm, giá tại thời điểm mua, địa chỉ giao hàng, phương thức thanh toán, timeline trạng thái; tính năng "Mua lại" (Reorder): thêm tất cả sản phẩm từ đơn hàng cũ vào giỏ hàng mới với 1 thao tác (sản phẩm không còn hàng được bỏ qua và thông báo cho user).

---

### 2.5 FR-REC — Module AI Recommendation Engine

> Pipeline đầy đủ: Data Collection → Feature Store → Model Training → Inference Serving → Cold-Start → A/B Testing → Feedback Loop → Monitoring

- [ ] **FR-REC-01** `Must` [Data Collection]: Thu thập behavioral events — hệ thống ghi lại tất cả sự kiện tương tác: `page_view`, `product_view`, `search_query`, `add_to_cart`, `remove_from_cart`, `purchase`, `review_submit`, `wishlist_add`, `recommendation_impression`, `recommendation_click`; mỗi event chứa: `user_id` (hoặc `session_id` cho guest), `item_id`, `event_type`, `timestamp` (UTC), `context` (trang hiện tại, device type, source placement); events được gửi bất đồng bộ từ frontend — không chờ response, không làm chậm UI; client retry tự động nếu request thất bại.
- [ ] **FR-REC-02** `Must` [Feature Store]: Feature engineering và lưu trữ — hệ thống batch job định kỳ (mặc định mỗi 1 giờ) tính toán từ raw events: (a) User features: vector lịch sử mua hàng, category affinity scores (tần suất tương tác theo category), price sensitivity (khoảng giá thường mua), recency (ngày tương tác gần nhất), frequency (số lần tương tác trong 30 ngày), monetary (tổng chi tiêu); (b) Item features: category embedding, popularity score (view và purchase trong 7 ngày), average rating, price tier; (c) Interaction matrix thưa (sparse user-item matrix); features được lưu vào feature store với phiên bản (versioning) để reproducible training.
- [ ] **FR-REC-03** `Must` [Model Training — CF]: Huấn luyện Collaborative Filtering — sử dụng thư viện ML có sẵn (Surprise, LightFM, implicit hoặc tương đương) để train model Matrix Factorization trên user-item interaction matrix từ feature store; lịch training: mặc định 1 lần/ngày vào giờ thấp điểm (cấu hình được); sau mỗi lần train, tự động đánh giá model mới trên offline test set với metrics: precision@10, recall@10, NDCG@10; chỉ promote model mới thành model production nếu tất cả metrics >= model hiện tại (không thụt lùi); lưu model artifact và metadata (training date, dataset version, metrics) vào model registry.
- [ ] **FR-REC-04** `Should` [Model Training — CBF]: Huấn luyện Content-Based Filtering — sử dụng thư viện tính toán embedding và similarity có sẵn (scikit-learn, sentence-transformers hoặc tương đương) để tính toán item similarity matrix dựa trên product attributes: category embedding (one-hot encoded category path), text embedding của description, tag overlap, price range similarity; similarity matrix được rebuild khi có sản phẩm mới được thêm (trigger-based) hoặc theo lịch hàng ngày; lưu similarity scores vào cache để phục vụ inference nhanh.
- [ ] **FR-REC-05** `Must` [Inference Serving — Hybrid API]: Hybrid Recommendation API — endpoint nhận input: `user_id` (hoặc `session_id`), `context` (trang hiện tại, `item_id` nếu đang xem sản phẩm cụ thể), `n` (số lượng recommendations muốn trả về), `exclude_item_ids` (danh sách loại trừ); trả về: danh sách item_id theo thứ tự ưu tiên với explanation score; final score = alpha × CF_score + (1-alpha) × CBF_score (alpha configurable); kết quả được cache theo user_id với TTL configurable (mặc định 10 phút); response time p95 < 200ms (cache hit), p99 < 500ms (cache miss).
- [ ] **FR-REC-06** `Must` [Inference Serving — Placements]: Các vị trí hiển thị gợi ý — hệ thống hỗ trợ 5 placement độc lập, mỗi placement gọi FR-REC-05 với context khác nhau: (1) **Homepage Feed**: N sản phẩm cá nhân hóa cho user đăng nhập; (2) **Sản phẩm tương tự** trên Product Detail Page: CBF-heavy, loại trừ sản phẩm đang xem; (3) **Thường mua kèm** trong Cart: dựa trên co-purchase patterns, hiển thị sản phẩm hay được mua cùng với items trong giỏ; (4) **Search personalization**: rerank kết quả search theo user preference; (5) **Email recommendation block**: batch inference hàng ngày, không yêu cầu realtime; mỗi placement cấu hình được số lượng items và business rules override (ưu tiên sản phẩm cần đẩy hàng, loại trừ sản phẩm hết hàng).
- [ ] **FR-REC-07** `Must` [Cold-Start]: Xử lý người dùng mới — khi user có ít hơn 3 interactions (tính từ lúc tạo tài khoản hoặc session mới của guest): fallback strategy theo thứ tự ưu tiên: (1) Category preference từ onboarding survey (nếu user hoàn thành khi đăng ký), (2) Trending products trong 7 ngày gần nhất (toàn site), (3) Top-rated products trong category đang duyệt; sau khi user tích lũy đủ 3 interactions, hệ thống tự động chuyển sang hybrid model ở lần request tiếp theo mà không cần user thao tác gì.
- [ ] **FR-REC-08** `Could` [A/B Testing]: A/B test chiến lược gợi ý — hệ thống hỗ trợ chạy tối đa 3 strategy song song; user được phân bổ vào group ngẫu nhiên và nhất quán (cùng user luôn vào cùng group trong suốt thời gian test); phân bổ traffic cấu hình được theo % (ví dụ: 20%/80%); ghi lại per-group metrics: impression count, CTR, conversion rate, revenue per user; admin xem kết quả realtime, khai báo winner thủ công hoặc set ngưỡng auto-promote; thay đổi traffic allocation không yêu cầu redeploy service.
- [ ] **FR-REC-09** `Should` [Feedback Loop]: Thu thập và xử lý phản hồi — explicit negative feedback: user nhấn "Không muốn xem loại này" hoặc report gợi ý không phù hợp; hệ thống loại bỏ item đó khỏi danh sách gợi ý của user đó ngay lập tức (realtime blocklist, không chờ model retrain); đồng thời ghi negative signal vào training data cho lần retrain tiếp theo; implicit feedback (không click recommendation sau nhiều impression) cũng được ghi nhận với trọng số thấp hơn.
- [ ] **FR-REC-10** `Should` [Monitoring]: Giám sát hiệu suất recommendation — dashboard hiển thị: (a) Online metrics (cập nhật hàng giờ): CTR theo placement, conversion rate từ recommendation, revenue attributed to recommendation (last-click), impression count; (b) Offline metrics (cập nhật sau mỗi training run): precision@10, recall@10, NDCG@10 theo thời gian; (c) System metrics: inference latency p50/p95/p99, cache hit rate, feature store freshness (lag giữa event và feature update); alert tự động khi: CTR giảm > 20% so với baseline 7 ngày, inference latency p95 > 500ms, feature freshness > 3 giờ.

---

### 2.6 FR-MKTG — Module Marketing

- [ ] **FR-MKTG-01** `Should` [RFM Segmentation]: Phân đoạn khách hàng theo RFM — Marketing Manager bấm nút "Tính toán lại RFM" để trigger tính toán theo yêu cầu (không tự động theo lịch); hệ thống phân tích customer base theo Recency (ngày kể từ lần mua cuối), Frequency (số lần mua trong 12 tháng), Monetary (tổng chi tiêu trong 12 tháng) và gán mỗi user vào 1 trong 7 segment chuẩn (Champions / Loyal Customers / Potential Loyalists / At Risk / Cant Lose Them / Hibernating / Lost); admin xem phân phối user theo segment dưới dạng chart và bảng; click vào segment để xem danh sách user.
- [ ] **FR-MKTG-02** `Should` [Custom Segmentation]: Tạo segment tùy chỉnh bằng Rule Builder — giao diện drag-and-drop cho phép Marketing Manager tạo custom segment bằng cách kết hợp các conditions: hành vi (xem sản phẩm trong category X trong N ngày gần nhất, đã mua / chưa mua sản phẩm trong category Y, có items trong wishlist, có đơn hàng đang xử lý), thuộc tính (tổng chi tiêu >= X, số lần mua >= Y, đăng ký trong Z ngày gần nhất, địa chỉ thuộc tỉnh/thành); kết hợp conditions bằng AND/OR; preview số lượng user khớp realtime trước khi lưu; segment được tính toán lại theo lịch hoặc on-demand.
- [ ] **FR-MKTG-03** `Must` [Campaign Builder]: Tạo và quản lý chiến dịch — campaign gồm: tên, mô tả, target segment (chọn từ RFM hoặc custom segment), channel (email), thời gian chạy (start date / end date); trạng thái campaign: Draft → Scheduled → Running → Paused → Completed; admin có thể pause/resume campaign đang chạy; duplicate campaign để tái sử dụng cấu hình; lịch sử tất cả campaigns với metrics tóm tắt.
- [ ] **FR-MKTG-06** `Could` [Basic Personalization]: Template email hỗ trợ dynamic variables cơ bản: `{{name}}`, `{{email}}`, `{{segment}}`; Marketing Manager preview email render với dữ liệu của 1 user cụ thể trước khi gửi.
- [ ] **FR-MKTG-09** `Should` [Email Delivery]: Gửi email HTML campaign — gửi HTML email với plain-text fallback, tracking pixel cho open rate, UTM parameters cho click tracking; unsubscribe 1-click trong email footer theo chuẩn CAN-SPAM; bounce và complaint tự động đưa địa chỉ vào suppression list, không gửi lại. (Push notification và SMS không nằm trong scope Phase 1)
- [ ] **FR-MKTG-10** `Should` [Campaign Analytics]: Báo cáo hiệu quả chiến dịch — dashboard per campaign: sent count, delivery rate (%), open rate (%), CTR (%), conversion rate (%), revenue attributed (last-click model), unsubscribe rate (%); chart timeline: metrics theo ngày trong suốt thời gian campaign chạy; so sánh metrics giữa các campaigns trong cùng khoảng thời gian; so sánh metrics giữa các segments nhận campaign; export báo cáo định dạng CSV; retention tracking: user nhận campaign có quay lại mua hàng trong 30 ngày hay không.

---

### 2.7 FR-ANALYTICS — Module Analytics & Dashboard

- [ ] **FR-ANALYTICS-01** `Must`: Real-time Business Dashboard — admin/manager xem dashboard với các widget cập nhật realtime (polling mỗi 60 giây hoặc server-sent events): doanh thu ngày hôm nay (số tiền và so sánh % với hôm qua), số đơn hàng mới, số user mới đăng ký, GMV (Gross Merchandise Value), số user đang online; mỗi metric có sparkline 24 giờ gần nhất; alert nổi bật khi có chỉ số bất thường (doanh thu giảm > 30% so với trung bình 7 ngày).
- [ ] **FR-ANALYTICS-02** `Should`: Báo cáo Doanh Thu — phân tích doanh thu với các dimension: (a) Thời gian: ngày, tuần, tháng, năm, custom date range; (b) Category sản phẩm; (c) Sản phẩm cụ thể (top N); (d) Phương thức thanh toán; chart line/bar có thể drill-down (click vào tháng để xem chi tiết ngày); hiển thị: gross revenue, discounts, net revenue, số đơn, AOV, số khách mua mới vs. quay lại; export Excel/CSV với tất cả data.
- [ ] **FR-ANALYTICS-03** `Should`: Phân Tích Hành Vi Người Dùng — funnel visualization: Visitors → Product Viewed → Add to Cart → Checkout Started → Order Placed; hiển thị số lượng và tỷ lệ drop-off tại mỗi bước; phân tích theo device type (mobile/desktop/tablet); top 20 sản phẩm được xem nhiều nhất và tỷ lệ conversion của từng sản phẩm; top search queries và kết quả click-through rate; heatmap session duration.
- [ ] **FR-ANALYTICS-04** `Could`: Analytics Tìm Kiếm — danh sách top queries theo volume trong khoảng thời gian chọn; queries không có kết quả (no-result queries) với số lượt tìm — dùng để bổ sung tag/sản phẩm; queries dẫn đến mua hàng (high-converting queries); click-through rate từ search result; admin dùng data này để cải thiện search index và product tagging; export danh sách no-result queries để team catalog xử lý.
- [ ] **FR-ANALYTICS-05** `Should`: Dashboard Hiệu Suất AI Recommendation — metrics hiển thị: CTR tổng và theo từng placement (Homepage Feed, PDP Similar, Cart FBT, Search), conversion rate từ recommendation, revenue attributed to recommendation, coverage (% catalog items được gợi ý ít nhất 1 lần trong 7 ngày — chỉ số đo popularity bias), diversity score (average pairwise distance giữa recommended items); offline metrics sau mỗi training run: precision@10, recall@10; chart theo thời gian; so sánh metrics giữa các A/B test groups.
- [ ] **FR-ANALYTICS-06** `Must`: Quản Lý Người Dùng & Phân Quyền (RBAC) — 5 roles hệ thống: Super Admin (full access), Product Manager (catalog + inventory), Marketing Manager (marketing + analytics), Data Analyst (read-only analytics + recommendation metrics), Customer Support (view orders + user profiles, no edit); Super Admin tạo tài khoản staff, gán role, vô hiệu hóa tài khoản; mỗi permission được kiểm tra server-side; UI tự ẩn/hiện menu và action buttons theo role.
- [ ] **FR-ANALYTICS-07** `Should`: Audit Log — ghi lại tất cả thao tác quan trọng của admin/staff vào immutable log: ai (user ID + email), làm gì (action type), trên đối tượng nào (resource type + resource ID), thay đổi gì (before/after JSON diff cho update operations), lúc nào (timestamp UTC), từ đâu (IP address, user agent); log không thể xóa hoặc sửa (append-only); giao diện search và filter theo user, action type, resource type, khoảng thời gian; export CSV; lưu tối thiểu 90 ngày.
- [ ] **FR-ANALYTICS-08** `Could`: Báo Cáo Sản Phẩm — top selling products (theo doanh thu và theo số lượng) trong khoảng thời gian chọn; slow-moving inventory (sản phẩm có stock > 0 nhưng không bán được trong X ngày); out-of-stock frequency (số lần và tổng thời gian hết hàng trong 30 ngày); return rate theo sản phẩm (% đơn hàng bị trả / tổng đơn); admin xem và xuất báo cáo; alert tự động cho sản phẩm sắp hết hàng (< ngưỡng) hiển thị trong dashboard.

---

## 3. Yêu Cầu Phi Chức Năng

### 3.1 Performance (Hiệu Năng)

| Metric | Target | Notes |
|---|---|---|
| Page load time | p95 < 2 giây | Đo Time to Interactive trên kết nối 4G |
| API response latency — standard endpoints | p95 < 200ms | CRUD thông thường (product, cart, user) |
| API response latency — complex queries | p99 < 500ms | Filter + sort + pagination phức tạp |
| AI Recommendation inference | p95 < 200ms | Cache hit — kết quả đã được cache |
| AI Recommendation inference | p99 < 500ms | Cache miss — tính toán realtime |
| Search latency | p95 < 300ms | Full-text search với bộ lọc kết hợp |
| Throughput tổng thể | >= 500 req/s | Sustained load, không có performance degradation |
| Concurrent users | >= 1,000 users | Simultaneous active sessions không ảnh hưởng latency |
| Background job (batch inference) | Hoàn thành trong < 2 giờ | Batch recommendation cho email campaign 100k user |

### 3.2 Scalability (Khả Năng Mở Rộng)

| Metric | Target | Notes |
|---|---|---|
| Web tier scaling strategy | Horizontal scale-out stateless instances | Session state không lưu in-process, dùng distributed cache |
| AI service scaling | Scale-out độc lập với web tier | AI inference service tách biệt hoàn toàn |
| Database strategy | Read replica sẵn sàng khi cần | Schema không có blocker cho sharding trong tương lai |
| Cache hit rate — recommendation | >= 80% | Per-user cache với TTL 10 phút |
| Cache hit rate — product catalog | >= 90% | Product data cache với TTL 1 giờ |
| Event ingestion throughput | >= 10,000 behavioral events/phút | Pipeline async, không block web request |
| Data volume resilience | Hệ thống vận hành ổn định khi data tăng 10x | Không cần migration lớn khi scale |
| Message queue backpressure | Queue không tràn khi spike traffic | Consumer auto-scale hoặc queue buffer đủ lớn |

### 3.3 Security (Bảo Mật)

| Metric | Target | Notes |
|---|---|---|
| Authentication mechanism | Token-based: access token TTL ngắn + refresh token TTL dài | Refresh token lưu HTTP-only Secure cookie |
| Password storage | One-way hash với salt, adaptive cost factor | Không lưu plaintext; không dùng MD5 hoặc SHA1 |
| Data encryption in transit | TLS 1.2 minimum, TLS 1.3 preferred | Tất cả endpoints và internal service communication |
| Sensitive data at rest | Encryption tương đương AES-256 | Payment tokens, PII fields (SĐT, địa chỉ) |
| Rate limiting — authentication | Max 10 attempts/phút per IP | Hard lockout 15 phút sau 5 failed attempts liên tiếp |
| Rate limiting — API chung | Max 100 requests/phút per authenticated user | Configurable per endpoint group |
| Input validation | 100% user inputs được sanitize | Ngăn SQL Injection, XSS, Command Injection, Path Traversal |
| CORS policy | Whitelist explicit origins | Không dùng wildcard `*` trên production |
| Security compliance | Không có Critical hoặc High vulnerability | Scan OWASP Top 10 trước mỗi release |
| Audit logging completeness | 100% admin actions được log | Immutable, bao gồm user ID, timestamp, IP |

### 3.4 Availability & Reliability (Khả Dụng & Tin Cậy)

| Metric | Target | Notes |
|---|---|---|
| Uptime SLA | >= 99.5% | Tương đương ~3.6 giờ downtime cho phép/tháng |
| Recovery Time Objective (RTO) | <= 30 phút | Thời gian khôi phục hoạt động sau sự cố |
| Recovery Point Objective (RPO) | <= 1 giờ | Tối đa 1 giờ dữ liệu có thể mất trong worst case |
| Graceful degradation — AI service | Fallback sang best-seller list trong <= 100ms | Khi AI service down, toàn site không bị ảnh hưởng |
| Graceful degradation — payment gateway | Hiển thị thông báo rõ ràng, giữ nguyên giỏ hàng | Không mất cart data khi payment timeout |
| Automated backup | Daily full backup + hourly incremental | Backup lưu ở storage location độc lập với production |
| Deployment rollback | <= 5 phút | Blue-green hoặc canary deployment strategy |
| Health check | Mỗi service expose `/health` endpoint | Dùng cho load balancer routing và monitoring alerting |

### 3.5 AI/ML Specific Requirements

| Metric | Target | Notes |
|---|---|---|
| Recommendation inference latency | p95 < 200ms end-to-end | Bao gồm feature lookup, scoring, và response serialization |
| Click-Through Rate (CTR) | >= 5% | Đo trên tổng số recommendation impressions |
| Precision@10 | >= 0.30 | Offline evaluation — đo trên held-out test set |
| Recall@10 | >= 0.20 | Offline evaluation — đo trên held-out test set |
| Cold-start response time | Trending list trả về trong <= 100ms | Precomputed, không cần model inference |
| Model retraining cadence | Tối thiểu 1 lần/ngày | Batch retraining vào giờ thấp điểm |
| Feature store freshness | Lag tối đa 1 giờ | Khoảng cách giữa event xảy ra và feature được cập nhật |
| A/B test minimum sample | >= 1,000 users/group | Trước khi kết luận statistical significance |
| Model promotion gate | Offline metrics >= model hiện tại | Không deploy model mới nếu precision hoặc recall thấp hơn |
| Catalog coverage | >= 60% items được gợi ý ít nhất 1 lần/tuần | Đo diversity, tránh popularity bias quá mức |

---

## 4. User Stories

> **Format:** `**US-[PERSONA]-[ID]:** As a [persona], I want [action], so that [benefit].`

### 4.1 User Stories — Buyer (Người Mua Hàng)

**US-BUY-01:** As a buyer, I want to see personalized product recommendations on the homepage based on my browsing and purchase history, so that I can discover products relevant to my taste without spending time manually searching.

**US-BUY-02:** As a buyer, I want to apply multiple filters simultaneously (price range, category, rating, stock availability) and have the URL update to reflect my filter state, so that I can quickly narrow down options and easily share or bookmark my filtered search.

**US-BUY-03:** As a buyer, I want to receive an automatic notification when a product in my wishlist drops in price or comes back in stock, so that I can make a timely purchase decision without having to manually check the product page repeatedly.

**US-BUY-04:** As a buyer, I want to track the real-time status of my order with a clear visual timeline and receive push notifications at each major stage (confirmed, shipped, delivered), so that I always know where my package is without needing to contact customer support.

### 4.2 User Stories — Seller / Product Manager

**US-SELL-01:** As a product manager, I want to receive automatic low-stock alerts (configurable threshold) in the dashboard and via email when any product variant's inventory falls below the threshold, so that I can restock proactively before items go out of stock and cause lost sales.

**US-SELL-02:** As a product manager, I want to view a product performance report showing views, add-to-cart rate, conversion rate, and return rate per product, so that I can identify underperforming products and make data-driven decisions about pricing adjustments, content improvements, or promotions.

**US-SELL-03:** As a product manager, I want to bulk-import products via a CSV file with automatic SKU and variant generation from attribute definitions, so that I can update the entire catalog at scale without manually creating hundreds of individual product listings.

### 4.3 User Stories — Marketing Manager

**US-MKT-01:** As a marketing manager, I want the system to automatically segment the entire customer base using RFM analysis and visually identify "At Risk" customers — those who used to buy frequently but haven't purchased recently, so that I can proactively launch a targeted re-engagement campaign before these customers churn permanently.

**US-MKT-02:** As a marketing manager, I want to use an AI-powered content generator to create 3 variations of an email subject line and body for a campaign by providing only a brief description of the product and target audience, so that I can run meaningful A/B tests without spending hours on copywriting or relying on an external agency.

**US-MKT-03:** As a marketing manager, I want the system to automatically send a personalized abandoned cart email — containing the exact items the user left behind plus an AI-recommended product and a time-limited discount — 1 hour after a user adds items to cart without completing checkout, so that I can recover lost revenue without any manual intervention per campaign.

**US-MKT-04:** As a marketing manager, I want to view a comprehensive analytics dashboard for each campaign showing open rate, CTR, conversion rate, revenue attributed, and statistical significance of A/B test results, so that I can accurately measure ROI, learn what content resonates with each segment, and continuously optimize future strategies.

### 4.4 User Stories — Admin / System Administrator

**US-ADM-01:** As an admin, I want to view a real-time dashboard that consolidates today's revenue, new orders count, new user registrations, AI recommendation CTR, and system health status in a single view, so that I can immediately assess the overall health of the business and technology platform without navigating through multiple separate reports.

**US-ADM-02:** As an admin, I want to assign role-based permissions to staff accounts with fine-grained control (e.g., Customer Support role can view and update order status but cannot modify products or access financial reports), so that I can enforce the principle of least privilege and reduce the risk of accidental or unauthorized changes to critical data.

**US-ADM-03:** As an admin, I want to monitor AI recommendation performance metrics (CTR, precision@10, inference latency p95) in real-time and receive automated alerts when any metric degrades beyond a defined threshold, so that I can detect and investigate model quality issues before they noticeably impact the user experience and conversion rate.

**US-ADM-04:** As an admin, I want an immutable audit log that records every significant admin action — including who performed it, what was changed (before and after values), when it happened, and from which IP address — and allows me to search and filter this log, so that I can investigate any unauthorized changes, maintain accountability, and fulfill compliance requirements.

---

## 5. Ràng Buộc & Giả Định

### 5.1 Ràng Buộc Kỹ Thuật (Technical Constraints)

- Kiến trúc phải là **modular** — dù monolith hay microservices, các module phải có ranh giới rõ ràng (clear domain boundaries), có thể test độc lập, và có thể tách ra thành service riêng trong tương lai mà không phải rewrite.
- **AI services phải decoupled** khỏi web application layer — giao tiếp qua API contract thuần túy; web app không được import AI model code trực tiếp.
- Mọi **external service** (payment gateway, email provider, LLM API, SMS provider) phải được truy cập qua adapter/interface layer — cho phép swap provider mà không thay đổi business logic.
- **Database schema** phải backward-compatible khi upgrade — không có destructive migrations (drop column, rename column) sau khi production data tồn tại; chỉ additive changes.
- **Behavioral event pipeline** phải bất đồng bộ (async, fire-and-forget từ phía web app) — web request không được chờ event được lưu xong mới trả về response.
- Hệ thống phải vận hành đúng khi **AI service không khả dụng** — graceful degradation là bắt buộc, không phải optional.
- Tất cả **API endpoints** phải được document theo chuẩn (OpenAPI 3.0) và phải validate input trước khi xử lý.

### 5.2 Ràng Buộc Ngân Sách & Timeline

| Ràng Buộc | Giá Trị | Ghi Chú |
|---|---|---|
| Timeline | 16 tuần (1 học kỳ) | Chia thành 4 sprint × 4 tuần |
| Team size | 5–8 developers | Phân công theo module, mỗi người có thể phụ trách 1–2 modules |
| Infrastructure budget | Ưu tiên free tier / low-cost cloud | Target: không vượt ngưỡng miễn phí của các cloud providers |
| Payment integration | Sandbox / test mode only | Không xử lý tiền thật trong Phase 1 |
| AI training dataset | Synthetic data hoặc public e-commerce dataset | Không có real user data tại thời điểm khởi đầu |

**Phân bổ sprint đề xuất:**

| Sprint | Tuần | Modules |
|---|---|---|
| Sprint 1 | 1–4 | FR-AUTH, FR-CATALOG, FR-CART |
| Sprint 2 | 5–8 | FR-ORDER, FR-ANALYTICS (MVP), Admin Dashboard cơ bản |
| Sprint 3 | 9–12 | FR-REC (full AI pipeline), FR-MKTG (segmentation + campaign builder) |
| Sprint 4 | 13–16 | FR-MKTG (email delivery + basic analytics), NFR testing, polish, demo prep |

### 5.3 Third-Party Dependencies

| Dependency | Mục Đích | Ràng Buộc |
|---|---|---|
| Payment Gateway (sandbox) | Xử lý thanh toán test (FR-CART-05) | Chỉ sandbox credentials, không live |
| Transactional Email Service | Gửi email xác nhận, notification (FR-CART-06, FR-ORDER-03, FR-MKTG-09) | Free tier đủ cho môi trường demo |
| SMS Provider | OTP 2FA + order notification SMS (FR-AUTH-03, FR-ORDER-03) | Optional — có thể mock trong Phase 1 |
| Object Storage | Lưu ảnh sản phẩm, ảnh review, packing slips | Free tier storage hoặc self-hosted |

### 5.4 Phạm Vi Demo & Đối Tượng Đánh Giá

**Đối tượng đánh giá:** Giảng viên có kinh nghiệm sâu trong lĩnh vực CNTT và thương mại điện tử.

**Tiêu chí đánh giá ưu tiên:**
1. **Chất lượng AI Recommendation** — LightFM Collaborative Filtering + TF-IDF CBF phải hoạt động thực sự, không chỉ là fallback. Precision@10 và Recall@10 phải đạt ngưỡng (>= 0.30 và >= 0.20).
2. **Luồng e-commerce hoàn chỉnh** — Register → Browse → Search → Product Detail → Add to Cart → Checkout → VNPay payment → Order confirmation email.
3. **AnalyticsModule** — Dashboard phải hiển thị dữ liệu thực từ behavioral_events, không dùng mock data.
4. **MarketingModule** — RFM segmentation và campaign email delivery phải chạy được (sử dụng Gmail SMTP nodemailer).

**Scale thực tế trong demo:** ~10-50 concurrent users, ~50-100 emails/ngày, ~1,000-5,000 behavioral events/ngày — toàn bộ infrastructure free tier đủ xử lý.

**Không yêu cầu trong bối cảnh demo:**
- SEO traffic (không có real search engine indexing)
- 99.5% SLA (shared free tier không có SLA cam kết)
- Horizontal scaling (1 Render instance mỗi service là đủ)
- Real payment (VNPay sandbox only — không có giao dịch thật)

---

## 6. Ngoài Phạm Vi Phase 1 (Out of Scope)

Các tính năng sau đây **KHÔNG** được triển khai trong Phase 1:

- **Live payment processing** — tích hợp payment gateway thực sự xử lý giao dịch tiền thật; Phase 1 chỉ dùng sandbox/test mode
- **Mobile native application** (iOS/Android) — chỉ xây dựng responsive web; mobile app sẽ là Phase 2 nếu có
- **Multi-vendor marketplace** — nhiều seller độc lập với seller dashboard riêng, commission management, payout system
- **Logistics integration thực tế** — tự động đặt đơn vận chuyển qua API (Giao Hàng Nhanh, GHTK v.v.), in vận đơn tự động
- **Real-time customer support chatbot** — chatbot tích hợp trong site với live messaging
- **Blockchain / NFT / Web3 features** — bất kỳ tính năng nào liên quan đến blockchain
- **Multi-currency** — chỉ hỗ trợ VND; multi-currency là Phase 2
- **Multi-language ngoài Tiếng Việt và Tiếng Anh** — i18n framework sẽ chuẩn bị nhưng chỉ 2 ngôn ngữ được hỗ trợ
- **Subscription / Recurring billing** — mô hình thanh toán định kỳ
- **Affiliate / Referral program** — theo dõi hoa hồng affiliate và link referral
- **Social commerce features** — mua sắm trực tiếp qua social media posts (Instagram shopping, TikTok shop)
- **Real-time fraud detection** — ML model chấm điểm giao dịch realtime để phát hiện gian lận
- **Loyalty tier membership** (Gold/Silver/Platinum với perks khác nhau) — Phase 1 chỉ có hệ thống điểm cơ bản (FR-AUTH-07)
- **International shipping** — chỉ giao hàng trong nước (Việt Nam)
- Cloudflare CDN proxy (removed — Vercel Edge CDN đã đủ cho demo scale)
- Third-party error tracking (Sentry) — replaced by MongoDB error_logs collection
- Resend/SendGrid email API — replaced by Gmail SMTP (nodemailer) for demo scale

---

## 7. Bảng Tóm Tắt (Summary)

| Danh Mục | Module / Nhóm | Số Lượng |
|---|---|---|
| Business Goals | — | 7 |
| User Personas | — | 4 |
| **Functional Requirements** | FR-AUTH | 8 |
| | FR-CATALOG | 10 |
| | FR-CART | 8 |
| | FR-ORDER | 8 |
| | FR-REC | 10 |
| | FR-MKTG | 6 |
| | FR-ANALYTICS | 8 |
| **Tổng Functional Requirements** | | **58** (Must: 21 / Should: 27 / Could: 10) |
| **Non-Functional Requirements** | Performance | 9 |
| | Scalability | 8 |
| | Security | 10 |
| | Availability | 8 |
| | AI/ML Specific | 10 |
| **Tổng Non-Functional Requirements** | | **45** |
| **User Stories** | Buyer | 4 |
| | Seller / Product Manager | 3 |
| | Marketing Manager | 4 |
| | Admin | 4 |
| **Tổng User Stories** | | **15** |
| Out of Scope Items | — | 14 |

---

*Tài liệu này là nền tảng cho toàn bộ quá trình thiết kế và phát triển. Mọi thay đổi phải được review bởi toàn team và cập nhật version number.*
*Xem tiếp: [`TECH_STACK.md`](./TECH_STACK.md) → [`ARCHITECTURE.md`](./ARCHITECTURE.md) → [`MODULE_STRUCTURE.md`](./MODULE_STRUCTURE.md) → [`DATABASE_DESIGN.md`](./DATABASE_DESIGN.md)*
