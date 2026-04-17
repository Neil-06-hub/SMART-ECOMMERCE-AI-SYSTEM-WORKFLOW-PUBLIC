# SMART ECOMMERCE AI SYSTEM

An AI-powered e-commerce platform with hybrid collaborative + content-based filtering recommendations, built as a university capstone project.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 18, Ant Design 5, TanStack Query v5, Zustand |
| Backend | Express.js 4, Node.js 20, Mongoose 8, JWT, bcryptjs |
| AI Service | FastAPI 0.111, LightFM 1.17, scikit-learn 1.4, Motor, boto3 |
| Database | MongoDB Atlas M0 (free) |
| Image Storage | Cloudinary (free) |
| Model Storage | Cloudflare R2 (free) |
| AI Copy | Google Gemini 1.5 Flash (free tier) |
| Email | Nodemailer + Gmail SMTP |
| Deployment | Render.com (API + AI), Vercel (Web) |
| CI/CD | GitHub Actions (PR gate + deploy + daily ML training) |

## Architecture

```
Browser → Vercel (Next.js — SSR/ISR/CSR)
        → Render.com:
            Express.js :5000  ──opossum──→  FastAPI :8000
                 │                               │
          MongoDB Atlas                  GitHub Actions cron
          Cloudinary                     Cloudflare R2 (model PKLs)
          Gmail SMTP
```

**AI Recommendation Flow:**
```
User event → POST /api/ai/track → BehavioralEvent (MongoDB)
                  ↓ (daily 02:00 ICT GitHub Actions)
           train_pipeline.py → LightFM CF + TF-IDF CBF → upload to R2
                  ↓
GET /api/ai/recommendations → opossum circuit breaker → FastAPI /recommend
  → α×CF + (1-α)×CBF hybrid scoring → product details from MongoDB
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB (local or Atlas)

### Option A — Docker Compose (Recommended)

```bash
# Copy and fill environment variables
cp backend/.env.example backend/.env
cp apps/ai-service/.env.example apps/ai-service/.env
cp apps/web/.env.example apps/web/.env.local

# Start all services
docker compose up -d

# Seed database (products + users + AI training data)
docker compose exec backend npm run seed
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- FastAPI AI: http://localhost:8000

### Option B — Manual Setup

**1. Backend (Express.js)**
```bash
cd backend
cp .env.example .env    # fill in your values
npm install
npm run dev             # starts on :5000
```

**2. AI Service (FastAPI)**
```bash
cd apps/ai-service
cp .env.example .env    # fill in your values

# Install (lightfm requires build tools)
pip install "setuptools<70.0.0" wheel Cython "numpy==1.26.4"
pip install lightfm==1.17
pip install -e .

python -m uvicorn app.main:app --reload --port 8000
```

**3. Frontend (Next.js)**
```bash
cd apps/web
cp .env.example .env.local   # fill in your values
npm install
npm run dev                  # starts on :3000
```

**4. Seed the database**
```bash
cd backend
npm run seed    # products → users → behavioral events → feature snapshots
```

**5. Train the AI model** (optional for first-run — model loads from R2 if configured)
```bash
cd apps/ai-service
python scripts/train_pipeline.py
```

### Demo Accounts

After running `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | admin@smartshop.com | admin123456 |
| Customer | customer@smartshop.com | customer123456 |

## Project Structure

```
SMART-ECOMMERCE-AI-SYSTEM/
├── backend/                   ← Express.js API (port 5000)
│   ├── controllers/           ← 8 controllers (auth, product, order, ai, ...)
│   ├── models/                ← 10 Mongoose schemas
│   ├── routes/                ← 9 route files
│   ├── services/              ← gemini, recommendation, email, marketing
│   ├── jobs/                  ← marketing.cron.js (abandoned cart + newsletter)
│   ├── seeds/                 ← 05-behavior-history.js, 06-feature-snapshots.js
│   ├── seed.js                ← master seeder (runs all seeds)
│   └── server.js              ← Express app entry
│
├── apps/ai-service/           ← FastAPI + ML Pipeline (port 8000)
│   ├── app/
│   │   ├── api/               ← /recommend, /health, /internal/reload-model
│   │   ├── ml/                ← train_cf.py, train_cbf.py, hybrid.py, evaluate.py
│   │   └── services/          ← model_registry.py, r2_client.py, mongo_client.py
│   └── scripts/
│       └── train_pipeline.py  ← GitHub Actions daily training entry point
│
├── apps/web/                  ← Next.js 15 (port 3000)
│   └── app/
│       ├── (client)/          ← shop pages (home, products, cart, checkout, orders)
│       └── admin/             ← admin dashboard (products, orders, users, marketing)
│
├── .github/workflows/
│   ├── ml-training.yml        ← daily 02:00 ICT ML training cron
│   ├── pr-gate.yml            ← CI gate on every PR
│   ├── deploy-api.yml         ← deploy Express.js to Render on main push
│   ├── deploy-ai.yml          ← deploy FastAPI to Render on main push
│   └── deploy-web.yml         ← log trigger for Vercel auto-deploy
│
├── docker-compose.yml         ← local full-stack (mongodb + backend + ai + web)
├── render.yaml                ← Render.com deployment config
└── docs/                      ← Architecture, requirements, database design docs
```

## API Endpoints

### Auth
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | User |
| PUT | `/api/auth/profile` | User |

### Products
| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/products` | Public |
| GET | `/api/products/:id` | Public |
| GET | `/api/products/featured` | Public |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:id` | Admin |
| DELETE | `/api/products/:id` | Admin |

### Orders
| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/orders` | User |
| GET | `/api/orders/my` | User |
| GET | `/api/orders/:id` | User/Admin |
| PUT | `/api/orders/:id/cancel` | User |

### AI Recommendations
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/ai/recommendations` | User | Personalized AI recommendations |
| POST | `/api/ai/track` | User | Track user events (auth) |
| POST | `/api/ai/track-public` | Public | Track anonymous events |

### FastAPI (internal)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/recommend` | Hybrid CF+CBF inference |
| GET | `/health` | Health check + model status |
| POST | `/internal/reload-model` | Hot-reload model artifacts |

## Environment Variables

See `.env.example` files in each app directory:
- [`backend/.env.example`](backend/.env.example)
- [`apps/ai-service/.env.example`](apps/ai-service/.env.example)
- [`apps/web/.env.example`](apps/web/.env.example)

## Documentation

| Doc | Description |
|---|---|
| [REQUIREMENTS.md](docs/REQUIREMENTS.md) | Business goals, 62 FRs, user personas |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, circuit breaker, RBAC |
| [TECH_STACK.md](docs/TECH_STACK.md) | Technology choices and rationale |
| [DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md) | MongoDB schemas, indexes |
| [AI_LAYER_ARCHITECTURE.md](docs/AI_LAYER_ARCHITECTURE.md) | ML pipeline deep dive |
| [IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) | Build phases and verification |
| [API_SPECIFICATIONS.md](docs/API_SPECIFICATIONS.md) | Full API contract |
