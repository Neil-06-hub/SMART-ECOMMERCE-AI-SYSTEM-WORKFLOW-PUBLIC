---
description: GitHub Actions, Docker Compose, and deployment specialist for the SMART-ECOMMERCE project. Creates CI/CD pipelines, the daily ML training cron, Render.com and Vercel deployment configs, and Docker Compose for local development.
---

# DevOps & CI/CD Engineer

## When to Use This Skill
- "Set up the CI/CD pipeline"
- "Create the ML training GitHub Actions workflow"
- "Configure Docker Compose for local development"
- "Add a health check"
- "Set up Render deployment"
- Any task touching `.github/workflows/` or `infra/`

## Context to Read First (in order)
1. `docs/TECH_STACK.md` §7 (Infrastructure & DevOps: GitHub Actions, Render.com, Vercel, Docker)
2. `docs/ARCHITECTURE.md` §4.4 (ML Training Pipeline: daily 02:00 ICT, 7 steps, cron config)
3. `docs/ARCHITECTURE.md` §7 (Deployment: Render spin-down, UptimeRobot, health endpoints)
4. `CLAUDE.md` Commands section (all build/test commands for each app)

---

## GitHub Actions Workflows (4 files)

### 1. `.github/workflows/ci.yml` — PR Gate

Runs on every pull request. All jobs must pass before merge.

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-typecheck-api:
    name: API — Lint & TypeCheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/api/package-lock.json
      - run: cd apps/api && npm ci
      - run: cd apps/api && npm run lint
      - run: cd apps/api && npx tsc --noEmit

  lint-build-web:
    name: Web — Lint & Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/web/package-lock.json
      - run: cd apps/web && npm ci
      - run: cd apps/web && npm run lint
      - run: cd apps/web && npm run build

  test-api:
    name: API — Jest Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/api/package-lock.json
      - run: cd apps/api && npm ci
      - run: cd apps/api && npm run test -- --passWithNoTests --forceExit

  test-ai-service:
    name: AI Service — pytest
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          cache-dependency-path: apps/ai-service/requirements.txt
      - run: cd apps/ai-service && pip install -r requirements.txt
      - run: cd apps/ai-service && pytest tests/ -v --tb=short
```

### 2. `.github/workflows/cd-staging.yml` — Staging Deploy

Triggers on push to `develop` branch.

```yaml
name: CD — Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-api-staging:
    name: Deploy Express.js → Render Staging
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render Deploy Hook
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_API_STAGING }}"

  deploy-ai-staging:
    name: Deploy FastAPI → Render Staging
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render Deploy Hook
        run: |
          curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_AI_STAGING }}"

  deploy-web-staging:
    name: Deploy Next.js → Vercel Preview
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g vercel
      - run: cd apps/web && vercel --token ${{ secrets.VERCEL_TOKEN }} --yes
```

### 3. `.github/workflows/cd-production.yml` — Production Deploy

Triggers on push to `main` branch (after PR merge).

```yaml
name: CD — Production

on:
  push:
    branches: [main]

jobs:
  deploy-api:
    name: Deploy Express.js → Render Production
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_API_PROD }}"

  deploy-ai:
    name: Deploy FastAPI → Render Production
    runs-on: ubuntu-latest
    steps:
      - run: curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_AI_PROD }}"

  deploy-web:
    name: Deploy Next.js → Vercel Production
    runs-on: ubuntu-latest
    needs: [deploy-api]  # wait for API before deploying frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install -g vercel
      - run: cd apps/web && vercel --prod --token ${{ secrets.VERCEL_TOKEN }} --yes

  smoke-test:
    name: Post-Deploy Health Check
    runs-on: ubuntu-latest
    needs: [deploy-api, deploy-ai, deploy-web]
    steps:
      - name: Health Check Express.js
        run: |
          for i in {1..10}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${{ secrets.API_URL }}/health)
            if [ "$STATUS" = "200" ]; then echo "Express.js healthy"; exit 0; fi
            echo "Attempt $i failed (status=$STATUS), waiting..."; sleep 15
          done
          echo "Express.js health check failed"; exit 1

      - name: Health Check FastAPI
        run: |
          for i in {1..10}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${{ secrets.AI_SERVICE_URL }}/health)
            if [ "$STATUS" = "200" ]; then echo "FastAPI healthy"; exit 0; fi
            echo "Attempt $i failed, waiting..."; sleep 15
          done
          echo "FastAPI health check failed"; exit 1
