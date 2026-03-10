# CLAUDE.md — Promise Engine

## What This Is

Promise Engine is a universal auditing infrastructure built on Promise Theory. It turns implicit claims into verifiable, measurable commitments. The platform tracks promises made by AI systems, businesses, infrastructure services, and organizations, computes integrity scores, and generates labeled training data automatically.

**Live at:** https://promise.pleco.dev

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.9.6, Flask 3.0.0, SQLAlchemy 2.0.25, Alembic 1.13.1 |
| **Frontend** | React 18.2.0, react-router-dom 7.12.0, Create React App |
| **Database** | PostgreSQL (SQLAlchemy ORM, Alembic migrations) |
| **Auth** | JWT (PyJWT 2.8.0) + bcrypt 4.1.2 |
| **Payments** | Stripe 7.11.0 |
| **Email** | SendGrid 6.11.0 |
| **Validation** | JSON Schema 4.20.0 |
| **Frontend Deploy** | Vercel |
| **Backend Deploy** | Railway |

---

## Project Structure

```
promise-engine/
├── backend/
│   ├── app/
│   │   ├── __init__.py              # Flask app factory, blueprint registration
│   │   ├── config.py                # Config classes (Dev/Test/Prod)
│   │   ├── database.py              # SQLAlchemy engine + session management
│   │   ├── api/
│   │   │   ├── auth.py              # POST /register, /login, GET /me
│   │   │   ├── beta.py              # POST /signup (beta email collection)
│   │   │   └── promise.py           # Core promise verify/integrity/schemas endpoints
│   │   ├── models/
│   │   │   ├── user.py              # User model with Stripe fields
│   │   │   └── beta_signup.py       # Beta signup model
│   │   ├── promise_engine/
│   │   │   ├── core/
│   │   │   │   ├── engine.py        # Promise Engine kernel (register, verify, integrity)
│   │   │   │   └── models.py        # Agent, PromiseEvent, IntegrityScore, PromiseSchema
│   │   │   ├── storage/
│   │   │   │   ├── models.py        # SQLAlchemy ORM models
│   │   │   │   └── repository.py    # Data access layer (save_event, get_events, etc.)
│   │   │   └── verticals/
│   │   │       └── codec/
│   │   │           └── schemas.py   # CODEC vertical promise schemas
│   │   └── utils/
│   │       └── exceptions.py        # ValidationError, BusinessRuleViolation
│   ├── alembic/                     # Database migrations
│   ├── schemas/                     # Promise schema definitions
│   ├── requirements.txt
│   ├── run.py                       # Entry point (runs migrations on startup)
│   ├── test_api.py                  # API test script
│   └── demo_promise_engine.py       # Demo of core Promise Engine flow
├── frontend/
│   ├── src/
│   │   ├── App.js                   # Main router and navigation
│   │   ├── components/
│   │   │   ├── CloudBackground.jsx  # Animated sky/cloud background
│   │   │   └── Scanlines.jsx        # VHS scanline overlay effect
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Homepage with beta signup
│   │   │   ├── Login.jsx            # JWT login form
│   │   │   ├── Register.jsx         # User registration form
│   │   │   ├── IntegrityPage.js     # Integrity score dashboard
│   │   │   ├── PromisesPage.js      # Promise audit log
│   │   │   └── LivingRoomWines.js   # CODEC vertical demo
│   │   ├── styles/
│   │   │   └── theme.js             # Design system tokens
│   │   └── utils/
│   │       └── api.js               # HTTP client with Bearer token auth
│   └── package.json
├── docs/
│   └── THEORY.md                    # Promise Theory foundations
├── vercel.json                      # Vercel build config, rewrites, security headers
└── connect-backend.sh               # Sets REACT_APP_API_URL in Vercel + redeploys
```

---

