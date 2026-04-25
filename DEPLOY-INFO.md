# SMART-ECOMMERCE — Thông Tin Deploy Production

> Cập nhật lần cuối: 2026-04-25

---

## 1. URLs Production

| Service | URL | Platform |
|---|---|---|
| **Backend API** | `https://smart-ecommerce-api-vbkw.onrender.com` | Render.com |
| **AI Service** | `https://smart-ecommerce-ai.onrender.com` | Render.com |
| **Frontend** | _(cập nhật sau khi Vercel deploy xong)_ | Vercel |
| **Health check BE** | `https://smart-ecommerce-api-vbkw.onrender.com/api/health` | — |
| **Health check AI** | `https://smart-ecommerce-ai.onrender.com/health` | — |

---

## 2. Tài Khoản & Dịch Vụ

| Dịch Vụ | Mục Đích | Ghi Chú |
|---|---|---|
| **MongoDB Atlas** | Database production | Project: `smart-ecommerce`, Cluster: `smart-ecommerce` |
| **Render.com** | Host Backend + AI Service | Free tier, spin down sau 15 phút idle |
| **Vercel** | Host Frontend Next.js | Free Hobby tier |
| **Cloudinary** | Lưu ảnh sản phẩm | Cloud name: `ddmmfnlvk` |
| **OpenRouter** | AI text generation (email marketing) | Model: `openrouter/free` |
| **Gmail SMTP** | Gửi email | `bcphong06@gmail.com` |
| **GitHub** | Source code + CI/CD | `Neil-06-hub/SMART-ECOMMERCE-AI-SYSTEM-WORKFLOW-PUBLIC` |

---

## 3. Environment Variables

### Backend (Render — `smart-ecommerce-api`)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://smart-ecommerce_db_user:***@smart-ecommerce.mq5xast.mongodb.net/smart-ecommerce?retryWrites=true&w=majority
JWT_SECRET=<random 32 chars — xem Render dashboard>
JWT_EXPIRE=7d
CLIENT_URL=<Vercel URL — cập nhật sau>
FASTAPI_URL=https://smart-ecommerce-ai.onrender.com
INTERNAL_SECRET=<random string — xem Render dashboard, phải trùng với AI service>
OPENROUTER_API_KEY=<xem backend/.env>
OPENROUTER_ENABLED=true
OPENROUTER_MODEL=openrouter/free
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
CLOUDINARY_CLOUD_NAME=ddmmfnlvk
CLOUDINARY_API_KEY=<xem backend/.env>
CLOUDINARY_API_SECRET=<xem backend/.env>
EMAIL_USER=bcphong06@gmail.com
EMAIL_PASS=<xem backend/.env>
```

### AI Service (Render — `smart-ecommerce-ai`)
```
MONGODB_URI=<cùng Atlas URI với backend>
MONGODB_DB_NAME=smart-ecommerce
FASTAPI_URL=https://smart-ecommerce-ai.onrender.com
INTERNAL_SECRET=<cùng giá trị với backend>
PYTHON_VERSION=3.11.0
```
> Không cần R2 — service dùng CBF local fallback (chưa có Cloudflare R2)

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://smart-ecommerce-api-vbkw.onrender.com
```

---

## 4. MongoDB Atlas

- **Connection string:** `mongodb+srv://smart-ecommerce_db_user:5R8mrSUWtlb9g0Oz@smart-ecommerce.mq5xast.mongodb.net/`
- **Database name:** `smart-ecommerce`
- **IP Whitelist:** `0.0.0.0/0` (allow all — cần thiết cho Render free tier IP động)
- **Tạo cluster:** M0 Free, region Singapore

---

## 5. Render.com Config

### Backend (`smart-ecommerce-api`)
```
Runtime:       Node
Root Dir:      backend
Build:         npm install
Start:         node server.js
Branch:        main
Health check:  /api/health
```

### AI Service (`smart-ecommerce-ai`)
```
Runtime:       Python 3
Root Dir:      apps/ai-service
Build:         pip install --no-cache-dir "setuptools<70.0.0" wheel Cython "numpy==1.26.4" && pip install --no-cache-dir lightfm==1.17 && pip install -e .
Start:         uvicorn app.main:app --host 0.0.0.0 --port 8000
Branch:        main
Health check:  /health
PYTHON_VERSION env: 3.11.0  ← quan trọng! Render mặc định Python 3.14 không tương thích LightFM
```

---

## 6. Vercel Config

```
Root Directory:  apps/web
Framework:       Next.js (auto-detect)
Build Command:   npm run build (mặc định)
Branch:          main (auto-deploy khi push)
```

---

## 7. Test Accounts (sau khi seed)

```
Admin:    admin@smartshop.com    / admin123456
Customer: customer@smartshop.com / customer123456
```

Chạy seed từ local:
```bash
cd backend
# Đổi MONGO_URI trong .env sang Atlas URI trước
npm run seed
```

---

## 8. Các Vấn Đề Đã Gặp & Cách Fix

| Vấn đề | Nguyên nhân | Fix |
|---|---|---|
| MongoDB connection refused | Atlas chưa whitelist IP Render | Thêm `0.0.0.0/0` vào Network Access |
| AI build fail (Python 3.14) | LightFM không hỗ trợ Python 3.14 | Thêm env var `PYTHON_VERSION=3.11.0` |
| Vercel build fail: `@/lib/api` not found | `.gitignore` exclude thư mục `lib/` | Thêm `!apps/web/lib/` exception vào `.gitignore` |
| render.yaml có GEMINI_API_KEY nhưng code dùng OPENROUTER | Config cũ chưa cập nhật | Thay bằng 4 OPENROUTER vars trong render.yaml |

---

## 9. Lưu Ý Vận Hành

- **Render free tier spin-down:** Service tắt sau 15 phút không có request → cold start ~30-60 giây
- **Khuyến nghị:** Dùng [UptimeRobot](https://uptimerobot.com) ping `/api/health` và `/health` mỗi 5 phút để giữ service luôn active
- **AI recommendations:** Hiện dùng CBF fallback (không có model ML trained). Nếu muốn hybrid AI thật sự cần setup Cloudflare R2 và chạy training pipeline
- **Auto-deploy:** Push lên `main` → Vercel tự deploy frontend. Backend và AI service cần cấu hình Deploy Hook trong Render

---

## 10. GitHub Secrets Cần Cấu Hình (CI/CD)

Vào repo GitHub → Settings → Secrets and variables → Actions:
```
RENDER_DEPLOY_HOOK_API    # Render → smart-ecommerce-api → Settings → Deploy Hook
RENDER_DEPLOY_HOOK_AI     # Render → smart-ecommerce-ai → Settings → Deploy Hook
```
