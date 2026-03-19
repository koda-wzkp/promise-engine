"""Deterministic cascade propagation through promise dependency networks."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..schema.promise import DependencyEdge, Promise
from .graph_metrics import build_networkx_graph


@dataclass
class CascadeResult:
    trigger_promise_id: str
    affected_promises: list[str]
    cascade_depth: int
    cascade_size: int
    risk_score: float  # 0-1 based on how many promises are affected
    path: list[list[str]]  # Promises affected at each depth level


def simulate_cascade(
    trigger_id: str,
    promises: list[Promise],
    edges: list[DependencyEdge],
    propagation_probability: float = 0.8,
) -> CascadeResult:
    """Simulate cascade propagation from a single promise failure.

    When a promise is violated, dependent promises may also fail.
    This simulates deterministic cascade (probability = 1.0) or
    probabilistic cascade (probability < 1.0).
    """
    # Build adjacency: for each promise, which promises depend on it?
    dependents: dict[str, list[str]] = {}
    for edge in edges:
        if edge.edge_type in ("depends_on", "gates"):
            # If target fails, source may fail too
            dependents.setdefault(edge.target_promise_id, []).append(edge.source_promise_id)

    affected: list[str] = []
    visited: set[str] = set()
    path: list[list[str]] = []

    # BFS cascade
    current_level = [trigger_id]
    while current_level:
        next_level: list[str] = []
        level_affected: list[str] = []

        for pid in current_level:
            if pid in visited:
                continue
            visited.add(pid)
            level_affected.append(pid)
            affected.append(pid)

            for dep in dependents.get(pid, []):
                if dep not in visited:
                    next_level.append(dep)

        if level_affected:
            path.append(level_affected)
        current_level = next_level

    n = len(promises)
    risk_score = len(affected) / n if n > 0 else 0.0

    return CascadeResult(
        trigger_promise_id=trigger_id,
        affected_promises=affected,
        cascade_depth=len(path),
        cascade_size=len(affected),
        risk_score=round(risk_score, 4),
        path=path,
    )


def identify_riskiest_cascades(
    promises: list[Promise],
    edges: list[DependencyEdge],
    top_n: int = 5,
) -> list[CascadeResult]:
    """Find the promises whose failure would cause the largest cascades."""
    results: list[CascadeResult] = []

    for p in promises:
        result = simulate_cascade(p.external_id, promises, edges)
        if result.cascade_size > 1:  # Only include non-trivial cascades
            results.append(result)

    # Sort by cascade size descending
    results.sort(key=lambda r: r.cascade_size, reverse=True)
    return results[:top_n]
