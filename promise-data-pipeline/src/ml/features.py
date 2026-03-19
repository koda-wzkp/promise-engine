"""Feature extraction from promise schemas for ML prediction."""

from __future__ import annotations

from typing import Any

from ..schema.network import PromiseNetwork
from ..schema.promise import Promise


def extract_features(promise: Promise, network: PromiseNetwork) -> dict[str, Any]:
    """Extract features for outcome prediction.

    Returns a flat dict suitable for tabular ML (XGBoost).
    """
    return {
        # Promise-level features
        "domain": promise.domain,
        "verification_method": promise.verification_method,
        "has_deadline": promise.target is not None,
        "has_quantitative_target": promise.required is not None,
        "progress_ratio": (
            (promise.progress / promise.required)
            if promise.required and promise.progress is not None
            else None
        ),
        "origin": promise.origin,
        "polarity": promise.polarity,

        # Agent-level features (promiser history)
        "promiser_kept_rate": _compute_agent_kept_rate(promise.promiser, network),
        "promiser_promise_count": _count_agent_promises(promise.promiser, network),

        # Network-level features
        "dependency_count": len(network.get_dependencies(promise.external_id)),
        "dependent_count": len(network.get_dependents(promise.external_id)),
        "domain_health": _compute_domain_health(promise.domain, network),
        "network_size": len(network.promises),

        # Source-specific
        "source_type": network.source_type,
    }


def extract_features_batch(network: PromiseNetwork) -> list[dict[str, Any]]:
    """Extract features for all promises in a network."""
    return [extract_features(p, network) for p in network.promises]


def _compute_agent_kept_rate(agent_id: str | None, network: PromiseNetwork) -> float:
    """Compute the historical kept rate for an agent."""
    if not agent_id:
        return 0.5
    agent_promises = [p for p in network.promises if p.promiser == agent_id]
    if not agent_promises:
        return 0.5
    kept = sum(1 for p in agent_promises if p.status == "verified")
    return kept / len(agent_promises)


def _count_agent_promises(agent_id: str | None, network: PromiseNetwork) -> int:
    """Count promises made by an agent."""
    if not agent_id:
        return 0
    return sum(1 for p in network.promises if p.promiser == agent_id)


def _compute_domain_health(domain: str, network: PromiseNetwork) -> float:
    """Compute health score for a specific domain within the network."""
    domain_promises = [p for p in network.promises if p.domain == domain]
    if not domain_promises:
        return 0.5
    weights = {"verified": 1.0, "declared": 0.5, "degraded": 0.3, "violated": 0.0, "unverifiable": 0.2}
    scores = [weights.get(p.status, 0.5) for p in domain_promises]
    return sum(scores) / len(scores)
