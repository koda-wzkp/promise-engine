# Promise Engine

**Universal Auditing Infrastructure for AI, IoT, and Beyond**

Audit everything that makes promises. Trust, but verify. Automatically.

## Overview

Promise Engine is the accountability layer for systems that make promises. AI models promise not to hallucinate. Smart locks promise to secure your home. Cloud services promise 99.9% uptime. Supply chains promise on-time delivery.

We make those promises auditable.

Built on [Promise Theory](https://en.wikipedia.org/wiki/Promise_theory), Promise Engine turns implicit claims into verifiable commitments. Every promise becomes measurable. Every failure becomes a training signal.

## Use Cases

### 🤖 AI/ML Auditing
- Track hallucinations, policy violations, and model drift
- Compliance for EU AI Act, SOC2, ISO 42001
- Generate training data from failures
- Prove your AI does what you claim

### 🏠 IoT & Smart Home
- "Did my lock actually lock at 11pm?"
- Monitor device reliability over time
- Home Assistant integration
- Building management at scale

### ☁️ Infrastructure & SLAs
- Verify uptime, latency, and performance claims
- Alert before breaches become incidents
- Track vendor accountability
- Automated SLA auditing

### 📦 Supply Chain & Commerce
- Verify delivery timelines
- Audit sustainability claims
- End-to-end shipment tracking
- CODEC: Coffee subscription management (first vertical)

### 🌱 Land Stewardship (Coming Soon)
- Track restoration commitments
- Verify regeneration claims
- Indigenous data sovereignty
- Route reparations directly

## How It Works

1. **DEFINE** - Promise schemas for your domain
2. **MONITOR** - Every event flows through Promise Engine
3. **VERIFY** - Automatic verification against schema
4. **IMPROVE** - Integrity scores, alerts, training signal

## Architecture

- **Backend**: Python/Flask + PostgreSQL
- **Frontend**: React
- **Deployment**: Vercel (frontend) + Railway (backend)
- **Database**: PostgreSQL with JSONB for flexible promise storage
- **Validation**: JSON Schema for promise definitions

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
python run.py
```

Backend runs on http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on http://localhost:3000

### Database

```bash
# Create database
createdb promise_engine_dev

# Migrations run automatically on app startup
# Or manually: python -m alembic upgrade head
```

## Promise Schemas

Promise Engine uses JSON Schema to define promise types. Example schemas:

- **ML**: `schemas/ml/hallucination_check.json`, `schemas/ml/policy_adherence.json`
- **IoT**: `schemas/iot/state_verification.json`, `schemas/iot/schedule_adherence.json`
- **Infrastructure**: `schemas/infra/uptime_sla.json`, `schemas/infra/latency_sla.json`
- **Supply Chain**: `schemas/codec/grind_roast_promise.json` (CODEC vertical)

Create custom schemas for your domain. See `/backend/schemas/` for examples.

## API

### Core Endpoints

```bash
# Create a promise
POST /api/v1/promise
{
  "agent_type": "platform",
  "agent_id": "my-service",
  "vertical": "infra",
  "promise_type": "uptime_sla",
  "promise_schema": "uptime_sla_v1",
  "promise_data": { ... }
}

# Verify a promise
POST /api/v1/promise/:id/verify
{
  "verification_data": { ... }
}

# Get integrity score
GET /api/v1/integrity?agent_type=platform&agent_id=my-service
```

See full API docs at `/backend/README.md`

## Production Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

Live at: https://promise.pleco.dev

### Backend (Railway)

1. Connect Railway to GitHub repo
2. Set root directory to `backend`
3. Add PostgreSQL addon
4. Set environment variables (see `.env.example`)
5. Railway auto-deploys on push

### Connect Frontend to Backend

```bash
# Set backend URL in Vercel
cd frontend
vercel env add REACT_APP_API_URL production
# Enter your Railway backend URL
vercel --prod
```

## Verticals

Promise Engine supports domain-specific "verticals" with custom schemas:

- **CODEC**: Coffee roaster subscription management (live in production)
- **ML/AI**: Hallucination tracking, policy compliance
- **IoT**: Device state verification, schedule adherence
- **Infrastructure**: SLA monitoring, uptime/latency tracking
- **Supply Chain**: Delivery promises, sustainability audits

Create custom verticals by defining schemas in `/backend/schemas/[vertical_name]/`

## Roadmap

- [x] Core promise engine (create, verify, query)
- [x] Integrity scoring system
- [x] CODEC vertical (coffee roasters)
- [x] Production deployment (promise.pleco.dev)
- [x] Universal auditing positioning
- [x] Multi-domain schemas (ML, IoT, Infrastructure)
- [ ] Real-time alerting (Slack, webhooks)
- [ ] Training data export for ML workflows
- [ ] Home Assistant integration
- [ ] EU AI Act compliance reporting
- [ ] Promise Theory whitepaper

## Contributing

Promise Engine is currently in private beta. For access or partnership inquiries:

- Email: hello@pleco.dev
- Discord: https://discord.gg/pleco
- Twitter: [@pleco_dev](https://twitter.com/pleco_dev)

## Philosophy

> "The world runs on promises. We make them auditable."

Everything makes promises. Most systems can't prove they keep them. Promise Engine fixes that.

Built on Promise Theory (Burgess, 2004), we believe:
- Autonomous agents make promises, not demands
- Verification is continuous, not one-time
- Failed promises are learning opportunities
- Accountability scales trust

## License

Proprietary. © 2026 Pleco

---

**Current Status**: Live in production at [promise.pleco.dev](https://promise.pleco.dev)
