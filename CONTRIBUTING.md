# Contributing to Promise Engine

Thanks for your interest in Promise Engine. This guide covers how to get involved.

## Where to Start

The highest-impact contribution right now is **training data** — extracting structured promises from state clean energy legislation. No code required, just careful reading and annotation.

### Labeling Promises

1. Pick a bill from [TRAINING_BILL_CANDIDATES.md](TRAINING_BILL_CANDIDATES.md) (start with Tier 1)
2. Read the labeling schema in [LABELED_DATA_INVENTORY.md](LABELED_DATA_INVENTORY.md)
3. Use the annotation tool (`/annotate` in the promise-pipeline app) or create JSON manually
4. Submit labeled promises as a PR

Each labeled promise should include: promiser, promisee, body (natural language), domain, status, statutory reference, and source text.

### Code Contributions

**Promise Pipeline (Next.js)** — the active development focus:
- Annotation tool improvements
- Network visualization features
- Simulation engine enhancements
- API route development

**Legacy Platform (Flask + React):**
- Backend promise engine improvements
- New promise verticals
- Test coverage

## Development Setup

### Promise Pipeline

```bash
cd promise-pipeline
npm install
cp .env.example .env.local  # Add your ANTHROPIC_API_KEY
npm run dev
```

### Legacy Platform

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
createdb promise_engine_dev
python run.py

# Frontend
cd frontend
npm install
npm start
```

### Running Tests

```bash
cd backend
pytest                    # All tests
pytest --cov=app tests/   # With coverage
```

## Pull Request Process

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run tests if modifying backend code
4. Write a clear PR description explaining what and why
5. Link any related issues

## Code Style

- **Python:** Follow PEP 8. Use `black` for formatting, `flake8` for linting.
- **TypeScript/React:** Follow existing patterns in the codebase. Use Tailwind for styling.
- **Commits:** Write clear, descriptive commit messages. Focus on the "why."

## Reporting Issues

Open an issue on GitHub with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Environment details (OS, Node/Python version)

## Questions?

Open a discussion on GitHub or file an issue. We're happy to help you get started.
