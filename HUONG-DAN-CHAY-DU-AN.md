# HƯỚNG DẪN CHẠY DỰ ÁN SMART-ECOMMERCE AI SYSTEM

Tài liệu này hướng dẫn cách khởi chạy toàn bộ các thành phần của dự án và kiểm tra tính năng AI.

## 📋 Yêu cầu hệ thống
- **Node.js**: v18+ 
- **Python**: v3.10+
- **MongoDB**: Đã cài đặt và đang chạy tại `localhost:27017`

---

## 🚀 Các bước khởi chạy

### 1. Khởi động MongoDB
Đảm bảo dịch vụ MongoDB đã được bật. Bạn có thể kiểm tra bằng MongoDB Compass hoặc lệnh:
```bash
# Kiểm tra port 27017
netstat -ano | findstr :27017
```

### 2. Chạy Backend (Node.js API)
Mở terminal mới tại thư mục gốc:
```bash
cd backend
npm install
npm run dev
```
*Dấu hiệu thành công:* `🚀 Server running on port 5000` và `✅ MongoDB Connected`.

### 3. Chạy AI Service (FastAPI)
Mở terminal thứ hai tại thư mục gốc:
```bash
cd apps/ai-service
# Cài đặt môi trường ảo (khuyên dùng)
python -m venv .venv
.\.venv\Scripts\activate
# Cài đặt thư viện
pip install -r requirements.txt
# Chạy server
python -m uvicorn app.main:app --reload --port 8000
```
*Dấu hiệu thành công:* `Uvicorn running on http://127.0.0.1:8000`.

### 4. Chạy Frontend (Next.js)
Mở terminal thứ ba tại thư mục gốc:
```bash
cd apps/web
npm install
npm run dev
```
*Dấu hiệu thành công:* Truy cập được `http://localhost:3000`.

---

## 🤖 Kiểm tra tính năng AI (Testing AI)

Dự án sử dụng AI Service để gợi ý sản phẩm dựa trên hành vi người dùng.

### Các bước test:
1. **Truy cập Frontend:** Vào `http://localhost:3000`.
2. **Đăng nhập:** Tạo tài khoản hoặc dùng tài khoản admin (nếu có dữ liệu seed).
3. **Tạo lịch sử xem:** Bấm xem chi tiết 3-4 loại sản phẩm khác nhau. Lúc này Frontend sẽ gửi request tới `/api/ai/track` để ghi nhận hành vi.
4. **Xem gợi ý:** Quay lại trang chủ hoặc vào phần "Sản phẩm dành cho bạn". Backend Node.js sẽ gọi tới AI Service (FastAPI) để lấy danh sách sản phẩm phù hợp nhất.

### Kiểm tra trực tiếp API:
Bạn có thể dùng Postman hoặc trình duyệt (nếu đã đăng nhập) để gọi:
- **Gợi ý:** `GET http://localhost:5000/api/ai/recommendations`
- **Capture hành vi:** `POST http://localhost:5000/api/ai/track`

---

## 🛠️ Xử lý lỗi thường gặp
- **Lỗi ETIMEDOUT MongoDB:** Hãy chắc chắn MongoDB đang chạy và file `.env` đã được sửa thành `localhost` (không phải `host.docker.internal`).
- **Lỗi Module not found (Python):** Đảm bảo bạn đã kích hoạt môi trường ảo (venv) trước khi `pip install`.
- **Lỗi CORS:** Frontend mặc định chạy ở port 3000, hãy kiểm tra `CLIENT_URL` trong `backend/.env`.
