"""Tests for Promise Engine core features: export, trust capital, events, recovery.

These test the features that fulfill POD's own promises:
- Training data export (POD's core value proposition)
- Trust capital (stakes-weighted integrity)
- Event history query
- Recovery workflow
"""

import pytest
import json
from datetime import datetime, timedelta
from uuid import uuid4

from app.promise_engine.core.models import (
    Agent, AgentType, PromiseEvent, PromiseResult,
    PromiseSchema, SignalStrength, VerificationResult,
    IntegrityScore,
)
from app.promise_engine.storage.repository import PromiseRepository


# ============================================================
# FIXTURES
# ============================================================

@pytest.fixture
def db_session():
    """In-memory SQLite session for testing.

    Uses event listener to map JSONB → JSON for SQLite compatibility.
    """
    from sqlalchemy import create_engine, event as sa_event, JSON
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.dialects.postgresql import JSONB
    from app.database import Base

    engine = create_engine("sqlite:///:memory:")

    # Map JSONB to JSON for SQLite
    @sa_event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_conn, connection_record):
        pass

    # Patch JSONB columns to use JSON for SQLite
    for table in Base.metadata.tables.values():
        for column in table.columns:
            if isinstance(column.type, JSONB):
                column.type = JSON()

    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def repo(db_session):
    """Repository with in-memory DB."""
    return PromiseRepository(db_session)


@pytest.fixture
def pge():
    return Agent(type=AgentType.BUSINESS, id="pge", metadata={"name": "PGE"})


@pytest.fixture
def ratepayers():
    return Agent(type=AgentType.COMMUNITY, id="ratepayers", metadata={"name": "Ratepayers"})


@pytest.fixture
def high_stakes_schema(repo, db_session):
    """Register a high-stakes schema in the test DB."""
    from app.promise_engine.storage.models import PromiseSchemaDB

    schema = PromiseSchemaDB(
        id="hb2021.emissions_target",
        version=1,
        vertical="hb2021",
        name="Emissions Target",
        description="Test",
        commitment_type="emissions_reduction",
        stakes="high",
        schema_json={"type": "object", "properties": {}},
        verification_type="automatic",
        verification_rules={"rules": []},
        training_eligible=True,
        domain_tags=["test"],
        created_at=datetime.utcnow(),
    )
    db_session.add(schema)
    db_session.commit()
    return schema


@pytest.fixture
def low_stakes_schema(repo, db_session):
    """Register a low-stakes schema in the test DB."""
    from app.promise_engine.storage.models import PromiseSchemaDB

    schema = PromiseSchemaDB(
        id="codec.grind_check",
        version=1,
        vertical="codec",
        name="Grind Check",
        description="Test",
        commitment_type="config",
        stakes="low",
        schema_json={"type": "object", "properties": {}},
        verification_type="automatic",
        verification_rules={"rules": []},
        training_eligible=True,
        domain_tags=["test"],
        created_at=datetime.utcnow(),
    )
    db_session.add(schema)
    db_session.commit()
    return schema


def _make_event(
    promiser, promisee, schema_id="hb2021.emissions_target",
    result=PromiseResult.KEPT, vertical="hb2021",
    training_eligible=True, exported_at=None,
    timestamp=None, due_by=None,
):
    """Helper to create a test PromiseEvent."""
    return PromiseEvent(
        id=uuid4(),
        timestamp=timestamp or datetime.utcnow(),
        vertical=vertical,
        promise_schema_id=schema_id,
        promise_version=1,
        promiser=promiser,
        promisee=promisee,
        input_context={"test": True},
        output={},
        result=result,
        signal_strength=SignalStrength.IMPLICIT,
        due_by=due_by,
        training_eligible=training_eligible,
        exported_at=exported_at,
    )


# ============================================================
# TRAINING DATA EXPORT
# ============================================================

