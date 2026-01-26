# Promise Engine - Setup Guide

## Quick Start

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb promise_engine_dev

# (Optional) Create test database
createdb promise_engine_test
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set:
#   - DATABASE_URL=postgresql://localhost/promise_engine_dev
#   - SECRET_KEY=<generate a random string>
#   - STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY (from Stripe dashboard)

# Run migrations (automatic on first run)
python run.py
```

Backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run on http://localhost:3000

The frontend proxies API requests to http://localhost:5000, so make sure the backend is running.

## Verify Installation

1. **Backend Health Check**
   - Visit http://localhost:5000/api/v1/auth/me
   - Should return: `{"error": {"code": "UNAUTHORIZED", ...}}`

2. **Frontend Health Check**
   - Visit http://localhost:3000
   - Should see landing page with sky/cloud theme
   - Test beta signup form

3. **Database Check**
   ```bash
   psql promise_engine_dev
   \dt  # Should show: users, beta_signups, alembic_version
   ```

## Development Workflow

### Backend

```bash
cd backend

# Start server (auto-reloads on changes)
python run.py

# Run tests
pytest

# Create new migration
python -m alembic revision --autogenerate -m "description"

# Format code
black app/

# Lint
flake8 app/
```

### Frontend

```bash
cd frontend

# Start dev server (auto-reloads on changes)
npm start

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

### Backend (.env)

```bash
# Required
DATABASE_URL=postgresql://localhost/promise_engine_dev
SECRET_KEY=<random-secret-key>

# Stripe (required for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional
FLASK_ENV=development
FLASK_DEBUG=True
JWT_ACCESS_TOKEN_HOURS=24
SENDGRID_API_KEY=<your-key>
FROM_EMAIL=noreply@promise.pleco.dev
```

### Frontend

The frontend uses `http://localhost:5000` for local development. To change:

```bash
# Create .env.local in frontend/ directory
REACT_APP_API_URL=http://your-backend-url
```

## Deployment

### Vercel (Frontend)

1. Push to GitHub
2. Connect repository to Vercel
3. Set build command: `cd frontend && CI=false npm run build`
4. Set output directory: `frontend/build`
5. Deploy

### Backend Deployment

The backend can be deployed to:
- Railway (recommended)
- Render
- Heroku
- AWS/GCP/Azure

Set environment variables in your hosting platform's dashboard.

## Troubleshooting

### "Database not initialized" error
- Make sure PostgreSQL is running: `pg_ctl status`
- Verify database exists: `psql -l | grep promise_engine`
- Check DATABASE_URL in .env

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify proxy setting in package.json

### Migration errors
- Drop and recreate database if needed (dev only):
  ```bash
  dropdb promise_engine_dev
  createdb promise_engine_dev
  python run.py
  ```

## Next Steps

1. Create database (see above)
2. Set up backend environment
3. Run backend server
4. Set up frontend environment
5. Run frontend dev server
6. Visit http://localhost:3000 and test!

For production deployment, see Vercel configuration in `vercel.json`.
