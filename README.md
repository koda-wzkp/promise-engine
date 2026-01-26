# Promise Engine

A promise-based collaboration platform for creative work.

## Overview

Promise Engine is a platform where creators make promises about their work, and projects make promises about how they'll use it. Built on promise theory, it enables transparent, trust-based creative collaboration.

## Architecture

- **Backend**: Python/Flask + PostgreSQL
- **Frontend**: React
- **Deployment**: Vercel (promise.pleco.dev)
- **Database**: PostgreSQL
- **Payments**: Stripe Connect

## Development

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

## Project Status

**Current Phase**: Beta setup
**Launch Target**: This week at promise.pleco.dev

## License

Proprietary