class TestTrainingDataExport:
    """POD's core promise: every event becomes a labeled training signal."""

    def test_unexported_events_returned(self, repo, pge, ratepayers, high_stakes_schema):
        """Unexported, resolved, training-eligible events are returned."""
        event = _make_event(pge, ratepayers, result=PromiseResult.KEPT)
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        repo.save_event(event)

        unexported = repo.get_unexported_events()
        assert len(unexported) == 1
        assert str(unexported[0].id) == str(event.id)

    def test_pending_events_excluded(self, repo, pge, ratepayers, high_stakes_schema):
        """Pending events should NOT be exported (no label yet)."""
        event = _make_event(pge, ratepayers, result=PromiseResult.PENDING)
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        repo.save_event(event)

        unexported = repo.get_unexported_events()
        assert len(unexported) == 0

    def test_already_exported_excluded(self, repo, pge, ratepayers, high_stakes_schema):
        """Already-exported events should not be returned."""
        event = _make_event(pge, ratepayers, exported_at=datetime.utcnow())
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        repo.save_event(event)

        unexported = repo.get_unexported_events()
        assert len(unexported) == 0

    def test_non_training_eligible_excluded(self, repo, pge, ratepayers, high_stakes_schema):
        """Events marked training_eligible=False should not be exported."""
        event = _make_event(pge, ratepayers, training_eligible=False)
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        repo.save_event(event)

        unexported = repo.get_unexported_events()
        assert len(unexported) == 0

    def test_mark_exported(self, repo, pge, ratepayers, high_stakes_schema):
        """mark_exported should set exported_at on events."""
        event = _make_event(pge, ratepayers)
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        repo.save_event(event)

        count = repo.mark_exported([event.id])
        assert count == 1

        # Should no longer appear in unexported
        unexported = repo.get_unexported_events()
        assert len(unexported) == 0

    def test_mark_exported_idempotent(self, repo, pge, ratepayers, high_stakes_schema):
        """Marking already-exported events should succeed (idempotent)."""
        event = _make_event(pge, ratepayers)
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        repo.save_event(event)

        repo.mark_exported([event.id])
        count = repo.mark_exported([event.id])  # Second time
        assert count == 1  # Updated again (no error)

    def test_mark_exported_empty_list(self, repo):
        """Marking empty list should return 0."""
        assert repo.mark_exported([]) == 0

    def test_vertical_filter(self, repo, pge, ratepayers, high_stakes_schema, low_stakes_schema):
        """Export should respect vertical filter."""
        e1 = _make_event(pge, ratepayers, schema_id="hb2021.emissions_target", vertical="hb2021")
        e2 = _make_event(pge, ratepayers, schema_id="codec.grind_check", vertical="codec")
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        repo.save_event(e1)
        repo.save_event(e2)

        hb_events = repo.get_unexported_events(vertical="hb2021")
        assert len(hb_events) == 1
        assert hb_events[0].vertical == "hb2021"

    def test_export_stats(self, repo, pge, ratepayers, high_stakes_schema):
        """Export stats should reflect current state."""
        e1 = _make_event(pge, ratepayers)
        e2 = _make_event(pge, ratepayers)
        e3 = _make_event(pge, ratepayers, result=PromiseResult.PENDING)
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        repo.save_event(e1)
        repo.save_event(e2)
        repo.save_event(e3)

        stats = repo.get_export_stats()
        assert stats["total_eligible"] == 3
        assert stats["pending_export"] == 2  # e1, e2 (e3 is pending)
        assert stats["exported"] == 0

        repo.mark_exported([e1.id])
        stats = repo.get_export_stats()
        assert stats["exported"] == 1
        assert stats["pending_export"] == 1

    def test_export_preserves_label(self, repo, pge, ratepayers, high_stakes_schema):
        """Exported data should have the correct label (kept/broken/etc)."""
        kept = _make_event(pge, ratepayers, result=PromiseResult.KEPT)
        broken = _make_event(pge, ratepayers, result=PromiseResult.BROKEN)
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        repo.save_event(kept)
        repo.save_event(broken)

        events = repo.get_unexported_events()
        labels = {e.result for e in events}
        assert labels == {"kept", "broken"}


# ============================================================
# TRUST CAPITAL (Stakes-Weighted Scoring)
# ============================================================

