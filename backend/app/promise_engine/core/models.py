"""Core data models for Promise Engine.

These are the fundamental building blocks of Promise-Oriented Development (POD).
Every interaction in the system is expressed through these primitives.
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Literal
from uuid import UUID, uuid4


# ============================================================
# ENUMS
# ============================================================

class PromiseResult(Enum):
    """The outcome of a promise verification."""
    KEPT = "kept"
    BROKEN = "broken"
    PENDING = "pending"
    BLOCKED = "blocked"           # Couldn't even attempt (validation failed)
    RENEGOTIATED = "renegotiated" # Terms changed before due


class SignalStrength(Enum):
    """How strong is the training signal?"""
    EXPLICIT = "explicit"    # User explicitly confirmed kept/broken
    IMPLICIT = "implicit"    # System verified automatically
    INFERRED = "inferred"    # Derived from behavior


class AgentType(Enum):
    """Types of entities that can make or receive promises."""
    PLATFORM = "platform"
    USER = "user"
    BUSINESS = "business"
    AI_AGENT = "ai_agent"
    LAND = "land"
    COMMUNITY = "community"


# ============================================================
# CORE DATA STRUCTURES
# ============================================================

@dataclass
class Agent:
    """Any entity that can make or receive promises.

    Examples:
    - Platform: Agent(type=AgentType.PLATFORM, id="codec")
    - User: Agent(type=AgentType.USER, id="customer_123")
    - Roaster: Agent(type=AgentType.BUSINESS, id="roaster_outer_heaven")
    - Land: Agent(type=AgentType.LAND, id="parcel_456")
    """
    type: AgentType
    id: str
    metadata: Dict = field(default_factory=dict)

    def __str__(self) -> str:
        return f"{self.type.value}:{self.id}"

    @property
    def key(self) -> tuple:
        """Unique key for database lookups."""
        return (self.type.value, self.id)


@dataclass
class PromiseEvent:
    """A single promise instance - the fundamental training signal.

    This is THE atomic unit of POD. Every promise event generates labeled
    training data without human annotation.

    Example:
        Platform promises: "Grind size must match roast level"
        Input: {"roast": "espresso", "grind": "french_press"}
        Result: BROKEN
        → Training signal: This configuration is invalid
    """
    id: UUID
    timestamp: datetime

    # Schema reference
    vertical: str                    # 'codec', 'crm', 'bindle', 'land'
    promise_schema_id: str           # e.g., 'codec.grind_roast_compatibility'
    promise_version: int

    # Agents involved
    promiser: Agent
    promisee: Agent

    # The interaction
    input_context: Dict              # What triggered the promise
    output: Dict                     # What happened

    # Verification result
    result: PromiseResult
    violation_type: Optional[str] = None
    violation_detail: Optional[str] = None

    # Recovery (if broken)
    recovery_action: Optional[str] = None
    recovery_outcome: Optional[str] = None
    recovery_at: Optional[datetime] = None

    # User signals
    user_confirmed: Optional[bool] = None
    user_feedback: Optional[str] = None
    signal_strength: SignalStrength = SignalStrength.INFERRED

    # Touchpoint tracking (for CX delta analysis)
    touchpoint_id: Optional[str] = None
    journey_id: Optional[str] = None

    # Deadline tracking
    due_by: Optional[datetime] = None

    # ML training metadata
    training_eligible: bool = True
    exported_at: Optional[datetime] = None

    @classmethod
    def create(
        cls,
        vertical: str,
        schema_id: str,
        promiser: Agent,
        promisee: Agent,
        input_context: Dict,
        output: Dict,
        result: PromiseResult,
        **kwargs
    ) -> "PromiseEvent":
        """Factory method for creating promise events."""
        return cls(
            id=uuid4(),
            timestamp=datetime.utcnow(),
            vertical=vertical,
            promise_schema_id=schema_id,
            promise_version=1,  # TODO: Get from schema registry
            promiser=promiser,
            promisee=promisee,
            input_context=input_context,
            output=output,
            result=result,
            **kwargs
        )


@dataclass
class VerificationResult:
    """Result of verifying a promise."""
    kept: bool
    result: PromiseResult
    violation: Optional[str] = None
    details: Dict = field(default_factory=dict)

    @classmethod
    def success(cls) -> "VerificationResult":
        """Promise was kept."""
        return cls(kept=True, result=PromiseResult.KEPT)

    @classmethod
    def failure(cls, violation: str, **details) -> "VerificationResult":
        """Promise was broken."""
        return cls(
            kept=False,
            result=PromiseResult.BROKEN,
            violation=violation,
            details=details
        )

    @classmethod
    def blocked(cls, reason: str) -> "VerificationResult":
        """Promise couldn't be attempted."""
        return cls(
            kept=False,
            result=PromiseResult.BLOCKED,
            violation=reason
        )


