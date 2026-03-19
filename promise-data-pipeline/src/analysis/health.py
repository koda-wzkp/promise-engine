"""Network health scoring — aggregate promise status into a health metric."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..schema.network import PromiseNetwork
from ..schema.promise import Promise


# Status weights for health scoring (1.0 = perfect, 0.0 = worst)
STATUS_WEIGHTS: dict[str, float] = {
    "verified": 1.0,
    "declared": 0.5,  # In progress, not yet evaluated
    "degraded": 0.3,
    "violated": 0.0,
    "unverifiable": 0.2,
}


@dataclass
class HealthScore:
    overall: float  # 0.0 to 1.0
    by_domain: dict[str, float]
    by_status: dict[str, int]
    promise_count: int
    verified_rate: float
    violated_rate: float
    details: dict[str, Any]


def compute_network_health(promises: list[Promise]) -> HealthScore:
    """Compute the health score for a set of promises.

    Uses trust-capital weighting (stakes weighting) per CLAUDE.md invariant:
    "Trust capital uses stakes weighting, never flat averaging."

    Promises with quantitative targets (required field) are weighted
    higher than qualitative-only promises.
    """
    if not promises:
        return HealthScore(
            overall=0.0,
            by_domain={},
            by_status={},
            promise_count=0,
            verified_rate=0.0,
            violated_rate=0.0,
            details={},
        )

    # Compute weighted scores
    total_weight = 0.0
    weighted_sum = 0.0
    by_domain: dict[str, list[float]] = {}
    status_counts: dict[str, int] = {}

    for p in promises:
        score = STATUS_WEIGHTS.get(p.status, 0.5)
        # Promises with quantitative targets get higher weight
        weight = 2.0 if p.required is not None else 1.0

        weighted_sum += score * weight
        total_weight += weight

        # Domain grouping
        by_domain.setdefault(p.domain, []).append(score)

        # Status distribution
        status_counts[p.status] = status_counts.get(p.status, 0) + 1

    overall = weighted_sum / total_weight if total_weight > 0 else 0.0

    domain_scores = {
        domain: sum(scores) / len(scores)
        for domain, scores in by_domain.items()
    }

    n = len(promises)
    verified_count = status_counts.get("verified", 0)
    violated_count = status_counts.get("violated", 0)

    return HealthScore(
        overall=round(overall, 4),
        by_domain={k: round(v, 4) for k, v in domain_scores.items()},
        by_status=status_counts,
        promise_count=n,
        verified_rate=round(verified_count / n, 4),
        violated_rate=round(violated_count / n, 4),
        details={
            "total_weight": round(total_weight, 2),
            "quantitative_promises": sum(1 for p in promises if p.required is not None),
            "qualitative_promises": sum(1 for p in promises if p.required is None),
        },
    )
