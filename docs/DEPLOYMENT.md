# Deployment Guide

Promise Engine has two deployable components: the Promise Pipeline (Next.js) and the Legacy Platform (Flask + React).

---

## Promise Pipeline (Next.js)

### Vercel (Recommended)

1. Import the repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `promise-pipeline`
3. Add environment variables:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   OPENSTATES_API_KEY=...  (optional)
   ```
4. Deploy

### Self-hosted

```bash
cd promise-pipeline
npm install
npm run build
npm start  # Runs on :3000
```

---

## Legacy Platform

### Architecture

```
Frontend (React)  →  Vercel
Backend (Flask)   →  Railway / Render / Fly.io
Database          →  PostgreSQL (managed)
```

### Backend Deployment

The backend includes configuration for Railway (`railway.json`, `Procfile`, `start.sh`) but can run anywhere that supports Python.

**Environment variables:**

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:port/dbname
SECRET_KEY=<random-64-char-hex>
FLASK_ENV=production
FLASK_DEBUG=False

# Optional
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGINS=https://your-frontend-domain.com
```

**Generate a secret key:**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Deploy steps:**
1. Set up a managed PostgreSQL database
2. Deploy the `backend/` directory to your platform
3. Set environment variables
4. Migrations run automatically on startup

### Frontend Deployment

**Vercel:**
1. Import repo, set root directory to `frontend`
2. Build command: `cd frontend && CI=false npm run build`
3. Output directory: `frontend/build`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url/api/v1
   ```

### Database Setup

```bash
# Create database
createdb promise_engine_dev

# Migrations run automatically on app startup
# Or manually:
cd backend
python -m alembic upgrade head
```

### Seed Data

```bash
cd backend
python scripts/seed_hb2021.py
```

---

## Post-Deploy Checklist

- [ ] Backend health check: `curl https://your-backend/api/v1/promise/schemas`
- [ ] Frontend loads and displays correctly
- [ ] API calls succeed (check browser network tab for CORS errors)
- [ ] SSL certificates active
- [ ] Database migrations ran successfully
