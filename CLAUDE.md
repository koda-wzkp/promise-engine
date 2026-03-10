# CLAUDE.md — Promise Engine

Universal auditing infrastructure built on Promise Theory. Tracks promises made by AI systems, businesses, and organizations, computes integrity scores, and generates labeled training data automatically. Live at https://promise.pleco.dev.

## Tech Stack

**Backend:** Python 3.9.6, Flask 3.0.0, SQLAlchemy 2.0.25, Alembic 1.13.1, PostgreSQL
**Frontend:** React 18.2.0, react-router-dom 7.12.0, Create React App
**Auth:** JWT (PyJWT) + bcrypt | **Payments:** Stripe | **Email:** SendGrid
**Deploy:** Frontend on Vercel, Backend on Railway

## Project Structure

```
backend/app/
├── __init__.py                     # Flask app factory, blueprint registration
├── config.py                       # Config classes (Dev/Test/Prod)
├── database.py                     # SQLAlchemy engine + session management
├── api/
│   ├── auth.py                     # POST /register, /login, GET /me
│   ├── beta.py                     # POST /signup (beta email collection)
│   └── promise.py                  # Core promise verify/integrity/schemas endpoints
├── models/
│   ├── user.py                     # User model with Stripe fields
│   └── beta_signup.py              # Beta signup model
├── promise_engine/
│   ├── core/
│   │   ├── engine.py               # Promise Engine kernel (register, verify, integrity)
│   │   └── models.py               # Agent, PromiseEvent, IntegrityScore, PromiseSchema
│   ├── storage/
│   │   ├── models.py               # SQLAlchemy ORM models
│   │   └── repository.py           # Data access layer (save_event, get_events, etc.)
│   └── verticals/codec/schemas.py  # CODEC vertical promise schemas
└── utils/exceptions.py             # ValidationError, BusinessRuleViolation

frontend/src/
├── App.js                          # Main router and navigation
├── components/                     # CloudBackground.jsx, Scanlines.jsx
├── pages/                          # LandingPage, Login, Register, IntegrityPage, PromisesPage, LivingRoomWines
├── styles/theme.js                 # Design system tokens
└── utils/api.js                    # HTTP client with Bearer token auth
```

Other key files: `backend/run.py` (entry point, auto-runs migrations), `vercel.json` (build config + security headers), `connect-backend.sh` (sets `REACT_APP_API_URL` in Vercel), `docs/THEORY.md`.

## Setup

Backend: `cd backend && pip install -r requirements.txt && cp .env.example .env && python run.py` (port 5000). Frontend: `cd frontend && npm install && npm start` (port 3000, proxies to backend). Env vars: see `backend/.env.example`.

## API Routes (`/api/v1/`)

- **Auth** (`/auth`): `POST /register`, `POST /login` (JWT, 24h), `GET /me`
- **Promise** (`/promise`): `POST /verify`, `GET /integrity/{agent_type}/{agent_id}`, `GET /schemas`, `GET /schemas/{id}`, `GET /health`
- **Beta** (`/beta`): `POST /signup`

## Core Concepts

**Promise Engine Kernel** (`core/engine.py`): `register_schema()`, `verify()` (auto-logs result), `get_integrity()`, `get_events()`.

**Models** (`core/models.py`): **Agent** (PLATFORM/USER/BUSINESS/AI_AGENT), **PromiseEvent** (the fundamental training signal), **PromiseResult** (KEPT/BROKEN/PENDING/BLOCKED/RENEGOTIATED), **IntegrityScore**, **PromiseSchema**.

**Verticals**: Domain-specific schemas added in `verticals/`. Currently: CODEC (coffee/commerce). New domains = new schemas, not core changes.

**POD**: Every verification generates labeled training data. Broken promises are training signals, not just errors.

## Code Quality

```bash
cd backend
black app/          # Format
flake8 app/         # Lint
mypy app/           # Type check
pytest --cov=app    # Tests
```

Migrations: `cd backend && python -m alembic revision --autogenerate -m "description"` (auto-run on startup too).

## Key Patterns

**Error handling** — structured JSON exceptions:
```python
raise ValidationError(message="Email already registered", code="EMAIL_EXISTS", details={...})
```

**Database sessions** — always use context managers:
```python
with get_db() as db:       # Read-only
with transaction() as db:  # Auto-commits or rolls back
```

**API responses** — standard format: `{ "success": bool, "result": {}, "error": { "code", "message", "details" } }`

**Frontend auth** — JWT in `localStorage`, `utils/api.js` auto-attaches Bearer tokens.

## Rules

**Do:** Run `black`/`flake8`/`mypy` before committing. Use context managers for DB access. Follow `ValidationError`/`BusinessRuleViolation` patterns. Add Alembic migrations for schema changes. Keep standard API response format. Add type annotations when in doubt. Comment the "why" not the "what".

**Don't:** Expose secrets (`STRIPE_SECRET_KEY`, `ANTHROPIC_API_KEY`, `SECRET_KEY`) in client code. Write raw SQL outside migrations. Skip migrations for DB changes. Add deps without updating `requirements.txt`/`package.json`. Force push to main.

## Invariants (never violate)

- All DB writes go through API routes, never client-side
- Promise schemas are immutable once published; new versions = new records
- Training data export is append-only, no deletion
- All API routes require auth except public read endpoints
- Trust capital uses stakes weighting, never flat averaging
- CLAUDE.md is source of truth; if code and spec diverge, flag it
- Editorial content in frontend; computational backing in API

## Process

Full development process in [`docs/PROCESS.md`](docs/PROCESS.md). Key points:

- **ADRs**: Significant technical choices get a record in `docs/decisions/` (see PROCESS.md for template)
- **Testing**: Every feature needs unit + integration + axiom tests (Promise Theory properties)
- **Build reports**: Self-review checklist after each session (deviations, debt, invariants, security)
- **Uncertainty**: Choose simpler option, write ADR, flag in build report

## Architecture Decisions

- **PromiseEvent is the gold** — every row is labeled training data. Preserve data integrity above all.
- **JSONB for flexibility** — `input_context`, `schema_json`, `verification_rules` support arbitrary promise domains.
- **Vertical architecture** — new domains = new schemas in `verticals/`, not core engine changes.
- **Recovery is not failure** — broken promises with successful recovery improve integrity scores.
- **Agent autonomy is core** — agents commit what they CAN keep, not aspirational targets.
