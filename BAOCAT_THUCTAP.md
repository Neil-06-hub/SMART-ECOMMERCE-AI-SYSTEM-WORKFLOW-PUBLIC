# BÁO CÁO THỰC TẬP TỐT NGHIỆP

---

```
HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG
KHOA CÔNG NGHỆ THÔNG TIN
```

---

**THỰC TẬP TỐT NGHIỆP**

**ĐỀ TÀI:**

# XÂY DỰNG HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ THÔNG MINH VỚI TÍ NH NĂNG GỢI Ý SẢN PHẨM BẰNG TRÍ TUỆ NHÂN TẠO (SMART-ECOMMERCE AI SYSTEM)

---

**Đà Nẵng, tháng 05 năm 2026**

---

---

## LỜI CẢM ƠN

Trong suốt quá trình thực tập và hoàn thành đề tài này, em đã nhận được rất nhiều sự hỗ trợ, hướng dẫn và động viên từ thầy cô, gia đình và bạn bè.

Em xin gửi lời cảm ơn chân thành và sâu sắc nhất đến quý thầy cô tại Khoa Công nghệ Thông tin — Học viện Công nghệ Bưu chính Viễn thông đã tận tình giảng dạy, truyền đạt kiến thức và tạo điều kiện thuận lợi để em hoàn thành chương trình học và kỳ thực tập tốt nghiệp này.

Em cũng xin gửi lời cảm ơn đến gia đình và bạn bè đã luôn ở bên, động viên và tạo điều kiện tốt nhất để em học tập và hoàn thành báo cáo.

Do kiến thức và kinh nghiệm còn hạn chế, báo cáo chắc chắn không tránh khỏi những thiếu sót. Em rất mong nhận được sự góp ý của quý thầy cô để báo cáo được hoàn thiện hơn.

Em xin chân thành cảm ơn!

---

---

## MỤC LỤC