```

### 4. `.github/workflows/ml-training.yml` — Daily ML Cron

```yaml
name: ML Training Pipeline

on:
  schedule:
    # 02:00 ICT = 19:00 UTC (UTC+7 → UTC-7)
    - cron: '0 19 * * *'
  workflow_dispatch:  # allow manual trigger for testing

jobs:
  train:
    name: Train Recommendation Models
    runs-on: ubuntu-latest
    timeout-minutes: 30  # LightFM ~10min + CBF ~5min + upload ~2min + buffer

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          cache-dependency-path: apps/ai-service/requirements.txt

      - name: Install dependencies
        run: cd apps/ai-service && pip install -r requirements.txt

      - name: Run training pipeline
        env:
          MONGO_URI: ${{ secrets.MONGO_URI }}
          REDIS_URL: ${{ secrets.REDIS_URL }}
          R2_ACCESS_KEY: ${{ secrets.R2_ACCESS_KEY }}
          R2_SECRET_KEY: ${{ secrets.R2_SECRET_KEY }}
          R2_BUCKET: ${{ secrets.R2_BUCKET }}
          R2_ACCOUNT_ID: ${{ secrets.R2_ACCOUNT_ID }}
          AI_SERVICE_URL: ${{ secrets.AI_SERVICE_URL }}
          INTERNAL_API_TOKEN: ${{ secrets.INTERNAL_API_TOKEN }}
        run: cd apps/ai-service && python scripts/train_pipeline.py

      - name: Notify on failure
        if: failure()
        run: |
          echo "ML training failed — previous model remains active"
          # Could send email via Gmail SMTP or GitHub notification
```

---

## Docker Compose — Local Development

```yaml
# infra/docker-compose.yml
version: '3.9'

services:
  express:
    build:
      context: ../apps/api
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: development
      MONGO_URI: mongodb://mongodb:27017/smart-ecommerce
      REDIS_URL: redis://redis:6379
    volumes:
      - ../apps/api/src:/app/src  # hot reload in dev
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_started
    command: npm run start:dev

  fastapi:
    build:
      context: ../apps/ai-service
      dockerfile: Dockerfile
    ports:
      - '8000:8000'
    environment:
      MONGO_URI: mongodb://mongodb:27017/smart-ecommerce
      REDIS_URL: redis://redis:6379
    depends_on:
      - mongodb
      - redis
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

  nextjs:
    build:
      context: ../apps/web
      dockerfile: Dockerfile
    ports:
      - '3001:3001'
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3000
    depends_on:
      - express

  mongodb:
    image: mongo:7
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: mongosh --eval 'db.runCommand("ping").ok' --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  meilisearch:
    image: getmeili/meilisearch:v1.7
    ports:
      - '7700:7700'
    environment:
      MEILI_MASTER_KEY: 'masterKey_dev_only'
    volumes:
      - meilisearch_data:/meili_data

volumes:
  mongodb_data:
  redis_data:
  meilisearch_data:
```

**Usage:**
```bash
# Start all services
docker compose up -d

# Start infrastructure only (MongoDB + Redis)
docker compose up -d mongodb redis

# View Express.js logs
docker compose logs -f express

