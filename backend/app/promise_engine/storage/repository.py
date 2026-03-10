"""Repository layer - database operations for Promise Engine.

All database access goes through here. Clean separation of concerns.
"""

from typing import List, Optional, Dict
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.promise_engine.core.models import (
    Agent,
    PromiseEvent,
    PromiseResult,
    IntegrityScore,
    PromiseSchema,
    SignalStrength,
)
from app.promise_engine.storage.models import (
    PromiseEventDB,
    PromiseSchemaDB,
    IntegrityScoreDB,
    AgentDB,
    TouchpointDB,
    JourneyDB,
)


class PromiseRepository:
    """Database operations for Promise Engine."""

    def __init__(self, db: Session):
        self.db = db

    # ============================================================
    # PROMISE EVENTS
    # ============================================================

    def save_event(self, event: PromiseEvent) -> PromiseEventDB:
        """Save a promise event to database."""
        db_event = PromiseEventDB(
            id=event.id,
            timestamp=event.timestamp,
            vertical=event.vertical,
            promise_schema_id=event.promise_schema_id,
            promise_version=event.promise_version,
            promiser_type=event.promiser.type.value,
            promiser_id=event.promiser.id,
            promisee_type=event.promisee.type.value,
            promisee_id=event.promisee.id,
            input_context=event.input_context,
            output=event.output,
            result=event.result.value,
            violation_type=event.violation_type,
            violation_detail=event.violation_detail,
            recovery_action=event.recovery_action,
            recovery_outcome=event.recovery_outcome,
            recovery_at=event.recovery_at,
            user_confirmed=event.user_confirmed,
            user_feedback=event.user_feedback,
            signal_strength=event.signal_strength.value,
            touchpoint_id=event.touchpoint_id,
            journey_id=event.journey_id,
            training_eligible=event.training_eligible,
            exported_at=event.exported_at,
        )
        self.db.add(db_event)
        self.db.commit()
        self.db.refresh(db_event)
        return db_event

    def get_events(
        self,
        agent: Optional[Agent] = None,
        vertical: Optional[str] = None,
        schema_id: Optional[str] = None,
        result: Optional[PromiseResult] = None,
        since: Optional[datetime] = None,
        limit: int = 100
    ) -> List[PromiseEventDB]:
        """Query promise events."""
        query = self.db.query(PromiseEventDB)

        if agent:
            query = query.filter(
                or_(
                    and_(
                        PromiseEventDB.promiser_type == agent.type.value,
                        PromiseEventDB.promiser_id == agent.id
                    ),
                    and_(
                        PromiseEventDB.promisee_type == agent.type.value,
                        PromiseEventDB.promisee_id == agent.id
                    )
                )
            )

        if vertical:
            query = query.filter(PromiseEventDB.vertical == vertical)

        if schema_id:
            query = query.filter(PromiseEventDB.promise_schema_id == schema_id)

        if result:
            query = query.filter(PromiseEventDB.result == result.value)

        if since:
            query = query.filter(PromiseEventDB.timestamp >= since)

        return query.order_by(PromiseEventDB.timestamp.desc()).limit(limit).all()

    def get_pending(
        self,
        promiser: Agent,
        due_before: Optional[datetime] = None
    ) -> List[PromiseEventDB]:
        """Get pending promises for an agent."""
        query = self.db.query(PromiseEventDB).filter(
            PromiseEventDB.promiser_type == promiser.type.value,
            PromiseEventDB.promiser_id == promiser.id,
            PromiseEventDB.result == PromiseResult.PENDING.value
        )

        if due_before:
            # TODO: Add due_by field to schema
            pass

        return query.order_by(PromiseEventDB.timestamp.asc()).all()

    # ============================================================
    # PROMISE SCHEMAS
    # ============================================================

    def save_schema(self, schema: PromiseSchema) -> PromiseSchemaDB:
        """Save a promise schema (upsert)."""
        # Check if schema already exists
        existing = self.db.query(PromiseSchemaDB).filter(
            PromiseSchemaDB.id == schema.id
        ).first()

        if existing:
            # Update existing schema
            existing.version = schema.version
            existing.vertical = schema.vertical
            existing.name = schema.name
            existing.description = schema.description
            existing.commitment_type = schema.commitment_type
            existing.stakes = schema.stakes
            existing.schema_json = schema.schema_json
            existing.verification_type = schema.verification_type
            existing.verification_rules = schema.verification_rules
            existing.training_eligible = schema.training_eligible
            existing.domain_tags = schema.domain_tags
            existing.deprecated_at = schema.deprecated_at
            self.db.commit()
            return existing
        else:
            # Insert new schema
            db_schema = PromiseSchemaDB(
                id=schema.id,
                version=schema.version,
                vertical=schema.vertical,
                name=schema.name,
                description=schema.description,
                commitment_type=schema.commitment_type,
                stakes=schema.stakes,
                schema_json=schema.schema_json,
                verification_type=schema.verification_type,
                verification_rules=schema.verification_rules,
                training_eligible=schema.training_eligible,
                domain_tags=schema.domain_tags,
                created_at=schema.created_at,
                deprecated_at=schema.deprecated_at,
            )
            self.db.add(db_schema)
            self.db.commit()
            self.db.refresh(db_schema)
            return db_schema

    def get_schema(self, schema_id: str, version: Optional[int] = None) -> Optional[PromiseSchemaDB]:
        """Get a promise schema by ID."""
        query = self.db.query(PromiseSchemaDB).filter(
            PromiseSchemaDB.id == schema_id,
            PromiseSchemaDB.deprecated_at == None
        )

        if version:
            query = query.filter(PromiseSchemaDB.version == version)
        else:
            query = query.order_by(PromiseSchemaDB.version.desc())

        return query.first()

    def list_schemas(self, vertical: Optional[str] = None) -> List[PromiseSchemaDB]:
        """List all active schemas."""
        query = self.db.query(PromiseSchemaDB).filter(
            PromiseSchemaDB.deprecated_at == None
        )

        if vertical:
            query = query.filter(PromiseSchemaDB.vertical == vertical)

        return query.order_by(PromiseSchemaDB.vertical, PromiseSchemaDB.id).all()

    # ============================================================
    # INTEGRITY SCORES
    # ============================================================

    def save_integrity(self, score: IntegrityScore) -> IntegrityScoreDB:
        """Save computed integrity score."""
        db_score = IntegrityScoreDB(
            agent_type=score.agent.type.value,
            agent_id=score.agent.id,
            vertical=score.vertical or '_overall_',
            overall_score=score.overall_score,
            total_promises=score.total_promises,
            kept_count=score.kept_count,
            broken_count=score.broken_count,
            renegotiated_count=score.renegotiated_count,
            pending_count=score.pending_count,
            trust_capital=score.trust_capital,
            recovery_rate=score.recovery_rate,
            avg_recovery_hours=int(score.avg_recovery_time.total_seconds() / 3600) if score.avg_recovery_time else None,
            trend_30d=score.trend_30d,
            trend_90d=score.trend_90d,
            vouching_strength=score.vouching_strength,
            vouched_by_count=score.vouched_by_count,
            vouching_accuracy=score.vouching_accuracy,
            computed_at=score.computed_at,
        )

        # Upsert
        existing = self.db.query(IntegrityScoreDB).filter(
            IntegrityScoreDB.agent_type == score.agent.type.value,
            IntegrityScoreDB.agent_id == score.agent.id,
            IntegrityScoreDB.vertical == (score.vertical or '_overall_')
        ).first()

        if existing:
            for key, value in db_score.__dict__.items():
                if key != '_sa_instance_state':
                    setattr(existing, key, value)
            self.db.commit()
            return existing
        else:
            self.db.add(db_score)
            self.db.commit()
            self.db.refresh(db_score)
            return db_score

    def get_integrity(
        self,
        agent: Agent,
        vertical: Optional[str] = None
    ) -> Optional[IntegrityScoreDB]:
        """Get integrity score for an agent."""
        return self.db.query(IntegrityScoreDB).filter(
            IntegrityScoreDB.agent_type == agent.type.value,
            IntegrityScoreDB.agent_id == agent.id,
            IntegrityScoreDB.vertical == (vertical or '_overall_')
        ).first()

    # ============================================================
    # AGENTS
    # ============================================================

    def save_agent(self, agent: Agent) -> AgentDB:
        """Save or update an agent."""
        existing = self.db.query(AgentDB).filter(
            AgentDB.type == agent.type.value,
            AgentDB.id == agent.id
        ).first()

        if existing:
            existing.agent_metadata = agent.metadata
            self.db.commit()
            return existing
        else:
            db_agent = AgentDB(
                type=agent.type.value,
                id=agent.id,
                agent_metadata=agent.metadata
            )
            self.db.add(db_agent)
            self.db.commit()
            self.db.refresh(db_agent)
            return db_agent

    # ============================================================
    # TRAINING DATA EXPORT
    # ============================================================

    def get_unexported_events(
        self,
        vertical: Optional[str] = None,
        limit: int = 1000,
    ) -> List[PromiseEventDB]:
        """Get training-eligible events that haven't been exported yet."""
        query = self.db.query(PromiseEventDB).filter(
            PromiseEventDB.training_eligible == True,
            PromiseEventDB.exported_at == None,
            PromiseEventDB.result != PromiseResult.PENDING.value,
        )

        if vertical:
            query = query.filter(PromiseEventDB.vertical == vertical)

        return query.order_by(PromiseEventDB.timestamp.asc()).limit(limit).all()

    def mark_exported(self, event_ids: List, exported_at: Optional[datetime] = None) -> int:
        """Mark events as exported. Returns count of updated rows."""
        if not event_ids:
            return 0
        ts = exported_at or datetime.utcnow()
        count = self.db.query(PromiseEventDB).filter(
            PromiseEventDB.id.in_(event_ids)
        ).update(
            {PromiseEventDB.exported_at: ts},
            synchronize_session='fetch'
        )
        self.db.commit()
        return count

    def get_export_stats(self, vertical: Optional[str] = None) -> Dict:
        """Get export statistics."""
        base_query = self.db.query(PromiseEventDB).filter(
            PromiseEventDB.training_eligible == True,
        )
        if vertical:
            base_query = base_query.filter(PromiseEventDB.vertical == vertical)

        total = base_query.count()
        exported = base_query.filter(PromiseEventDB.exported_at != None).count()
        pending_export = base_query.filter(
            PromiseEventDB.exported_at == None,
            PromiseEventDB.result != PromiseResult.PENDING.value,
        ).count()

        return {
            "total_eligible": total,
            "exported": exported,
            "pending_export": pending_export,
        }

    # ============================================================
    # RECOVERY
    # ============================================================

    def log_recovery(
        self,
        event_id,
        recovery_action: str,
        recovery_outcome: str,
    ) -> Optional[PromiseEventDB]:
        """Log a recovery action for a broken promise."""
        event = self.db.query(PromiseEventDB).filter(
            PromiseEventDB.id == event_id
        ).first()

        if not event:
            return None

        if event.result != PromiseResult.BROKEN.value:
            return None

        event.recovery_action = recovery_action
        event.recovery_outcome = recovery_outcome
        event.recovery_at = datetime.utcnow()

        if recovery_outcome in ("resolved", "compensated", "renegotiated"):
            event.result = PromiseResult.RENEGOTIATED.value

        self.db.commit()
        return event

    # ============================================================
    # ANALYTICS
    # ============================================================

    def compute_integrity(
        self,
        agent: Agent,
        vertical: Optional[str] = None,
        since: Optional[datetime] = None
    ) -> IntegrityScore:
        """Compute integrity score from promise events."""
        query = self.db.query(PromiseEventDB).filter(
            PromiseEventDB.promiser_type == agent.type.value,
            PromiseEventDB.promiser_id == agent.id
        )

        if vertical:
            query = query.filter(PromiseEventDB.vertical == vertical)

        if since:
            query = query.filter(PromiseEventDB.timestamp >= since)

        events = query.all()

        if not events:
            return IntegrityScore(
                agent=agent,
                overall_score=1.0,
                total_promises=0,
                kept_count=0,
                broken_count=0,
                renegotiated_count=0,
                pending_count=0,
                vertical=vertical
            )

        # Count by result
        kept = sum(1 for e in events if e.result == PromiseResult.KEPT.value)
        broken = sum(1 for e in events if e.result == PromiseResult.BROKEN.value)
        renegotiated = sum(1 for e in events if e.result == PromiseResult.RENEGOTIATED.value)
        pending = sum(1 for e in events if e.result == PromiseResult.PENDING.value)
        total = len(events)

        # Calculate score (exclude pending)
        resolved = kept + broken + renegotiated
        overall_score = kept / resolved if resolved > 0 else 1.0

        # Calculate recovery metrics
        broken_events = [e for e in events if e.result == PromiseResult.BROKEN.value]
        recovered = [e for e in broken_events if e.recovery_outcome]
        recovery_rate = len(recovered) / len(broken_events) if broken_events else 0.0

        # Calculate trends
        now = datetime.utcnow()
        events_30d = [e for e in events if e.timestamp >= now - timedelta(days=30)]
        events_90d = [e for e in events if e.timestamp >= now - timedelta(days=90)]

        trend_30d = self._calculate_trend_delta(events, events_30d)
        trend_90d = self._calculate_trend_delta(events, events_90d)

        return IntegrityScore(
            agent=agent,
            overall_score=round(overall_score, 4),
            total_promises=total,
            kept_count=kept,
            broken_count=broken,
            renegotiated_count=renegotiated,
            pending_count=pending,
            trust_capital=self._compute_trust_capital(events),
            recovery_rate=round(recovery_rate, 4),
            trend_30d=trend_30d,
            trend_90d=trend_90d,
            vertical=vertical
        )

    def _compute_trust_capital(self, events: List) -> float:
        """Compute stakes-weighted trust score.

        High-stakes promises kept = more trust capital.
        High-stakes promises broken = larger trust penalty.

        Weights: low=1, medium=2, high=3
        Formula: sum(weight * kept) / sum(weight * resolved)
        """
        STAKES_WEIGHT = {"low": 1, "medium": 2, "high": 3}

        # Build schema → stakes lookup
        schema_stakes = {}
        schema_ids = {e.promise_schema_id for e in events}
        for sid in schema_ids:
            schema = self.db.query(PromiseSchemaDB).filter(
                PromiseSchemaDB.id == sid
            ).first()
            if schema:
                schema_stakes[sid] = STAKES_WEIGHT.get(schema.stakes, 1)
            else:
                schema_stakes[sid] = 1

        weighted_kept = 0.0
        weighted_resolved = 0.0

        for e in events:
            if e.result == PromiseResult.PENDING.value:
                continue
            weight = schema_stakes.get(e.promise_schema_id, 1)
            weighted_resolved += weight
            if e.result == PromiseResult.KEPT.value:
                weighted_kept += weight

        if weighted_resolved == 0:
            return 0.0

        return round(weighted_kept / weighted_resolved, 4)

    def _calculate_trend_delta(self, all_events: List, recent_events: List) -> Optional[float]:
        """Calculate change in integrity score over time period."""
        if not all_events or not recent_events:
            return None

        # Overall score
        all_kept = sum(1 for e in all_events if e.result == PromiseResult.KEPT.value)
        all_resolved = sum(1 for e in all_events if e.result != PromiseResult.PENDING.value)
        overall = all_kept / all_resolved if all_resolved > 0 else 1.0

        # Recent score
        recent_kept = sum(1 for e in recent_events if e.result == PromiseResult.KEPT.value)
        recent_resolved = sum(1 for e in recent_events if e.result != PromiseResult.PENDING.value)
        recent = recent_kept / recent_resolved if recent_resolved > 0 else 1.0

        return round(recent - overall, 4)