- [LỜI CẢM ƠN](#lời-cảm-ơn)
- [DANH MỤC BẢNG KÍ HIỆU VÀ TỪ VIẾT TẮT](#danh-mục-bảng-kí-hiệu-và-từ-viết-tắt)
- [DANH MỤC CÁC BẢNG](#danh-mục-các-bảng)
- [DANH MỤC CÁC HÌNH VẼ](#danh-mục-các-hình-vẽ)
- [MỞ ĐẦU](#mở-đầu)
  - [1. Lý do chọn đề tài](#1-lý-do-chọn-đề-tài)
  - [2. Mục tiêu đề tài](#2-mục-tiêu-đề-tài)
  - [3. Đối tượng và phạm vi nghiên cứu](#3-đối-tượng-và-phạm-vi-nghiên-cứu)
  - [4. Phương pháp nghiên cứu](#4-phương-pháp-nghiên-cứu)
  - [5. Kết quả dự kiến](#5-kết-quả-dự-kiến)
  - [6. Bố cục của báo cáo thực tập](#6-bố-cục-của-báo-cáo-thực-tập)
  - [7. Kế hoạch dự kiến triển khai đề tài](#7-kế-hoạch-dự-kiến-triển-khai-đề-tài)
- [CHƯƠNG 1: CƠ SỞ LÝ THUYẾT](#chương-1-cơ-sở-lý-thuyết)
  - [1.1. Tổng quan về thương mại điện tử và hệ thống gợi ý AI](#11-tổng-quan-về-thương-mại-điện-tử-và-hệ-thống-gợi-ý-ai)
  - [1.2. Các nghiệp vụ chính của hệ thống](#12-các-nghiệp-vụ-chính-của-hệ-thống)
  - [1.3. Các công nghệ sử dụng trong hệ thống](#13-các-công-nghệ-sử-dụng-trong-hệ-thống)
- [CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG](#chương-2-phân-tích-và-thiết-kế-hệ-thống)
  - [2.1. Đặt tả yêu cầu về nhiệm vụ](#21-đặt-tả-yêu-cầu-về-nhiệm-vụ)
  - [2.2. Biểu đồ ca sử dụng](#22-biểu-đồ-ca-sử-dụng)
  - [2.3. Biểu đồ hoạt động](#23-biểu-đồ-hoạt-động)
  - [2.4. Biểu đồ trạng thái](#24-biểu-đồ-trạng-thái)
  - [2.5. Thiết kế cơ sở dữ liệu](#25-thiết-kế-cơ-sở-dữ-liệu)
- [CHƯƠNG 3: CÀI ĐẶT CHƯƠNG TRÌNH VÀ KẾT QUẢ THỰC HIỆN](#chương-3-cài-đặt-chương-trình-và-kết-quả-thực-hiện)
  - [3.1. Môi trường phát triển và công nghệ sử dụng](#31-môi-trường-phát-triển-và-công-nghệ-sử-dụng)
  - [3.2. Xây dựng các chức năng chính của hệ thống](#32-xây-dựng-các-chức-năng-chính-của-hệ-thống)
- [KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN](#kết-luận-và-hướng-phát-triển)
- [DANH MỤC TÀI LIỆU THAM KHẢO](#danh-mục-tài-liệu-tham-khảo)

---

---

## DANH MỤC BẢNG KÍ HIỆU VÀ TỪ VIẾT TẮT

| Ký hiệu / Từ viết tắt | Giải thích |
|---|---|
| AI | Artificial Intelligence — Trí tuệ nhân tạo |
| ML | Machine Learning — Học máy |
| CF | Collaborative Filtering — Lọc cộng tác |
| CBF | Content-Based Filtering — Lọc dựa trên nội dung |
| RS | Recommendation System — Hệ thống gợi ý |
| TMĐT | Thương mại điện tử |
| API | Application Programming Interface — Giao diện lập trình ứng dụng |
| REST | Representational State Transfer — Kiểu kiến trúc API |
| JWT | JSON Web Token — Cơ chế xác thực |
| RBAC | Role-Based Access Control — Kiểm soát truy cập theo vai trò |
| ORM | Object-Relational Mapping (ở đây dùng ODM — Object-Document Mapping) |
| ODM | Object-Document Mapping (Mongoose với MongoDB) |
| NoSQL | Not Only SQL — Cơ sở dữ liệu phi quan hệ |
| ISR | Incremental Static Regeneration — Tái tạo tĩnh gia tăng (Next.js) |
| SSR | Server-Side Rendering — Kết xuất phía máy chủ |
| CSR | Client-Side Rendering — Kết xuất phía máy khách |
| TTL | Time To Live — Thời gian tồn tại (cho index MongoDB) |
| RFM | Recency, Frequency, Monetary — Mô hình phân tích khách hàng |
| NLP | Natural Language Processing — Xử lý ngôn ngữ tự nhiên |
| FSM | Finite State Machine — Máy trạng thái hữu hạn |
| QR | Quick Response (code) |
| CDN | Content Delivery Network — Mạng phân phối nội dung |
| CI/CD | Continuous Integration / Continuous Deployment |
| KPI | Key Performance Indicator — Chỉ số hiệu suất chính |
| CTR | Click-Through Rate — Tỷ lệ nhấp chuột |
| AOV | Average Order Value — Giá trị đơn hàng trung bình |
| COD | Cash on Delivery — Thanh toán khi nhận hàng |
| TF-IDF | Term Frequency — Inverse Document Frequency (thuật toán NLP) |
| WARP | Weighted Approximate-Rank Pairwise (hàm loss của LightFM) |
| P@10 | Precision at 10 — Độ chính xác tại 10 kết quả đầu |
| R@10 | Recall at 10 — Độ bao phủ tại 10 kết quả đầu |

---

---

## DANH MỤC CÁC BẢNG

| Số bảng | Tên bảng |
|---|---|
| Bảng 1.1 | Bảng so sánh các loại hệ thống gợi ý sản phẩm |
| Bảng 1.2 | Danh sách các công nghệ sử dụng trong hệ thống |
| Bảng 2.1 | Danh sách các yêu cầu chức năng nhóm FR-AUTH |
| Bảng 2.2 | Danh sách các yêu cầu chức năng nhóm FR-CATALOG |
| Bảng 2.3 | Danh sách các yêu cầu chức năng nhóm FR-CART |
| Bảng 2.4 | Danh sách các yêu cầu chức năng nhóm FR-ORDER |
| Bảng 2.5 | Danh sách các yêu cầu chức năng nhóm FR-REC (AI) |
| Bảng 2.6 | Danh sách các yêu cầu chức năng nhóm FR-MKTG |
| Bảng 2.7 | Danh sách các yêu cầu chức năng nhóm FR-ANALYTICS |
| Bảng 2.8 | Đặc tả Use Case UC01 — Đăng ký tài khoản |
| Bảng 2.9 | Đặc tả Use Case UC02 — Đăng nhập hệ thống |
| Bảng 2.10 | Đặc tả Use Case UC03 — Tìm kiếm và lọc sản phẩm |
| Bảng 2.11 | Đặc tả Use Case UC04 — Xem chi tiết sản phẩm |
| Bảng 2.12 | Đặc tả Use Case UC05 — Quản lý giỏ hàng |
| Bảng 2.13 | Đặc tả Use Case UC06 — Đặt hàng và thanh toán |
| Bảng 2.14 | Đặc tả Use Case UC07 — Theo dõi đơn hàng |
| Bảng 2.15 | Đặc tả Use Case UC08 — Nhận gợi ý AI |
| Bảng 2.16 | Đặc tả Use Case UC09 — Quản lý sản phẩm (Admin) |
| Bảng 2.17 | Đặc tả Use Case UC10 — Quản lý đơn hàng (Admin) |
| Bảng 2.18 | Đặc tả Use Case UC11 — Quản lý marketing (Admin) |
| Bảng 2.19 | Đặc tả Use Case UC12 — Xem dashboard phân tích (Admin) |
| Bảng 2.20 | Schema collection users |
| Bảng 2.21 | Schema collection products |
| Bảng 2.22 | Schema collection orders |
| Bảng 2.23 | Schema collection carts |
| Bảng 2.24 | Schema collection behavioral_events |
| Bảng 2.25 | Schema collection feature_snapshots |
| Bảng 2.26 | Schema collection model_versions |
| Bảng 2.27 | Schema collection coupons |
| Bảng 2.28 | Schema collection notifications |
| Bảng 2.29 | Schema collection marketing_logs |
| Bảng 3.1 | Môi trường phát triển phần mềm |
| Bảng 3.2 | Danh sách đầy đủ các API endpoint (56 endpoints) |

---

---

## DANH MỤC CÁC HÌNH VẼ

| Số hình | Tên hình |
|---|---|
| Hình 1.1 | Kiến trúc hệ thống gợi ý Hybrid (CF + CBF) |
| Hình 1.2 | Kiến trúc tổng thể hệ thống SMART-ECOMMERCE AI SYSTEM |
| Hình 2.1 | Sơ đồ Use Case tổng quan hệ thống |
| Hình 2.2 | Biểu đồ hoạt động — Đăng nhập |
| Hình 2.3 | Biểu đồ hoạt động — Đăng ký tài khoản |
| Hình 2.4 | Biểu đồ hoạt động — Tìm kiếm sản phẩm |
| Hình 2.5 | Biểu đồ hoạt động — Thêm vào giỏ hàng |
| Hình 2.6 | Biểu đồ hoạt động — Thanh toán đơn hàng |
| Hình 2.7 | Biểu đồ hoạt động — Nhận gợi ý AI (Circuit Breaker) |
| Hình 2.8 | Biểu đồ hoạt động — Pipeline huấn luyện AI |
| Hình 2.9 | Biểu đồ hoạt động — Quản lý sản phẩm Admin |
| Hình 2.10 | Biểu đồ hoạt động — Xử lý đơn hàng Admin |
| Hình 2.11 | Biểu đồ hoạt động — Gửi chiến dịch Marketing |
| Hình 2.12 | Biểu đồ trạng thái — Đơn hàng |
| Hình 2.13 | Biểu đồ trạng thái — Circuit Breaker AI |
| Hình 2.14 | Biểu đồ trạng thái — Mô hình ML |
| Hình 3.1 | Giao diện trang Đăng nhập |
| Hình 3.2 | Giao diện trang Đăng ký |
| Hình 3.3 | Giao diện trang Chủ (Homepage) |
| Hình 3.4 | Giao diện trang Danh mục sản phẩm (Shop) |
| Hình 3.5 | Giao diện trang Chi tiết sản phẩm (PDP) |
| Hình 3.6 | Giao diện trang Giỏ hàng (Cart) |
| Hình 3.7 | Giao diện trang Thanh toán (Checkout) |
| Hình 3.8 | Giao diện trang Lịch sử đơn hàng |
| Hình 3.9 | Giao diện trang Hồ sơ cá nhân |
| Hình 3.10 | Giao diện trang Danh sách yêu thích (Wishlist) |
| Hình 3.11 | Giao diện trang Gợi ý AI (AI Suggest) |
| Hình 3.12 | Giao diện Admin — Dashboard tổng quan |
| Hình 3.13 | Giao diện Admin — Quản lý sản phẩm |
| Hình 3.14 | Giao diện Admin — Quản lý đơn hàng |
| Hình 3.15 | Giao diện Admin — Quản lý người dùng |
| Hình 3.16 | Giao diện Admin — Quản lý mã giảm giá |
| Hình 3.17 | Giao diện Admin — Marketing & chiến dịch email |
| Hình 3.18 | Giao diện Bong bóng Chatbot 2-trong-1 (Client) |
| Hình 3.19 | Giao diện Admin — Hỗ trợ khách hàng trực tuyến (Live Chat) |

---

---

## MỞ ĐẦU

### 1. Lý do chọn đề tài

Trong những năm gần đây, thương mại điện tử (TMĐT) đã trở thành một trong những ngành tăng trưởng nhanh nhất tại Việt Nam. Theo báo cáo của Hiệp hội Thương mại điện tử Việt Nam (VECOM), doanh thu TMĐT Việt Nam năm 2025 ước đạt khoảng 25 tỷ USD, với tốc độ tăng trưởng bình quân trên 30% mỗi năm. Hàng triệu người tiêu dùng Việt Nam đang ngày càng ưa thích mua sắm trực tuyến nhờ sự tiện lợi, đa dạng sản phẩm và khả năng so sánh giá cả dễ dàng.

Tuy nhiên, sự bùng nổ về số lượng sản phẩm và gian hàng trực tuyến đặt ra một thách thức lớn: **người dùng thường xuyên bị quá tải thông tin**. Với hàng chục nghìn sản phẩm trên một nền tảng, việc tìm kiếm đúng mặt hàng phù hợp với nhu cầu và sở thích cá nhân trở nên rất khó khăn. Điều này dẫn đến tỷ lệ thoát trang cao, tỷ lệ chuyển đổi thấp và trải nghiệm mua sắm kém hiệu quả.

Các nền tảng TMĐT lớn như Shopee, Lazada, Amazon, Tiki đã giải quyết bài toán này bằng cách tích hợp **hệ thống gợi ý sản phẩm bằng trí tuệ nhân tạo (AI Recommendation System)**, cho phép cá nhân hóa trải nghiệm mua sắm của từng người dùng. Tuy nhiên, các giải pháp này đòi hỏi hạ tầng phức tạp, chi phí vận hành cao và thuật toán độc quyền, khiến các doanh nghiệp vừa và nhỏ khó tiếp cận.

Xuất phát từ thực tế đó, nhóm nghiên cứu quyết định chọn đề tài **"Xây dựng hệ thống thương mại điện tử thông minh với tính năng gợi ý sản phẩm bằng trí tuệ nhân tạo"** với những lý do sau:

- **Tính thực tiễn cao:** Đề tài giải quyết bài toán thực tế mà nhiều doanh nghiệp đang gặp phải trong lĩnh vực TMĐT.
- **Tính học thuật sâu:** Hệ thống gợi ý sản phẩm kết hợp Collaborative Filtering (LightFM) và Content-Based Filtering (TF-IDF) là chủ đề nghiên cứu hiện đại và có nhiều ứng dụng thực tiễn.
- **Tính toàn diện:** Đề tài bao phủ toàn bộ vòng đời của một sản phẩm phần mềm, từ phân tích yêu cầu, thiết kế kiến trúc, triển khai đến vận hành tự động bằng CI/CD.
- **Tính khả thi về chi phí:** Hệ thống được thiết kế để vận hành hoàn toàn trên các dịch vụ miễn phí (Render.com, Vercel, MongoDB Atlas M0), phù hợp với điều kiện của sinh viên và doanh nghiệp nhỏ.

### 2. Mục tiêu đề tài

Đề tài hướng đến các mục tiêu cụ thể sau:

**Mục tiêu tổng quát:** Xây dựng một hệ thống thương mại điện tử full-stack hoàn chỉnh, tích hợp hệ thống gợi ý sản phẩm bằng trí tuệ nhân tạo, có thể vận hành thực tế với chi phí vận hành tối thiểu.

**Mục tiêu cụ thể:**

1. Xây dựng hệ thống backend Express.js đáp ứng đầy đủ các nghiệp vụ TMĐT: quản lý người dùng, sản phẩm, đơn hàng, giỏ hàng, mã giảm giá, thông báo.

2. Xây dựng hệ thống gợi ý sản phẩm lai (Hybrid Recommendation System) kết hợp:
   - **Collaborative Filtering** sử dụng thư viện LightFM với thuật toán WARP loss, 128 latent factors
   - **Content-Based Filtering** sử dụng TF-IDF với kho từ vựng 5.000 từ và bi-gram
   - Công thức: **score = α × CF_score + (1 - α) × CBF_score** với α thay đổi theo từng vị trí hiển thị

3. Triển khai pipeline huấn luyện ML tự động hàng ngày bằng GitHub Actions, với cơ chế nâng cấp mô hình khi đạt ngưỡng: Precision@10 ≥ 0.30, Recall@10 ≥ 0.20.

4. Tích hợp pattern **Circuit Breaker** (thư viện opossum) để đảm bảo hệ thống hoạt động bình thường ngay cả khi dịch vụ AI gặp sự cố.

5. Xây dựng module Marketing tự động: phân khúc khách hàng theo RFM, gửi email nhắc nhở giỏ hàng bỏ quên, newsletter hàng tuần với nội dung được tạo bởi Gemini AI.

6. Xây dựng giao diện người dùng Next.js 15 với chiến lược kết xuất hỗn hợp (ISR/SSR/CSR) tối ưu cho từng loại trang.

7. Triển khai hệ thống thực tế lên các nền tảng: Render.com (backend + AI service), Vercel (frontend), MongoDB Atlas M0 (database).

### 3. Đối tượng và phạm vi nghiên cứu

#### 3.1 Đối tượng nghiên cứu

- **Hệ thống thương mại điện tử:** nghiên cứu các quy trình nghiệp vụ B2C bao gồm quản lý danh mục sản phẩm, quy trình đặt hàng, thanh toán, quản lý đơn hàng và chăm sóc khách hàng.
- **Hệ thống gợi ý sản phẩm:** nghiên cứu các thuật toán Collaborative Filtering, Content-Based Filtering và phương pháp kết hợp Hybrid; đặc biệt là thư viện LightFM và scikit-learn TF-IDF.
- **Kiến trúc phần mềm hiện đại:** nghiên cứu kiến trúc "Monolith + AI Sidecar", pattern Circuit Breaker, REST API design, pipeline CI/CD tự động.
- **Các công nghệ web hiện đại:** Next.js 15 (App Router), Express.js, FastAPI, MongoDB (NoSQL), Docker.

#### 3.2 Phạm vi nghiên cứu

- **Người dùng mục tiêu:** người mua sắm trực tuyến tại Việt Nam, nhà quản trị hệ thống TMĐT.
- **Phạm vi chức năng:** hệ thống bao gồm 58 yêu cầu chức năng được phân loại theo độ ưu tiên (Must/Should/Could), bao phủ 7 nhóm nghiệp vụ chính.
- **Phạm vi kỹ thuật:** ba đơn vị triển khai độc lập (backend Node.js, AI service Python, frontend Next.js) kết nối qua REST API.
- **Giới hạn:** hệ thống được xây dựng với mục đích học thuật và demo. Thanh toán sử dụng VNPay sandbox (không xử lý tiền thật). Hệ thống vận hành trên các gói miễn phí ($0/tháng).
- **Ngoài phạm vi:** ứng dụng di động native, marketplace đa người bán, tích hợp logistics thực tế, thanh toán quốc tế.

### 4. Phương pháp nghiên cứu

Đề tài sử dụng kết hợp các phương pháp nghiên cứu sau:

**4.1 Nghiên cứu lý thuyết:**
- Nghiên cứu tài liệu về hệ thống gợi ý sản phẩm: bài báo gốc của LightFM (Maciej Kula, 2015), tài liệu scikit-learn về TF-IDF vectorization.
- Nghiên cứu kiến trúc circuit breaker pattern trong hệ thống phân tán.
- Nghiên cứu các kỹ thuật rendering của Next.js (SSR, ISR, CSR) và ưu/nhược điểm của từng phương pháp.
- Nghiên cứu cơ sở dữ liệu NoSQL MongoDB và các pattern thiết kế schema.

**4.2 Phương pháp phát triển phần mềm:**
- Áp dụng phương pháp Agile với 4 sprint, mỗi sprint 4 tuần.
- Phát triển theo thứ tự phụ thuộc: foundation → authentication → catalog → cart/order → AI pipeline → marketing → testing.
- Sử dụng Git/GitHub để quản lý phiên bản và quy trình review code.

**4.3 Kiểm thử và đánh giá:**
- Unit testing: Jest (frontend/backend), pytest (FastAPI AI service).
- Integration testing: kiểm thử toàn bộ luồng từ trình duyệt đến database.
- Đánh giá chất lượng mô hình AI: Precision@10, Recall@10 trên tập dữ liệu holdout.
- Manual testing: kiểm thử UI/UX trên nhiều trình duyệt và kích thước màn hình.

### 5. Kết quả dự kiến

#### 5.1 Lý thuyết

Sau khi hoàn thành đề tài, nhóm mong muốn đạt được sự hiểu biết sâu sắc về:
- Các thuật toán gợi ý sản phẩm hiện đại và cách áp dụng trong bài toán thực tế.
- Kiến trúc hệ thống web quy mô vừa kết hợp với dịch vụ AI.
- Quy trình xây dựng và vận hành pipeline ML tự động (MLOps cơ bản).
- Các best practices trong thiết kế REST API, bảo mật JWT/RBAC, và MongoDB schema.

#### 5.2 Thực tiễn

- Một hệ thống TMĐT hoàn chỉnh và đang hoạt động thực tế với:
  - **56 API endpoints** phục vụ đầy đủ các nghiệp vụ TMĐT
  - **15 trang web** (9 trang khách hàng + 6 trang quản trị)
  - **Hệ thống AI** gợi ý sản phẩm cá nhân hóa theo 4 vị trí: Homepage, PDP, Cart, AI Suggest
  - **Pipeline ML tự động** chạy hàng ngày lúc 02:00 (giờ Việt Nam)
  - **Marketing automation** với email tự động và nội dung được tạo bởi AI
- Kinh nghiệm thực tiễn triển khai ứng dụng lên môi trường production (Render.com, Vercel).

### 6. Bố cục của báo cáo thực tập

Báo cáo được tổ chức thành các phần chính như sau:

- **Mở đầu:** Trình bày lý do chọn đề tài, mục tiêu, phạm vi nghiên cứu và kế hoạch triển khai.
- **Chương 1 — Cơ sở lý thuyết:** Giới thiệu các khái niệm về thương mại điện tử, hệ thống gợi ý sản phẩm AI và các công nghệ được sử dụng trong hệ thống.
- **Chương 2 — Phân tích và thiết kế hệ thống:** Đặc tả yêu cầu chức năng, biểu đồ ca sử dụng, biểu đồ hoạt động, biểu đồ trạng thái và thiết kế cơ sở dữ liệu MongoDB.
- **Chương 3 — Cài đặt chương trình và kết quả thực hiện:** Trình bày môi trường phát triển, các công nghệ sử dụng và mô tả chi tiết kết quả thực hiện của từng chức năng.
- **Kết luận và hướng phát triển:** Đánh giá kết quả đạt được, hạn chế của hệ thống và định hướng phát triển trong tương lai.
- **Tài liệu tham khảo:** Danh sách các tài liệu, bài báo và trang web tham khảo trong quá trình thực hiện đề tài.

### 7. Kế hoạch dự kiến triển khai đề tài

Đề tài được triển khai theo phương pháp Agile với 4 sprint trong 16 tuần:

| Sprint | Tuần | Nội dung công việc | Kết quả đạt được |
|---|---|---|---|
| **Sprint 1** | 1–4 | Thiết kế kiến trúc hệ thống; Xây dựng module Auth (đăng ký, đăng nhập, JWT, RBAC); Xây dựng module Catalog (CRUD sản phẩm, tìm kiếm, danh mục); Xây dựng module Cart (giỏ hàng, mã giảm giá) | Backend Auth + Catalog + Cart hoàn chỉnh; Database schema 10 collections; Frontend Login/Register/Shop/PDP/Cart |
| **Sprint 2** | 5–8 | Xây dựng module Order (đặt hàng, thanh toán VNPay/COD/MoMo, vòng đời đơn hàng); Xây dựng Admin dashboard (KPI, biểu đồ); Xây dựng quản lý admin (sản phẩm, đơn hàng, người dùng, mã giảm giá) | Checkout flow hoàn chỉnh; Admin dashboard với 6 loại biểu đồ; 4 module quản trị |
| **Sprint 3** | 9–12 | Xây dựng FastAPI AI service (LightFM CF + TF-IDF CBF); Tích hợp circuit breaker; Behavioral event tracking; Pipeline ML tự động GitHub Actions; Module Marketing (RFM, email campaigns, Gemini AI) | AI service hoàn chỉnh; Pipeline tự động; Marketing automation |
| **Sprint 4** | 13–16 | Thông báo realtime; AI Suggest page; Wishlist; Testing (Jest + pytest); Tối ưu hiệu suất; Deploy lên Render.com + Vercel + MongoDB Atlas; Viết báo cáo | Hệ thống hoàn chỉnh deployed; Báo cáo hoàn thành |

---

---

## CHƯƠNG 1: CƠ SỞ LÝ THUYẾT

### 1.1. Tổng quan về thương mại điện tử và hệ thống gợi ý AI

#### 1.1.1. Thương mại điện tử B2C

Thương mại điện tử (TMĐT) là hình thức trao đổi thông tin và thực hiện các giao dịch thương mại thông qua mạng Internet và các phương tiện điện tử. Mô hình B2C (Business to Consumer — Doanh nghiệp đến người tiêu dùng) là hình thức phổ biến nhất, nơi các doanh nghiệp bán hàng hóa hoặc cung cấp dịch vụ trực tiếp đến người tiêu dùng cuối qua website hoặc ứng dụng.

Một hệ thống TMĐT B2C hoàn chỉnh thường bao gồm các nghiệp vụ cơ bản: quản lý danh mục sản phẩm, tìm kiếm và lọc sản phẩm, giỏ hàng, quy trình thanh toán, quản lý đơn hàng, hệ thống đánh giá sản phẩm, chương trình khuyến mãi, và báo cáo phân tích kinh doanh.

#### 1.1.2. Hệ thống gợi ý sản phẩm (Recommendation System)

Hệ thống gợi ý sản phẩm (Recommendation System — RS) là một ứng dụng của lọc thông tin, nhằm dự đoán "đánh giá" hoặc "sở thích" mà người dùng có thể dành cho một mục (item). Hệ thống RS giải quyết vấn đề quá tải thông tin (information overload) bằng cách tự động đề xuất các sản phẩm phù hợp với từng người dùng.

**Ba phương pháp chính của hệ thống gợi ý:**

**(a) Collaborative Filtering (CF — Lọc cộng tác):**
Phương pháp này dựa trên hành vi tập thể của người dùng. Nếu người dùng A và B có hành vi tương tự nhau (xem/mua các sản phẩm giống nhau), thì những sản phẩm mà B thích có thể được gợi ý cho A. Có hai biến thể chính:
- **Memory-based CF:** Tính toán độ tương đồng giữa người dùng hoặc sản phẩm.
- **Model-based CF:** Sử dụng Matrix Factorization (như LightFM, SVD) để học các latent features ẩn.

**(b) Content-Based Filtering (CBF — Lọc dựa trên nội dung):**
Phương pháp này phân tích thuộc tính của sản phẩm (mô tả, danh mục, thẻ tag, giá) để tìm các sản phẩm tương tự. Nếu người dùng thích một sản phẩm cụ thể, hệ thống sẽ gợi ý các sản phẩm có nội dung tương tự. Phương pháp TF-IDF (Term Frequency–Inverse Document Frequency) thường được sử dụng để vector hóa mô tả sản phẩm.

**(c) Hybrid Recommendation (Gợi ý lai):**
Kết hợp CF và CBF để tận dụng ưu điểm của cả hai. Công thức tổng quát:

```
score(user, item) = α × CF_score(user, item) + (1 - α) × CBF_score(user, item)
```

Trong đó α là hệ số điều chỉnh, thay đổi theo ngữ cảnh (placement) và mức độ hoạt động của người dùng.

**Bảng 1.1 — So sánh các phương pháp hệ thống gợi ý:**

| Tiêu chí | Collaborative Filtering | Content-Based Filtering | Hybrid |
|---|---|---|---|
| Dữ liệu cần thiết | Hành vi người dùng | Thuộc tính sản phẩm | Cả hai |
| Cold-start user | Không tốt | Tốt | Tốt |
| Cold-start item | Không tốt | Tốt | Tốt |
| Độ đa dạng | Cao | Thấp (quá chuyên biệt) | Trung bình-Cao |
| Khả năng mở rộng | Trung bình | Tốt | Tốt |
| Sử dụng trong đề tài | LightFM WARP | TF-IDF + category one-hot | α×CF+(1-α)×CBF |

#### 1.1.3. Vấn đề Cold-Start và giải pháp

Cold-start là vấn đề xảy ra khi hệ thống gợi ý không có đủ dữ liệu về một người dùng mới hoặc một sản phẩm mới để đưa ra gợi ý chính xác. Hệ thống trong đề tài này giải quyết cold-start như sau:

| Kịch bản | Giá trị α | Hành vi hệ thống |
|---|---|---|
| Người dùng chưa đăng nhập (anonymous) | 0.0 | Thuần CBF — gợi ý sản phẩm phổ biến theo danh mục |
| Người dùng mới (<5 sự kiện hành vi) | 0.2 | CBF chiếm ưu thế (80%) |
| Người dùng hoạt động (≥5 sự kiện) | Theo placement | Hybrid bình thường |

#### 1.1.4. Circuit Breaker Pattern

Circuit Breaker (Cầu dao ngắt mạch) là một mẫu thiết kế trong hệ thống phân tán, giúp ngăn ngừa các cuộc gọi liên tiếp đến một dịch vụ đang gặp sự cố. Hệ thống có 3 trạng thái:

- **CLOSED (Đóng — bình thường):** Mọi request được chuyển tiếp đến dịch vụ AI (FastAPI). Nếu số lỗi vượt ngưỡng, chuyển sang OPEN.
- **OPEN (Mở — sự cố):** Không gọi dịch vụ AI; trả về kết quả fallback ngay lập tức. Sau thời gian resetTimeout, chuyển sang HALF-OPEN.
- **HALF-OPEN (Nửa mở — thử lại):** Cho phép một số request thử lại. Nếu thành công, chuyển về CLOSED; nếu thất bại, quay lại OPEN.

Trong hệ thống này, circuit breaker được cấu hình: `timeout = 500ms, errorThresholdPercentage = 50%, resetTimeout = 60s, volumeThreshold = 5`.

### 1.2. Các nghiệp vụ chính của hệ thống

#### 1.2.1. Quản lý người dùng

Nghiệp vụ quản lý người dùng bao gồm toàn bộ vòng đời của tài khoản trong hệ thống:

- **Đăng ký tài khoản:** Người dùng cung cấp tên, email và mật khẩu. Mật khẩu được mã hóa bằng bcrypt trước khi lưu vào database. Khi đăng ký thành công, hệ thống tự động gửi email chào mừng kèm mã giảm giá WELCOME10.
- **Đăng nhập và xác thực:** Sử dụng JWT (JSON Web Token) với thời hạn 7 ngày. Token được lưu trên client và gửi kèm trong header `Authorization: Bearer <token>` cho mỗi request yêu cầu xác thực.
- **Phân quyền RBAC:** Hệ thống có hai vai trò chính: `customer` (khách hàng) và `admin` (quản trị viên). Middleware `protect` xác minh JWT, middleware `adminOnly` kiểm tra quyền admin.
- **Quản lý hồ sơ:** Người dùng có thể cập nhật thông tin cá nhân (tên, SĐT, ngày sinh, giới tính, địa chỉ), thay đổi mật khẩu, upload avatar lên Cloudinary, và quản lý danh sách sở thích sản phẩm (dùng cho AI gợi ý).
- **Danh sách yêu thích (Wishlist):** Người dùng có thể lưu sản phẩm vào wishlist, nhận thông báo khi giá sản phẩm trong wishlist giảm.
- **Khóa/Mở khóa tài khoản:** Admin có thể khóa tài khoản người dùng vi phạm; middleware kiểm tra trạng thái `isBlocked` và từ chối đăng nhập.

#### 1.2.2. Quản lý sản phẩm

- **Danh mục sản phẩm (Catalog):** Sản phẩm được phân loại theo danh mục (category). Mỗi sản phẩm có: tên, mô tả, giá bán, giá gốc, danh mục, thẻ tag (dùng cho AI CBF), hình ảnh chính và hình ảnh phụ, thông số kỹ thuật (specs), số lượng tồn kho.
- **Tìm kiếm full-text:** Hỗ trợ tìm kiếm sản phẩm theo từ khóa với MongoDB text index. Ngoài ra, hệ thống còn hỗ trợ tìm kiếm bằng ngôn ngữ tự nhiên (NLP) thông qua OpenRouter LLM để phân tích ý định mua hàng của người dùng.
- **Lọc sản phẩm:** Lọc theo danh mục, khoảng giá, sản phẩm có giảm giá, sản phẩm phổ biến (sold cao), sản phẩm mới.
- **Đánh giá sản phẩm:** Chỉ người dùng đã mua và nhận hàng mới được phép đánh giá. Mỗi đánh giá gồm số sao (1–5) và nhận xét.
- **Quản lý tồn kho:** Hệ thống tự động theo dõi tồn kho, gửi thông báo khi sản phẩm sắp hết hàng (stock ≤ 5). Khi đơn hàng được xác nhận, tồn kho được trừ đi tự động; khi đơn bị hủy, tồn kho được hoàn trả.
- **Upload hình ảnh:** Hình ảnh sản phẩm được upload lên Cloudinary, hỗ trợ tối ưu hóa kích thước và định dạng tự động.

#### 1.2.3. Giỏ hàng và thanh toán

- **Giỏ hàng (Cart):** Hỗ trợ cả giỏ hàng ẩn danh (guest cart) và giỏ hàng đăng nhập (user cart). Giỏ hàng được lưu trong database, cho phép người dùng thêm, sửa số lượng, xóa sản phẩm.
- **Mã giảm giá:** Hỗ trợ hai loại mã: giảm theo phần trăm (percent) và giảm theo số tiền cố định (fixed). Mã có thể có giới hạn số lần sử dụng, giá trị đơn hàng tối thiểu và ngày hết hạn.
- **Thanh toán:** Hệ thống hỗ trợ ba phương thức thanh toán:
  - **COD (Thanh toán khi nhận hàng):** Đơn giản nhất, không cần xử lý online.
  - **Banking/VietQR:** Tạo mã QR thanh toán qua VietQR API, hiển thị thông tin ngân hàng.
  - **MoMo:** Tạo mã QR thanh toán qua ví MoMo.
- **Quy trình checkout 4 bước:** Thông tin giao hàng → Chọn phương thức vận chuyển → Chọn phương thức thanh toán → Xác nhận đơn hàng.
- **Phí vận chuyển:** Miễn phí vận chuyển cho đơn hàng từ 500.000đ trở lên; đơn hàng dưới 500.000đ tính phí 30.000đ.

#### 1.2.4. Quản lý đơn hàng

- **Vòng đời đơn hàng:** Đơn hàng trải qua các trạng thái: `pending` (chờ thanh toán) → `paid` (đã thanh toán) → `confirmed` (đã xác nhận) → `shipping` (đang giao) → `delivered` (đã giao) → `completed` (hoàn tất). Ngoài ra còn có: `cancelled` (đã hủy), `return_requested` (yêu cầu hoàn trả), `refunded` (đã hoàn tiền).
- **Theo dõi đơn hàng:** Người dùng có thể xem timeline trực quan của đơn hàng với các cột mốc trạng thái được hiển thị rõ ràng.
- **Hủy đơn hàng:** Người dùng chỉ có thể hủy đơn khi đơn ở trạng thái `pending` hoặc `paid`. Admin có thể hủy đơn ở các trạng thái trước `shipping`.
- **Thông báo tự động:** Khi trạng thái đơn hàng thay đổi, hệ thống tự động gửi thông báo trong ứng dụng cho người dùng.
- **Snapshot đơn hàng:** Thông tin sản phẩm, giá và địa chỉ giao hàng được chụp lại (snapshot) tại thời điểm đặt hàng, đảm bảo tính bất biến của đơn hàng dù sản phẩm có thay đổi sau này.

#### 1.2.5. AI gợi ý sản phẩm

- **Thu thập hành vi người dùng:** Mọi hành động của người dùng (xem sản phẩm, click, thêm vào giỏ, mua hàng, click vào gợi ý AI) đều được ghi lại vào collection `behavioral_events` với trọng số tương ứng.
- **Gợi ý theo vị trí (placement):** Hệ thống hỗ trợ 4 vị trí gợi ý khác nhau với hệ số α khác nhau: Homepage (α=0.7), Product Detail Page (α=0.3), Cart (α=0.5), AI Suggest (α=0.7).
- **Tìm kiếm bằng ngôn ngữ tự nhiên:** Người dùng có thể nhập câu hỏi tự nhiên như "tôi cần đồ cho chuyến đi biển dưới 2 triệu" và hệ thống sẽ tự động phân tích intent, trích xuất: danh mục, khoảng giá, từ khóa, tiêu chí sắp xếp.
- **Theo dõi hiệu suất AI:** Hệ thống đo lường CTR (Click-Through Rate) của từng vị trí gợi ý, hiển thị trên admin dashboard với đường mục tiêu 5%.

#### 1.2.6. Marketing tự động

- **Phân khúc khách hàng RFM:** Hệ thống tự động phân loại khách hàng dựa trên ba chỉ số: Recency (thời gian kể từ lần mua gần nhất), Frequency (tần suất mua hàng), Monetary (tổng giá trị chi tiêu). Mỗi chỉ số được chấm điểm từ 1–5 và khách hàng được xếp vào 6 phân khúc: Champions, Loyal, Potential, At Risk, Dormant, New.
- **Email nhắc giỏ hàng bỏ quên:** Hệ thống chạy cron job mỗi giờ, phát hiện người dùng có giỏ hàng chưa thanh toán sau 24 giờ và gửi email nhắc nhở với nội dung được tạo bởi Gemini AI, kèm mã giảm giá ưu đãi.
- **Newsletter hàng tuần:** Mỗi thứ Hai lúc 9:00 sáng, hệ thống tự động gửi newsletter cho tất cả khách hàng, giới thiệu top 3 sản phẩm bán chạy nhất với nội dung email được tạo bởi Gemini AI.
- **Email chào mừng:** Khi người dùng đăng ký tài khoản mới, hệ thống tự động gửi email chào mừng kèm mã WELCOME10 (giảm 10%).

#### 1.2.7. Thông báo và phân tích

- **Hệ thống thông báo:** Thông báo trong ứng dụng hỗ trợ 6 loại: `order` (cập nhật đơn hàng), `wishlist` (giá sản phẩm trong wishlist giảm), `promotion` (ưu đãi marketing), `system` (thông báo hệ thống), `new_product` (sản phẩm mới phù hợp sở thích), `ai` (gợi ý AI).
- **Dashboard admin:** Trang tổng quan với 4 KPI chính (doanh thu, đơn hàng, khách hàng, tăng trưởng tháng), 6 loại biểu đồ (doanh thu line chart, đơn hàng theo trạng thái, AI CTR, RFM segments, wishlist phổ biến, từ khóa trending), bảng tồn kho rủi ro và phân tích AI bằng Gemini.
- **Cảnh báo hệ thống:** Dashboard hiển thị cảnh báo realtime về sản phẩm sắp hết hàng (tồn kho <10), đơn hàng chờ xử lý, và mã giảm giá hết hạn/hết lượt dùng.

### 1.3. Các công nghệ sử dụng trong hệ thống

#### 1.3.1. Next.js 15 (Frontend Framework)

Next.js là framework React phổ biến nhất hiện nay, được phát triển bởi Vercel. Phiên bản 15 sử dụng App Router — hệ thống định tuyến file-based mới, hỗ trợ React Server Components và các chiến lược rendering linh hoạt:

- **ISR (Incremental Static Regeneration):** Trang được tạo tĩnh và tái tạo theo định kỳ. Sử dụng cho trang chủ (revalidate 3600s) và trang chi tiết sản phẩm (revalidate 300s) — tối ưu cho SEO.
- **SSR (Server-Side Rendering):** Trang được tạo trên server cho mỗi request. Sử dụng cho trang lịch sử đơn hàng — dữ liệu user-specific.
- **CSR (Client-Side Rendering):** Trang render hoàn toàn trên client. Sử dụng cho giỏ hàng, checkout, trang admin — yêu cầu tương tác realtime.

#### 1.3.2. Ant Design 5 + TanStack Query v5 + Zustand 4

- **Ant Design 5:** Thư viện UI component phong phú cho React, cung cấp các component như Table, Form, Modal, Chart, Drawer, Tabs được sử dụng xuyên suốt trong giao diện admin.
- **TanStack Query v5 (React Query):** Thư viện quản lý trạng thái server, hỗ trợ caching, refetching tự động, optimistic updates và phân trang. Được sử dụng cho tất cả các API call.
- **Zustand 4:** Thư viện quản lý trạng thái client nhẹ (< 1KB), dùng cho giỏ hàng, thông tin người dùng đăng nhập, và trạng thái UI modal/drawer.

#### 1.3.3. Express.js 4 + Node.js 20 LTS

Express.js là framework web tối giản cho Node.js. Hệ thống backend được viết bằng **JavaScript thuần (CommonJS)** — không phải TypeScript — với cấu trúc MVC rõ ràng: `models/` (Mongoose schemas), `controllers/` (business logic), `routes/` (URL mapping), `middleware/` (auth, error handling), `services/` (email, AI, marketing), `jobs/` (cron jobs).

#### 1.3.4. MongoDB Atlas M0 + Mongoose 8

MongoDB là cơ sở dữ liệu NoSQL document-oriented, lưu dữ liệu dưới dạng BSON (tương tự JSON). Mongoose là ODM (Object-Document Mapping) cung cấp schema validation, query builder và middleware hooks.

Hệ thống sử dụng các kỹ thuật quan trọng:
- **Soft-delete:** Sản phẩm dùng `isActive: false`, người dùng dùng `deletedAt: Date`.
- **TTL Index:** Collection `behavioral_events` tự động xóa dữ liệu sau 90 ngày.
- **Atomic operations:** `$inc` cho `usedCount` của mã giảm giá, `$set` cho trạng thái đơn hàng.
- **Embedding vs Referencing:** Dữ liệu liên quan thường xuyên truy cập cùng nhau (như items trong đơn hàng) được nhúng (embed) trực tiếp; dữ liệu có vòng đời độc lập (như đánh giá) được tham chiếu (reference).

#### 1.3.5. Python 3.11 + FastAPI 0.111

FastAPI là framework web Python hiện đại, dựa trên ASGI, hỗ trợ async/await native, tự động sinh tài liệu OpenAPI/Swagger. FastAPI đóng vai trò là **AI Sidecar Service** — một dịch vụ độc lập chuyên xử lý các tác vụ ML inference.

#### 1.3.6. LightFM 1.17 (Collaborative Filtering)

LightFM là thư viện Python chuyên dụng cho hệ thống gợi ý, kết hợp Matrix Factorization truyền thống với khả năng sử dụng item/user features. Trong hệ thống này:
- **Thuật toán:** WARP loss (Weighted Approximate-Rank Pairwise) — tối ưu hóa cho bài toán top-N ranking.
- **Cấu hình:** 128 latent factors, 50 epochs, learning rate 0.05.
- **Item features:** category one-hot encoding + price tier + tags.

#### 1.3.7. scikit-learn TF-IDF (Content-Based Filtering)

TF-IDF (Term Frequency–Inverse Document Frequency) là kỹ thuật vector hóa văn bản, đo lường mức độ quan trọng của một từ trong một tài liệu so với toàn bộ corpus. Trong hệ thống:
- **Cấu hình:** `max_features=5000`, `ngram_range=(1,2)` (unigram + bigram), `sublinear_tf=True`.
- **Kết hợp:** Vector TF-IDF (mô tả sản phẩm) + category one-hot (weight×2.0) + price tier one-hot.
- **Pre-computation:** Top-50 sản phẩm tương tự nhất cho mỗi sản phẩm được tính trước và lưu vào file `.pkl`.

#### 1.3.8. Cloudflare R2

Cloudflare R2 là dịch vụ lưu trữ object tương thích với S3 API của Amazon. Trong hệ thống, R2 được sử dụng để lưu trữ:
- File model ML: `cf_model.pkl`, `cf_dataset.pkl`, `cbf_top50.pkl`, `vectorizer.pkl`, `metadata.json`.
- Hỗ trợ hot-reload model: FastAPI tải model mới từ R2 vào bộ nhớ mà không cần restart.

Gói miễn phí: 10GB dung lượng, 10 triệu request/tháng.

#### 1.3.9. GitHub Actions (CI/CD + ML Training)

GitHub Actions là nền tảng CI/CD tích hợp trong GitHub. Trong hệ thống có 5 workflow:
- `pr-gate.yml`: Kiểm tra code quality khi tạo Pull Request (lint, test).
- `deploy-api.yml`: Deploy Express.js lên Render.com khi merge vào main.
- `deploy-ai.yml`: Deploy FastAPI lên Render.com.
- `deploy-web.yml`: Deploy Next.js lên Vercel.
- `ml-training.yml`: **Chạy tự động hàng ngày lúc 02:00 ICT (19:00 UTC)** — huấn luyện lại mô hình AI với dữ liệu 90 ngày gần nhất.

#### 1.3.10. Render.com + Vercel

- **Render.com:** Nền tảng hosting cho Express.js backend (port 5000) và FastAPI AI service (port 8000). Gói miễn phí: 512MB RAM, shared CPU. Có thể spin-down sau 15 phút không có request — được giải quyết bằng UptimeRobot ping `/api/health` mỗi 5 phút.
- **Vercel:** Nền tảng hosting tối ưu cho Next.js, hỗ trợ Edge CDN toàn cầu, tự động deploy khi push code.

#### 1.3.11. Nodemailer + Gmail SMTP

Nodemailer là thư viện Node.js phổ biến để gửi email. Hệ thống sử dụng Gmail SMTP với App Password (không cần OAuth2). Giới hạn: 500 email/ngày — phù hợp với quy mô demo. Email được gửi theo batch để tránh vượt giới hạn tốc độ.

#### 1.3.12. Opossum (Circuit Breaker)

Opossum là thư viện Node.js triển khai pattern Circuit Breaker. Trong hệ thống:
```js
{ timeout: 500ms, errorThresholdPercentage: 50%, resetTimeout: 60s, volumeThreshold: 5 }
```
Khi FastAPI AI service không phản hồi trong 500ms hoặc tỷ lệ lỗi vượt 50%, circuit breaker chuyển sang OPEN và trả về danh sách sản phẩm nổi bật từ MongoDB ngay lập tức.

#### 1.3.13. Cloudinary

Cloudinary là dịch vụ quản lý media trên cloud, hỗ trợ upload, lưu trữ, biến đổi (resize, crop, optimize) và phân phối hình ảnh qua CDN. Hệ thống sử dụng Cloudinary để lưu avatar người dùng và hình ảnh sản phẩm.

#### 1.3.14. Docker Compose (Môi trường phát triển local)

Docker Compose cho phép khởi động toàn bộ stack (MongoDB, Express.js, FastAPI, Next.js) với một lệnh duy nhất `docker compose up -d`, đảm bảo môi trường phát triển nhất quán giữa các thành viên nhóm.

#### 1.3.15. Công cụ hỗ trợ

- **Visual Studio Code:** IDE chính, hỗ trợ đầy đủ JavaScript, TypeScript và Python với các extension như ESLint, Prettier, Python.
- **Git / GitHub:** Quản lý phiên bản source code, quy trình pull request review.
- **Postman:** Kiểm thử API endpoint trong quá trình phát triển.
- **MongoDB Compass:** Giao diện đồ họa để quản lý và truy vấn MongoDB.

**Bảng 1.2 — Danh sách công nghệ sử dụng trong hệ thống:**

| # | Công nghệ | Phiên bản | Mục đích | Nền tảng |
|---|---|---|---|---|
| 1 | Next.js | 15.x | Frontend framework (App Router) | Vercel |
| 2 | React | 18.x | UI library | Vercel |
| 3 | Ant Design | 5.x | UI component library | Client |
| 4 | TanStack Query | 5.x | Server state management | Client |
| 5 | Zustand | 4.x | Client state management | Client |
| 6 | Express.js | 4.x | Backend REST API framework | Render.com |
| 7 | Node.js | 20 LTS | JavaScript runtime | Render.com |
| 8 | MongoDB | 7.x | NoSQL database | MongoDB Atlas M0 |
| 9 | Mongoose | 8.x | ODM cho MongoDB | Backend |
| 10 | Python | 3.11 | AI/ML language | Render.com |
| 11 | FastAPI | 0.111 | AI inference service | Render.com |
| 12 | LightFM | 1.17 | Collaborative Filtering | FastAPI |
| 13 | scikit-learn | 1.4 | TF-IDF, Content-Based Filtering | FastAPI |
| 14 | Cloudflare R2 | — | Object storage (ML models + images) | Cloudflare |
| 15 | Cloudinary | — | Image hosting + CDN | External |
| 16 | GitHub Actions | — | CI/CD + ML training cron | GitHub |
| 17 | Render.com | — | Backend + AI service hosting | Cloud |
| 18 | Vercel | — | Frontend hosting + Edge CDN | Cloud |
| 19 | Nodemailer | — | Email sending (Gmail SMTP) | Backend |
| 20 | Opossum | — | Circuit Breaker pattern | Backend |
| 21 | Docker Compose | 26.x | Local development environment | Local |
| 22 | bcryptjs | — | Password hashing (cost=12) | Backend |
| 23 | jsonwebtoken | — | JWT authentication | Backend |
| 24 | multer | — | File upload middleware | Backend |
| 25 | node-cron | — | Cron jobs (abandoned cart, newsletter) | Backend |

---

## CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

### 2.1. Đặt tả yêu cầu về nhiệm vụ

#### 2.1.1. Phát biểu bài toán

Bài toán đặt ra là xây dựng một hệ thống thương mại điện tử B2C hoàn chỉnh, phục vụ đồng thời hai nhóm người dùng chính:

- **Khách hàng (Customer):** Có thể duyệt sản phẩm, tìm kiếm, đặt hàng, thanh toán và nhận các gợi ý sản phẩm được cá nhân hóa dựa trên lịch sử hành vi của mình.
- **Quản trị viên (Admin):** Có thể quản lý toàn bộ hệ thống bao gồm sản phẩm, đơn hàng, người dùng, chiến dịch marketing và xem báo cáo phân tích kinh doanh.

Điểm đặc biệt của hệ thống so với TMĐT truyền thống là sự tích hợp của **hệ thống gợi ý sản phẩm bằng AI** hoạt động theo thời gian thực, kết hợp dữ liệu hành vi người dùng và đặc điểm sản phẩm để đưa ra các gợi ý phù hợp. Đồng thời, hệ thống phải đảm bảo **tính sẵn sàng cao** — khi dịch vụ AI gặp sự cố, hệ thống vẫn tiếp tục hoạt động bình thường với cơ chế fallback (circuit breaker).

#### 2.1.2. Các chức năng chính của hệ thống

Hệ thống được xây dựng dựa trên **58 yêu cầu chức năng (Functional Requirements)** được phân loại theo mức độ ưu tiên: Must (bắt buộc — 21 FRs), Should (nên có — 27 FRs), Could (có thể có — 10 FRs), tổ chức thành 7 nhóm nghiệp vụ.

**Bảng 2.1 — Yêu cầu chức năng nhóm FR-AUTH (Xác thực & Người dùng):**

| Mã | Mức | Mô tả |
|---|---|---|
| FR-AUTH-01 | Must | Đăng ký bằng email/mật khẩu; mật khẩu tối thiểu 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt |
| FR-AUTH-02 | Should | Đăng nhập bằng OAuth (Google, Facebook) với tự động liên kết tài khoản |
| FR-AUTH-03 | Could | Xác thực hai yếu tố (TOTP + SMS OTP, 5 phút hết hạn, khóa sau 5 lần sai) |
| FR-AUTH-04 | Must | Quản lý phiên đăng nhập bằng JWT (access token ngắn hạn 7 ngày) |
| FR-AUTH-05 | Should | Quên mật khẩu & đặt lại (link reset hết hạn sau 1 giờ) |
| FR-AUTH-06 | Should | Quản lý hồ sơ cá nhân (tên, SĐT, avatar, ngày sinh, giới tính, tối đa 5 địa chỉ giao hàng) |
| FR-AUTH-07 | Could | Hệ thống điểm tích lũy (tỷ lệ cấu hình, đổi voucher, lịch sử đầy đủ) |
| FR-AUTH-08 | Should | Danh sách yêu thích (wishlist persistent, trạng thái tồn kho, thêm hàng loạt vào giỏ) |

**Bảng 2.2 — Yêu cầu chức năng nhóm FR-CATALOG (Danh mục & Tìm kiếm):**

| Mã | Mức | Mô tả |
|---|---|---|
| FR-CATALOG-01 | Must | CRUD sản phẩm đầy đủ (tên, mô tả, giá, giá gốc, danh mục, kho, tags, hình ảnh, specs) |
| FR-CATALOG-02 | Must | Quản lý danh mục sản phẩm (slug, SEO metadata) |
| FR-CATALOG-03 | Should | Quản lý biến thể sản phẩm (nhóm thuộc tính, tạo ma trận tự động) |
| FR-CATALOG-04 | Must | Tìm kiếm toàn văn hỗ trợ tiếng Việt (MongoDB text index, p95 < 300ms) |
| FR-CATALOG-05 | Should | Bộ lọc nâng cao (danh mục, khoảng giá, quick filter: Discount/Popular/New) |
| FR-CATALOG-06 | Should | Sắp xếp kết quả (giá tăng/giảm, mới nhất, bán chạy, đánh giá cao) |
| FR-CATALOG-07 | Must | Trang chi tiết sản phẩm (gallery ảnh, mô tả, specs, trạng thái kho, gợi ý tương tự) |
| FR-CATALOG-08 | Should | Đánh giá và xếp hạng (xác minh mua hàng & đã nhận hàng, 1–5 sao, nhận xét) |
| FR-CATALOG-09 | Should | Quản lý tồn kho (cảnh báo sắp hết kho ≤5, auto-notify admin, lịch sử biến động) |
| FR-CATALOG-10 | Could | Flash sale & ưu đãi có thời hạn (đếm ngược, tự động hết hạn) |

**Bảng 2.3 — Yêu cầu chức năng nhóm FR-CART (Giỏ hàng, Thanh toán):**

| Mã | Mức | Mô tả |
|---|---|---|
| FR-CART-01 | Must | Quản lý giỏ hàng (thêm/sửa/xóa, persistent cho user đăng nhập) |
| FR-CART-02 | Should | Áp dụng mã giảm giá (kiểm tra điều kiện, giới hạn sử dụng, validate API) |
| FR-CART-03 | Should | Tính phí vận chuyển (FREE ≥500k VND, 30k VND nếu dưới ngưỡng) |
| FR-CART-04 | Must | Quy trình checkout nhiều bước (thông tin giao hàng → phương thức ship → thanh toán → xác nhận) |
| FR-CART-05 | Must | Thanh toán đa phương thức (COD, Banking/VietQR, MoMo; QR modal) |
| FR-CART-06 | Must | Xác nhận đơn hàng tức thì (trang success với mã đơn, trạng thái) |
| FR-CART-07 | Could | Lưu phương thức thanh toán (tokenization) |
| FR-CART-08 | Should | Xử lý lỗi thanh toán (trạng thái pending, thông báo rõ ràng) |

**Bảng 2.4 — Yêu cầu chức năng nhóm FR-ORDER (Quản lý đơn hàng):**

| Mã | Mức | Mô tả |
|---|---|---|
| FR-ORDER-01 | Must | Vòng đời đơn hàng (6 trạng thái chính + 3 trạng thái đặc biệt theo FSM) |
| FR-ORDER-02 | Should | Theo dõi đơn hàng (timeline trực quan với 4 cột mốc, màu sắc trạng thái) |
| FR-ORDER-03 | Should | Thông báo thay đổi trạng thái (notification trong app tự động) |
| FR-ORDER-04 | Should | Hủy đơn hàng (user hủy khi pending/paid, hoàn trả mã giảm giá) |
| FR-ORDER-05 | Should | Hoàn tiền (toàn phần, back to original method) |
| FR-ORDER-06 | Could | Hoàn trả & đổi hàng (7 ngày, lý do, ảnh minh chứng, duyệt admin) |
| FR-ORDER-07 | Must | Quản lý đơn hàng Admin (danh sách có lọc nhiều tiêu chí, cập nhật trạng thái, xuất CSV) |
| FR-ORDER-08 | Should | Lịch sử đơn hàng User (tất cả đơn, lọc theo trạng thái, modal chi tiết) |

**Bảng 2.5 — Yêu cầu chức năng nhóm FR-REC (AI Gợi ý sản phẩm):**

| Mã | Mức | Mô tả |
|---|---|---|
| FR-REC-01 | Must | Thu thập sự kiện hành vi (view=1, click=1.5, add_to_cart=2, purchase=5, rec_click=1.5; async) |
| FR-REC-02 | Must | Tạo và lưu feature vector mỗi ngày vào feature_snapshots (RFM, recentViews, avgOrderValue) |
| FR-REC-03 | Must | Huấn luyện Collaborative Filtering (LightFM WARP 128 factors, 50 epochs; daily; P@10≥0.30, R@10≥0.20) |
| FR-REC-04 | Should | Huấn luyện Content-Based Filtering (TF-IDF 5000 vocab + category one-hot; cache top-50 similar) |
| FR-REC-05 | Must | API gợi ý Hybrid (α×CF + (1-α)×CBF; circuit breaker 500ms; fallback featured products) |
| FR-REC-06 | Must | Hiển thị gợi ý tại 4 vị trí: Homepage (α=0.7), PDP (α=0.3), Cart (α=0.5), AI Suggest (α=0.7) |
| FR-REC-07 | Must | Xử lý cold-start (anonymous: α=0 → pure CBF; user mới: α=0.2; user hoạt động: α theo placement) |
| FR-REC-08 | Could | A/B testing (tối đa 3 chiến lược song song, phân bổ traffic ngẫu nhiên) |
| FR-REC-09 | Should | Tìm kiếm NLP: POST /api/ai/chat-search → OpenRouter LLM → parse intent (category/price/keywords) |
| FR-REC-10 | Should | Giám sát AI CTR theo placement; hiển thị trên admin dashboard với target 5% |

**Bảng 2.6 — Yêu cầu chức năng nhóm FR-MKTG (Marketing):**

| Mã | Mức | Mô tả |
|---|---|---|
| FR-MKTG-01 | Should | Phân khúc RFM tự động (6 phân khúc: Champions, Loyal, Potential, At Risk, Dormant, New) |
| FR-MKTG-02 | Should | Email nhắc giỏ hàng bỏ quên (cron hourly: tìm cartAbandonedAt > 24h, Gemini AI copy, mã giảm giá) |
| FR-MKTG-03 | Must | Newsletter hàng tuần (cron thứ Hai 9:00: top 3 bán chạy, Gemini AI subject+body, all customers) |
| FR-MKTG-04 | Must | Email chào mừng tự động (khi đăng ký: WELCOME10 code, Gemini AI nội dung) |
| FR-MKTG-05 | Should | Kích hoạt chiến dịch thủ công từ Admin dashboard ("Trigger now") |
| FR-MKTG-06 | Could | Cá nhân hóa email cơ bản (biến {{name}}, {{code}}) |
| FR-MKTG-07 | Should | Ghi log email đầy đủ (loại, người nhận, trạng thái, nội dung, thời gian, mã giảm giá kèm) |

**Bảng 2.7 — Yêu cầu chức năng nhóm FR-ANALYTICS (Phân tích & Dashboard):**

| Mã | Mức | Mô tả |
|---|---|---|
| FR-ANALYTICS-01 | Must | 4 KPI cards: doanh thu, đơn hàng (+ AOV), khách hàng, tăng trưởng tháng (% MoM) |
| FR-ANALYTICS-02 | Should | Revenue chart: năm nay + năm trước + AI forecast; date range selector (Day/Week/Month/Quarter) |
| FR-ANALYTICS-03 | Should | Order status donut chart (6 trạng thái màu sắc, center text tổng đơn) |
| FR-ANALYTICS-04 | Should | AI CTR by Placement column chart (target line 5% đỏ nét đứt) |
| FR-ANALYTICS-05 | Could | RFM Customer Segmentation donut (6 phân khúc màu sắc) |
| FR-ANALYTICS-06 | Should | Top Wishlisted Products horizontal bar chart (top 10) |
| FR-ANALYTICS-07 | Should | Trending Search Keywords word cloud (30 ngày, 10 từ, font-size by weight) |
| FR-ANALYTICS-08 | Must | Inventory Stockout Risk table (sp < 30 ngày, color-coded: đỏ <7, cam 7-14, vàng 14+) |
| FR-ANALYTICS-09 | Could | AI Analysis panel: Gemini insights về strengths, improvements, recommendations |
| FR-ANALYTICS-10 | Must | System Alerts: low stock, pending orders, expired discounts |

### 2.2. Biểu đồ ca sử dụng

#### 2.2.1. Các tác nhân (Actors)

Hệ thống có 4 tác nhân tham gia:

| Tác nhân | Vai trò | Mô tả |
|---|---|---|
| **Khách hàng (Customer)** | Người dùng cuối | Duyệt sản phẩm, đặt hàng, theo dõi đơn, quản lý tài khoản, nhận gợi ý AI. Bao gồm cả khách vãng lai (chưa đăng nhập) và khách đã đăng nhập. |
| **Quản trị viên (Admin)** | Nhân viên quản lý | Quản lý sản phẩm, đơn hàng, người dùng, marketing, xem báo cáo. Kế thừa toàn bộ quyền của Khách hàng. |
| **Hệ thống AI (AI System)** | Dịch vụ tự động | FastAPI inference service — xử lý yêu cầu gợi ý sản phẩm, phân tích NLP. Hoạt động tự động, không tương tác trực tiếp với người dùng. |
| **Hệ thống Email (Email System)** | Dịch vụ tự động | Gmail SMTP qua Nodemailer — gửi email tự động (chào mừng, xác nhận đơn, nhắc giỏ hàng, newsletter). Hoạt động theo sự kiện và cron job. |

#### 2.2.2. Sơ đồ Use Case tổng quan

```
╔══════════════════════════════════════════════════════════════════╗
║           HỆ THỐNG SMART-ECOMMERCE AI SYSTEM                    ║
║                                                                  ║
║  ┌──────────┐    CHỨC NĂNG KHÁCH HÀNG          ┌──────────┐    ║
║  │          │──► UC01: Đăng ký tài khoản        │          │    ║
║  │          │──► UC02: Đăng nhập                │          │    ║
║  │          │──► UC03: Tìm kiếm sản phẩm        │          │    ║
║  │          │──► UC04: Xem chi tiết SP           │          │    ║
║  │ KHÁCH    │──► UC05: Quản lý giỏ hàng         │  ADMIN   │    ║
║  │ HÀNG     │──► UC06: Đặt hàng & thanh toán    │          │    ║
║  │          │──► UC07: Theo dõi đơn hàng        │          │    ║
║  │          │──► UC08: Nhận gợi ý AI             │          │    ║
║  │          │──► UC09: Quản lý hồ sơ             │          │    ║
║  │          │──► UC10: Danh sách yêu thích       │          │    ║
║  └──────────┘                                   │          │    ║
║                  CHỨC NĂNG QUẢN TRỊ            │          │    ║
║                  UC11: Quản lý sản phẩm ◄───────┤          │    ║
║                  UC12: Quản lý đơn hàng ◄───────┤          │    ║
║                  UC13: Quản lý người dùng ◄─────┤          │    ║
║                  UC14: Quản lý mã giảm giá ◄────┤          │    ║
║                  UC15: Marketing & Email ◄───────┤          │    ║
║                  UC16: Dashboard phân tích ◄─────┘──────────┘    ║
║                                                                  ║
║  [AI System] ──────────► UC08 (cung cấp gợi ý hybrid)          ║
║  [Email System] ──────── UC01, UC06, UC15 (gửi email auto)      ║
╚══════════════════════════════════════════════════════════════════╝
```

#### 2.2.3. Đặc tả Use Case chi tiết

**Bảng 2.8 — UC01: Đăng ký tài khoản**

| Mục | Nội dung |
|---|---|
| **Mã UC** | UC01 |
| **Tên** | Đăng ký tài khoản |
| **Tác nhân** | Khách hàng (chưa đăng nhập) |
| **Mô tả** | Cho phép người dùng mới tạo tài khoản trong hệ thống |
| **Tiền điều kiện** | Người dùng chưa có tài khoản; có kết nối Internet |
| **Hậu điều kiện** | Tài khoản được tạo với role='customer'; email chào mừng kèm mã WELCOME10 được gửi |
| **Luồng chính** | 1. Truy cập /register; 2. Nhập tên, email, mật khẩu; 3. Validate email chưa tồn tại; 4. Validate độ mạnh mật khẩu (8+ ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt); 5. Hash mật khẩu bcrypt (cost=12); 6. Lưu user MongoDB (role='customer', isBlocked=false); 7. Tạo JWT token 7 ngày; 8. Gửi email chào mừng async; 9. Trả về token + user info |
| **Luồng thay thế** | Email đã tồn tại → HTTP 400 "Email đã được sử dụng" |
| **Luồng ngoại lệ** | Mật khẩu không đủ mạnh → HTTP 400 với mô tả cụ thể; Lỗi server → HTTP 500 |
| **API** | POST /api/auth/register |

**Bảng 2.9 — UC02: Đăng nhập hệ thống**

| Mục | Nội dung |
|---|---|
| **Mã UC** | UC02 |
| **Tên** | Đăng nhập hệ thống |
| **Tác nhân** | Khách hàng, Quản trị viên |
| **Mô tả** | Xác thực danh tính người dùng và cấp phát JWT token |
| **Tiền điều kiện** | Người dùng đã có tài khoản; tài khoản không bị khóa (isBlocked=false) |
| **Hậu điều kiện** | JWT token được tạo và lưu trên client; người dùng được redirect về trang cần thiết |
| **Luồng chính** | 1. Nhập email và mật khẩu; 2. Tìm user theo email (loại trừ deletedAt≠null); 3. So sánh mật khẩu với bcrypt.compare(); 4. Kiểm tra isBlocked=false; 5. Tạo JWT token; 6. Lưu token vào Zustand store; 7. Redirect |
| **Luồng thay thế** | Sai mật khẩu → HTTP 401 "Email hoặc mật khẩu không đúng" |
| **Luồng ngoại lệ** | Tài khoản bị khóa → HTTP 403 "Tài khoản đã bị khóa" |
| **API** | POST /api/auth/login |

**Bảng 2.10 — UC03: Tìm kiếm và lọc sản phẩm**

| Mục | Nội dung |
|---|---|
| **Mã UC** | UC03 |
| **Tên** | Tìm kiếm và lọc sản phẩm |
| **Tác nhân** | Khách hàng (đăng nhập hoặc không) |
| **Mô tả** | Tìm kiếm sản phẩm theo từ khóa, ngôn ngữ tự nhiên, áp dụng bộ lọc và sắp xếp kết quả |
| **Tiền điều kiện** | Hệ thống đang hoạt động |
| **Hậu điều kiện** | Danh sách sản phẩm phù hợp được hiển thị; sự kiện search được ghi vào behavioral_events |
| **Luồng chính — Tìm kiếm thông thường** | 1. Nhập từ khóa; 2. Text search MongoDB ({isActive:true}); 3. Áp dụng filters (category, price range, quickFilter); 4. Sắp xếp; 5. Trả về phân trang; 6. Lưu lịch sử localStorage (max 5) |
| **Luồng thay thế — Tìm kiếm NLP** | 1. Nhập câu hỏi tự nhiên (VD: "đồ đi biển dưới 2 triệu"); 2. POST /api/ai/chat-search → OpenRouter LLM; 3. Parse intent → {category, minPrice, maxPrice, keywords, sort}; 4. Tự động áp dụng filters; 5. Hiển thị kết quả |
| **API** | GET /api/products?search=&category=&minPrice=&maxPrice=&sort=; POST /api/ai/chat-search |

**Bảng 2.11 — UC04: Xem chi tiết sản phẩm**

| Mục | Nội dung |
|---|---|
| **Mã UC** | UC04 |
| **Tên** | Xem chi tiết sản phẩm |
| **Tác nhân** | Khách hàng |
| **Mô tả** | Xem đầy đủ thông tin sản phẩm, đánh giá và nhận gợi ý sản phẩm tương tự |
| **Tiền điều kiện** | Sản phẩm tồn tại và isActive=true |
| **Hậu điều kiện** | Sự kiện view được ghi vào behavioral_events; wishlist state được cập nhật |
| **Luồng chính** | 1. Truy cập /products/[id]; 2. Server ISR 300s load sản phẩm; 3. Client mount: track event view; 4. Load 4 sản phẩm tương tự (content-based tags); 5. Hiển thị: image gallery, tên, giá, giá gốc (% discount), category, stock status, mô tả, specs, reviews |
| **Luồng thay thế** | isActive=false hoặc không tồn tại → HTTP 404, Next.js notFound() |
| **Luồng thêm** | User đã đăng nhập → Hiển thị nút Wishlist (toggle); Viết review nếu đã mua & nhận hàng |
| **API** | GET /api/products/:id; POST /api/ai/track |

**Bảng 2.12 — UC05: Quản lý giỏ hàng**

| Mục | Nội dung |
|---|---|
| **Mã UC** | UC05 |
| **Tên** | Quản lý giỏ hàng |
| **Tác nhân** | Khách hàng |
| **Mô tả** | Thêm, sửa số lượng, xóa sản phẩm khỏi giỏ hàng; xem gợi ý AI |
| **Tiền điều kiện** | Người dùng đã chọn sản phẩm muốn thêm |
| **Hậu điều kiện** | Giỏ hàng Zustand store được cập nhật; cartAbandonedAt được set; event add_to_cart được ghi |
| **Luồng chính** | 1. Click "Thêm vào giỏ hàng"; 2. Kiểm tra tồn kho (nếu đăng nhập); 3. Thêm vào Zustand cart store; 4. Track event add_to_cart; 5. Tại /cart: Hiển thị CartItem list, AI Add-ons, Order summary; 6. Tính shipping fee (FREE ≥500k / 30k VND) |
| **Luồng thay thế** | Sản phẩm hết hàng → "Sản phẩm tạm hết hàng"; Tăng SL vượt kho → Giới hạn tại số thực tế |
| **Ghi chú** | AI Add-ons: Section gợi ý sp AI phía dưới cart items để tăng AOV |

**Bảng 2.13 — UC06: Đặt hàng và thanh toán**

| Mục | Nội dung |
|---|---|
| **Mã UC** | UC06 |
| **Tên** | Đặt hàng và thanh toán |
| **Tác nhân** | Khách hàng (đã đăng nhập), Hệ thống Email |
| **Mô tả** | Hoàn tất quy trình đặt hàng và thanh toán |
| **Tiền điều kiện** | Giỏ hàng ≥1 sản phẩm; người dùng đã đăng nhập |
| **Hậu điều kiện** | Đơn hàng được tạo với snapshot bất biến; kho được trừ; email xác nhận gửi; giỏ hàng xóa |
| **Luồng chính** | 1. Điền form giao hàng (họ tên*, SĐT*, địa chỉ*, tỉnh/thành*, ghi chú); 2. Tính phí ship; 3. Nhập mã giảm giá (POST /api/discounts/validate); 4. Chọn phương thức TT (COD/Banking/MoMo); 5. Xác nhận → POST /api/orders; 6. Server: validate stock → create order với itemSnapshot → decrement stock → send notification; 7. Redirect thành công |
| **Luồng thay thế — Banking/MoMo** | Hiển thị QR Modal: VietQR code, thông tin ngân hàng copyable, "Tôi đã thanh toán" → cập nhật order |
| **Luồng ngoại lệ** | Stock hết trong khi checkout → HTTP 400, yêu cầu cập nhật giỏ hàng |
| **API** | POST /api/orders; POST /api/discounts/validate |

**Bảng 2.14 — UC07: Theo dõi đơn hàng**

| Mục | Nội dung |
|---|---|
| **Mã UC** | UC07 |
| **Tên** | Theo dõi đơn hàng |
| **Tác nhân** | Khách hàng (đã đăng nhập) |
| **Mô tả** | Xem lịch sử tất cả đơn hàng và theo dõi trạng thái chi tiết từng đơn |
| **Tiền điều kiện** | Người dùng đã đăng nhập |
| **Hậu điều kiện** | Nếu hủy: kho hoàn trả, mã giảm giá hoàn trả, notification gửi |
| **Luồng chính** | 1. Truy cập /orders; 2. Load GET /api/orders/my; 3. Hiển thị order cards (mã 8 ký tự, ngày, status tag 7 màu, payment method); 4. Preview 3 sp đầu + "X sản phẩm khác"; 5. Click "Xem chi tiết" → Modal: timeline 4 bước, info giao hàng, sp list, price breakdown |
| **Luồng thay thế — Hủy đơn** | Click "Hủy đơn" → Confirm dialog → PUT /api/orders/:id/cancel → Hoàn trả coupon usedCount |
| **API** | GET /api/orders/my; PUT /api/orders/:id/cancel |

**Bảng 2.15 — UC08: Nhận gợi ý AI**

| Mục | Nội dung |
|---|---|
| **Mã UC** | UC08 |
| **Tên** | Nhận gợi ý sản phẩm AI |
| **Tác nhân** | Khách hàng; Hệ thống AI (FastAPI) |
| **Mô tả** | Hệ thống tự động gợi ý sản phẩm phù hợp theo hành vi cá nhân tại nhiều vị trí |
| **Tiền điều kiện** | Người dùng truy cập một trong 4 vị trí gợi ý |
| **Hậu điều kiện** | Event impression được ghi; khi click → event rec_click được ghi (weight=1.5) |
| **Luồng chính** | 1. GET /api/ai/recommendations?placement=X&n=12; 2. Backend: kiểm tra circuit breaker; 3. [CLOSED] POST http://fastapi:8000/recommend (userId, placement, n, filters); 4. FastAPI: α×CF_score + (1-α)×CBF_score → top-N productIds; 5. Backend hydrate từ MongoDB; 6. Trả về products + source badge (model/fallback) |
| **Luồng thay thế** | [OPEN circuit] Ngay lập tức: Product.find({isActive:true, featured:true}).limit(n) làm fallback; Badge "fallback" |
| **Ghi chú** | α per placement: homepage=0.7, pdp=0.3, cart=0.5, anonymous=0.0 |
| **API** | GET /api/ai/recommendations; POST /api/ai/track |

**Bảng 2.16 — UC09: Quản lý sản phẩm (Admin)**

| Mục | Nội dung |
|---|---|
| **Mã UC** | UC09 |
| **Tên** | Quản lý sản phẩm |
| **Tác nhân** | Quản trị viên |
| **Mô tả** | Tạo, chỉnh sửa, ẩn/hiện sản phẩm; quản lý tồn kho và thông báo liên quan |
| **Tiền điều kiện** | role='admin'; đã đăng nhập |
| **Hậu điều kiện** | Sản phẩm cập nhật; thông báo gửi đến users liên quan |
| **Luồng chính — Tạo sản phẩm** | 1. Form: tên*, mô tả*, giá*, giá gốc, danh mục*, kho*, tags (AI), featured, active; 2. Upload ảnh Cloudinary; 3. POST /api/admin/products; 4. Gửi notify đến users có preferences trùng tags |
| **Luồng chính — Cập nhật** | Tương tự; nếu giá giảm → notify wishlist owners (dedup) |
| **Luồng chính — Xóa** | Soft delete: isActive=false (không xóa dữ liệu) |
| **API** | GET/POST/PUT/DELETE /api/admin/products |

**Bảng 2.17 — UC10: Quản lý đơn hàng (Admin)**

| Mục | Nội dung |
|---|---|
| **Mã UC** | UC10 |
| **Tên** | Quản lý đơn hàng |
| **Tác nhân** | Quản trị viên |
| **Mô tả** | Xem, lọc, cập nhật trạng thái, xử lý hàng loạt đơn hàng |
| **Tiền điều kiện** | role='admin'; đã đăng nhập |
| **Hậu điều kiện** | Trạng thái đơn cập nhật; kho trừ/hoàn tự động; notification gửi khách |
| **Luồng chính** | 1. Xem danh sách với filters (tab trạng thái + search + date range + payment method/status); 2. Row actions: View detail / Quick confirm / Cancel; 3. Detail Drawer: customer info, shipping, products, status selects; 4. Thay đổi orderStatus → validate FSM → trừ/hoàn kho → notify |
| **Luồng thay thế — Bulk** | Chọn nhiều rows → Bulk confirm / Bulk cancel; Export CSV selected |
| **API** | GET /api/admin/orders; PUT /api/admin/orders/:id/status |

**Bảng 2.18 — UC11: Quản lý Marketing (Admin)**

| Mục | Nội dung |
|---|---|
| **Mã UC** | UC11 |
| **Tên** | Quản lý chiến dịch Marketing |
| **Tác nhân** | Quản trị viên; Hệ thống Email |
| **Mô tả** | Theo dõi và kích hoạt thủ công các chiến dịch email marketing tự động |
| **Tiền điều kiện** | role='admin'; đã đăng nhập |
| **Hậu điều kiện** | Emails được gửi (Gmail batch); log ghi vào marketing_logs |
| **Luồng chính** | 1. Xem trang /admin/marketing; 2. 3 campaign cards: Abandoned Cart (hourly + manual), Newsletter (Monday 9AM + manual), Welcome (100% auto); 3. Click "Trigger now" → POST /api/admin/marketing/trigger; 4. Backend: Gemini AI generate content → bulk send → log; 5. Xem kết quả trong Email Logs table (expandable rows) |
| **Luồng ngoại lệ** | Vượt giới hạn 500 emails/ngày Gmail → Dừng, ghi log lỗi |
| **API** | POST /api/admin/marketing/trigger; GET /api/admin/marketing/logs |

**Bảng 2.19 — UC12: Xem Dashboard phân tích (Admin)**

| Mục | Nội dung |
|---|---|
| **Mã UC** | UC12 |
| **Tên** | Xem Dashboard phân tích |
| **Tác nhân** | Quản trị viên |
| **Mô tả** | Xem tổng quan kinh doanh qua KPI và 6 loại biểu đồ; phân tích AI bằng Gemini |
| **Tiền điều kiện** | role='admin'; đã đăng nhập |
| **Hậu điều kiện** | Không thay đổi dữ liệu |
| **Luồng chính** | 1. Load /admin/dashboard; 2. Parallel fetch: 4 KPI stats + revenue chart + order distribution + AI CTR + RFM + wishlist + inventory + keywords; 3. Hiển thị tất cả widgets; 4. Tùy chọn: "AI Analysis" → GET /api/admin/dashboard/ai-analysis → Gemini insights panel |
| **Ghi chú** | Revenue chart: 3 đường (năm nay, năm trước, AI forecast). CTR chart: đường target 5%. Trending keywords: word cloud CSS |
| **API** | GET /api/admin/dashboard; GET /api/admin/dashboard/ai-analysis; GET /api/admin/dashboard/revenue; GET /api/admin/dashboard/inventory-trends; GET /api/admin/dashboard/wishlist-stats |

---

### 2.3. Biểu đồ hoạt động

Các biểu đồ hoạt động dưới đây mô tả luồng xử lý chi tiết của từng chức năng chính trong hệ thống, được biểu diễn dưới dạng text để rõ ràng và dễ đọc.

#### 2.3.1. Đăng nhập

```
[Bắt đầu]
   │
   ▼
[Người dùng nhập email + mật khẩu]
   │
   ▼
[Hệ thống: Tìm user theo email trong MongoDB]
   │
   ├──── [Không tìm thấy] ──────────────────────► [Thông báo lỗi: "Email hoặc mật khẩu không đúng"]
   │                                                              │
   ▼                                                             ▼
[bcrypt.compare(password, user.password)]                   [Kết thúc - thất bại]
   │
   ├──── [Sai] ─────────────────────────────────► [Thông báo lỗi: "Email hoặc mật khẩu không đúng"]
   │
   ▼
[Kiểm tra user.isBlocked]
   │
   ├──── [true] ────────────────────────────────► [Thông báo: "Tài khoản đã bị khóa"]
   │
   ▼
[Tạo JWT token (payload: userId, role, exp: 7d)]
   │
   ▼
[Lưu token vào Zustand store + localStorage]
   │
   ▼
[Redirect: trang trước hoặc Homepage/Admin dashboard]
   │
   ▼
[Kết thúc - thành công]
```

#### 2.3.2. Đăng ký tài khoản

```
[Bắt đầu]
   │
   ▼
[Người dùng nhập: name, email, password]
   │
   ▼
[Validate client-side: định dạng email, độ mạnh mật khẩu]
   │
   ├──── [Không hợp lệ] ──► [Hiển thị lỗi inline dưới field]
   │
   ▼
[POST /api/auth/register]
   │
   ▼
[Server: Kiểm tra email đã tồn tại trong MongoDB chưa]
   │
   ├──── [Đã tồn tại] ─────► [HTTP 400: "Email đã được sử dụng"]
   │
   ▼
[Validate mật khẩu: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/]
   │
   ├──── [Không đủ mạnh] ──► [HTTP 400: mô tả yêu cầu cụ thể]
   │
   ▼
[Hash mật khẩu: bcrypt.hash(password, 12)]
   │
   ▼
[Tạo user mới trong MongoDB: {name, email, passwordHash, role:'customer', isBlocked:false}]
   │
   ▼
[Tạo JWT token]
   │
   ▼
[Gửi email chào mừng + WELCOME10 (async, không chặn response)]
   │
   ▼
[Trả về: {success:true, token, user}]
   │
   ▼
[Client: Lưu token → Redirect Homepage]
   │
   ▼
[Kết thúc - thành công]
```

#### 2.3.3. Tìm kiếm sản phẩm (Full-text + NLP)

```
[Bắt đầu]
   │
   ▼
[Người dùng nhập từ khóa vào thanh tìm kiếm]
   │
   ├──── [Câu hỏi tự nhiên (NLP mode)] ──────────────────────────────────────────────┐
   │                                                                                  │
   ▼                                                                                  ▼
[Gọi GET /api/products?search=keyword]                          [Gọi POST /api/ai/chat-search {query}]
   │                                                                                  │
   ▼                                                                                  ▼
[MongoDB: $text search trên {name, description} với filter isActive:true]    [Backend gọi OpenRouter LLM]
   │                                                                                  │
   ▼                                                                                  ▼
[Áp dụng bộ lọc thêm: category, minPrice, maxPrice, quickFilter]   [LLM parse intent → {category, minPrice,
   │                                                                  maxPrice, keywords, sort, source}]
   ▼                                                                                  │
[Sắp xếp theo: newest/price_asc/price_desc/popular/rating]          ┌─────[source: 'fallback']
   │                                                                 │         │
   ▼                                                                 │         ▼
[Trả về: products[] + pagination]                                    │    [MongoDB keyword search thay thế]
   │                                                                 │         │
   ├──────────────────────────────────────────────────────────[source: 'llm']  │
   │                                                                 │         │
   ▼                                                                 ▼         ▼
[Ghi POST /api/ai/track-search {query}]             [Áp dụng parsed filters → GET /api/products]
   │                                                                           │
   ▼                                                                           ▼
[Lưu lịch sử tìm kiếm localStorage (max 5)]                   [Hiển thị kết quả có filters auto-applied]
   │                                                                           │
   └──────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
                               [Hiển thị danh sách sản phẩm]
                                          │
                                          ▼
                                    [Kết thúc]
```

#### 2.3.4. Thêm sản phẩm vào giỏ hàng

```
[Bắt đầu]
   │
   ▼
[Người dùng click "Thêm vào giỏ hàng" tại trang SP hoặc danh mục]
   │
   ▼
[Kiểm tra tồn kho (product.stock > 0)]
   │
   ├──── [Hết hàng] ──► [Hiển thị "Sản phẩm tạm hết hàng"]
   │
   ▼
[Cập nhật Zustand cart store: thêm item / tăng quantity]
   │
   ▼
[Kiểm tra số lượng không vượt kho thực tế]
   │
   ├──── [Vượt kho] ──► [Giới hạn tại stock thực tế, thông báo nhẹ]
   │
   ▼
[POST /api/ai/track {productId, action: 'add_to_cart', placement}]
   │
   ▼
[Server: Ghi BehavioralEvent {eventType:'add_to_cart', weight:2, userId, productId}]
   │
   ▼
[Server: Cập nhật user.cartAbandonedAt = now()]
   │
   ▼
[Hiển thị animation thêm thành công + badge cart tăng]
   │
   ▼
[Tại /cart: Hiển thị CartItem list + AI Add-ons + Order Summary sidebar]
   │
   ▼
[Kết thúc]
```

#### 2.3.5. Thanh toán đơn hàng

```
[Bắt đầu: User tại /cart, click "Thanh toán"]
   │
   ▼
[Kiểm tra đăng nhập]
   │
   ├──── [Chưa đăng nhập] ──► [Redirect /login?redirect=/checkout]
   │
   ▼
[BƯỚC 1: Form thông tin giao hàng]
[Nhập: Họ tên*, SĐT*, Địa chỉ*, Tỉnh/Thành*, Ghi chú]
   │
   ▼
[BƯỚC 2: Tùy chọn mã giảm giá]
[Input code → POST /api/discounts/validate {code, orderAmount}]
   │
   ├──── [Không hợp lệ] ──► [Hiển thị lý do: hết hạn/hết lượt/chưa đủ điều kiện]
   │
   ▼
[Tính shipping: FREE nếu ≥500k, 30k VND nếu <500k]
   │
   ▼
[BƯỚC 3: Chọn phương thức thanh toán]
[Radio: COD (blue) | Banking/VietQR (green) | MoMo (pink)]
   │
   ▼
[BƯỚC 4: Xác nhận → POST /api/orders]
   │
   ▼
[Server Transaction:
  1. Validate tất cả cart items còn tồn kho
  2. Validate & lock mã giảm giá (atomic $inc usedCount)
  3. Tạo order document với item snapshot + address snapshot
  4. Decrement stock cho từng item
  5. Emit notification cho user]
   │
   ├──── [Stock không đủ] ──► [HTTP 400, yêu cầu cập nhật giỏ hàng]
   │
   ▼
[Nếu COD/Banking/MoMo]
   │
   ├──── [COD] ──────────────► [Redirect trang success: Order code + status "Đang xử lý"]
   │
   ├──── [Banking/MoMo] ─────► [Hiển thị QR Modal:
   │                             - VietQR code image (generate từ VietQR API)
   │                             - Bank details copyable
   │                             - "Tôi đã thanh toán" button]
   │                                    │
   │                                    ▼
   │                          [Click "Tôi đã thanh toán"]
   │                                    │
   │                                    ▼
   │                          [Redirect trang success]
   │
   ▼
[Xóa giỏ hàng; Gửi email xác nhận đơn hàng]
   │
   ▼
[Kết thúc]
```

#### 2.3.6. Nhận gợi ý AI sản phẩm (Circuit Breaker)

```
[Bắt đầu: Component mount tại Homepage/PDP/Cart/AI Suggest]
   │
   ▼
[GET /api/ai/recommendations?placement=X&n=N&userId=Y]
   │
   ▼
[Backend: Kiểm tra trạng thái Circuit Breaker (Opossum)]
   │
   ├──── [CLOSED — bình thường] ─────────────────────────────────────────────────────┐
   │                                                                                  │
   ├──── [OPEN — FastAPI đang gặp sự cố] ───────────────────────────────────────┐   │
   │                                                                              │   │
   ├──── [HALF-OPEN — đang thử lại] ────────────────────────────────────────┐   │   │
                                                                              │   │   │
[CLOSED: Gọi POST http://fastapi:8000/recommend]                              │   │   │
{userId, placement, n, filters:{excludeOos:true}}                             │   │   │
   │                                                                           │   │   │
   ├──── [Timeout >500ms] ─► [Circuit OPEN] ─────────────────────────────────┤   │   │
   │                                                                           │   │   │
   ▼                                                                           │   │   │
[FastAPI: Tính hybrid score]                                                   │   │   │
  CF_scores = LightFM.predict(userId, all_items)                               │   │   │
  CBF_scores = cbf_top50[contextProductId] (hoặc category popularity)          │   │   │
  hybrid = α × CF + (1-α) × CBF                                               │   │   │
  Sắp xếp giảm dần → top-N productIds                                         │   │   │
   │                                                                           │   │   │
   ▼                                                                           │   │   │
[Backend hydrate: Product.find({_id:{$in:productIds}, isActive:true})]        │   │   │
   │                                                                           │   │   │
   ▼                                                                           │   │   │
[Trả về: {products[], scores[], source:'model', model_version}]               │   │   │
                                                                               │   │   │
[OPEN/HALF-OPEN FALLBACK] ◄────────────────────────────────────────────────────┘   │   │
[Product.find({isActive:true, featured:true}).limit(n)]                            │   │
[Trả về: {products[], source:'fallback'}]                                          │   │
   └────────────────────────────────────────────────────────────────────────────────┘   │
                                                                                        │
[HALF-OPEN: Thử gọi FastAPI 1 lần] ◄───────────────────────────────────────────────────┘
   ├──── [Thành công] ──► [Circuit → CLOSED]
   └──── [Thất bại] ────► [Circuit → OPEN lại]
                                          │
                                          ▼
                        [Frontend hiển thị products với badge source]
                                          │
                                          ▼
                        [User click → POST /api/ai/track {rec_click, weight:1.5}]
                                          │
                                          ▼
                                    [Kết thúc]
```

#### 2.3.7. Pipeline huấn luyện AI (GitHub Actions Daily 02:00 ICT)

```
[GitHub Actions Cron: "0 19 * * *" UTC = 02:00 ICT]
   │
   ▼
[BƯỚC 1: Fetch Training Data từ MongoDB]
  - behavioral_events (90 ngày gần nhất, trọng số theo eventType)
  - feature_snapshots (snapshot mới nhất mỗi user)
  - Xây dựng interaction matrix: users × items × weighted_scores
   │
   ▼
[BƯỚC 2: Train Collaborative Filtering (LightFM)]
  - Loss: WARP (Weighted Approximate-Rank Pairwise)
  - no_components: 128 (latent factors)
  - Item features: category one-hot + price tier + tags
  - epochs: 50, learning_rate: 0.05
  - Thời gian: ~10 phút
   │
   ▼
[BƯỚC 3: Evaluate Model]
  - Tập holdout: 7 ngày gần nhất
  - Tính Precision@10 và Recall@10
   │
   ├──── [P@10 < 0.30 HOẶC R@10 < 0.20] ──► [Log kết quả; Giữ model cũ; KHÔNG promote]
   │
   ▼
[BƯỚC 4: Promote Model nếu tốt hơn]
  - So sánh với active model trong model_versions
  - Nếu tốt hơn: set old model isActive=false, new model isActive=true, promotedAt=now
   │
   ▼
[BƯỚC 5: Build CBF Matrix]
  - TF-IDF vectorize product descriptions (max_features=5000, ngram(1,2))
  - Category one-hot (weight×2.0) + Price tier one-hot
  - Tính top-50 similar items cho mỗi sản phẩm (cosine similarity)
   │
   ▼
[BƯỚC 6: Upload Artifacts lên Cloudflare R2]
  - cf_model.pkl, cf_dataset.pkl
  - cbf_top50.pkl, vectorizer.pkl
  - metadata.json (version, metrics, timestamp)
   │
   ▼
[BƯỚC 7: Hot-reload FastAPI]
  - POST /internal/reload-model
  - FastAPI: asyncio.Lock → load model từ R2 → swap in-memory (atomic)
  - Không restart process
   │
   ▼
[BƯỚC 8: Ghi kết quả training_results.json (GitHub Actions artifact)]
   │
   ▼
[Kết thúc pipeline - tổng ~15 phút]
```

#### 2.3.8. Quản lý sản phẩm Admin

```
[Bắt đầu: Admin tại /admin/products]
   │
   ├──── [TẠO SẢN PHẨM] ─────────────────────────────────────────────────────────┐
   │     1. Click "+ Thêm sản phẩm"                                               │
   │     2. Modal: Nhập name*, description*, price*, originalPrice,               │
   │        category*, stock*, tags (AI tooltip), featured toggle                 │
   │     3. Upload ảnh → Cloudinary (picture-card)                                │
   │     4. POST /api/admin/products (FormData)                                   │
   │     5. Server: Lưu MongoDB → Gửi notify đến users có preferences trùng tags │
   │     6. Refresh danh sách                                                     │
   │                                                                              │
   ├──── [CẬP NHẬT SẢN PHẨM] ───────────────────────────────────────────────────┤
   │     1. Click "Edit" trong row actions                                        │
   │     2. Modal pre-fill dữ liệu hiện tại                                      │
   │     3. Chỉnh sửa → PUT /api/admin/products/:id                              │
   │     4. Nếu price mới < price cũ: Notify wishlist owners (dedup by userId)   │
   │        + Notify users có preference matching tags                            │
   │                                                                              │
   ├──── [ẨN/HIỆN SẢN PHẨM] ────────────────────────────────────────────────────┤
   │     1. Toggle trong Status column                                            │
   │     2. PUT /api/admin/products/:id {isActive: !current}                     │
   │     3. Sản phẩm ẩn không hiển thị ở client (filter isActive:true)          │
   │                                                                              │
   └──── [XÓA SẢN PHẨM] ────────────────────────────────────────────────────────┤
         1. Delete action → Confirm modal                                         │
         2. DELETE /api/admin/products/:id                                        │
         3. Soft delete: set isActive=false (KHÔNG xóa dữ liệu thực)            │
                                                                                  │
         [Tất cả actions → Refresh table → Cập nhật Stats (Total/Categories/     │
          Low stock/Out of stock)]                                                │
                                                                          [Kết thúc]
```

#### 2.3.9. Xử lý đơn hàng Admin (FSM)

```
[Bắt đầu: Admin tại /admin/orders]
   │
   ▼
[Xem danh sách với bộ lọc]
  - Tab: Tất cả/Chờ xác nhận/Chuẩn bị/Đang giao/Đã giao/Đã hủy
  - Filters: search (mã/tên/SĐT) + date range + payment method + payment status
   │
   ▼
[Click "Xem chi tiết" → Detail Drawer mở]
  - Hiển thị: customer info, shipping address, payment method, products list
   │
   ▼
[Admin thay đổi orderStatus trong select]
   │
   ▼
[Server validate FSM transition hợp lệ:]
  pending/paid → confirmed ✓
  confirmed → shipping ✓
  shipping → delivered ✓
  bất kỳ → cancelled ✓ (nếu chưa giao)
  delivered/cancelled → không thể thay đổi ✗
   │
   ├──── [Transition không hợp lệ] ──► [HTTP 400: "Không thể chuyển trạng thái"]
   │
   ▼
[Cập nhật order.status + order.timeline.push({status, timestamp, updatedBy})]
   │
   ▼
[Nếu chuyển sang 'confirmed': Decrement stock cho từng item]
[Nếu chuyển sang 'cancelled': Restore stock + hoàn trả coupon usedCount]
   │
   ▼
[Tạo Notification cho customer: {type:'order', title:'Đơn hàng cập nhật', ...}]
   │
   ▼
[Refresh order list + cập nhật tab badge counts]
   │
   ▼
[Kết thúc]
```

#### 2.3.10. Gửi chiến dịch email marketing

```
[Trigger: Cron job hoặc Admin manual click "Trigger now"]
   │
   ├──── [Abandoned Cart (cron 0 * * * *)] ──────────────────────────────────────┐
   │     1. Tìm users: cartAbandonedAt > 24h AND cartAbandonedNotified=false     │
   │     2. Với mỗi user: Gọi Gemini AI generate nội dung email cá nhân hóa     │
   │     3. Include mã giảm giá khuyến mãi                                       │
   │     4. Gửi email qua Gmail SMTP (nodemailer)                                 │
   │     5. Set cartAbandonedNotified=true                                        │
   │     6. Ghi marketing_log: {type:'abandoned_cart', recipient, status, ...}   │
   │                                                                              │
   ├──── [Weekly Newsletter (cron 0 9 * * 1)] ──────────────────────────────────┤
   │     1. Fetch top 3 sản phẩm bán chạy nhất (30 ngày)                        │
   │     2. Gọi Gemini AI generate subject + HTML body                           │
   │     3. Fetch danh sách tất cả customers (không bị khóa)                    │
   │     4. Gửi theo batch (tránh vượt giới hạn Gmail 500/ngày)                 │
   │     5. Ghi log cho từng email                                                │
   │                                                                              │
   └──── [Manual Trigger từ Admin] ─────────────────────────────────────────────┤
         POST /api/admin/marketing/trigger {campaignType}                        │
         → Thực thi cùng logic như trên nhưng ngay lập tức                      │
                                                                                  │
   [Nếu vượt 500 emails/ngày Gmail] ──► [Dừng, ghi log lỗi, thông báo admin]   │
                                                                                  │
   [Tất cả emails] ──► [Ghi marketing_logs: type, recipient, subject,           │
                         status(success/failed), discountCode, content]           │
                                                                          [Kết thúc]
```

#### 2.3.11. Theo dõi đơn hàng (Customer)

```
[Bắt đầu: Customer tại /orders]
   │
   ▼
[Load GET /api/orders/my (auth required)]
   │
   ├──── [Không có đơn nào] ──► [Empty state + CTA "Bắt đầu mua sắm"]
   │
   ▼
[Hiển thị danh sách order cards:]
  - Mã đơn: last 8 chars của ObjectId (uppercase)
  - Ngày tạo (format: DD/MM/YYYY HH:mm)
  - Status tag (7 màu: gold/purple/blue/cyan/green/red/orange)
  - Payment method icon
  - Preview 3 sản phẩm + "...và X sản phẩm khác"
  - Total amount (teal, lớn)
   │
   ▼
[Click "Xem chi tiết" → Detail Modal]
  - Timeline visual: 4 bước (pending → confirmed → shipping → delivered)
    Mỗi bước: icon màu + label + kết nối đường ngang
    Bước active: màu đậm; bước chưa đến: gray
  - Shipping info: tên, SĐT, địa chỉ, ghi chú
  - Phương thức thanh toán + trạng thái TT
  - Products list (scrollable max 240px): ảnh + tên + qty × price
  - Price breakdown: subtotal + ship + discount + total (teal, lớn)
   │
   ├──── [Status là pending hoặc paid] ──► [Nút "Hủy đơn hàng" (danger)]
   │           │
   │           ▼
   │     [Confirm Modal: "Bạn có chắc muốn hủy đơn này?"]
   │           │
   │           ▼
   │     [PUT /api/orders/:id/cancel]
   │           │
   │           ▼
   │     [Server: Hoàn kho + Hoàn coupon usedCount + Gửi notification]
   │           │
   │           ▼
   │     [Refresh orders list]
   │
   ▼
[Kết thúc]
```

#### 2.3.12. Xử lý thanh toán QR/VietQR

```
[Bắt đầu: User chọn Banking/MoMo tại Checkout, click Xác nhận]
   │
   ▼
[POST /api/orders → Server tạo order (status: 'pending')]
   │
   ▼
[Frontend: Hiển thị QR Modal]
   │
   ▼
[Generate QR Code via VietQR API:]
  - Amount: totalAmount
  - Bank code: Vietcombank (hoặc tùy cấu hình)
  - Account number: môi trường TEST
  - Transfer content: "Thanh toan don hang [orderId last 8]"
   │
   ▼
[Hiển thị trong Modal:]
  - QR code image (error handling: fallback nếu VietQR API lỗi)
  - Bank name + Account number (copyable button)
  - Account name
  - Amount (formatted VND)
  - Transfer content (copyable)
   │
   ├──── [Click "Thanh toán sau"] ──► [Đóng modal → Trang success (order pending)]
   │
   ├──── [Click "Tôi đã thanh toán"] ──► [Frontend: order status optimistic update]
   │                                      [Redirect thành công]
   │
   ▼
[Kết thúc]
```

#### 2.3.13. Quản lý tồn kho (Auto Low-Stock Alert)

```
[Trigger: Admin cập nhật order sang 'confirmed' HOẶC Admin tạo/cập nhật sản phẩm]
   │
   ▼
[Kiểm tra stock của sản phẩm sau khi decrement]
   │
   ├──── [stock > 5] ──► [Không có action gì]
   │
   ├──── [stock > 0 AND stock <= 5] ──► [Tạo Notification loại 'system']
   │     Title: "⚠️ Sản phẩm sắp hết hàng"
   │     Message: "[Tên SP] chỉ còn [stock] sản phẩm"
   │     Gửi đến: tất cả users có role='admin'
   │
   ├──── [stock = 0] ──► [Tạo Notification 'system' với mức độ cao hơn]
   │     Title: "🚨 Sản phẩm đã hết hàng"
   │
   ▼
[Dashboard Admin: Inventory Stockout Risk Table cập nhật]
  - Tính daily_velocity = total_sold_7days / 7
  - days_remaining = stock / daily_velocity
  - Color: đỏ (<7 ngày), cam (7-14 ngày), vàng (14-30 ngày)
   │
   ▼
[Kết thúc]
```

#### 2.3.14. Gửi thông báo hệ thống

```
[Trigger: Các sự kiện trong hệ thống]
   │
   ├──── [order.placed] ──────────────────► Notify customer: "Đặt hàng thành công"
   │
   ├──── [order.status.changed] ─────────► Notify customer: "Cập nhật đơn [status mới]"
   │
   ├──── [order.cancelled] ─────────────► Notify customer: "Đơn hàng đã bị hủy"
   │
   ├──── [product.price.decreased] ─────► Notify wishlist owners: "Giá SP trong wishlist giảm"
   │
   ├──── [product.created + tags match] ► Notify users có preferences matching: "SP mới phù hợp"
   │
   ├──── [stock.low] ────────────────────► Notify admins: "SP sắp hết hàng"
   │
   └──── [marketing.campaign] ──────────► Notify all customers: ưu đãi, khuyến mãi
   │
   ▼
[Server tạo Notification document:]
  {userId, type, title, message, link, isRead:false, createdAt:now}
   │
   ▼
[Frontend: NotificationBell icon badge +1]
[GET /api/notifications trả về unreadCount]
   │
   ▼
[User click bell → Dropdown list top 30 notifications]
[Click notification → Navigate tới link + mark as read]
   │
   ▼
[Kết thúc]
```

#### 2.3.15. Xem Dashboard phân tích Admin

```
[Bắt đầu: Admin tại /admin/dashboard]
   │
   ▼
[Parallel fetch (tất cả đồng thời)]
  ┌──► GET /api/admin/dashboard → {totalRevenue, totalOrders, totalUsers, growth%, monthlyRevenue[], ordersByStatus[], aiCtrByPlacement[], rfmSegments[]}
  ├──► GET /api/admin/dashboard/revenue?granularity=month → {current[], comparison[], forecast[]}
  ├──► GET /api/admin/dashboard/inventory-trends → {stockoutRisk[], trendingKeywords[]}
  └──► GET /api/admin/dashboard/wishlist-stats → {wishlistStats[]}
   │
   ▼
[Render 4 KPI Cards:]
  - Tổng doanh thu (formatted: M/K notation)
  - Tổng đơn hàng + AOV
  - Tổng khách hàng
  - Tăng trưởng tháng (% MoM với delta indicator ↑↓)
   │
   ▼
[Render 6 Biểu đồ:]
  1. Revenue Line Chart (năm nay solid + năm trước dashed + AI forecast dotted)
     → Date range selector: Ngày/Tuần/Tháng/Quý
  2. Order Status Donut (6 màu + center text total)
  3. AI CTR Column Chart (5% target line đỏ nét đứt)
  4. RFM Segments Donut (6 segments màu sắc)
  5. Top Wishlist Horizontal Bar (top 10)
  6. Trending Keywords Word Cloud (10 từ, font-size by weight)
   │
   ▼
[Render Inventory Risk Table:]
  - Sản phẩm có days_remaining < 30
  - Sort theo days_remaining ASC
  - Color-code: đỏ <7, cam 7-14, vàng 14+
   │
   ▼
[Tùy chọn: Click "AI Analysis"]
   │
   ▼
[GET /api/admin/dashboard/ai-analysis]
  → Backend gọi Gemini AI với context: top orders, top products, revenue trend
  → Gemini trả về: summary text + strengths[] + improvements[] + recommendations[]
   │
   ▼
[Hiển thị AI Analysis Panel:]
  - Summary (plain text)
  - Strengths box (green background)
  - Improvements box (amber background)
  - Recommendations box (blue background)
   │
   ▼
[Kết thúc]
```

---

### 2.4. Biểu đồ trạng thái

#### 2.4.1. Biểu đồ trạng thái đơn hàng

Đơn hàng trong hệ thống hoạt động theo mô hình Finite State Machine (FSM) với 9 trạng thái:

```
                    ┌─────────────────────────────────────────────┐
                    │              VÒNG ĐỜI ĐƠN HÀNG             │
                    └─────────────────────────────────────────────┘

[Khởi tạo]
    │
    ▼
┌─────────┐   Thanh toán     ┌──────┐   Admin xác nhận  ┌───────────┐
│ PENDING │─────────────────►│ PAID │──────────────────►│ CONFIRMED │
│(Chờ TT) │                  │(Đã TT│                   │(Đã xác    │
└─────────┘                  │ online│                   │  nhận)    │
    │                        └──────┘                   └───────────┘
    │                            │                           │
    │ Hủy đơn                    │ Hủy đơn                   │ Admin giao
    │ (user/admin)               │ (admin)                   │ hàng
    ▼                            ▼                           ▼
┌──────────┐              ┌──────────┐              ┌──────────────┐
│ CANCELLED│              │ CANCELLED│              │   SHIPPING   │
│(Đã hủy) │              │(Đã hủy) │              │ (Đang giao)  │
└──────────┘              └──────────┘              └──────────────┘
                                                           │
                                                           │ Giao thành công
                                                           ▼
                                                    ┌───────────┐
                                                    │ DELIVERED │
                                                    │(Đã giao)  │
                                                    └───────────┘
                                                           │
                                              ┌────────────┴────────────┐
                                              │                         │
                                              ▼                         ▼
                                       ┌──────────┐          ┌──────────────────┐
                                       │COMPLETED │          │ RETURN_REQUESTED │
                                       │(Hoàn tất)│          │(Yêu cầu hoàn    │
                                       └──────────┘          │  trả)           │
                                                             └──────────────────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────┐
                                                               │ REFUNDED │
                                                               │(Đã hoàn  │
                                                               │  tiền)   │
                                                               └──────────┘

Quy tắc FSM:
- pending → paid: khi user xác nhận TT online (Banking/MoMo)
- pending/paid → confirmed: Admin xác nhận
- pending/paid → cancelled: User hoặc Admin hủy (kho được hoàn trả)
- confirmed → shipping: Admin bắt đầu giao hàng
- confirmed → cancelled: Admin hủy (kho được hoàn trả)
- shipping → delivered: Admin xác nhận đã giao
- delivered → completed: Sau 7 ngày không có yêu cầu hoàn trả
- delivered → return_requested: Trong 7 ngày sau giao
- return_requested → refunded: Admin phê duyệt hoàn tiền
```

#### 2.4.2. Biểu đồ trạng thái người dùng

```
[Đăng ký mới]
    │
    ▼
┌─────────┐   Admin khóa   ┌───────────┐   Admin xóa  ┌─────────────┐
│ ACTIVE  │───────────────►│ SUSPENDED │─────────────►│   DELETED   │
│(Hoạt    │                │ (Bị khóa) │              │(Soft-delete)│
│  động)  │◄───────────────│           │              │deletedAt≠null│
└─────────┘   Admin mở     └───────────┘              └─────────────┘
                  khóa

Ghi chú:
- ACTIVE: isBlocked=false, deletedAt=null → Đăng nhập bình thường
- SUSPENDED: isBlocked=true, deletedAt=null → Middleware từ chối đăng nhập (HTTP 403)
- DELETED: isBlocked=true, deletedAt=Date → Không tìm thấy khi đăng nhập
- Admin (role='admin') không thể bị xóa qua API admin
```

#### 2.4.3. Biểu đồ trạng thái sản phẩm

```
[Tạo mới]
    │
    ▼
┌─────────────┐   Admin ẩn    ┌──────────────┐
│   ACTIVE    │──────────────►│    HIDDEN    │
│(isActive:   │               │(isActive:    │
│  true)      │◄──────────────│  false)      │
└─────────────┘   Admin hiện  └──────────────┘

Quy tắc:
- ACTIVE: Hiển thị ở trang client (filter isActive:true)
- HIDDEN: Không hiển thị client; vẫn tồn tại trong database
- Xóa thực chất là set isActive=false (soft delete)
- Admin quản lý qua /admin/products với Tabs: Tất cả / Đang bán / Đã ẩn
```

#### 2.4.4. Biểu đồ trạng thái chiến dịch Marketing

```
[Admin tạo chiến dịch]
    │
    ▼
┌───────┐   Admin lên lịch  ┌───────────┐   Đến giờ gửi  ┌─────────┐
│ DRAFT │──────────────────►│ SCHEDULED │───────────────►│ RUNNING │
│(Nháp) │                  └───────────┘                 └─────────┘
└───────┘                                                     │
                                                    ┌─────────┴──────────┐
                                                    │                    │
                                                    ▼                    ▼
                                             ┌──────────┐        ┌───────────┐
                                             │ COMPLETED│        │  PAUSED   │
                                             │(Hoàn tất)│        │(Tạm dừng) │
                                             └──────────┘        └───────────┘
                                                                       │
                                                               Admin tiếp tục
                                                                       │
                                                                       ▼
                                                              [Quay lại RUNNING]

Ghi chú: Trong hệ thống hiện tại, các campaign email được xử lý ngay lập tức (không có SCHEDULED state)
- Abandoned Cart: cron hourly → RUNNING → COMPLETED tự động
- Newsletter: cron Monday 9AM → RUNNING → COMPLETED tự động
- Manual trigger: Admin click → RUNNING → COMPLETED ngay
```

#### 2.4.5. Biểu đồ trạng thái Circuit Breaker AI

```
                              ┌──────────────────────────────────────┐
                              │         CIRCUIT BREAKER (Opossum)    │
                              └──────────────────────────────────────┘

                    ┌─────────────────────────────────────────────┐
                    │                                             │
[Khởi động]         │  Tỷ lệ lỗi > 50% trong cửa sổ 5 requests  │
    │               │  HOẶC timeout > 500ms liên tiếp            │
    ▼               │                                             │
┌────────┐          │                                  ┌──────────┐
│        │──────────┴─────────────────────────────────►│  OPEN    │
│ CLOSED │          Kết quả trả về: fallback           │ (Sự cố)  │
│(Bình   │◄──────────────────────────────────────────┐ └──────────┘
│thường) │    Thử nghiệm thành công                  │      │
└────────┘                                            │      │ Sau resetTimeout=60s
    │                                                 │      │
    │ Mọi request được forward                        │      ▼
    │ đến FastAPI AI service                          │ ┌───────────┐
    │                                                 │ │ HALF-OPEN │
    └──────────────────────────────────────── ────────┘ │(Thử lại)  │
                                                        └───────────┘
                                                              │
                                              ┌───────────────┴──────────────┐
                                              │                              │
                                              ▼                              ▼
                                       [Thành công]                    [Thất bại]
                                              │                              │
                                              ▼                              ▼
                                         [→ CLOSED]                     [→ OPEN]

Config: timeout=500ms, errorThresholdPercentage=50%, resetTimeout=60s, volumeThreshold=5
Fallback khi OPEN: Product.find({isActive:true, featured:true}).limit(n)
```

#### 2.4.6. Biểu đồ trạng thái Mô hình ML

```
[GitHub Actions kích hoạt (Daily 02:00 ICT)]
    │
    ▼
┌──────────┐   Pipeline hoàn thành   ┌───────────┐
│ TRAINING │────────────────────────►│ EVALUATED │
│(Đang     │                         │(Đã đánh   │
│  train)  │                         │  giá)     │
└──────────┘                         └───────────┘
                                           │
                          ┌────────────────┴────────────────┐
                          │                                  │
                          ▼                                  ▼
             [P@10 ≥ 0.30 AND R@10 ≥ 0.20]      [P@10 < 0.30 OR R@10 < 0.20]
                          │                                  │
                          ▼                                  ▼
                   ┌──────────┐                    [REJECTED — Giữ model cũ]
                   │ PROMOTED │                    [Ghi log thất bại]
                   │(Active)  │
                   └──────────┘
                         │
                         │ Model mới được promote
                         ▼
                [Model cũ → DEPRECATED]
                [Model mới → ACTIVE (isActive:true)]
                [Hot-reload: POST /internal/reload-model]

Registry: model_versions collection trong MongoDB
- Mỗi lần train → 1 document mới
- Chỉ 1 model per type (cf/cbf/hybrid) có isActive=true
- Lịch sử tất cả versions được giữ lại (promotedAt, deprecatedAt, metrics)
```

#### 2.4.7. Biểu đồ trạng thái thanh toán

```
[Đơn hàng mới tạo]
    │
    ▼
┌─────────┐
│ PENDING │
│(Chờ TT) │
└─────────┘
    │
    ├──── [COD] ──────────────────────────────────────────────────► [PENDING → chờ COD khi nhận]
    │
    ├──── [Banking/MoMo] ──► [Hiển thị QR] ──► [User xác nhận] ──► ┌──────┐
    │                                                                │ PAID │
    │                                                                └──────┘
    │                                                                    │
    │                         [Admin xác nhận đã nhận COD] ─────────────┘
    │
    ├──── [Hủy đơn] ────────────────────────────────────────────► ┌────────┐
    │                                                              │ FAILED │
    │                                                              └────────┘
    │
    └──── [Hoàn tiền sau khi PAID] ──────────────────────────────► ┌─────────┐
                                                                    │ REFUNDED│
                                                                    └─────────┘

Trạng thái payment được lưu độc lập với order.status trong document orders:
orders.payment.status: 'pending' | 'paid' | 'failed' | 'refunded'
```

---

### 2.5. Thiết kế cơ sở dữ liệu

#### 2.5.1. Tổng quan các collection MongoDB

Hệ thống sử dụng MongoDB với 12 collection chính. MongoDB được chọn vì tính linh hoạt của schema document (không cần migrate khi thêm trường), phù hợp với dữ liệu sản phẩm đa dạng và hành vi người dùng.

| # | Collection | Mục đích | Ghi chú đặc biệt |
|---|---|---|---|
| 1 | **users** | Tài khoản người dùng, hồ sơ, wishlist | Soft-delete: `deletedAt`; Block: `isBlocked` |
| 2 | **products** | Danh mục sản phẩm, tags AI, tồn kho | Soft-delete: `isActive:false` |
| 3 | **orders** | Đơn hàng với snapshot bất biến | Embedding: items, shippingAddress, payment, timeline |
| 4 | **carts** | Giỏ hàng (users + guests) | Sparse index theo userId/sessionId |
| 5 | **coupons** | Mã giảm giá | Atomic `$inc` cho usedCount |
| 6 | **notifications** | Thông báo trong ứng dụng | 6 loại type; mark-as-read |
| 7 | **behavioral_events** | Dữ liệu hành vi cho ML | **TTL index 90 ngày**; Time-series |
| 8 | **feature_snapshots** | Feature vector daily cho ML | Append-only; 1 snapshot/user/ngày |
| 9 | **model_versions** | Registry mô hình ML | Chỉ 1 model isActive=true mỗi type |
| 10 | **marketing_logs** | Audit log email marketing | INSERT-only; không update/delete |
| 11 | **support_rooms** | Phiên hỗ trợ realtime (Live Chat) | Lưu trạng thái bot/waiting/active |
| 12 | **messages** | Chi tiết nội dung tin nhắn chat | Lưu lịch sử hội thoại của bot và nhân viên |

#### 2.5.2. Schema chi tiết các collection

**Bảng 2.20 — Schema collection `users`:**

| Field | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated | Primary key |
| `name` | String | Required, trim | Tên đầy đủ người dùng |
| `email` | String | Required, unique, lowercase | Email đăng nhập |
| `password` | String | Required | Bcrypt hash (cost=12) |
| `role` | Enum | 'customer' \| 'admin', default:'customer' | Phân quyền RBAC |
| `avatar` | String | default:'' | URL Cloudinary avatar |
| `phone` | String | default:'' | Số điện thoại |
| `address` | String | default:'' | Địa chỉ mặc định (text) |
| `addresses` | Array | [{fullName, phone, street, city, isDefault}] | Danh sách địa chỉ giao hàng |
| `dob` | Date | null | Ngày sinh |
| `gender` | Enum | 'Nam' \| 'Nữ' \| 'Khác' \| '' | Giới tính |
| `preferences` | [String] | default:[] | Sở thích danh mục (cho AI gợi ý) |
| `wishlist` | [ObjectId] | ref:'Product', default:[] | Danh sách SP yêu thích |
| `isBlocked` | Boolean | default:false | Khóa tài khoản |
| `cartAbandonedAt` | Date | null | Timestamp thêm SP vào giỏ cuối |
| `cartAbandonedNotified` | Boolean | default:false | Đã gửi email nhắc chưa |
| `deletedAt` | Date | null | Soft delete timestamp |
| `createdAt` | Date | Auto (timestamps:true) | Ngày tạo |
| `updatedAt` | Date | Auto (timestamps:true) | Ngày cập nhật |

*Indexes:* `{email: 1}` unique; `{deletedAt: 1, isBlocked: 1}`

**Bảng 2.21 — Schema collection `products`:**

| Field | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Auto-generated | Primary key |
| `name` | String | Required, trim | Tên sản phẩm |
| `description` | String | Required | Mô tả chi tiết |
| `price` | Number | Required, min:0 | Giá bán (VND integer) |
| `originalPrice` | Number | default:0 | Giá gốc (để tính % giảm) |
| `category` | String | Required | Danh mục sản phẩm |
| `tags` | [String] | default:[] | Thẻ tag (dùng cho CBF AI) |
| `image` | String | Required | URL ảnh chính (Cloudinary) |
| `images` | [String] | default:[] | Danh sách ảnh phụ |
| `stock` | Number | Required, min:0 | Số lượng tồn kho |
| `sold` | Number | default:0 | Tổng đã bán (cumulative) |
| `reviews` | [ReviewSchema] | Embedded | Danh sách đánh giá |
| `rating` | Number | default:0, 0–5 | Điểm trung bình |
| `numReviews` | Number | default:0 | Tổng số đánh giá |
| `featured` | Boolean | default:false | Sản phẩm nổi bật (homepage) |
| `isActive` | Boolean | default:true | Soft delete flag |
| `specs` | Array | [{name, value}] | Thông số kỹ thuật |
| `createdAt` | Date | Auto | Ngày tạo |
| `updatedAt` | Date | Auto | Ngày cập nhật |

*Embedded ReviewSchema:* `{user: ObjectId, name: String, rating: Number(1-5), comment: String, createdAt, updatedAt}`

*Indexes:* `{isActive:1, category:1}`; `{name:'text', description:'text'}`; `{sold:-1, isActive:1}`

**Bảng 2.22 — Schema collection `orders`:**

| Field | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `user` | ObjectId | ref:'User', Required | Người đặt hàng |
| `items` | [OrderItem] | Embedded | Snapshot sản phẩm tại thời điểm đặt |
| `items[].product` | ObjectId | ref:'Product' | Tham chiếu SP |
| `items[].name` | String | Snapshot | Tên SP (bất biến) |
| `items[].image` | String | Snapshot | Ảnh SP (bất biến) |
| `items[].price` | Number | Snapshot | Giá tại thời điểm đặt |
| `items[].quantity` | Number | Required | Số lượng |
| `shippingAddress` | Object | Embedded Snapshot | {fullName, phone, address, city, note} |
| `paymentMethod` | Enum | 'cod' \| 'banking' \| 'momo' | Phương thức TT |
| `subtotal` | Number | Tính toán | Tổng trước giảm giá + ship |
| `shippingFee` | Number | 0 \| 30000 | Phí vận chuyển |
| `discount` | Number | default:0 | Số tiền giảm giá |
| `discountCode` | String | Snapshot | Mã giảm giá đã dùng |
| `totalAmount` | Number | Required | Tổng thanh toán |
| `paymentStatus` | Enum | 'pending'\|'paid'\|'failed'\|'refunded' | Trạng thái thanh toán |
| `status` | Enum | 9 trạng thái FSM | Trạng thái đơn hàng |
| `timeline` | [TimelineEntry] | Append-only | Lịch sử thay đổi trạng thái |
| `timeline[].status` | String | — | Trạng thái |
| `timeline[].timestamp` | Date | — | Thời điểm thay đổi |
| `timeline[].updatedBy` | ObjectId | — | Ai thay đổi |
| `createdAt` | Date | Auto | Ngày đặt hàng |

*Indexes:* `{user:1, createdAt:-1}`; `{status:1, createdAt:-1}`; `{paymentStatus:1}`

**Bảng 2.23 — Schema collection `carts`:**

| Field | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `userId` | ObjectId | sparse, unique | null cho guest cart |
| `sessionId` | String | sparse | Session ID cho guest |
| `items` | [CartItem] | Embedded | [{product, quantity, price, addedAt}] |
| `abandonedAt` | Date | null | Thời điểm thêm SP vào giỏ lần cuối |
| `updatedAt` | Date | Auto | Lần cập nhật cuối |

*Indexes:* `{userId:1}` sparse unique; `{sessionId:1}` sparse

**Bảng 2.24 — Schema collection `behavioral_events`:**

| Field | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `userId` | ObjectId | null cho anonymous | Người dùng (nullable) |
| `sessionId` | String | — | Session cho anonymous tracking |
| `eventType` | Enum | view\|click\|add_to_cart\|purchase\|search\|rec_click | Loại sự kiện |
| `productId` | ObjectId | null cho search | Sản phẩm liên quan |
| `weight` | Number | Theo eventType | Trọng số ML (view=1, ..., purchase=5) |
| `query` | String | null | Từ khóa tìm kiếm |
| `metadata` | Object | — | {placement, position, source, model_version} |
| `timestamp` | Date | default:now | Thời điểm sự kiện |

*Indexes:* `{timestamp:1}` **TTL: 7,776,000 giây = 90 ngày** (tự động xóa); `{userId:1, timestamp:-1}`; `{eventType:1, timestamp:-1}`; `{productId:1, eventType:1}`

**Bảng 2.25 — Schema collection `feature_snapshots`:**

| Field | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `userId` | ObjectId | ref:'User', Required | Người dùng |
| `snapshotDate` | Date | Required | Ngày tạo snapshot |
| `features.recentViewedProductIds` | [ObjectId] | — | SP đã xem gần đây |
| `features.purchasedCategoryIds` | [String] | — | Danh mục đã mua |
| `features.avgOrderValue` | Number | — | AOV trung bình |
| `features.purchaseFrequency` | Number | — | Số đơn hàng (tần suất) |
| `features.daysSinceLastPurchase` | Number | — | Ngày từ lần mua cuối (Recency) |
| `features.preferredPriceRange` | {min, max} | — | Khoảng giá ưa thích |
| `features.rfmScore` | {r, f, m} | 1–5 mỗi chỉ số | Điểm RFM |
| `features.segmentId` | String | — | Phân khúc khách hàng |
| `createdAt` | Date | Auto | — |

*Indexes:* `{userId:1, snapshotDate:-1}` unique compound

**Bảng 2.26 — Schema collection `model_versions`:**

| Field | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `modelType` | Enum | 'cf' \| 'cbf' \| 'hybrid' | Loại mô hình |
| `version` | String | YYYY-MM-DD-vN | Tên phiên bản |
| `metrics.precisionAt10` | Number | — | Precision@10 trên tập test |
| `metrics.recallAt10` | Number | — | Recall@10 trên tập test |
| `metrics.trainingSamples` | Number | — | Số samples huấn luyện |
| `metrics.trainingDurationMs` | Number | — | Thời gian train (ms) |
| `artifactUrl` | String | — | URL file .pkl trên Cloudflare R2 |
| `isActive` | Boolean | default:false | Model đang được dùng |
| `promotedAt` | Date | null | Khi nào được promote |
| `deprecatedAt` | Date | null | Khi nào bị thay thế |
| `createdAt` | Date | Auto | Ngày tạo |

*Indexes:* `{modelType:1, isActive:1}`; `{modelType:1, promotedAt:-1}`

**Bảng 2.27 — Schema collection `coupons`:**

| Field | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `code` | String | Required, unique, uppercase | Mã giảm giá |
| `description` | String | — | Mô tả (optional) |
| `type` | Enum | 'percent' \| 'fixed' | Loại giảm giá |
| `value` | Number | Required | Giá trị (% hoặc VND) |
| `maxDiscount` | Number | null | Giảm tối đa (cho loại percent) |
| `minOrderAmount` | Number | default:0 | Giá trị đơn hàng tối thiểu |
| `usageLimit` | Number | default:0 | Giới hạn dùng (0=unlimited) |
| `usedCount` | Number | default:0 | Số lần đã dùng (atomic $inc) |
| `expiresAt` | Date | null | Ngày hết hạn (null=không hạn) |
| `isActive` | Boolean | default:true | Đang kích hoạt |
| `createdAt` | Date | Auto | — |

*Indexes:* `{code:1}` unique; `{isActive:1, expiresAt:1}`

**Bảng 2.28 — Schema collection `notifications`:**

| Field | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `userId` | ObjectId | ref:'User', Required | Người nhận |
| `type` | Enum | order\|wishlist\|promotion\|system\|new_product\|ai | Loại thông báo |
| `title` | String | Required | Tiêu đề ngắn |
| `message` | String | Required | Nội dung thông báo |
| `link` | String | — | URL khi click (optional) |
| `isRead` | Boolean | default:false | Đã đọc chưa |
| `createdAt` | Date | Auto | Thời điểm tạo |

*Indexes:* `{userId:1, createdAt:-1}`; `{userId:1, isRead:1}`

**Bảng 2.29 — Schema collection `marketing_logs`:**

| Field | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `type` | Enum | welcome\|abandoned_cart\|newsletter\|promotion | Loại chiến dịch |
| `recipientId` | ObjectId | ref:'User' | Người nhận |
| `recipientEmail` | String | — | Email người nhận |
| `recipientName` | String | — | Tên người nhận |
| `subject` | String | — | Tiêu đề email |
| `content` | String | — | Nội dung email HTML |
| `status` | Enum | 'success' \| 'failed' \| 'pending' | Trạng thái gửi |
| `discountCode` | String | null | Mã giảm giá kèm theo |
| `error` | String | null | Lý do thất bại (nếu có) |
| `sentAt` | Date | Auto | Thời điểm gửi |

*Collection này là INSERT-ONLY — không có UPDATE/DELETE*

**Bảng 2.30 — Schema collection `support_rooms`:**

| Field | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `roomId` | String | Required, unique, index | ID phòng chat (userId hoặc guestId) |
| `userId` | ObjectId | ref:'User', null | ID người dùng đăng nhập (nếu có) |
| `userName` | String | Required | Tên hiển thị của khách hàng/khách vãng lai |
| `status` | Enum | 'bot' \| 'waiting' \| 'active' \| 'closed', default:'bot' | Trạng thái phòng hỗ trợ |
| `adminId` | ObjectId | ref:'User', null | ID của nhân viên tiếp nhận |
| `adminName` | String | null | Tên của nhân viên tiếp nhận |
| `createdAt` | Date | Auto | Thời điểm tạo phòng |
| `updatedAt` | Date | Auto | Thời điểm tương tác cuối |

*Indexes:* `{roomId: 1}` (Unique); `{status: 1}`

**Bảng 2.31 — Schema collection `messages`:**

| Field | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `roomId` | String | Required, index | ID phòng chat liên kết |
| `senderId` | ObjectId | ref:'User', null | ID người gửi tin nhắn (nếu có) |
| `senderName` | String | Required | Tên hiển thị người gửi |
| `senderRole` | Enum | 'customer' \| 'admin' \| 'bot' | Vai trò người gửi |
| `message` | String | Required | Nội dung tin nhắn văn bản |
| `timestamp` | Date | Required, default:Date.now | Thời điểm gửi |

*Indexes:* `{roomId: 1, timestamp: 1}` (Compound)

#### 2.5.3. Các quyết định thiết kế quan trọng

**Embedding vs Referencing:**

| Quyết định | Lý do |
|---|---|
| **Embed** `orders.items[]` | Snapshot bất biến tại thời điểm đặt hàng; không phụ thuộc vào thay đổi sản phẩm sau này |
| **Embed** `orders.shippingAddress` | Địa chỉ giao hàng không thay đổi sau khi đặt |
| **Embed** `products.reviews[]` | Reviews luôn được load cùng sản phẩm; ít phần tử |
| **Reference** `users.wishlist` → Product | Products có vòng đời độc lập; filter `isActive:true` cần thiết |
| **Reference** `behavioral_events.userId` | Write-heavy (fire-and-forget); có TTL; không cần join thường xuyên |

**TTL Index:** Collection `behavioral_events` có TTL index 90 ngày trên field `timestamp`. MongoDB tự động xóa documents cũ hơn 90 ngày, giữ database gọn gàng và đảm bảo ML chỉ train trên dữ liệu gần đây.

**Atomic Operations:** Field `coupons.usedCount` sử dụng `$inc` atomic để tránh race condition khi nhiều người dùng đặt hàng cùng một lúc với cùng mã giảm giá.

**Soft Delete Pattern:**
- Products: `isActive: false` — Query luôn kèm `{isActive:true}` ở client
- Users: `deletedAt: Date, isBlocked: true` — Middleware kiểm tra cả hai
- Dữ liệu lịch sử (orders, behavioral_events) không bao giờ bị xóa

---

## CHƯƠNG 3: CÀI ĐẶT CHƯƠNG TRÌNH VÀ KẾT QUẢ THỰC HIỆN

### 3.1. Môi trường phát triển và công nghệ sử dụng

#### 3.1.1. Môi trường phát triển

**Bảng 3.1 — Môi trường phát triển phần mềm:**

| Thành phần | Công cụ / Phiên bản | Mục đích |
|---|---|---|
| **Hệ điều hành** | Windows 11 / macOS 14 | Môi trường phát triển local |
| **IDE** | Visual Studio Code 1.90+ | Editor chính với extensions: ESLint, Prettier, Python, MongoDB |
| **Runtime Backend** | Node.js 20 LTS | Chạy Express.js backend |
| **Runtime AI** | Python 3.11 | Chạy FastAPI + ML libraries |
| **Package Manager** | npm 10.x (JS) / pip 24.x (Python) | Quản lý dependencies |
| **Container** | Docker Desktop + Docker Compose 26.x | Local full-stack environment |
| **Version Control** | Git 2.45 + GitHub | Quản lý source code |
| **API Testing** | Postman | Kiểm thử API endpoints |
| **Database GUI** | MongoDB Compass | Trực quan hóa và query MongoDB |
| **Browser DevTools** | Chrome DevTools | Debug frontend, Network tab |

#### 3.1.2. Kiến trúc triển khai tổng thể

```
                    ┌─────────────────────────────────────┐
                    │         NGƯỜI DÙNG (Browser)        │
                    └──────────────┬──────────────────────┘
                                   │ HTTPS
                    ┌──────────────▼──────────────────────┐
                    │    VERCEL EDGE CDN (Global)          │
                    │    Next.js 15 (Port 3000)            │
                    │    ISR/SSR/CSR theo từng trang       │
                    └──────────────┬──────────────────────┘
                                   │ REST API Calls
                    ┌──────────────▼──────────────────────┐
                    │    RENDER.COM — Express.js API       │
                    │    Node.js 20 LTS (Port 5000)        │
                    │    ├── Auth + Products + Orders      │
                    │    ├── Cart + Coupons + Wishlist     │
                    │    ├── Notifications + Marketing     │
                    │    └── AI Controller (circuit breaker)│
                    └──────┬────────────────┬─────────────┘
                           │                │
              ┌────────────▼──┐    ┌────────▼────────────┐
              │ MONGODB ATLAS │    │ RENDER.COM           │
              │ M0 Free Tier  │    │ FastAPI AI Service   │
              │ 12 Collections│    │ Python 3.11 (Port 8000)│
              │ 512MB storage │    │ LightFM + TF-IDF     │
              └───────────────┘    └──────────┬──────────┘
                                              │
                                   ┌──────────▼──────────┐
                                   │  CLOUDFLARE R2       │
                                   │  ML Model PKL files  │
                                   │  (cf_model, cbf_top50│
                                   │   vectorizer, metadata)│
                                   └─────────────────────┘

        Cron Jobs (GitHub Actions):
        ├── Daily 02:00 ICT: ML Training Pipeline
        ├── Hourly: Abandoned Cart Email
        └── Weekly Mon 9AM: Newsletter

        External Services:
        ├── Cloudinary: Image hosting + CDN
        ├── Gmail SMTP: Email delivery
        ├── Groq API: Real-time Chat & NLP Search
        └── Llama 3 8B: Marketing copy & consulting
```

### 3.2. Xây dựng các chức năng chính của hệ thống

#### 3.2.1. Trang Đăng nhập / Đăng ký

**Trang Đăng nhập (`/login`):**

Giao diện trang đăng nhập được xây dựng với Ant Design Form component, bao gồm:
- **Form fields:** Email input (type="email", required, validate định dạng email), Password input (type="password", required, minLength=8)
- **Nút đăng nhập:** Gọi `POST /api/auth/login`, lưu JWT token vào Zustand `useAuthStore`, redirect về trang trước (via `returnUrl` param) hoặc Homepage/Admin dashboard tùy role
- **Link "Quên mật khẩu"** và **Link "Chưa có tài khoản? Đăng ký"**
- **Error handling:** Hiển thị Ant Design Alert với message từ API response (`{ success: false, message: "..." }`)

Luồng xử lý khi đăng nhập thành công:
1. Nhận `{ success: true, token, user }` từ API
2. Lưu `token` vào localStorage + Zustand store
3. Set `user` vào `useAuthStore.setUser()`
4. `router.replace(returnUrl || (user.role === 'admin' ? '/admin/dashboard' : '/'))`

**Trang Đăng ký (`/register`):**

- **Form fields:** Họ và tên (required), Email (required, unique), Mật khẩu (required, min 6 ký tự, validate regex phía client)
- **Validation mật khẩu hiển thị realtime:** Ít nhất 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt
- Khi submit thành công: Tương tự login — lưu token, redirect Homepage
- **Email chào mừng** được gửi async (không ảnh hưởng UX)

#### 3.2.2. Module Khách hàng

##### (a) Trang Chủ — Homepage (`/`)

**Chiến lược rendering:** ISR (Incremental Static Regeneration) với `revalidate = 3600` giây (1 giờ). Trang chủ được tạo tĩnh và tự động tái tạo mỗi giờ để phản ánh sản phẩm nổi bật mới nhất, đồng thời phục vụ qua Vercel Edge CDN với tốc độ cao.

**Nội dung trang chủ:**
- **Hero Section (Server-rendered):** Banner quảng cáo, slogan hệ thống, CTA "Khám phá ngay"
- **Featured Products (ISR):** Server fetch `GET /api/products/featured` → 8 sản phẩm nổi bật
- **AI Recommendations Section (Client hydration):**
  - Sau khi trang load, client kiểm tra auth state từ Zustand store
  - Nếu đã đăng nhập: Fetch `GET /api/ai/recommendations?placement=homepage&n=12`
  - Hiển thị ProductCard với badge "✨ Gợi ý cho bạn" và badge source (model/fallback)
  - Skeleton loader trong khi chờ AI response
- **Category Navigation:** Danh sách danh mục sản phẩm nhanh (link đến `/shop?category=X`)

##### (b) Trang Danh mục Sản phẩm — Shop (`/shop`)

**Chiến lược rendering:** CSR (Client-Side Rendering) vì trang cần tương tác động, lọc realtime và cập nhật ngay lập tức.

**Các thành phần chính:**

**Hero Section:**
- Hiển thị tổng số sản phẩm (từ API) và số lượng AI recommendations
- Natural Language Search Input: Textbox với placeholder "Hỏi AI tìm sản phẩm cho bạn..."
- Khi nhập câu hỏi tự nhiên → gọi `POST /api/ai/chat-search` → auto-fill filters

**Sticky Toolbar (hiển thị khi cuộn):**
- Nút mở Filter panel với badge số filter đang active
- Search bar thu gọn với icon kính lúp
- Search history dropdown (từ localStorage, tối đa 5 mục gần nhất, nút xóa lịch sử)
- Nút reset tất cả filters

**Active Filter Tags (hiển thị các filter đang áp dụng):**
- Tag màu cho: Danh mục (blue), Quick filter (green), Từ khóa (orange), Khoảng giá (purple)
- Click × trên tag để xóa filter đó
- Animation fade-in khi tag xuất hiện/biến mất

**AI Concierge Sidebar (chỉ desktop ≥1280px):**
- Toggle button "Bật/Tắt AI gợi ý"
- Hiển thị số lượng AI products và nguồn (model/fallback)
- Loading spinner khi đang fetch

**Sections hiển thị sản phẩm:**

1. **AI + Featured Carousel** (top 10, blend AI recs + featured):
   - Header "✨ Gợi ý từ AI + Nổi bật"
   - Horizontal scroll carousel với ProductCard
   - Badge nguồn AI trên mỗi card

2. **Category Highlights** (chỉ khi không có filter active):
   - Hiển thị top 2 danh mục có nhiều sản phẩm nhất
   - Mỗi danh mục: Carousel riêng với 8 sản phẩm
   - Chỉ hiển thị nếu có ≥3 sản phẩm trong danh mục
   - Emoji tương ứng danh mục (📱 Phone, 💻 Laptop, 👗 Fashion...)

3. **Main Product Grid** (vô hạn cuộn với pagination):
   - Grid responsive: 4 cột (xl), 3 cột (lg), 2 cột (sm), 1 cột (xs)
   - Skeleton loader (6 placeholder cards) trong lúc load
   - Empty state: Icon + "Không tìm thấy sản phẩm" + nút thử lại
   - Pagination với milestone notifications ("Bạn đã xem 20 sản phẩm...")
   - CTA link đến `/ai-suggest` khi hết sản phẩm

**Filter Panel (Drawer trên mobile, Sidebar trên desktop):**
- **Price Slider:** Range 0 – 100,000,000 VND (bước 500,000)
- **Quick Filters:** Tags chọn nhiều: Đang giảm giá / Phổ biến (sold cao) / Mới nhất
- **Category Filter:** Checkbox list danh mục từ `GET /api/products/categories`
- Nút "Áp dụng" và "Đặt lại"

##### (c) Trang Chi tiết Sản phẩm — PDP (`/products/[id]`)

**Chiến lược rendering:** ISR với `revalidate = 300` giây (5 phút). SEO-critical — metadata động từ dữ liệu sản phẩm (title, description, og:image).

**Nội dung trang PDP:**
- **Image Gallery:** Ảnh chính lớn + thumbnails ảnh phụ; click thumbnail → đổi ảnh chính; zoom on hover
- **Thông tin sản phẩm:**
  - Tên sản phẩm (H1)
  - Giá bán (lớn, màu cam) + Giá gốc (gạch ngang) + % giảm giá (badge đỏ)
  - Category tag (blue tag)
  - Trạng thái kho: "Còn hàng (X)" (green) hoặc "Hết hàng" (red)
  - Rating stars + số lượng reviews
- **Actions:**
  - Nút "Thêm vào giỏ hàng" (disabled khi hết hàng)
  - Nút "Thêm vào yêu thích" (toggle, heart icon, màu đỏ khi đã thêm)
  - Track event: POST /api/ai/track {action:'add_to_cart'} hoặc {action:'view'}
- **Tabs thông tin:**
  - Tab "Mô tả": HTML content từ product.description (render dangerouslySetInnerHTML)
  - Tab "Thông số kỹ thuật": Bảng specs[] {name: value}
  - Tab "Đánh giá": Danh sách reviews + Form viết review
- **Section "Đánh giá sản phẩm":**
  - Chỉ hiển thị form nếu user đã mua và đã nhận hàng (kiểm tra phía server)
  - Form: Rating stars (1-5), Comment textarea (required)
  - POST /api/products/:id/reviews
- **Section "Sản phẩm tương tự":**
  - 4 sản phẩm content-based (cùng tags/category)
  - ProductCard với click → track event rec_click

##### (d) Giỏ hàng — Cart (`/cart`)

**Chiến lược rendering:** CSR — Dữ liệu cart lưu trong Zustand store (client-side).

**Trạng thái giỏ trống (Empty State):**
- Icon giỏ hàng animated (bounce effect)
- Text: "Giỏ hàng trống" + mô tả
- Nút "Tiếp tục mua sắm" → /shop

**Danh sách sản phẩm trong giỏ:**

Mỗi CartItem hiển thị:
- Ảnh sản phẩm (60×60px)
- Tên sản phẩm (link đến PDP)
- Đơn giá
- Quantity controls: nút "-" / input số / nút "+"
  - Min=1; Max=stock hiện tại
  - Animation khi thay đổi số lượng
- Nút xóa (icon trash, confirm popconfirm)
- Tổng tiền dòng = price × quantity

Header section giỏ:
- Tổng số sản phẩm
- Nút "Xóa tất cả" với Confirm modal

**AI Add-ons Section** (phía dưới cart items):
- Header "🤖 Có thể bạn cũng thích"
- Fetch GET /api/ai/recommendations?placement=cart&n=6
- Mỗi AI card: ảnh + tên + giá + nút "+" thêm ngay
- Horizontal scroll trên mobile

**Order Summary Sidebar (sticky, right column):**
- Subtotal (tổng tiền chưa ship)
- Phí vận chuyển: "MIỄN PHÍ" (nếu ≥500k) hoặc "30,000đ" (nếu <500k)
- Progress bar "Còn X.000đ nữa để miễn phí vận chuyển"
- Discount badge (nếu đã áp mã)
- **Tổng cộng** (lớn, màu cam)
- Nút "Tiến hành thanh toán" (primary, large):
  - Nếu chưa đăng nhập → Redirect /login?redirect=/checkout
  - Nếu đã đăng nhập → Navigate /checkout

##### (e) Thanh toán — Checkout (`/checkout`)

**Chiến lược rendering:** CSR — Data động, user-specific.

**Layout 2 cột:**

**Cột trái — Thông tin đặt hàng:**

*Form thông tin giao hàng:*
- Họ và tên* (Ant Design Input)
- Số điện thoại* (validate số VN: /^(0|\+84)[3-9]\d{8}$/)
- Địa chỉ chi tiết* (số nhà, đường)
- Tỉnh/Thành phố* (Input text)
- Ghi chú cho shipper (optional, Textarea)

*Phương thức thanh toán (Radio group với styled cards):*

| Phương thức | Icon | Màu | Mô tả |
|---|---|---|---|
| COD | 🚗 Car icon | Blue (#0284C7) | Thanh toán khi nhận hàng |
| Banking/VietQR | 💳 Card icon | Green (#15803D) | Chuyển khoản ngân hàng 24/7 |
| MoMo | 👛 Wallet icon | Pink (#DB2777) | Ví điện tử MoMo |

*Submit Button:*
- "Xác nhận & Đặt hàng" (primary, full-width, loading state)
- Disclaimer: "Bằng cách đặt hàng, bạn đồng ý với Điều khoản dịch vụ"

**Cột phải — Tóm tắt đơn hàng (sticky):**
- Danh sách sản phẩm (scrollable max 400px):
  - Thumbnail 48×48px + badge số lượng (absolute top-right)
  - Tên sản phẩm (1 dòng, ellipsis)
  - Đơn giá × số lượng
- **Mã giảm giá input:**
  - Input field với icon Tag
  - Nút "Áp dụng" / "Xóa" (toggle)
  - Validate: POST /api/discounts/validate {code, orderAmount}
  - Khi hợp lệ: Hiển thị badge mã + số tiền giảm
  - Khi không hợp lệ: Alert đỏ với lý do
- **Breakdown:**
  - Tạm tính: [subtotal]
  - Phí vận chuyển: [FREE / 30.000đ]
  - Giảm giá: [-X.000đ] (nếu có)
  - **Tổng thanh toán:** [total] (lớn, teal)

**Trang thành công (Success State) sau khi đặt hàng:**
- Icon checkmark màu xanh (animated)
- "Đặt hàng thành công!" heading
- Card tóm tắt:
  - Mã đơn hàng (last 8 chars, uppercase, copyable)
  - Tổng tiền
  - Phương thức thanh toán
  - Trạng thái: "Chờ xác nhận" (pending) hoặc "Chờ thanh toán" (banking/momo)
- 2 CTA buttons: "Xem đơn hàng" (→ /orders) + "Tiếp tục mua sắm" (→ /shop)

**QR Payment Modal (cho Banking/MoMo):**
- Header: Icon phương thức TT + Tên ngân hàng/Ví
- QR Code image (từ VietQR API)
  - Loading spinner trong khi generate
  - Fallback text nếu API lỗi
- Bank details section (Banking):
  - Ngân hàng: Vietcombank
  - Số tài khoản: [masked number] + Copy button
  - Tên tài khoản
  - Số tiền cần chuyển: [formatted VND]
  - Nội dung chuyển khoản: "Thanh toan [orderId last 8]" + Copy button
- 2 Nút actions:
  - "Thanh toán sau" → Đóng modal, vào trang success (order pending)
  - "Tôi đã thanh toán" → Đóng modal, vào trang success (optimistic)

##### (f) Lịch sử Đơn hàng — Orders (`/orders`)

**Chiến lược rendering:** SSR — Dữ liệu user-specific, cần auth.

**Empty State:**
- Icon shopping bag
- "Chưa có đơn hàng nào"
- Nút "Bắt đầu mua sắm" → /shop

**Danh sách Order Cards:**

Mỗi card đơn hàng:
- **Header:** Mã đơn (8 ký tự cuối ObjectId, uppercase) | Ngày đặt (DD/MM/YYYY HH:mm) | Status Tag | Payment Method
- **Status Tag colors:** pending=gold, paid=purple, confirmed=blue, shipping=cyan, delivered=green, completed=emerald, cancelled=red
- **Products preview:** Ảnh thumbnail (40×40px) + tên + qty × price cho 3 sản phẩm đầu; "+X sản phẩm khác" nếu nhiều hơn
- **Footer:** Tổng tiền (large, teal) | Nút "Hủy đơn" (nếu pending/paid, danger outline) | Nút "Xem chi tiết" (primary outline)

**Detail Modal (Ant Design Modal, width=700px):**

- **Timeline visual (horizontal):**
  ```
  ● ─────── ● ─────── ○ ─────── ○
  Đặt hàng  Xác nhận  Đang giao  Đã giao
  (active)  (active)  (inactive) (inactive)
  ```
  Circles màu teal (active), gray (inactive); line nối giữa
  
- **Thông tin đơn:**
  - Ngày đặt hàng
  - Phương thức TT + badge trạng thái TT
  
- **Địa chỉ giao hàng:**
  - Họ tên người nhận
  - Số điện thoại
  - Địa chỉ + tỉnh/thành
  - Ghi chú shipper (nếu có)
  
- **Danh sách sản phẩm** (scrollable, maxHeight=240px):
  - Ảnh 48×48px + Tên + Qty × đơn giá + thành tiền
  
- **Tổng kết:**
  - Tạm tính + Ship + Giảm giá (với coupon code tag) + **Tổng** (lớn, teal)
  
- **Footer modal:** Nút "Hủy đơn" (nếu trạng thái cho phép)

##### (g) Hồ sơ Cá nhân — Profile (`/profile`)

**Layout 2 cột:**

**Cột trái — Avatar Card:**
- Avatar hình tròn (96×96px)
- Hover: Overlay camera icon + "Đổi ảnh"
- Click → File input: chỉ nhận JPG/PNG/WEBP, max 2MB
- Nếu không có avatar: Avatar mặc định với chữ cái đầu tên
- Dưới avatar: Tên người dùng + Email + Role badge (Admin=red/Customer=blue)

**Cột phải — Tabs:**

**Tab 1 — Thông tin cá nhân:**
- Form Ant Design với các fields:
  - Họ và tên* (Input)
  - Số điện thoại (Input)
  - Ngày sinh (DatePicker, format DD/MM/YYYY)
  - Giới tính (Select: Nam/Nữ/Khác)
  - Địa chỉ (Textarea, 2 rows)
  - Sở thích sản phẩm (Input với Tooltip: "Giúp AI gợi ý chính xác hơn", comma-separated)
    - VD: "Laptop, Gaming, Điện thoại"
- Nút "Lưu thông tin" → PUT /api/auth/profile
- Cập nhật Zustand auth store sau khi lưu thành công

**Tab 2 — Đổi mật khẩu:**
- Mật khẩu hiện tại* (required, type=password)
- Mật khẩu mới* (required, min 6 chars)
- Xác nhận mật khẩu mới* (required, phải khớp với mật khẩu mới)
- Nút "Đổi mật khẩu" → PUT /api/auth/change-password
- Form reset sau khi đổi thành công

##### (h) Danh sách Yêu thích — Wishlist (`/wishlist`)

**Auth Guard:** Middleware client kiểm tra auth state; nếu chưa đăng nhập → redirect `/login?redirect=/wishlist`

**Hero Section (pink gradient background):**
- Tag icon + "Danh sách yêu thích"
- Heading: "Những sản phẩm bạn đã lưu lại..."
- Description
- Card bên phải: Số lượng sản phẩm trong wishlist (large number, pink)

**Empty State (khi không có sản phẩm):**
- Heart icon (outline, large)
- "Danh sách yêu thích trống"
- Mô tả: "Nhấn icon ❤️ trên sản phẩm để thêm vào đây"
- Nút "Khám phá Shop" → /shop

**Product Grid:**
- 4 cột (xl), 3 cột (lg), 2 cột (sm), 1 cột (xs)
- Mỗi ProductCard trong wishlist:
  - Ảnh + Tên + Giá
  - Badge trạng thái tồn kho (nếu hết hàng: "Hết hàng" overlay)
  - Nút xóa khỏi wishlist (icon trash, góc top-right)
  - Nút "Thêm vào giỏ" (nếu còn hàng)
- Fetch từ GET /api/wishlist
- Toggle wishlist: POST /api/wishlist/:productId

**Footer:**
- Nút "Tiếp tục mua sắm" → /shop

##### (i) Trang Gợi ý AI — AI Suggest (`/ai-suggest`)

**Auth Check:** Nếu chưa đăng nhập → Hiển thị placeholder với nút "Đăng nhập để nhận gợi ý" thay vì redirect.

**Hero Section (amber gradient):**
- Tags: "🤖 Smart Stylist AI" + "📊 Xếp hạng cá nhân"
- Heading: "Từ nhu cầu mơ hồ đến danh sách rõ ràng"
- Description về tính năng

**Layout 2 cột:**

**Cột trái — AI Profile Form (sticky):**

Form cập nhật sở thích để AI gợi ý chính xác hơn:
- **Mục đích mua:** Radio buttons: "Mua cho bản thân" / "Mua làm quà tặng"
- **Từ khóa/Bối cảnh:** TextArea 4 dòng, placeholder: "VD: chuyến đi biển, họp khách hàng, quà sinh nhật dưới 3 triệu..."
- **Phong cách ưa thích:** Multi-select tags: Minimalist / Casual / Streetwear / Vintage / Formal
- **Màu sắc ưa thích:** Tags input (tự do nhập, enter/comma để thêm tag)
- **Ngân sách:** Range slider [0 — 100,000,000 VND]
  - Marks tại: 0, 500k, 2M, 5M, 10M, 50M, 100M
  - Format tooltip: "500K", "2M", "100M"
- **Live signals card:** Hiển thị realtime các signals đang active (orange tags)
  - VD: "budget: 2M-5M", "style: Casual", "keyword: beach trip"
- Nút "Cập nhật và phân tích" → PUT /api/auth/profile {preferences: [...]}

**Cột phải — Kết quả AI:**

*Results Header Card:*
- Checkmark icon xanh
- Type: "Gợi ý cá nhân hóa" (nếu có model) hoặc "Dựa trên tín hiệu có sẵn"
- Message từ API response
- Số sản phẩm được xếp hạng (badge)

*Product Grid (3 cột):*
Mỗi AIRecCard hiển thị:
- Ảnh sản phẩm
- Tên sản phẩm (2 dòng)
- Giá
- **Match percentage:** "96% phù hợp" (màu teal, gradient bar)
  - Tính toán: Dựa trên vị trí trong sorted list (rank 1=96%, rank 2=92%...)
- **Reason tags:** "Tại sao AI chọn sản phẩm này?"
  - VD: "Trong ngân sách", "Đúng phong cách Casual", "Phù hợp đi biển"
  - Tag màu xanh lá nhỏ
- **Source badge:** "model" (blue) hoặc "fallback" (gray)

*Empty State:*
- Icon robot
- "AI đang chờ thêm tín hiệu"
- CTA: "Cập nhật sở thích hoặc tương tác với nhiều sản phẩm hơn"

##### (j) Bong bóng Chatbot 2-trong-1 và Hỗ trợ Trực tuyến (`ChatbotWidget`)

**Tổng quan:**
- Bong bóng chat nổi (floating button) xuất hiện ở góc dưới bên phải trên tất cả các trang khách hàng (ngoại trừ trang admin).
- Thiết kế gradient cam-đỏ (`linear-gradient(135deg, #f97316 0%, #ea580c 100%)`) có đổ bóng và hiệu ứng phóng to/thu nhỏ khi di chuột (framer-motion).

**Chức năng chính:**
- **Tương tác với AI (Bot mode):** Chatbot mặc định sử dụng Groq API (`llama3-8b-8192`) để tư vấn mua sắm dựa trên bối cảnh hội thoại (10 tin nhắn gần nhất).
- **Yêu cầu gặp nhân viên (Handoff mode):** Nút "Gặp nhân viên hỗ trợ" hoặc từ khóa kích hoạt luồng. Trạng thái phòng chat chuyển sang `waiting`.
- **Hàng đợi chờ duyệt:** Hiển thị hiệu ứng loading cùng spinner xoay và nút hủy để quay lại chế độ AI.
- **Trò chuyện trực tiếp (Active mode):** Khi nhân viên chấp nhận, tin nhắn hệ thống thông báo nhân viên đã tham gia, và chuyển sang chat realtime 2 chiều.
- **Lịch sử chat:** Lưu và tự động đồng bộ lịch sử tin nhắn của người dùng trong MongoDB.

---

#### 3.2.3. Module Quản trị

##### (a) Dashboard Tổng quan — Admin Dashboard (`/admin/dashboard`)

**Chiến lược rendering:** CSR — Dữ liệu realtime, admin-specific.

**Header:**
- Tiêu đề "Dashboard Tổng quan" + sync indicator (loading spinner khi đang fetch)
- Nút "Phân tích AI" (orange gradient):
  - Click → GET /api/admin/dashboard/ai-analysis
  - Loading state trong khi chờ Gemini AI
  - Hiển thị AI Analysis Panel bên dưới KPI cards

**4 KPI Cards (responsive grid, 4 cột desktop / 2 cột tablet / 1 cột mobile):**

| Card | Nội dung | Icon | Màu |
|---|---|---|---|
| **Tổng doanh thu** | Formatted short (VD: "125.5M", "1.2B") + full value tooltip | Dollar sign | Orange |
| **Đơn hàng** | Total count + AOV subtext ("AOV: 850K") | Shopping cart | Blue |
| **Khách hàng** | Total registered accounts | People group | Green |
| **Tăng trưởng tháng** | % MoM + delta (↑ teal / ↓ red) + số tiền tháng này | Rise/Fall arrow | Amber |

**AI Analysis Panel (conditional, sau khi click):**
- Gradient border cam (orange gradient background subtle)
- Header: "🤖 Gemini AI Analysis" badge + "OpenRouter" source label
- **Summary:** Đoạn văn tóm tắt tình hình kinh doanh
- **Strengths box** (green bg): Bullet list điểm mạnh
- **Improvements box** (amber bg): Bullet list cần cải thiện
- **Recommendations box** (blue bg): Đề xuất hành động

**Biểu đồ 1 — Revenue Line Chart:**
- Thư viện: Ant Design Charts / AntV G2
- 3 đường:
  - Năm nay (solid, teal): Doanh thu thực tế
  - Năm trước (dashed, gray): So sánh YoY
  - AI Forecast (dotted, orange): Dự báo tuyến tính
- X-axis: Tháng (1-12) hoặc Tuần/Ngày/Quý
- Y-axis: Currency format (125M, 1.2B)
- Legend: 3 màu + label
- **Date range selector:** 4 nút tabs: Ngày / Tuần / Tháng / Quý
- Tooltip khi hover: Hiện đầy đủ giá trị
- Nguồn data: GET /api/admin/dashboard/revenue?granularity=month

**Biểu đồ 2 — Order Status Donut Chart:**
- 6 màu tương ứng 6 trạng thái (gold, purple, blue, cyan, green, red)
- Center text: Tổng số đơn hàng + "Đơn hàng"
- Legend bên phải: Status label + count
- Nguồn: `ordersByStatus[]` từ GET /api/admin/dashboard

**Biểu đồ 3 — AI CTR by Placement (Column Chart):**
- X-axis: Placement names (Homepage, PDP, Cart, Search, AI Suggest)
- Y-axis: CTR % (0–10%)
- **Đường mục tiêu 5%:** Line annotation màu đỏ nét đứt + label "Target 5%"
- Màu cột: teal gradient
- Tooltip: "Homepage: 6.2% CTR"
- Nguồn: `aiCtrByPlacement[]` từ GET /api/admin/dashboard

**Biểu đồ 4 — RFM Customer Segmentation Donut:**
- 6 phân khúc: Champions (green), Loyal (blue), Potential (teal), At Risk (orange), Dormant (red), New (purple)
- Hiển thị % và số khách hàng mỗi phân khúc
- Tooltip đầy đủ thông tin

**Biểu đồ 5 — Top Wishlisted Products (Horizontal Bar Chart):**
- Nguồn: GET /api/admin/dashboard/wishlist-stats → top 10 sản phẩm được wishlist nhiều nhất
- X-axis: Số lượt wishlist
- Y-axis: Tên sản phẩm (ellipsis nếu dài)
- Tooltip: Tên đầy đủ + giá + tồn kho

**Biểu đồ 6 — Trending Search Keywords (Word Cloud):**
- Nguồn: GET /api/admin/dashboard/inventory-trends → `trendingKeywords[]`
- 10 từ khóa tìm kiếm phổ biến nhất (30 ngày)
- CSS word cloud layout (xen kẽ, không phải grid)
- Font-size tỷ lệ với weight/frequency
- 10 màu palette khác nhau per keyword
- Border với opacity tương ứng màu
- Hover: scale(1.1) + shadow effect

**Bảng Inventory Stockout Risk:**
- Nguồn: GET /api/admin/dashboard/inventory-trends → `stockoutRisk[]`
- Tiêu chí: Sản phẩm có `days_remaining < 30` (dựa trên daily velocity 7 ngày)
- Columns: Tên SP | Danh mục | Tồn kho | Tốc độ bán (sp/ngày) | Ngày còn lại
- **Color coding rows:**
  - Đỏ (days_remaining < 7): Background light red
  - Cam (7 ≤ days < 14): Background light orange
  - Vàng (14 ≤ days < 30): Background light amber
- Sort: Ascending by days_remaining (nguy hiểm nhất lên đầu)
- **System Alerts widget:**
  - Low stock alerts (stock < 10): Số lượng sản phẩm + link /admin/products
  - Pending orders: Số đơn chờ xử lý + link /admin/orders
  - Expired discounts: Số mã hết hạn/hết lượt + link /admin/discounts

##### (b) Quản lý Sản phẩm — Admin Products (`/admin/products`)

**Header:**
- Tiêu đề "Quản lý sản phẩm" + tổng số sản phẩm
- Nút "+ Thêm sản phẩm" (orange gradient, icon Plus)

**Stats Grid (4 cột):**
- Tổng sản phẩm (total)
- Số danh mục (distinct categories count)
- Sắp hết hàng (stock ≤ 5) — màu cam cảnh báo
- Hết hàng (stock = 0) — màu đỏ

**Tabs lọc:**
- "Tất cả" (blue badge với total)
- "Đang bán" (green badge, isActive=true)
- "Đã ẩn" (gray badge, isActive=false)

**Filter Bar:**
- Search input: Tìm kiếm theo tên sản phẩm (debounce 300ms)
- Category Dropdown: Chọn lọc theo danh mục (từ `GET /api/products/categories`)
- Reset button (xuất hiện khi có filter active)

**Products Table (Ant Design Table):**

| Cột | Nội dung | Ghi chú |
|---|---|---|
| **Sản phẩm** | Ảnh (44×44px) + Tên + Category tag + ⭐ icon nếu featured | Click ảnh → xem lớn |
| **Giá** | Giá bán (orange) + Giá gốc (gạch ngang, gray) | Sortable |
| **Tồn kho** | Số lượng; Màu: green (>5), orange warning (1-5), red (0) | Sortable |
| **Đã bán** | Total sold count | Sortable |
| **Trạng thái** | Eye icon xanh (active) / Eye-slash icon gray (hidden) | — |
| **Thao tác** | Dropdown "..." với: Chỉnh sửa / Ẩn/Hiện / Xóa | — |

- Pagination: 10/20/50 mỗi trang
- Row click → không có action (actions qua dropdown)
- Sticky header khi cuộn

**Modal Tạo/Chỉnh sửa sản phẩm (Ant Design Modal, width=640px):**

Fields:
- Tên sản phẩm* (Input, maxLength=200)
- Mô tả* (Textarea, 4 rows)
- Hình ảnh (Ant Design Upload, picture-card style):
  - Drag & drop hoặc click để upload
  - Preview thumbnail
  - Khi edit: Hiển thị ảnh hiện tại với option thay thế
  - Upload lên Cloudinary qua FormData
- Giá bán* (InputNumber, step=1000, formatter VND)
- Giá gốc (InputNumber, optional — để trống nếu không có giảm giá)
- Danh mục* (Select, options từ API)
- Tồn kho* (InputNumber, min=0)
- Tags AI (Input.Tag, comma-separated):
  - Tooltip info icon: "Tags dùng để AI gợi ý sản phẩm tương tự"
  - VD: "laptop, gaming, portable, high-performance"
- Nổi bật (Switch toggle): Hiển thị ở trang chủ
- Đang bán (Switch toggle, chỉ hiện khi edit): isActive

Footer modal: Nút "Hủy" + Nút "Tạo sản phẩm" / "Cập nhật" (primary)

**Khi giá giảm (Edit):** Server tự động gửi notification đến:
1. Tất cả users có sản phẩm này trong wishlist
2. Tất cả users có preferences trùng với tags của sản phẩm

##### (c) Quản lý Đơn hàng — Admin Orders (`/admin/orders`)

**Header:**
- Tiêu đề "Quản lý đơn hàng" + tổng số đơn

**Tabs (với badge count):**
- Tất cả | Chờ xác nhận (pending+paid) | Chuẩn bị (confirmed) | Đang giao (shipping) | Đã giao (delivered) | Đã hủy (cancelled) | Hoàn trả (return_requested)

**Filter Bar (thanh bộ lọc):**
- Search: Input tìm kiếm theo mã đơn / tên khách / SĐT (debounce)
- Date range picker: Từ ngày — Đến ngày (DD/MM/YYYY)
- Payment method: Select (Tất cả / COD / Banking / MoMo)
- Payment status: Select (Tất cả / Pending / Paid / Failed)
- Nút "Xóa bộ lọc" (xuất hiện khi có filter)
- Nút "Xuất CSV" (export all filtered results)

**Bulk Action Bar (xuất hiện khi có rows được chọn):**
- "Đã chọn X đơn hàng"
- Nút "Xuất CSV" (chỉ selected rows)
- Nút "Xác nhận hàng loạt" (confirm tất cả selected)
- Nút "Hủy hàng loạt" (danger, confirm tất cả selected)
- Nút "Bỏ chọn" × (deselect all)

**Orders Table:**

| Cột | Nội dung |
|---|---|
| Checkbox | Row selection (persist across pages) |
| **Mã đơn** | Last 8 chars ObjectId (uppercase) + icon copy |
| **Khách hàng** | Avatar 32px + Tên + Email/SĐT (2 dòng) |
| **Tổng tiền** | Formatted VND (orange text) |
| **Trạng thái đơn** | Colored tag (7 màu) |
| **Trạng thái TT** | Colored tag (4 màu: pending/paid/failed/refunded) |
| **Ngày đặt** | DD/MM/YYYY HH:mm (sortable ASC/DESC) |
| **Thao tác** | Dropdown "...": Xem chi tiết / Xác nhận nhanh / In hóa đơn / Hủy |

- Row selection: Checkbox toàn trang + individual checkboxes
- Selected rows persist khi chuyển trang
- Empty state: "Không có đơn hàng nào" + reset filter button

**Order Detail Drawer (Ant Design Drawer, width=600px, từ phải):**

*Header:* Mã đơn hàng (uppercase) + close button

*Sections trong drawer:*

**Thông tin khách hàng:**
- Avatar 40px + Tên + Email
- Badge role (Customer/Admin)

**Địa chỉ giao hàng:**
- Họ tên người nhận
- SĐT
- Địa chỉ chi tiết + Tỉnh/thành
- Ghi chú shipper (nếu có)

**Phương thức thanh toán:**
- Icon + tên (COD/Banking/MoMo)
- Tổng tiền thanh toán (lớn, teal)

**Danh sách sản phẩm:**
- Scrollable (maxHeight=300px)
- Mỗi item: Ảnh 48px + Tên (2 dòng) + Qty × Giá + Thành tiền

**Cập nhật trạng thái:**
- Select "Trạng thái đơn hàng" (dropdown với FSM validation):
  - Chỉ hiển thị các trạng thái chuyển tiếp hợp lệ
  - VD: pending → [confirmed, cancelled]; shipping → [delivered, cancelled]
- Select "Trạng thái thanh toán" (independent): pending / paid / failed / refunded
- Thay đổi bất kỳ → ngay lập tức gọi PUT /api/admin/orders/:id/status

**Print Action:** Nút "In hóa đơn" → window.print() với CSS print styles (ẩn UI, hiển thị full drawer content)

##### (d) Quản lý Người dùng — Admin Users (`/admin/users`)

**Header:**
- "Quản lý khách hàng" + tổng số tài khoản

**Stats Grid (3 cột):**
- Tổng khách hàng (blue)
- Đang hoạt động — isBlocked=false (green)
- Đang bị khóa — isBlocked=true (red)

**Tabs (với badge):**
- Tất cả (blue badge)
- Hoạt động (green badge)
- Bị khóa (red badge)

**Search Filter:**
- Input realtime: Tìm kiếm theo tên / email / SĐT
- Debounce 300ms → filter client-side (all users loaded at once vì ít dữ liệu demo)

**Users Table:**

| Cột | Nội dung |
|---|---|
| **Khách hàng** | Avatar 40px (chữ cái đầu nếu không có ảnh) + Tên + Email (2 dòng) |
| **SĐT** | Số điện thoại (hoặc "—") |
| **Địa chỉ** | Truncate ellipsis nếu dài |
| **AI Preferences** | Top 3 tags (orange), "..." nếu nhiều hơn (tooltip hiện tất cả) |
| **Trạng thái** | "Hoạt động" (green checkmark) / "Bị khóa" (red X) |
| **Ngày đăng ký** | DD/MM/YYYY (sortable) |
| **Thao tác** | Dropdown: Chỉnh sửa / Khóa/Mở khóa / Xóa |

- Pagination: 10/15/30 per page

**Actions:**

*Chỉnh sửa (Edit Modal):*
- Tên* (Input)
- Email* (Input, email format)
- SĐT (Input)
- Địa chỉ (Textarea)
- Vai trò (Select: customer/admin)
- PUT /api/admin/users/:id

*Khóa/Mở khóa:*
- PATCH /api/admin/users/:id/toggle-block
- Confirm: "Bạn có chắc muốn [khóa/mở khóa] tài khoản này?"
- isBlocked=true → Người dùng không thể đăng nhập (middleware check)
- Admin không bị ảnh hưởng bởi isBlocked check

*Xóa:*
- Confirm modal: "Hành động này không thể hoàn tác"
- DELETE /api/admin/users/:id → Soft delete: `{deletedAt: now, isBlocked: true}`
- Admin accounts không thể xóa (server validate role)

##### (e) Quản lý Mã giảm giá — Admin Discounts (`/admin/discounts`)

**Header:**
- "Quản lý mã giảm giá" (icon Tag) + tổng số mã
- Nút "+ Tạo mã" (orange gradient)

**Stats Grid (4 cột):**
- Tổng mã (blue)
- Đang hoạt động (green) — isActive=true AND expiresAt > now
- Đã hết hạn (red) — expiresAt < now
- Tổng lượt sử dụng (orange) — sum of usedCount

**Tabs (với badge):**
- Tất cả (blue) | Đang hoạt động (green) | Không kích hoạt (gray) | Hết hạn (red)

**Search:** Input tìm theo mã code (uppercase, realtime filter)

**Discounts Table:**

| Cột | Nội dung |
|---|---|
| **Mã** | Monospace font, uppercase + icon Copy (click → copy to clipboard) |
| **Loại** | Blue tag "Phần trăm" / Orange tag "Số tiền cố định" |
| **Giá trị** | VD: "10%" hoặc "50,000đ" + "(Tối đa 100,000đ)" nếu percent có max |
| **Đơn tối thiểu** | Formatted VND hoặc "Không giới hạn" |
| **Lượt dùng** | "23/100" — red nếu đã đạt giới hạn |
| **Hết hạn** | DD/MM/YYYY hoặc "Không giới hạn" — red nếu đã quá hạn |
| **Trạng thái** | Clickable tag: "Hoạt động" (green) / "Tắt" (gray) — toggle ngay lập tức |
| **Thao tác** | Dropdown: Chỉnh sửa / Toggle active / Copy code / Xóa |

**Create/Edit Modal:**

- Code* (Input, auto-uppercase khi nhập, placeholder: "SUMMER2026")
- Mô tả (Input, optional)
- Loại giảm giá* (Radio: Phần trăm / Số tiền cố định)
  - Dynamic field validation:
    - Percent: value 0–100, hiện thêm "Giảm tối đa" field
    - Fixed: value > 0 (VND)
- Giá trị*: InputNumber (formatter % hoặc VND)
- Giảm tối đa (chỉ hiện với Percent): InputNumber VND (optional)
- Đơn tối thiểu: InputNumber VND (default: 0 = không giới hạn)
- Giới hạn sử dụng: InputNumber (0 = unlimited)
- Ngày hết hạn: DatePicker (null = không giới hạn)
- Kích hoạt: Switch toggle (default: on)

**Các seed discounts mặc định:** WELCOME10 (10%, max 50k), SALE50K (50k fixed), FREESHIP (30k = phí ship miễn phí), VIPONLY (20%, orders ≥2M), SUMMER2026 (15%, max 200k)

##### (f) Marketing & Chiến dịch — Admin Marketing (`/admin/marketing`)

**Header:**
- "Marketing AI" (bold)
- Subtitle: "Trung tâm chiến dịch email tự động"

**Campaign Cards Grid (2 cột):**

**Card 1 — Abandoned Cart Reminder:**
- Icon: Shopping cart (orange gradient background)
- Tiêu đề: "Nhắc Giỏ Hàng Bỏ Quên"
- Mô tả: "Tự động gửi email nhắc nhở khách đã bỏ giỏ hàng hơn 24 giờ"
- Badge trigger: "Hourly (auto) + Manual"
- Features list:
  - ✓ Phát hiện giỏ hàng >24h chưa thanh toán
  - ✓ Nội dung email được tạo bởi Gemini AI
  - ✓ Kèm mã giảm giá ưu đãi tự động
- Nút "Kích hoạt ngay" (orange, loading state khi đang gửi)
  - POST /api/admin/marketing/trigger {campaignType: 'abandoned_cart'}

**Card 2 — Weekly Newsletter:**
- Icon: Bell (indigo gradient background)
- Tiêu đề: "Newsletter Hàng Tuần"
- Mô tả: "Gửi newsletter mỗi thứ Hai 9:00 SA với top sản phẩm bán chạy"
- Badge trigger: "Thứ Hai 9:00 SA (auto) + Manual"
- Features list:
  - ✓ Top 3 sản phẩm bán chạy nhất tháng
  - ✓ Tiêu đề + nội dung do Gemini AI tạo
  - ✓ Gửi đến tất cả khách hàng
- Nút "Kích hoạt ngay" (indigo)

**Welcome Email Card (full width, green):**
- Icon: Envelope (green)
- Tiêu đề: "Email Chào Mừng"
- Mô tả: "Gửi tự động khi khách hàng đăng ký tài khoản mới"
- Badge: "Tự động 100%"
- Features: Kèm mã WELCOME10 (giảm 10%), Nội dung AI
- Status: "Đang hoạt động" (no trigger button vì fully automatic)

**Email Logs Section:**

*Stats Row (3 cột, small cards):*
- Tổng emails đã gửi (blue)
- Gửi thành công (green) — status='success'
- Gửi thất bại (red) — status='failed'

*Tabs:*
- Tất cả | Welcome (icon envelope) | Giỏ hàng (icon cart) | Newsletter (icon newspaper)

*Filters:*
- Search: Tên / Email người nhận (debounce)
- Date range picker: Từ ngày — Đến ngày

*Log Table:*

| Cột | Nội dung |
|---|---|
| **Loại** | Colored tag: welcome (green) / abandoned_cart (orange) / newsletter (indigo) / promotion (purple) |
| **Người nhận** | Tên + Email (2 dòng) |
| **Tiêu đề** | Ellipsis nếu dài (tooltip đầy đủ) |
| **Trạng thái** | green "Thành công" / red "Thất bại" / orange "Đang gửi" |
| **Mã giảm giá** | Gold tag nếu có (VD: "WELCOME10") / "—" nếu không |
| **Thời gian** | DD/MM/YYYY HH:mm:ss (sortable ASC/DESC) |

*Expandable rows:*
- Click row → Expand để xem:
  - Nội dung email HTML (preview trong iframe nhỏ)
  - Error message (nếu status='failed')

- Pagination: 10/20/50 per page

##### (g) Hỗ trợ Khách hàng Trực tuyến — Live Chat Queue (`/admin/chat`)

**Chiến lược rendering:** CSR — Quản trị viên sử dụng để nhận và xử lý yêu cầu chat trực tiếp từ khách hàng theo thời gian thực.

**Layout 2 cột:**
- **Cột trái — Danh sách phòng chat:** Chia làm 2 tabs:
  - **Chờ duyệt (waiting):** Danh sách khách hàng đang chờ được kết nối (nền màu vàng hổ phách). Có nút "Chấp nhận" để nhân viên tiếp nhận hỗ trợ.
  - **Đang hỗ trợ (active):** Danh sách khách hàng đang trò chuyện trực tiếp (có tên nhân viên đang hỗ trợ).
- **Cột phải — Khung chat chi tiết:**
  - Nếu chưa chọn phòng: Hiển thị Empty state hướng dẫn chọn phòng chat.
  - Nếu đã chọn phòng: Hiển thị tên khách hàng, mã phòng, nút "Kết thúc hỗ trợ" để trả về chế độ bot tự động.
  - Khung tin nhắn: Khách hàng hiển thị bên trái, tin nhắn admin hiển thị bên phải (màu teal `#0d9488`).
  - Ô nhập liệu và nút "Gửi" tin nhắn realtime.

#### 3.2.4. Hệ thống AI Gợi ý sản phẩm

##### Kiến trúc tổng thể AI

Hệ thống AI được thiết kế theo mô hình **"AI Sidecar"** — một dịch vụ Python độc lập (FastAPI) chạy song song với Express.js backend. Express.js không bao giờ import code Python trực tiếp; giao tiếp hoàn toàn qua REST API với contract rõ ràng.

```
Express.js (Node.js)          FastAPI (Python 3.11)
       │                              │
       │  POST /recommend             │
       │──────────────────────────────►│
       │  {userId, placement, n}      │
       │                              │  Tải model từ RAM (in-memory)
       │                              │  α × LightFM CF scores
       │                              │  + (1-α) × TF-IDF CBF scores
       │  {productIds, scores,        │
       │   model_version, source}     │
       │◄──────────────────────────────│
       │                              │
       │  Hydrate products từ MongoDB │
       │  Trả về cho frontend         │
       │                              │
```

##### Thu thập dữ liệu hành vi

Mọi tương tác của người dùng với sản phẩm đều được ghi lại không đồng bộ (fire-and-forget), không ảnh hưởng đến UX:

| Endpoint | Auth | Event types | Ghi vào |
|---|---|---|---|
| POST /api/ai/track | Bắt buộc đăng nhập | view, click, add_to_cart, purchase, rec_click | BehavioralEvent + Activity |
| POST /api/ai/track-public | Không cần | view, click, add_to_cart, purchase, rec_click | BehavioralEvent (userId=null) |
| POST /api/ai/track-search | Không cần | search query | BehavioralEvent (productId=null) |

**Trọng số sự kiện (Event Weights) dùng cho ML training:**
```
view         = 1.0   (người dùng xem sản phẩm)
click        = 1.5   (click vào sản phẩm)
add_to_cart  = 2.0   (thêm vào giỏ hàng)
purchase     = 5.0   (đã mua — tín hiệu mạnh nhất)
rec_click    = 1.5   (click vào gợi ý AI)
```

##### FastAPI Inference Service

**Endpoint chính:** `POST /recommend`

Request body:
```json
{
  "userId": "65f4a2b3...",      // ObjectId | null (anonymous)
  "placement": "homepage",      // homepage | pdp | cart | search
  "n": 12,                      // số lượng gợi ý cần
  "filters": {
    "excludeOos": true,         // loại sản phẩm hết hàng
    "minPrice": 0,
    "maxPrice": 5000000
  }
}
```

Response:
```json
{
  "productIds": ["65f4...", "65f5..."],
  "scores": [0.95, 0.87, ...],
  "model_version": "2026-05-01-v1",
  "source": "model"
}
```

**Hệ số α theo placement:**

| Placement | α (CF weight) | (1-α) CBF | Giải thích |
|---|---|---|---|
| homepage | 0.7 | 0.3 | CF chiếm ưu thế — khám phá đa dạng |
| pdp | 0.3 | 0.7 | CBF chiếm ưu thế — sản phẩm tương tự |
| cart | 0.5 | 0.5 | Cân bằng — frequently bought together |
| anonymous | 0.0 | 1.0 | Thuần CBF — không có user history |

**Cold Start Handling:**

```python
if user_id is None:
    alpha = 0.0  # Anonymous: pure CBF
elif user_event_count < 5:
    alpha = 0.2  # New user: CBF-dominant
else:
    alpha = PLACEMENT_ALPHA[placement]  # Normal hybrid
```

##### Pipeline ML tự động (GitHub Actions)

File: `.github/workflows/ml-training.yml`
Schedule: `cron: '0 19 * * *'` (19:00 UTC = 02:00 ICT hàng ngày)

**8 bước pipeline:**

**Bước 1 — Fetch Training Data:**
```python
# Lấy behavioral_events 90 ngày gần nhất
events = db.behavioral_events.find({
    "timestamp": {"$gte": datetime.now() - timedelta(days=90)}
})
# Xây dựng interaction matrix với weighted scores
matrix = build_interaction_matrix(events, weights={
    'view': 1, 'click': 1.5, 'add_to_cart': 2,
    'purchase': 5, 'rec_click': 1.5
})
```

**Bước 2 — Train Collaborative Filtering:**
```python
model = LightFM(
    no_components=128,    # Latent factors
    loss='warp',          # Tối ưu top-N ranking
    learning_rate=0.05,
    item_alpha=1e-6
)
model.fit(
    interactions=matrix,
    item_features=item_features,  # category one-hot + price tier + tags
    epochs=50,
    num_threads=4
)
```

**Bước 3 — Evaluate:**
```python
precision = precision_at_k(model, test_interactions, k=10)
recall = recall_at_k(model, test_interactions, k=10)
# Ngưỡng để promote: P@10 >= 0.30 AND R@10 >= 0.20
```

**Bước 4 — Promote nếu tốt hơn:**
- So sánh metrics với active model trong `model_versions` collection
- Nếu tốt hơn: Cập nhật isActive trong MongoDB

**Bước 5 — Build CBF Matrix:**
```python
vectorizer = TfidfVectorizer(
    max_features=5000,
    ngram_range=(1, 2),     # Unigram + bigram
    sublinear_tf=True
)
tfidf_matrix = vectorizer.fit_transform(product_descriptions)
# Kết hợp với category one-hot (weight×2.0) + price tier
combined = hstack([tfidf_matrix, category_features * 2.0, price_features])
# Tính top-50 similar products per product (cosine similarity)
cbf_top50 = compute_top50(combined)  # Dict: {productId: [top50_productIds]}
```

**Bước 6–8 — Upload R2 → Hot-reload → Ghi kết quả:**
```python
# Upload artifacts lên Cloudflare R2
r2.upload('cf_model.pkl', pickle.dumps(model))
r2.upload('cbf_top50.pkl', pickle.dumps(cbf_top50))
r2.upload('metadata.json', json.dumps({
    "version": version, "metrics": metrics
}))

# Hot-reload FastAPI (không restart process)
requests.post('http://fastapi:8000/internal/reload-model')

# ModelRegistry sử dụng asyncio.Lock để atomic swap
async def reload_model(self):
    async with self._lock:
        new_model = load_from_r2()
        self._model = new_model  # Atomic swap
```

##### Circuit Breaker Integration

Circuit breaker trong Express.js ngăn chặn cascade failure khi FastAPI không khả dụng:

```javascript
// backend/controllers/ai.controller.js
const CircuitBreaker = require('opossum');

const breakerOptions = {
  timeout: 500,                    // 500ms timeout
  errorThresholdPercentage: 50,    // 50% error rate → OPEN
  resetTimeout: 60000,             // Thử lại sau 60s
  volumeThreshold: 5               // Cần ít nhất 5 requests để tính
};

const breaker = new CircuitBreaker(callFastAPI, breakerOptions);

// Fallback khi circuit OPEN
breaker.fallback(async (userId, placement, n) => {
  return await Product.find({ isActive: true, featured: true })
    .limit(n)
    .select('name price image category rating');
});

// Sử dụng trong route handler
const recommendations = await breaker.fire(userId, placement, n);
```

---

## KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 1. Kết quả đạt được

Sau quá trình nghiên cứu và triển khai, đề tài đã đạt được các kết quả cụ thể như sau:

**Về mặt kỹ thuật:**

- Xây dựng thành công hệ thống thương mại điện tử full-stack với **3 đơn vị triển khai độc lập** (Express.js backend, FastAPI AI service, Next.js frontend), mỗi đơn vị có thể scale độc lập.

- Triển khai **56 API endpoints** đầy đủ chức năng, bao phủ 7 nhóm nghiệp vụ (Auth, Catalog, Cart, Order, AI, Wishlist, Notification, Discount, Admin, Marketing).

- Xây dựng **15 trang web** (9 trang khách hàng + 6 trang quản trị) với chiến lược rendering tối ưu cho từng loại trang (ISR/SSR/CSR).

- Triển khai **hệ thống AI Gợi ý Hybrid** kết hợp Collaborative Filtering (LightFM WARP) và Content-Based Filtering (TF-IDF), với hệ số α thay đổi theo 4 vị trí hiển thị khác nhau.

- Xây dựng **pipeline ML tự động** chạy hàng ngày lúc 02:00 ICT qua GitHub Actions, tự động đánh giá và nâng cấp model khi đạt ngưỡng P@10 ≥ 0.30 và R@10 ≥ 0.20.

- Tích hợp **Circuit Breaker pattern** (opossum) đảm bảo hệ thống hoạt động liên tục ngay cả khi FastAPI AI service gặp sự cố, với thời gian fallback < 100ms.

- Xây dựng **Marketing Automation** với email nhắc giỏ hàng bỏ quên (hourly cron), newsletter hàng tuần (Monday 9AM cron), và email chào mừng tự động — tất cả sử dụng Gemini AI để tạo nội dung.

- Thiết kế **10 MongoDB collections** với schema tối ưu, soft-delete pattern, TTL index cho behavioral_events (90 ngày), và atomic operations cho mã giảm giá.

**Về mặt học thuật:**

- Nắm vững lý thuyết và thực hành về hệ thống gợi ý Hybrid (CF + CBF), bao gồm Matrix Factorization (LightFM), TF-IDF vectorization, và cold-start handling.

- Hiểu sâu về kiến trúc hệ thống phân tán: "Monolith + AI Sidecar", circuit breaker pattern, event-driven communication, và graceful degradation.

- Kinh nghiệm thực tiễn về MLOps cơ bản: xây dựng pipeline huấn luyện, đánh giá và triển khai model tự động với GitHub Actions.

- Thực hành triển khai ứng dụng lên môi trường production với chi phí vận hành $0/tháng (Render.com free tier, Vercel, MongoDB Atlas M0, Cloudflare R2 free tier).

**Các chỉ số kinh doanh hướng đến:**

| Chỉ số | Mục tiêu | Mô tả |
|---|---|---|
| Tỷ lệ chuyển đổi | ≥ 3.5% | Visits → Purchase |
| AI Recommendation CTR | ≥ 5% | Click vào gợi ý AI |
| Tăng AOV | +15% | Nhờ AI cross-sell |
| Email open rate | ≥ 20% | Newsletter + abandoned cart |
| Giảm tỷ lệ bỏ giỏ | ≤ 65% | Email nhắc nhở tự động |

### 2. Hạn chế của hệ thống

Mặc dù đã đạt được nhiều kết quả tích cực, hệ thống vẫn còn một số hạn chế cần thẳng thắn nhìn nhận:

**Hạn chế về hạ tầng (Free-tier constraints):**
- Render.com free tier chỉ có 512MB RAM — giới hạn số lượng model ML có thể load đồng thời và kích thước tập training data.
- Render.com spin-down sau 15 phút không có request — giải quyết bằng UptimeRobot nhưng vẫn có độ trễ ~30 giây khi cold start.
- MongoDB Atlas M0 giới hạn 512MB storage — không phù hợp với dữ liệu sản phẩm ảnh chất lượng cao.
- Gmail SMTP giới hạn 500 emails/ngày — không đủ cho scale production thực tế.

**Hạn chế về chức năng:**
- Thanh toán chỉ sử dụng VNPay sandbox — không xử lý tiền thật.
- Không có horizontal scaling — mỗi service chỉ chạy 1 instance.
- Single-region MongoDB — latency cao hơn với người dùng ở xa.
- Tìm kiếm sản phẩm dựa trên MongoDB text index — kém linh hoạt hơn Elasticsearch hay Meilisearch.
- Không có real-time notifications (WebSocket) — thông báo chỉ cập nhật khi polling.

**Hạn chế về AI:**
- Model LightFM CF cần lượng dữ liệu tối thiểu để cho kết quả tốt — trong môi trường demo với seed data, accuracy có thể chưa được kiểm chứng trên real traffic.
- Không có A/B testing framework để so sánh chiến lược gợi ý khác nhau.
- TF-IDF không hỗ trợ tốt tiếng Việt có dấu — có thể miss các sản phẩm tương tự do vấn đề encoding.

### 3. Hướng phát triển trong tương lai

Để hoàn thiện và nâng cấp hệ thống, nhóm đề xuất các hướng phát triển sau:

**Kiến trúc và hạ tầng:**
- **Tách microservices:** Khi có nhu cầu scale, có thể tách từng module (Auth, Catalog, Order, AI) thành microservice độc lập với message broker (RabbitMQ/Kafka).
- **Container orchestration:** Sử dụng Kubernetes để quản lý deployment, auto-scaling theo load thực tế.
- **Distributed caching:** Triển khai Redis Cluster thay vì Upstash free tier để không bị giới hạn 10,000 commands/ngày.

**Tính năng sản phẩm:**
- **Ứng dụng di động:** Phát triển React Native app với trải nghiệm mua sắm tối ưu cho mobile.
- **Multi-vendor Marketplace:** Mở rộng thành marketplace cho phép nhiều người bán đăng bán sản phẩm.
- **Real-time notifications:** Sử dụng WebSocket (Socket.io) hoặc Server-Sent Events cho thông báo tức thì.
- **Advanced search:** Tích hợp Elasticsearch hoặc Meilisearch cho tìm kiếm full-text tiếng Việt tốt hơn.
- **Thanh toán thực tế:** Tích hợp VNPay production, ZaloPay, stripe cho thanh toán quốc tế.
- **Tích hợp logistics:** Kết nối API với Giao Hàng Nhanh, Giao Hàng Tiết Kiệm để tính phí ship thực tế và theo dõi vận đơn.

**Cải thiện AI:**
- **A/B Testing Framework:** Triển khai hệ thống so sánh chiến lược gợi ý với phân bổ traffic ngẫu nhiên và phân tích thống kê.
- **Deep Learning Recommendation:** Thay thế LightFM bằng Neural Collaborative Filtering (NCF) hoặc Transformer-based models.
- **LLM-powered search:** Tích hợp embedding search (semantic similarity) thay cho keyword search.
- **Personalized pricing:** Dynamic pricing dựa trên RFM segment và elasticity.
- **Real-time ML:** Cập nhật model online learning (không cần wait 24h) khi có dữ liệu mới.

**Bảo mật và Compliance:**
- **OAuth 2.0:** Đăng nhập bằng Google/Facebook thay vì chỉ email/password.
- **2FA (Two-Factor Authentication):** TOTP authenticator app.
- **GDPR Compliance:** Quyền xóa dữ liệu, export dữ liệu cá nhân.
- **PCI DSS:** Nếu xử lý thanh toán card thực tế.

---

## DANH MỤC TÀI LIỆU THAM KHẢO

**Bài báo khoa học:**

[1] Kula, M. (2015). *Metadata Embeddings for User and Item Cold-start Recommendations*. Proceedings of the 2nd Workshop on New Trends on Content-Based Recommender Systems, RecSys 2015. arXiv:1507.08439.

[2] Hu, Y., Koren, Y., & Volinsky, C. (2008). *Collaborative Filtering for Implicit Feedback Datasets*. IEEE International Conference on Data Mining (ICDM 2008).

[3] Rendle, S., Freudenthaler, C., Gantner, Z., & Schmidt-Thieme, L. (2009). *BPR: Bayesian Personalized Ranking from Implicit Feedback*. Proceedings of UAI 2009.

[4] Naumov, M., et al. (2019). *Deep Learning Recommendation Model for Personalization and Recommendation Systems*. arXiv:1906.00091.

[5] Nygard, M. T. (2007). *Release It! Design and Deploy Production-Ready Software*. Pragmatic Bookshelf. (Circuit Breaker Pattern)

**Tài liệu kỹ thuật chính thức:**

[6] Next.js Team. (2024). *Next.js 15 Documentation*. Vercel. https://nextjs.org/docs

[7] MongoDB Inc. (2024). *MongoDB Manual v7.0*. https://www.mongodb.com/docs/manual/

[8] FastAPI Documentation. (2024). *FastAPI — Modern, fast (high-performance), web framework for building APIs with Python 3.8+*. https://fastapi.tiangolo.com/

[9] scikit-learn developers. (2024). *scikit-learn 1.4 User Guide — Text feature extraction*. https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction

[10] LightFM Documentation. (2024). *LightFM: A Python implementation of a number of popular recommendation algorithms*. https://making.lyst.com/lightfm/docs/home.html

[11] Ant Design Team. (2024). *Ant Design 5.x — A design system for enterprise-level products*. https://ant.design/docs/react/introduce

[12] TanStack. (2024). *TanStack Query v5 Documentation*. https://tanstack.com/query/latest/docs/

[13] NodeSource. (2024). *Node.js v20 LTS Documentation*. https://nodejs.org/en/docs/

[14] opossum. (2024). *Opossum — A Node.js circuit breaker*. https://nodeshift.dev/opossum/

[15] Cloudflare. (2024). *Cloudflare R2 Storage Documentation*. https://developers.cloudflare.com/r2/

[16] GitHub Actions. (2024). *GitHub Actions Documentation — Automate your workflow*. https://docs.github.com/en/actions

[17] Vercel. (2024). *Vercel Platform Documentation*. https://vercel.com/docs

[18] Render.com. (2024). *Render Documentation — Deploy anything*. https://render.com/docs

[19] VNPay. (2024). *VNPay Sandbox Integration Guide*. https://sandbox.vnpayment.vn/apis/

[20] Google. (2024). *Gemini API Documentation*. https://ai.google.dev/docs

---

*Báo cáo thực tập tốt nghiệp*
*Đề tài: Xây dựng hệ thống thương mại điện tử thông minh với tính năng gợi ý sản phẩm bằng trí tuệ nhân tạo*
*Học viện Công nghệ Bưu chính Viễn thông — Khoa Công nghệ Thông tin*
*Tháng 05 năm 2026*

