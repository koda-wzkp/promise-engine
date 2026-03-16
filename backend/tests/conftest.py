"""conftest.py — shared fixtures for HB2021 tests."""

import sys
import os
import pytest

# Ensure backend is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


@pytest.fixture
def verifier():
    """Fresh EmissionsTrajectoryVerifier with default tolerance."""
    from app.promise_engine.verticals.hb2021.verification import EmissionsTrajectoryVerifier

    return EmissionsTrajectoryVerifier(tolerance_pct=5.0)


@pytest.fixture
def strict_verifier():
    """Verifier with zero tolerance — no margin for error."""
    from app.promise_engine.verticals.hb2021.verification import EmissionsTrajectoryVerifier

    return EmissionsTrajectoryVerifier(tolerance_pct=0.0)


@pytest.fixture
def schemas():
    """All HB2021 promise schemas."""
    from app.promise_engine.verticals.hb2021.schemas import HB2021_SCHEMAS

    return HB2021_SCHEMAS


@pytest.fixture
def agents():
    """All HB2021 agents."""
    from app.promise_engine.verticals.hb2021.agents import HB2021_AGENTS

    return HB2021_AGENTS


@pytest.fixture
def app():
    """Flask test application."""
    from app import create_app

    test_app = create_app(
        {
            "TESTING": True,
            "DATABASE_URL": os.environ.get("DATABASE_URL", "sqlite:///test.db"),
        }
    )
    return test_app


@pytest.fixture
def client(app):
    """Flask test client."""
    return app.test_client()
