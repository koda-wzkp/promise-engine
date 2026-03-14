"""SQLAlchemy models for Promise Engine.

These map the core data models to PostgreSQL tables.
Every promise event is logged. Every integrity score is computed.
This is the source of truth for POD training data.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, Index, TypeDecorator
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class PortableUUID(TypeDecorator):
    """UUID type that works with both PostgreSQL and SQLite."""

    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return uuid.UUID(value) if not isinstance(value, uuid.UUID) else value
        return value


class PromiseSchemaDB(Base):
    """Promise schema definitions - the registry of promise types."""

    __tablename__ = "promise_schemas"

    id = Column(String(100), primary_key=True)
    version = Column(Integer, nullable=False)
    vertical = Column(String(50), nullable=False, index=True)

    # Schema definition
    name = Column(String(200), nullable=False)
    description = Column(Text)
    commitment_type = Column(String(100))
    stakes = Column(String(20))

    schema_json = Column(JSONB, nullable=False)
    verification_type = Column(String(50))
    verification_rules = Column(JSONB)

    # Training
    training_eligible = Column(Boolean, default=True)
    domain_tags = Column(JSONB)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    deprecated_at = Column(DateTime)

    __table_args__ = (
        Index('idx_schemas_vertical', 'vertical'),
        Index('idx_schemas_active', 'deprecated_at'),
    )


class PromiseSchemaVersionDB(Base):
    """Schema version history — tracks every change to a schema definition.

    When a schema's verification_rules, schema_json, or stakes change,
    the old version is preserved here for auditability.
    """

    __tablename__ = "promise_schema_versions"

    schema_id = Column(String(100), nullable=False, primary_key=True)
    version = Column(Integer, nullable=False, primary_key=True)

    # Snapshot of the schema at this version
    name = Column(String(200), nullable=False)
    description = Column(Text)
    commitment_type = Column(String(100))
    stakes = Column(String(20))
    schema_json = Column(JSONB, nullable=False)
    verification_type = Column(String(50))
    verification_rules = Column(JSONB)

    # Version metadata
    change_summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('idx_schema_versions_id', 'schema_id'),
    )


class PromiseEventDB(Base):
    """Promise events - THE GOLD.

    Every row is a training signal. Every row contributes to integrity scores.
    This table is the foundation of POD.
    """

    __tablename__ = "promise_events"

    id = Column(PortableUUID(), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Schema reference
    vertical = Column(String(50), nullable=False, index=True)
    promise_schema_id = Column(String(100), nullable=False, index=True)
    promise_version = Column(Integer, nullable=False)

    # Agents
    promiser_type = Column(String(50), nullable=False, index=True)
    promiser_id = Column(String(100), nullable=False, index=True)
    promisee_type = Column(String(50), nullable=False)
    promisee_id = Column(String(100), nullable=False)

    # Interaction
    input_context = Column(JSONB)
    output = Column(JSONB)

    # Result
    result = Column(String(20), nullable=False, index=True)
    violation_type = Column(String(100))
    violation_detail = Column(Text)

    # Recovery (if broken)
    recovery_action = Column(String(100))
    recovery_outcome = Column(String(100))
    recovery_at = Column(DateTime)

    # User signals
    user_confirmed = Column(Boolean)
    user_feedback = Column(Text)
    signal_strength = Column(String(20), default='inferred')

    # Journey tracking (CX)
    touchpoint_id = Column(String(100), index=True)
    journey_id = Column(String(100), index=True)

    # Deadline tracking
    due_by = Column(DateTime, index=True)

    # ML metadata
    training_eligible = Column(Boolean, default=True, index=True)
    exported_at = Column(DateTime)

    __table_args__ = (
        Index('idx_events_promiser', 'promiser_type', 'promiser_id'),
        Index('idx_events_promisee', 'promisee_type', 'promisee_id'),
        Index('idx_events_schema', 'promise_schema_id'),
        Index('idx_events_result', 'result'),
        Index('idx_events_touchpoint', 'touchpoint_id'),
        Index('idx_events_journey', 'journey_id'),
        Index('idx_events_training', 'training_eligible', 'exported_at'),
        Index('idx_events_pending', 'promiser_id', 'result'),
        Index('idx_events_overdue', 'promiser_id', 'result', 'due_by'),
    )


class IntegrityScoreDB(Base):
    """Computed integrity scores - cached for performance.

    Refreshed periodically. This is what you show on dashboards.
    """

    __tablename__ = "integrity_scores"

    # Primary key: agent + vertical (NULL vertical = overall)
    agent_type = Column(String(50), primary_key=True)
    agent_id = Column(String(100), primary_key=True)
    vertical = Column(String(50), primary_key=True, default='_overall_')

    # Core metrics
    overall_score = Column(Float)
    total_promises = Column(Integer, default=0)
    kept_count = Column(Integer, default=0)
    broken_count = Column(Integer, default=0)
    renegotiated_count = Column(Integer, default=0)
    pending_count = Column(Integer, default=0)

    # Advanced metrics
    trust_capital = Column(Float)
    recovery_rate = Column(Float)
    avg_recovery_hours = Column(Integer)

    # Trends
    trend_30d = Column(Float)
    trend_90d = Column(Float)

    # Network (future)
    vouching_strength = Column(Float)
    vouched_by_count = Column(Integer, default=0)
    vouching_accuracy = Column(Float)

    # Metadata
    computed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('idx_integrity_agent', 'agent_type', 'agent_id'),
        Index('idx_integrity_score', 'overall_score'),
    )


class AgentDB(Base):
    """Agent registry - all entities that make or receive promises."""

    __tablename__ = "agents"

    type = Column(String(50), primary_key=True)
    id = Column(String(100), primary_key=True)
    agent_metadata = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('idx_agents_type', 'type'),
    )


class TouchpointDB(Base):
    """Touchpoints in customer journeys - for CX delta analysis."""

    __tablename__ = "touchpoints"

    id = Column(String(100), primary_key=True)
    vertical = Column(String(50), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    sequence_order = Column(Integer)
    promise_schemas = Column(JSONB)  # Which promises typically occur here
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class JourneyDB(Base):
    """Customer journeys - for tracking promise deltas over time."""

    __tablename__ = "journeys"

    id = Column(String(100), primary_key=True)
    agent_type = Column(String(50), nullable=False)
    agent_id = Column(String(100), nullable=False, index=True)
    vertical = Column(String(50), nullable=False, index=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime)
    outcome = Column(String(50))  # 'converted', 'churned', 'ongoing'

    __table_args__ = (
        Index('idx_journeys_agent', 'agent_type', 'agent_id'),
    )


class VouchingDB(Base):
    """Vouching relationships - trust network (future)."""

    __tablename__ = "vouching"

    voucher_type = Column(String(50), primary_key=True)
    voucher_id = Column(String(100), primary_key=True)
    vouchee_type = Column(String(50), primary_key=True)
    vouchee_id = Column(String(100), primary_key=True)

    strength = Column(Float, nullable=False)  # 0.00 - 1.00
    context = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    revoked_at = Column(DateTime)

    __table_args__ = (
        Index('idx_vouching_voucher', 'voucher_type', 'voucher_id'),
        Index('idx_vouching_vouchee', 'vouchee_type', 'vouchee_id'),
    )