@dataclass
class IntegrityScore:
    """Computed trust metric for an agent.

    This is THE trust metric. Your integrity score is your portable reputation.
    It's YOUR asset, not extracted by platforms.
    """
    agent: Agent

    # Overall
    overall_score: float         # 0.0 - 1.0
    total_promises: int
    kept_count: int
    broken_count: int
    renegotiated_count: int
    pending_count: int

    # By promise type
    by_type: Dict[str, float] = field(default_factory=dict)

    # By time period
    trend_30d: Optional[float] = None  # Change vs 30 days ago
    trend_90d: Optional[float] = None

    # Trust capital (weighted by stakes)
    trust_capital: float = 0.0        # Higher stakes promises count more

    # Recovery quality
    recovery_rate: float = 0.0         # When broken, how often recovered well?
    avg_recovery_time: Optional[timedelta] = None

    # Network (future)
    vouching_strength: float = 0.0     # Strength of vouching network
    vouched_by_count: int = 0
    vouching_accuracy: float = 0.0     # Do people YOU vouch for keep promises?

    # Metadata
    computed_at: datetime = field(default_factory=datetime.utcnow)
    vertical: Optional[str] = None     # None = overall, else specific vertical

    @property
    def is_trustworthy(self) -> bool:
        """Simple boolean: Can you trust this agent?"""
        return self.overall_score >= 0.85 and self.total_promises >= 10


@dataclass
class PromiseDelta:
    """Change in integrity between touchpoints (CX diagnostic).

    This is how you find promise leaks - where in the customer journey
    does integrity consistently drop?
    """
    journey_id: str
    touchpoint_before: str
    touchpoint_after: str

    integrity_before: float
    integrity_after: float
    delta: float                 # Negative = promise leak

    promises_in_window: List[PromiseEvent]
    broken_promises: List[PromiseEvent]

    # Diagnostic
    is_leak: bool                # delta < threshold
    leak_severity: Optional[Literal["minor", "moderate", "severe"]] = None
    common_violations: List[str] = field(default_factory=list)

    @classmethod
    def analyze(
        cls,
        journey_id: str,
        touchpoint_before: str,
        touchpoint_after: str,
        promises: List[PromiseEvent],
        threshold: float = -0.05
    ) -> "PromiseDelta":
        """Analyze promise delta between two touchpoints."""
        # Split promises by touchpoint
        before_promises = [p for p in promises if p.touchpoint_id == touchpoint_before]
        after_promises = [p for p in promises if p.touchpoint_id == touchpoint_after]

        # Calculate integrity at each touchpoint
        integrity_before = cls._calculate_integrity(before_promises)
        integrity_after = cls._calculate_integrity(after_promises)
        delta = integrity_after - integrity_before

        # Find broken promises in the window
        broken = [p for p in promises if p.result == PromiseResult.BROKEN]

        # Determine leak severity
        is_leak = delta < threshold
        leak_severity = None
        if is_leak:
            if delta < -0.15:
                leak_severity = "severe"
            elif delta < -0.10:
                leak_severity = "moderate"
            else:
                leak_severity = "minor"

        # Find common violations
        violations = [p.violation_type for p in broken if p.violation_type]
        from collections import Counter
        common_violations = [v for v, _ in Counter(violations).most_common(3)]

        return cls(
            journey_id=journey_id,
            touchpoint_before=touchpoint_before,
            touchpoint_after=touchpoint_after,
            integrity_before=integrity_before,
            integrity_after=integrity_after,
            delta=delta,
            promises_in_window=promises,
            broken_promises=broken,
            is_leak=is_leak,
            leak_severity=leak_severity,
            common_violations=common_violations
        )

    @staticmethod
    def _calculate_integrity(promises: List[PromiseEvent]) -> float:
        """Calculate integrity score for a list of promises."""
        if not promises:
            return 1.0  # No promises = no violations = perfect integrity

        kept = sum(1 for p in promises if p.result == PromiseResult.KEPT)
        total = len(promises)
        return kept / total if total > 0 else 1.0


@dataclass
class PromiseSchema:
    """Definition of a promise type.

    This is the machine-readable specification that enables automatic
    verification and training data generation.
    """
    id: str                      # e.g., 'codec.grind_roast_compatibility'
    version: int
    vertical: str                # 'codec', 'crm', 'bindle', 'land'

    # Description
    name: str
    description: str
    commitment_type: str         # 'configuration_validity', 'timeline', 'payment', etc.
    stakes: Literal["low", "medium", "high"]

    # Schema definition
    schema_json: Dict            # JSON Schema for validation

    # Verification
    verification_type: Literal["automatic", "reported", "witnessed", "inferred"]
    verification_rules: Dict

    # Training
    training_eligible: bool = True
    domain_tags: List[str] = field(default_factory=list)

    # Metadata
    created_at: datetime = field(default_factory=datetime.utcnow)
    deprecated_at: Optional[datetime] = None

    @property
    def is_active(self) -> bool:
        """Is this schema currently active?"""
        return self.deprecated_at is None
