# SMART ECOMMERCE AI SYSTEM

## Overview
**SMART ECOMMERCE AI SYSTEM** is an advanced, AI-powered e-commerce platform designed to personalize the shopping experience for users, while simultaneously providing robust marketing automation tools for administrators.

Currently, this repository contains the **design documentation and architecture**. The project is structured as a monorepo consisting of:
- **Express.js Backend** (Monolith) 
- **Next.js Frontend** 
- **FastAPI AI Service** (Sidecar for ML models)

## Architecture Overview
The system follows a Modular Monolith architecture for the core backend (Express.js), keeping boundaries well-defined by domains (Auth, Catalog, Cart, Order, Recs, etc.). The AI components are decoupled into a separate pure-ML Python FastAPI service.

**Deployable Units:**
1. `apps/api/` - Express.js API (Render.com)
2. `apps/web/` - Next.js 15 Web App (Vercel)
3. `apps/ai-service/` - FastAPI + Celery ML Service (Render.com)
4. `libs/shared/` - Shared types, DTOs, and constants

## Project Documentation
All the design, requirements, and constraints are thoroughly documented in the `docs/` folder. Please read them in the following order before scaffolding any code:

1. [**REQUIREMENTS.md**](docs/REQUIREMENTS.md) - Business goals, functional/non-functional requirements, and user stories.
2. [**TECH_STACK.md**](docs/TECH_STACK.md) - Decision logs and technology choices (MongoDB, Redis, Express.js, Quick setup configs).
3. [**ARCHITECTURE.md**](docs/ARCHITECTURE.md) - System Component Diagram, deployment models, AI-Integration patterns, and circuit breaker details.
4. [**MODULE_STRUCTURE.md**](docs/MODULE_STRUCTURE.md) - The specific directory structure mapped to Express.js Module conventions.
5. [**DATABASE_DESIGN.md**](docs/DATABASE_DESIGN.md) - MongoDB complete schema definitions (Mongoose TypeScript) and NoSQL modeling patterns.
6. [**AI_LAYER_ARCHITECTURE.md**](docs/AI_LAYER_ARCHITECTURE.md) - Instructions for Vibe Coding and AI coding agent integration via `.claude/commands/`.

## AI Skill Agents (Claude Code)
This repository contains a set of pre-configured "Skill Agents" inside `.claude/commands/` which act as custom agents to help write perfectly-aligned code.

Refer to [**CLAUDE.md**](CLAUDE.md) for the complete list of slash commands available for developers using Claude.

## Infrastructure Stack
* **Database:** MongoDB Atlas M0 (Free Tier)
* **Cache/Broker:** Upstash Redis 7
* **Search:** Meilisearch Cloud
* **Object Storage:** Cloudflare R2
* **Payment Sandbox:** VNPay

## Getting Started (Local Development)
Once the application code gets scaffolded, you can use docker to boot the local infrastructure:
```bash
docker compose up -d mongodb redis meilisearch
```
See the individual module `package.json` for dev commands.