# Reset everything including volumes
docker compose down -v
```

---

## Render.com Configuration

### `render.yaml` (root)
```yaml
services:
  - type: web
    name: smart-ecommerce-api
    runtime: node
    buildCommand: cd apps/api && npm ci && npm run build
    startCommand: cd apps/api && npm run start:prod
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        sync: false
      - key: REDIS_URL
        sync: false
      - key: JWT_PRIVATE_KEY
        sync: false
      # ... all other env vars

  - type: web
    name: smart-ecommerce-ai
    runtime: python
    buildCommand: cd apps/ai-service && pip install -r requirements.txt
    startCommand: cd apps/ai-service && uvicorn app.main:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /health
    envVars:
      - key: MONGO_URI
        sync: false
      # ... other env vars
```

---

## Health Endpoints

Both services must expose `/health` with no database calls:

```typescript
// Express.js — apps/api/src/health.controller.ts
// NOT under /api/v1 prefix
@Controller()
export class HealthController {
  @Get('health')
  @HttpCode(200)
  health() {
    // NO DB calls, NO Redis calls — must respond even when dependencies are down
    return {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
```

```python
# FastAPI — apps/ai-service/app/main.py
@app.get("/health")
async def health():
    # NO DB calls, NO Redis calls
    return {
        "status": "ok",
        "uptime": time.time() - START_TIME,
        "model_loaded": cf_service.model is not None,
    }
```

---

## Required GitHub Secrets

```
MONGO_URI                      → MongoDB Atlas connection string
REDIS_URL                      → Upstash Redis URL
JWT_PRIVATE_KEY                → RSA private key (PEM, single-line with \n)
JWT_PUBLIC_KEY                 → RSA public key (PEM)
GMAIL_USER                     → Gmail address for SMTP
GMAIL_APP_PASSWORD             → Gmail App Password (not account password)
VNPAY_HASH_SECRET              → VNPay HMAC-SHA512 key
R2_ACCESS_KEY                  → Cloudflare R2 access key
R2_SECRET_KEY                  → Cloudflare R2 secret key
R2_BUCKET                      → R2 bucket name
R2_ACCOUNT_ID                  → Cloudflare account ID
R2_PUBLIC_URL                  → R2 public bucket URL
AI_SERVICE_URL                 → FastAPI Render URL
API_URL                        → Express.js Render URL
INTERNAL_API_TOKEN             → Shared secret for /internal/* endpoints
VERCEL_TOKEN                   → Vercel deployment token
RENDER_DEPLOY_HOOK_API_PROD    → Render deploy hook for Express.js (prod)
RENDER_DEPLOY_HOOK_AI_PROD     → Render deploy hook for FastAPI (prod)
RENDER_DEPLOY_HOOK_API_STAGING → Render deploy hook for Express.js (staging)
RENDER_DEPLOY_HOOK_AI_STAGING  → Render deploy hook for FastAPI (staging)
```

---

## Critical Constraints

1. **GitHub Actions versions**: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/setup-python@v5` — never v3 (deprecated)
2. **ML training cron**: `0 19 * * *` UTC = 02:00 ICT — off-peak for Vietnamese users
3. **ML training timeout**: `timeout-minutes: 30` — prevents runaway jobs on GitHub Actions
4. **Never commit `.env` files** — `.env.example` with keys only is the source of truth
5. **Health endpoints**: respond in < 500ms with no database calls — UptimeRobot pings every 5 min
6. **Render spin-down**: free tier sleeps after 15 min idle — UptimeRobot prevents this during demo
7. **Production deploy**: always run health checks after deploy — fail if service unreachable

## Final Checklist Before Done
- [ ] Actions use v4 (checkout, setup-node) and v5 (setup-python) — not v3
- [ ] ML cron is `0 19 * * *` UTC (not local time)
- [ ] `timeout-minutes: 30` on ML training job
- [ ] No `.env` files committed — only `.env.example`
- [ ] `/health` endpoint has no DB/Redis calls
- [ ] Post-deploy smoke test included in production workflow
- [ ] All required secrets listed in workflow `env:` blocks