## Development Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL running locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Create database
createdb promise_engine_dev
# Copy and fill in environment variables
cp .env.example .env
# Run (migrations execute automatically on startup)
python run.py
# Backend runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm start
# Frontend runs on http://localhost:3000
# Proxies API requests to localhost:5000 via package.json "proxy" setting
```

---

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://localhost/promise_engine_dev
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=<random-secret>
JWT_SECRET_KEY=<same-as-SECRET_KEY>
JWT_ACCESS_TOKEN_HOURS=24
JWT_REFRESH_TOKEN_DAYS=30
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=<key>
FROM_EMAIL=noreply@promise.pleco.dev
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### Frontend

In development, the proxy in `package.json` handles API routing. For production, set `REACT_APP_API_URL` in Vercel.

---

## API Routes

All API endpoints are versioned under `/api/v1/`.

### Auth (`/api/v1/auth`)
- `POST /register` — Create user account
- `POST /login` — Get JWT token (24h default)
- `GET /me` — Current user from Bearer token

### Promise Engine (`/api/v1/promise`)
- `POST /verify` — Verify a promise against its schema, auto-logs result
- `GET /integrity/{agent_type}/{agent_id}` — Get integrity score for an agent
- `GET /schemas` — List all registered promise schemas
- `GET /schemas/{schema_id}` — Get specific schema
- `GET /health` — Health check

### Beta (`/api/v1/beta`)
- `POST /signup` — Collect beta signup email

---

## Core Concepts

### Promise Engine Kernel (`core/engine.py`)
The central system. Key methods:
- `register_schema(schema)` — Register a promise type definition
- `verify(schema_id, promiser, promisee, input_context)` — Verify a promise and auto-log
- `get_integrity(agent)` — Compute trust score for an agent
- `get_events()` — Query promise events with filters

### Key Models (`core/models.py`)
- **Agent** — Entity making/receiving promises. Types: `PLATFORM`, `USER`, `BUSINESS`, `AI_AGENT`
- **PromiseEvent** — Single promise instance (the fundamental training signal)
- **PromiseResult** — Enum: `KEPT`, `BROKEN`, `PENDING`, `BLOCKED`, `RENEGOTIATED`
- **IntegrityScore** — Trust metric: overall score, trends, trust capital, recovery rate
- **PromiseSchema** — Promise type definition with JSON schema + verification rules

### Verticals
Domain-specific promise schemas. Currently implemented: **CODEC** (coffee/commerce).
- `codec.grind_roast_compatibility` — Validates grind size matches roast level

### Promise-Oriented Development (POD)
Every promise verification generates labeled training data automatically. A broken promise is a training signal, not just an error.

---

## Database

### Key Tables
- `promise_events` — Core table, every promise verification result (heavily indexed)
- `promise_schemas` — Schema registry for promise types
- `integrity_scores` — Cached trust metrics per agent
- `agents` — Canonical agent registry
- `users` — User accounts with Stripe fields
- `beta_signups` — Beta email collection
- `journeys` / `touchpoints` — Customer experience tracking

### Migrations
Alembic manages migrations in `backend/alembic/`. Migrations run automatically on app startup via `run.py`. To run manually:

```bash
cd backend
python -m alembic upgrade head
```

---

## Code Quality

```bash
cd backend

# Format
black app/

# Lint
flake8 app/

# Type check
mypy app/

# Tests
pytest
pytest --cov=app
```

Frontend uses the default `react-app` ESLint config.

---

## Key Patterns

### Error Handling
Custom exceptions return structured JSON:
```python
raise ValidationError(message="Email already registered", code="EMAIL_EXISTS", details={...})
```

### Database Sessions
Use context managers from `database.py`:
```python
with get_db() as db:
    user = db.query(User).filter_by(email=email).first()

with transaction() as db:
    db.add(event)  # Auto-commits or rolls back
```

### API Response Format
```json
{
  "success": true,
  "result": { ... },
  "error": { "code": "ERROR_CODE", "message": "...", "details": {} }
}
```

### Frontend Auth
JWT tokens stored in `localStorage`. The `utils/api.js` client auto-attaches Bearer tokens to requests.

---

## Deployment

### Frontend (Vercel)
- **Build:** `cd frontend && CI=false npm run build`
- **Output:** `frontend/build`
- **Install:** `cd frontend && npm ci`
- **Rewrites:** SPA catch-all → `/index.html`
- **Headers:** X-Frame-Options DENY, X-Content-Type-Options nosniff, strict Referrer-Policy

### Backend (Railway)
- **Runtime:** Python 3.9.6
- **Entry:** `python run.py`
- **Root:** `/backend`
- **Database:** PostgreSQL addon
- **Auto-deploy:** On git push

### Connecting Frontend to Backend
Use `connect-backend.sh` to set `REACT_APP_API_URL` in Vercel and trigger redeployment.

---

## Guidelines for AI Assistants

### Do
- Run `black app/` before committing Python changes
- Run `flake8 app/` and `mypy app/` to check for issues
- Use context managers (`get_db()`, `transaction()`) for all database access
- Follow the existing error handling pattern with `ValidationError` / `BusinessRuleViolation`
- Keep API responses in the standard `{ success, result, error }` format
- Add Alembic migrations for any schema changes: `cd backend && python -m alembic revision --autogenerate -m "description"`
- Test endpoints with `pytest`

### Don't
- Expose `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `ANTHROPIC_API_KEY`, or `SECRET_KEY` in client code
- Write raw SQL outside of migrations — use SQLAlchemy ORM
- Skip migrations for database schema changes
- Add new dependencies without updating `requirements.txt` or `package.json`
- Modify `vercel.json` security headers without good reason
- Use `git push --force` to main/master

### Architecture Decisions
- **PromiseEvent is the gold** — every row is labeled training data. Preserve data integrity above all.
- **JSONB for flexibility** — `input_context`, `schema_json`, `verification_rules` are all JSONB to support arbitrary promise domains
- **Vertical architecture** — new domains are added by defining schemas in `verticals/`, not by changing core engine
- **Recovery is not failure** — broken promises with successful recovery actions improve integrity scores
- **Agent autonomy is core** — agents commit what they CAN keep, not aspirational targets