class TestTrustCapital:
    """Trust capital weights integrity by promise stakes."""

    def test_all_high_stakes_kept(self, repo, pge, ratepayers, high_stakes_schema):
        """All high-stakes promises kept → trust_capital = 1.0."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)

        for _ in range(5):
            repo.save_event(_make_event(pge, ratepayers, result=PromiseResult.KEPT))

        score = repo.compute_integrity(pge)
        assert score.trust_capital == 1.0

    def test_all_high_stakes_broken(self, repo, pge, ratepayers, high_stakes_schema):
        """All high-stakes promises broken → trust_capital = 0.0."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)

        for _ in range(5):
            repo.save_event(_make_event(pge, ratepayers, result=PromiseResult.BROKEN))

        score = repo.compute_integrity(pge)
        assert score.trust_capital == 0.0

    def test_high_stakes_weighted_more(
        self, repo, pge, ratepayers, high_stakes_schema, low_stakes_schema
    ):
        """High-stakes broken should hurt more than low-stakes broken."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)

        # 1 high-stakes kept + 1 low-stakes broken
        repo.save_event(_make_event(
            pge, ratepayers, schema_id="hb2021.emissions_target",
            result=PromiseResult.KEPT,
        ))
        repo.save_event(_make_event(
            pge, ratepayers, schema_id="codec.grind_check",
            vertical="codec", result=PromiseResult.BROKEN,
        ))

        score = repo.compute_integrity(pge)
        # high kept: weight 3, low broken: weight 1
        # trust_capital = 3 / (3+1) = 0.75
        assert score.trust_capital == 0.75

    def test_pending_events_not_counted(self, repo, pge, ratepayers, high_stakes_schema):
        """Pending events should not affect trust capital."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)

        repo.save_event(_make_event(pge, ratepayers, result=PromiseResult.KEPT))
        repo.save_event(_make_event(pge, ratepayers, result=PromiseResult.PENDING))

        score = repo.compute_integrity(pge)
        assert score.trust_capital == 1.0  # Only the kept event counts

    def test_no_events_zero_capital(self, repo, pge):
        """No events → trust_capital = 0.0."""
        score = repo.compute_integrity(pge)
        assert score.trust_capital == 0.0


# ============================================================
# RECOVERY WORKFLOW
# ============================================================

