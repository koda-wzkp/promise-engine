"""Promise Engine - The core kernel.

This is THE interface to Promise-Oriented Development.
Every promise kept or broken flows through here.
Every integrity score is computed here.
Every training signal originates here.

🐳 The gymnasium where AI learns integrity through practice.
"""

from typing import Optional, List, Dict
from datetime import datetime, timedelta

from app.database import get_db
from app.promise_engine.core.models import (
    Agent,
    PromiseEvent,
    PromiseResult,
    PromiseSchema,
    IntegrityScore,
    VerificationResult,
    SignalStrength,
)
from app.promise_engine.storage.repository import PromiseRepository


class PromiseEngine:
    """The core Promise Engine.

    Usage:
        pe = PromiseEngine()

        # Verify a promise (auto-logs)
        result = pe.verify(
            schema_id="codec.grind_roast_compatibility",
            promiser=Agent(type=AgentType.PLATFORM, id="codec"),
            promisee=Agent(type=AgentType.USER, id="customer_123"),
            input_context={"roast": "espresso", "grind": "french_press"}
        )

        # Get integrity score
        score = pe.get_integrity(Agent(type=AgentType.USER, id="customer_123"))
    """

    def __init__(self, vertical: Optional[str] = None):
        """Initialize Promise Engine.

        Args:
            vertical: Default vertical for operations (optional)
        """
        self.vertical = vertical
        self._schemas: Dict[str, PromiseSchema] = {}

    def _get_repo(self, db):
        """Get repository with database session."""
        return PromiseRepository(db)

    # ============================================================
    # SCHEMA MANAGEMENT
    # ============================================================

    def register_schema(self, schema: PromiseSchema) -> PromiseSchema:
        """Register a promise schema.

        Args:
            schema: PromiseSchema to register

        Returns:
            Registered schema
        """
        with get_db() as db:
            repo = self._get_repo(db)
            repo.save_schema(schema)
            self._schemas[schema.id] = schema
        return schema

    def get_schema(self, schema_id: str) -> Optional[PromiseSchema]:
        """Get a promise schema by ID.

        Args:
            schema_id: Schema identifier (e.g., 'codec.grind_roast_compatibility')

        Returns:
            PromiseSchema if found, None otherwise
        """
        # Check cache first
        if schema_id in self._schemas:
            return self._schemas[schema_id]

        # Load from database
        with get_db() as db:
            repo = self._get_repo(db)
            db_schema = repo.get_schema(schema_id)

            if db_schema:
                schema = PromiseSchema(
                    id=db_schema.id,
                    version=db_schema.version,
                    vertical=db_schema.vertical,
                    name=db_schema.name,
                    description=db_schema.description,
                    commitment_type=db_schema.commitment_type,
                    stakes=db_schema.stakes,
                    schema_json=db_schema.schema_json,
                    verification_type=db_schema.verification_type,
                    verification_rules=db_schema.verification_rules,
                    training_eligible=db_schema.training_eligible,
                    domain_tags=db_schema.domain_tags or [],
                    created_at=db_schema.created_at,
                    deprecated_at=db_schema.deprecated_at,
                )
                self._schemas[schema_id] = schema
                return schema

        return None

    def list_schemas(self, vertical: Optional[str] = None) -> List[PromiseSchema]:
        """List all active schemas.

        Args:
            vertical: Filter by vertical (optional)

        Returns:
            List of PromiseSchemas
        """
        with get_db() as db:
            repo = self._get_repo(db)
            db_schemas = repo.list_schemas(vertical)

            schemas = []
            for db_schema in db_schemas:
                schema = PromiseSchema(
                    id=db_schema.id,
                    version=db_schema.version,
                    vertical=db_schema.vertical,
                    name=db_schema.name,
                    description=db_schema.description,
                    commitment_type=db_schema.commitment_type,
                    stakes=db_schema.stakes,
                    schema_json=db_schema.schema_json,
                    verification_type=db_schema.verification_type,
                    verification_rules=db_schema.verification_rules,
                    training_eligible=db_schema.training_eligible,
                    domain_tags=db_schema.domain_tags or [],
                    created_at=db_schema.created_at,
                    deprecated_at=db_schema.deprecated_at,
                )
                schemas.append(schema)
                self._schemas[schema.id] = schema

        return schemas

    # ============================================================
    # PROMISE VERIFICATION
    # ============================================================

    def verify(
        self,
        schema_id: str,
        promiser: Agent,
        promisee: Agent,
        input_context: Dict,
        output: Optional[Dict] = None,
        touchpoint_id: Optional[str] = None,
        journey_id: Optional[str] = None,
    ) -> VerificationResult:
        """Verify a promise and auto-log the result.

        This is the main entry point for promise verification.
        It verifies according to the schema rules and automatically
        logs the event to generate training data.

        Args:
            schema_id: Promise schema ID
            promiser: Agent making the promise
            promisee: Agent receiving the promise
            input_context: Input data to verify
            output: Output data (optional)
            touchpoint_id: CX touchpoint identifier (optional)
            journey_id: Customer journey ID (optional)

        Returns:
            VerificationResult

        Example:
            result = pe.verify(
                schema_id="codec.grind_roast_compatibility",
                promiser=Agent(type=AgentType.PLATFORM, id="codec"),
                promisee=Agent(type=AgentType.USER, id="customer_123"),
                input_context={"roast": "espresso", "grind": "french_press"}
            )
        """
        schema = self.get_schema(schema_id)
        if not schema:
            return VerificationResult.blocked(f"Schema not found: {schema_id}")

        # Verify using schema rules
        result = self._verify_rules(schema, input_context)

        # Log the event
        event = PromiseEvent.create(
            vertical=schema.vertical,
            schema_id=schema_id,
            promiser=promiser,
            promisee=promisee,
            input_context=input_context,
            output=output or {},
            result=result.result,
            violation_type=result.violation,
            violation_detail=result.violation,
            signal_strength=SignalStrength.IMPLICIT,  # Automatic verification
            touchpoint_id=touchpoint_id,
            journey_id=journey_id,
        )

        self.log(event)

        return result

    def _verify_rules(self, schema: PromiseSchema, input_context: Dict) -> VerificationResult:
        """Verify input against schema rules.

        Args:
            schema: Promise schema
            input_context: Input to verify

        Returns:
            VerificationResult
        """
        rules = schema.verification_rules.get("rules", [])

        for rule in rules:
            # Check if rule applies
            if_condition = rule.get("if", {})
            applies = all(
                input_context.get(key) == value
                for key, value in if_condition.items()
            )

            if applies:
                # Check then condition
                then_condition = rule.get("then", {})
                for key, constraints in then_condition.items():
                    value = input_context.get(key)

                    # Check enum constraint
                    if "enum" in constraints:
                        if value not in constraints["enum"]:
                            return VerificationResult.failure(
                                f"{key}={value} not compatible with {if_condition}",
                                expected=constraints["enum"],
                                actual=value
                            )

        return VerificationResult.success()

    # ============================================================
    # PROMISE LOGGING
    # ============================================================

    def log(
        self,
        event: PromiseEvent,
    ) -> PromiseEvent:
        """Log a promise event.

        Use this for manual logging when verification is async or external.

        Args:
            event: PromiseEvent to log

        Returns:
            Logged PromiseEvent with ID
        """
        with get_db() as db:
            repo = self._get_repo(db)

            # Ensure agents exist
            repo.save_agent(event.promiser)
            repo.save_agent(event.promisee)

            # Save event
            repo.save_event(event)

        return event

    # ============================================================
    # INTEGRITY SCORES
    # ============================================================

    def get_integrity(
        self,
        agent: Agent,
        vertical: Optional[str] = None,
        since: Optional[datetime] = None,
        refresh: bool = False
    ) -> IntegrityScore:
        """Get integrity score for an agent.

        Args:
            agent: Agent to get score for
            vertical: Filter by vertical (optional)
            since: Only count promises since this date (optional)
            refresh: Force recomputation (default: use cached)

        Returns:
            IntegrityScore
        """
        with get_db() as db:
            repo = self._get_repo(db)

            # If not refreshing and since is None, try to use cached score
            if not refresh and since is None:
                cached = repo.get_integrity(agent, vertical)
                if cached:
                    return IntegrityScore(
                        agent=agent,
                        overall_score=cached.overall_score,
                        total_promises=cached.total_promises,
                        kept_count=cached.kept_count,
                        broken_count=cached.broken_count,
                        renegotiated_count=cached.renegotiated_count,
                        pending_count=cached.pending_count,
                        trust_capital=cached.trust_capital or 0.0,
                        recovery_rate=cached.recovery_rate or 0.0,
                        avg_recovery_time=(
                            timedelta(hours=cached.avg_recovery_hours) if cached.avg_recovery_hours else None
                        ),
                        trend_30d=cached.trend_30d,
                        trend_90d=cached.trend_90d,
                        vouching_strength=cached.vouching_strength or 0.0,
                        vouched_by_count=cached.vouched_by_count or 0,
                        vouching_accuracy=cached.vouching_accuracy or 0.0,
                        computed_at=cached.computed_at,
                        vertical=vertical,
                    )

            # Compute fresh
            score = repo.compute_integrity(agent, vertical, since)

            # Cache if no time filter
            if since is None:
                repo.save_integrity(score)

        return score

    def get_pending(
        self,
        promiser: Agent,
        due_before: Optional[datetime] = None
    ) -> List[PromiseEvent]:
        """Get pending promises for an agent.

        Args:
            promiser: Agent who made the promises
            due_before: Only show promises due before this time (optional)

        Returns:
            List of pending PromiseEvents
        """
        with get_db() as db:
            repo = self._get_repo(db)
            db_events = repo.get_pending(promiser, due_before)

            return [self._db_event_to_model(e) for e in db_events]

    def get_overdue(self, promiser: Agent) -> List[PromiseEvent]:
        """Get overdue promises for an agent.

        Returns pending promises whose due_by date has passed.

        Args:
            promiser: Agent who made the promises

        Returns:
            List of overdue PromiseEvents, oldest first
        """
        with get_db() as db:
            repo = self._get_repo(db)
            db_events = repo.get_overdue(promiser)

            return [self._db_event_to_model(e) for e in db_events]

    # ============================================================
    # HELPER METHODS
    # ============================================================

    def _db_event_to_model(self, db_event) -> PromiseEvent:
        """Convert database event to model."""
        from app.promise_engine.core.models import AgentType

        return PromiseEvent(
            id=db_event.id,
            timestamp=db_event.timestamp,
            vertical=db_event.vertical,
            promise_schema_id=db_event.promise_schema_id,
            promise_version=db_event.promise_version,
            promiser=Agent(
                type=AgentType(db_event.promiser_type),
                id=db_event.promiser_id
            ),
            promisee=Agent(
                type=AgentType(db_event.promisee_type),
                id=db_event.promisee_id
            ),
            input_context=db_event.input_context,
            output=db_event.output,
            result=PromiseResult(db_event.result),
            violation_type=db_event.violation_type,
            violation_detail=db_event.violation_detail,
            recovery_action=db_event.recovery_action,
            recovery_outcome=db_event.recovery_outcome,
            recovery_at=db_event.recovery_at,
            user_confirmed=db_event.user_confirmed,
            user_feedback=db_event.user_feedback,
            signal_strength=SignalStrength(db_event.signal_strength),
            touchpoint_id=db_event.touchpoint_id,
            journey_id=db_event.journey_id,
            due_by=db_event.due_by,
            training_eligible=db_event.training_eligible,
            exported_at=db_event.exported_at,
        )
