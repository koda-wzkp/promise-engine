"""Promise schema v2.1 — core data model for the pipeline.

Every promise traces back to its source record via source_raw.
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
from typing import Any, Optional
from uuid import uuid4


class PromiseStatus(str, Enum):
    VERIFIED = "verified"
    DECLARED = "declared"
    DEGRADED = "degraded"
    VIOLATED = "violated"
    UNVERIFIABLE = "unverifiable"


class PromiseOrigin(str, Enum):
    VOLUNTARY = "voluntary"
    IMPOSED = "imposed"
    NEGOTIATED = "negotiated"


class VerificationMethod(str, Enum):
    FILING = "filing"
    AUDIT = "audit"
    SELF_REPORT = "self-report"
    SENSOR = "sensor"
    BENCHMARK = "benchmark"
    NONE = "none"


class AgentType(str, Enum):
    AGENCY = "agency"
    GOVERNMENT = "government"
    REGULATOR = "regulator"
    INTERNATIONAL_ORG = "international_org"
    PLATFORM = "platform"
    USER = "user"
    BUSINESS = "business"
    AI_AGENT = "ai_agent"


class EdgeType(str, Enum):
    DEPENDS_ON = "depends_on"
    CONFLICTS_WITH = "conflicts_with"
    GATES = "gates"


@dataclass
class Agent:
    external_id: str
    name: str
    type: str
    short: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None
    id: str = field(default_factory=lambda: str(uuid4()))

    def to_dict(self) -> dict[str, Any]:
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class Promise:
    external_id: str
    body: str
    domain: str
    status: str
    verification_method: str
    ref: Optional[str] = None
    promiser: Optional[str] = None  # Agent external_id
    promisee: Optional[str] = None  # Agent external_id
    target: Optional[datetime] = None
    progress: Optional[float] = None
    required: Optional[float] = None
    note: Optional[str] = None
    polarity: str = "+"
    scope: Optional[str] = None
    origin: str = "imposed"
    verification_source: Optional[str] = None
    verification_metric: Optional[str] = None
    verification_frequency: Optional[str] = None
    source_raw: Optional[dict[str, Any]] = None
    id: str = field(default_factory=lambda: str(uuid4()))
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        # Convert datetimes to ISO strings for JSON serialization
        for key in ("target", "created_at", "updated_at"):
            if d[key] is not None:
                d[key] = d[key].isoformat()
        return {k: v for k, v in d.items() if v is not None}


@dataclass
class DependencyEdge:
    source_promise_id: str  # Promise external_id
    target_promise_id: str  # Promise external_id
    edge_type: str
    weight: float = 1.0
    metadata: Optional[dict[str, Any]] = None
    id: str = field(default_factory=lambda: str(uuid4()))

    def to_dict(self) -> dict[str, Any]:
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class PromiseSnapshot:
    promise_external_id: str
    status: str
    snapshot_date: datetime
    progress: Optional[float] = None
    source_document: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None
    id: str = field(default_factory=lambda: str(uuid4()))

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        if d["snapshot_date"] is not None:
            d["snapshot_date"] = d["snapshot_date"].isoformat()
        return {k: v for k, v in d.items() if v is not None}