class TestRecovery:
    """Recovery turns broken promises into renegotiated ones."""

    def test_recover_broken_promise(self, repo, pge, ratepayers, high_stakes_schema):
        """Recovery on a broken promise should update fields."""
        event = _make_event(pge, ratepayers, result=PromiseResult.BROKEN)
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        repo.save_event(event)

        recovered = repo.log_recovery(
            event_id=event.id,
            recovery_action="new_renewable_procurement",
            recovery_outcome="resolved",
        )

        assert recovered is not None
        assert recovered.recovery_action == "new_renewable_procurement"
        assert recovered.recovery_outcome == "resolved"
        assert recovered.recovery_at is not None
        assert recovered.result == "renegotiated"  # Status changed

    def test_cannot_recover_kept_promise(self, repo, pge, ratepayers, high_stakes_schema):
        """Recovery should only work on broken promises."""
        event = _make_event(pge, ratepayers, result=PromiseResult.KEPT)
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        repo.save_event(event)

        result = repo.log_recovery(
            event_id=event.id,
            recovery_action="unnecessary",
            recovery_outcome="resolved",
        )
        assert result is None

    def test_failed_recovery_keeps_broken(self, repo, pge, ratepayers, high_stakes_schema):
        """Failed recovery should not change status from broken."""
        event = _make_event(pge, ratepayers, result=PromiseResult.BROKEN)
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        repo.save_event(event)

        recovered = repo.log_recovery(
            event_id=event.id,
            recovery_action="attempted_fix",
            recovery_outcome="failed",
        )

        assert recovered is not None
        assert recovered.result == "broken"  # Still broken
        assert recovered.recovery_action == "attempted_fix"

    def test_recover_nonexistent_event(self, repo):
        """Recovery on nonexistent event returns None."""
        result = repo.log_recovery(
            event_id=uuid4(),
            recovery_action="fix",
            recovery_outcome="resolved",
        )
        assert result is None

    def test_recovery_changes_event_counts(self, repo, pge, ratepayers, high_stakes_schema):
        """Recovering a broken promise changes it to renegotiated,
        reducing broken_count and increasing renegotiated_count."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)

        # 1 kept + 1 broken
        repo.save_event(_make_event(pge, ratepayers, result=PromiseResult.KEPT))
        broken_event = _make_event(pge, ratepayers, result=PromiseResult.BROKEN)
        repo.save_event(broken_event)

        score_before = repo.compute_integrity(pge)
        assert score_before.broken_count == 1
        assert score_before.renegotiated_count == 0

        # Recover the broken one → status changes to renegotiated
        repo.log_recovery(broken_event.id, "fix", "resolved")

        score_after = repo.compute_integrity(pge)
        assert score_after.broken_count == 0
        assert score_after.renegotiated_count == 1
        # Overall score unchanged (kept/resolved = 1/2)
        assert score_after.overall_score == score_before.overall_score


# ============================================================
# EVENTS QUERY
# ============================================================

class TestEventsQuery:
    """Test event querying with filters."""

    def test_query_all_events(self, repo, pge, ratepayers, high_stakes_schema):
        """Query all events returns everything."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        for _ in range(5):
            repo.save_event(_make_event(pge, ratepayers))

        events = repo.get_events()
        assert len(events) == 5

    def test_filter_by_vertical(self, repo, pge, ratepayers, high_stakes_schema, low_stakes_schema):
        """Filter events by vertical."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        repo.save_event(_make_event(pge, ratepayers, vertical="hb2021"))
        repo.save_event(_make_event(pge, ratepayers, vertical="codec", schema_id="codec.grind_check"))

        hb_events = repo.get_events(vertical="hb2021")
        assert len(hb_events) == 1

    def test_filter_by_result(self, repo, pge, ratepayers, high_stakes_schema):
        """Filter events by result."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        repo.save_event(_make_event(pge, ratepayers, result=PromiseResult.KEPT))
        repo.save_event(_make_event(pge, ratepayers, result=PromiseResult.BROKEN))
        repo.save_event(_make_event(pge, ratepayers, result=PromiseResult.BROKEN))

        broken = repo.get_events(result=PromiseResult.BROKEN)
        assert len(broken) == 2

    def test_filter_by_agent(self, repo, pge, ratepayers, high_stakes_schema):
        """Filter events by agent (as promiser or promisee)."""
        other = Agent(type=AgentType.BUSINESS, id="pacificorp")
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        repo.save_agent(other)

        repo.save_event(_make_event(pge, ratepayers))
        repo.save_event(_make_event(other, ratepayers))

        pge_events = repo.get_events(agent=pge)
        assert len(pge_events) == 1

    def test_limit_respected(self, repo, pge, ratepayers, high_stakes_schema):
        """Limit parameter caps results."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)
        for _ in range(10):
            repo.save_event(_make_event(pge, ratepayers))

        events = repo.get_events(limit=3)
        assert len(events) == 3

    def test_events_ordered_by_timestamp_desc(self, repo, pge, ratepayers, high_stakes_schema):
        """Events should be returned newest first."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)

        old = _make_event(pge, ratepayers, timestamp=datetime(2020, 1, 1))
        new = _make_event(pge, ratepayers, timestamp=datetime(2025, 1, 1))
        repo.save_event(old)
        repo.save_event(new)

        events = repo.get_events()
        assert events[0].timestamp > events[1].timestamp


# ============================================================
# OVERDUE PROMISES
# ============================================================

