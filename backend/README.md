# Promise Engine Backend

Flask API server for Promise Engine.

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Create database
createdb promise_engine_dev

# Run migrations (automatic on startup)
python run.py
```

## Development

```bash
# Start server
python run.py

# Run tests
pytest

# Run with coverage
pytest --cov=app tests/

# Format code
black app/

# Lint
flake8 app/
```

## API Structure

- `/api/auth/*` - Authentication endpoints
- `/api/beta/*` - Beta signup

## Database Migrations

Migrations run automatically on app startup. To run manually:

```bash
# Run migrations
python -m alembic upgrade head

# Create new migration
python -m alembic revision --autogenerate -m "description"

# Rollback
python -m alembic downgrade -1
```

## Environment Variables

See `.env.example` for required configuration.
