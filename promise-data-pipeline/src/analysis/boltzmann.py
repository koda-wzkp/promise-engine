"""Paper I: Boltzmann equilibrium analysis for promise networks.

Computes mean-field equilibrium, Edwards-Anderson order parameter (q_EA),
and effective temperature from promise status distributions.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any

import numpy as np

from ..schema.promise import DependencyEdge, Promise

# Status → spin mapping (Ising model analogy)
# verified = +1 (aligned), violated = -1 (anti-aligned)
STATUS_SPIN: dict[str, float] = {
    "verified": 1.0,
    "declared": 0.0,    # Undetermined
    "degraded": -0.3,
    "violated": -1.0,
    "unverifiable": 0.0,
}


@dataclass
class BoltzmannResult:
    magnetization: float       # <σ> — mean spin (1.0 = all verified, -1.0 = all violated)
    q_EA: float                # Edwards-Anderson order parameter (spin glass measure)
    effective_beta: float      # Inverse effective temperature (enforcement strength)
    energy: float              # Hamiltonian energy
    entropy: float             # Configuration entropy
    free_energy: float         # F = E - TS
    regime: str                # 'ordered' | 'disordered' | 'spin_glass'
    details: dict[str, Any]


def compute_boltzmann_equilibrium(
    promises: list[Promise],
    edges: list[DependencyEdge],
    beta: float | None = None,
) -> BoltzmannResult:
    """Compute Boltzmann equilibrium properties of a promise network.

    Args:
        promises: List of promises in the network.
        edges: Dependency edges.
        beta: Inverse temperature (enforcement strength). If None, inferred from data.
    """
    if not promises:
        return BoltzmannResult(
            magnetization=0.0,
            q_EA=0.0,
            effective_beta=0.0,
            energy=0.0,
            entropy=0.0,
            free_energy=0.0,
            regime="disordered",
            details={},
        )

    # Map promises to spins
    spins = np.array([STATUS_SPIN.get(p.status, 0.0) for p in promises])
    n = len(spins)

    # Magnetization: mean spin
    magnetization = float(np.mean(spins))

    # Edwards-Anderson order parameter: <σ²> (measures frozen disorder)
    q_EA = float(np.mean(spins ** 2))

    # Infer effective beta from the data if not provided
    if beta is None:
        beta = _infer_beta(promises, edges)

    # Energy: Hamiltonian H = -Σ J_ij σ_i σ_j - h Σ σ_i
    # Coupling J from edges, external field h from verification method
    energy = _compute_energy(promises, edges, spins)

    # Entropy: from status distribution
    status_counts: dict[str, int] = {}
    for p in promises:
        status_counts[p.status] = status_counts.get(p.status, 0) + 1
    probs = [count / n for count in status_counts.values()]
    entropy = -sum(p * math.log(p) for p in probs if p > 0)

    # Free energy
    free_energy = energy - (1.0 / beta if beta > 0 else 0) * entropy

    # Regime classification
    regime = _classify_regime(magnetization, q_EA, entropy, n)

    return BoltzmannResult(
        magnetization=round(magnetization, 6),
        q_EA=round(q_EA, 6),
        effective_beta=round(beta, 4),
        energy=round(energy, 4),
        entropy=round(entropy, 6),
        free_energy=round(free_energy, 4),
        regime=regime,
        details={
            "n_promises": n,
            "status_distribution": status_counts,
            "spin_mean": round(float(np.mean(spins)), 6),
            "spin_std": round(float(np.std(spins)), 6),
        },
    )


def _infer_beta(promises: list[Promise], edges: list[DependencyEdge]) -> float:
    """Infer effective inverse temperature from network properties.

    Higher beta = stronger enforcement = more ordered states.
    Audit verification → higher beta than self-report.
    More dependency edges → higher beta (more coupling).
    """
    n = len(promises)
    if n == 0:
        return 1.0

    # Verification strength contribution
    verification_weights = {
        "audit": 2.0,
        "filing": 1.5,
        "benchmark": 1.5,
        "sensor": 1.8,
        "self-report": 0.8,
        "none": 0.3,
    }
    avg_verification = sum(
        verification_weights.get(p.verification_method, 1.0) for p in promises
    ) / n

    # Coupling density contribution
    edge_density = len(edges) / max(n * (n - 1) / 2, 1)
    coupling_factor = 1.0 + edge_density * 2.0

    return avg_verification * coupling_factor


def _compute_energy(
    promises: list[Promise],
    edges: list[DependencyEdge],
    spins: np.ndarray,
) -> float:
    """Compute Hamiltonian energy H = -Σ J_ij σ_i σ_j."""
    # Build index lookup
    id_to_idx = {p.external_id: i for i, p in enumerate(promises)}

    energy = 0.0
    for edge in edges:
        i = id_to_idx.get(edge.source_promise_id)
        j = id_to_idx.get(edge.target_promise_id)
        if i is not None and j is not None:
            # Coupling strength J = edge weight
            J = edge.weight
            energy -= J * spins[i] * spins[j]

    return float(energy)


def _classify_regime(
    magnetization: float,
    q_EA: float,
    entropy: float,
    n: int,
) -> str:
    """Classify the thermodynamic regime of the network.

    - ordered: high |magnetization|, low entropy (strong consensus)
    - disordered: low |magnetization|, high entropy (random)
    - spin_glass: low |magnetization|, high q_EA (frozen disorder)
    """
    abs_mag = abs(magnetization)
    max_entropy = math.log(5)  # 5 possible states

    if abs_mag > 0.6:
        return "ordered"
    elif q_EA > 0.5 and abs_mag < 0.3:
        return "spin_glass"
    else:
        return "disordered"