class TestOverdue:
    """Overdue detection: pending promises past their due_by date."""

    def test_overdue_returns_past_due_pending(self, repo, pge, ratepayers, high_stakes_schema):
        """Pending events with due_by in the past are overdue."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)

        past_due = _make_event(
            pge, ratepayers, result=PromiseResult.PENDING,
            due_by=datetime(2024, 1, 1),
        )
        repo.save_event(past_due)

        overdue = repo.get_overdue(pge)
        assert len(overdue) == 1
        assert str(overdue[0].id) == str(past_due.id)

    def test_future_due_not_overdue(self, repo, pge, ratepayers, high_stakes_schema):
        """Pending events with future due_by are NOT overdue."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)

        future = _make_event(
            pge, ratepayers, result=PromiseResult.PENDING,
            due_by=datetime(2099, 12, 31),
        )
        repo.save_event(future)

        overdue = repo.get_overdue(pge)
        assert len(overdue) == 0

    def test_no_due_by_not_overdue(self, repo, pge, ratepayers, high_stakes_schema):
        """Pending events without due_by are never overdue."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)

        no_deadline = _make_event(
            pge, ratepayers, result=PromiseResult.PENDING,
            due_by=None,
        )
        repo.save_event(no_deadline)

        overdue = repo.get_overdue(pge)
        assert len(overdue) == 0

    def test_kept_events_not_overdue(self, repo, pge, ratepayers, high_stakes_schema):
        """Kept events are never overdue, even if past due_by."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)

        kept = _make_event(
            pge, ratepayers, result=PromiseResult.KEPT,
            due_by=datetime(2020, 1, 1),
        )
        repo.save_event(kept)

        overdue = repo.get_overdue(pge)
        assert len(overdue) == 0

    def test_overdue_ordered_oldest_first(self, repo, pge, ratepayers, high_stakes_schema):
        """Overdue events are returned oldest-due first."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)

        old = _make_event(
            pge, ratepayers, result=PromiseResult.PENDING,
            due_by=datetime(2022, 1, 1),
        )
        newer = _make_event(
            pge, ratepayers, result=PromiseResult.PENDING,
            due_by=datetime(2024, 6, 1),
        )
        repo.save_event(newer)
        repo.save_event(old)

        overdue = repo.get_overdue(pge)
        assert len(overdue) == 2
        assert overdue[0].due_by < overdue[1].due_by

    def test_overdue_scoped_to_agent(self, repo, pge, ratepayers, high_stakes_schema):
        """Overdue only returns events for the specified promiser."""
        other = Agent(type=AgentType.BUSINESS, id="pacificorp")
        repo.save_agent(pge)
        repo.save_agent(other)
        repo.save_agent(ratepayers)

        pge_event = _make_event(
            pge, ratepayers, result=PromiseResult.PENDING,
            due_by=datetime(2023, 1, 1),
        )
        other_event = _make_event(
            other, ratepayers, result=PromiseResult.PENDING,
            due_by=datetime(2023, 1, 1),
        )
        repo.save_event(pge_event)
        repo.save_event(other_event)

        overdue = repo.get_overdue(pge)
        assert len(overdue) == 1

    def test_get_pending_with_due_before(self, repo, pge, ratepayers, high_stakes_schema):
        """get_pending with due_before filters by due_by."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)

        soon = _make_event(
            pge, ratepayers, result=PromiseResult.PENDING,
            due_by=datetime(2025, 6, 1),
        )
        later = _make_event(
            pge, ratepayers, result=PromiseResult.PENDING,
            due_by=datetime(2030, 1, 1),
        )
        repo.save_event(soon)
        repo.save_event(later)

        pending = repo.get_pending(pge, due_before=datetime(2026, 1, 1))
        assert len(pending) == 1
        assert str(pending[0].id) == str(soon.id)

    def test_as_of_parameter(self, repo, pge, ratepayers, high_stakes_schema):
        """get_overdue as_of lets you check overdue at a specific point in time."""
        repo.save_agent(pge)
        repo.save_agent(ratepayers)

        event = _make_event(
            pge, ratepayers, result=PromiseResult.PENDING,
            due_by=datetime(2025, 6, 1),
        )
        repo.save_event(event)

        # Not overdue as of 2025-01-01
        overdue_before = repo.get_overdue(pge, as_of=datetime(2025, 1, 1))
        assert len(overdue_before) == 0

        # Overdue as of 2025-07-01
        overdue_after = repo.get_overdue(pge, as_of=datetime(2025, 7, 1))
        assert len(overdue_after) == 1
