"""Paper II: Percolation analysis — conductivity, band gaps, verification frontier.

Tests the key hypothesis: verification culture predicts conductivity regime.
GPRA (self-report) → semiconductor/insulator. MONA (audit) → conductor.
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from statistics import mean
from typing import Any

import networkx as nx
import numpy as np

from ..schema.network import PromiseNetwork
from ..schema.promise import DependencyEdge, Promise
from .graph_metrics import build_networkx_graph

# Verification method → conductance contribution
VERIFICATION_CONDUCTANCE: dict[str, float] = {
    "audit": 0.9,
    "sensor": 0.85,
    "benchmark": 0.75,
    "filing": 0.6,
    "self-report": 0.3,
    "none": 0.05,
}

# Status → percolation probability (does this promise "conduct" trust?)
STATUS_PERCOLATION: dict[str, float] = {
    "verified": 1.0,
    "declared": 0.4,
    "degraded": 0.2,
    "violated": 0.0,
    "unverifiable": 0.1,
}


@dataclass
class ConductivityResult:
    sigma: float                # Effective conductivity (0-1)
    regime: str                 # 'conductor' | 'semiconductor' | 'insulator'
    percolation_threshold: float  # p_c estimate
    verification_gap: float     # Gap between verification strength and actual outcomes
    band_gap: float             # Energy gap (analogy) between verified and violated
    largest_conducting_cluster: int  # Size of largest cluster of verified promises
    details: dict[str, Any]


def compute_verification_conductivity(
    promises: list[Promise],
    edges: list[DependencyEdge],
) -> ConductivityResult:
    """Compute effective conductivity of a promise network.

    Conductivity σ combines verification method strength with actual outcomes.
    """
    if not promises:
        return ConductivityResult(
            sigma=0.0,
            regime="insulator",
            percolation_threshold=0.0,
            verification_gap=0.0,
            band_gap=0.0,
            largest_conducting_cluster=0,
            details={},
        )

    n = len(promises)

    # Per-promise conductance: verification × outcome
    conductances = []
    for p in promises:
        v = VERIFICATION_CONDUCTANCE.get(p.verification_method, 0.3)
        s = STATUS_PERCOLATION.get(p.status, 0.4)
        conductances.append(v * s)

    sigma = float(np.mean(conductances))

    # Verification gap: how much does verification quality diverge from outcomes?
    # High gap = verification isn't catching violations
    verification_strengths = [
        VERIFICATION_CONDUCTANCE.get(p.verification_method, 0.3) for p in promises
    ]
    outcome_strengths = [STATUS_PERCOLATION.get(p.status, 0.4) for p in promises]
    verification_gap = float(np.mean(verification_strengths)) - float(np.mean(outcome_strengths))

    # Band gap: energy difference between verified and violated fractions
    verified_fraction = sum(1 for p in promises if p.status == "verified") / n
    violated_fraction = sum(1 for p in promises if p.status == "violated") / n
    band_gap = verified_fraction - violated_fraction

    # Percolation: find the largest cluster of "conducting" (verified/declared) promises
    G = build_networkx_graph(promises, edges)
    conducting_nodes = {
        p.external_id for p in promises if p.status in ("verified", "declared")
    }
    subgraph = G.subgraph(conducting_nodes).to_undirected()
    components = list(nx.connected_components(subgraph)) if len(subgraph) > 0 else []
    largest_cluster = max(len(c) for c in components) if components else 0

    # Estimate percolation threshold
    p_c = _estimate_percolation_threshold(G, promises)

    # Classify regime
    regime = _classify_regime(sigma, verification_gap)

    return ConductivityResult(
        sigma=round(sigma, 6),
        regime=regime,
        percolation_threshold=round(p_c, 4),
        verification_gap=round(verification_gap, 4),
        band_gap=round(band_gap, 4),
        largest_conducting_cluster=largest_cluster,
        details={
            "n_promises": n,
            "mean_verification_strength": round(float(np.mean(verification_strengths)), 4),
            "mean_outcome_strength": round(float(np.mean(outcome_strengths)), 4),
            "conducting_fraction": round(len(conducting_nodes) / n, 4),
            "num_conducting_clusters": len(components),
        },
    )


def _estimate_percolation_threshold(G: nx.DiGraph, promises: list[Promise]) -> float:
    """Estimate percolation threshold p_c via bond percolation analysis.

    p_c is the fraction of "conducting" promises needed for a giant component
    to span the network.
    """
    n = G.number_of_nodes()
    if n == 0:
        return 0.0

    # Simple estimate: p_c ≈ 1 / <k> for random graphs (Erdős-Rényi)
    degrees = [d for _, d in G.degree()]
    avg_degree = sum(degrees) / len(degrees) if degrees else 1.0

    if avg_degree > 0:
        return min(1.0 / avg_degree, 1.0)
    return 1.0


def _classify_regime(sigma: float, verification_gap: float) -> str:
    """Classify the conductivity regime.

    conductor: σ > 0.6 — trust flows freely, verification catches violations
    semiconductor: 0.3 < σ ≤ 0.6 — partial trust flow, some verification gaps
    insulator: σ ≤ 0.3 — trust blocked, verification is weak or absent
    """
    if sigma > 0.6:
        return "conductor"
    elif sigma > 0.3:
        return "semiconductor"
    else:
        return "insulator"


def test_verification_culture_hypothesis(
    gpra_networks: list[PromiseNetwork],
    mona_networks: list[PromiseNetwork],
) -> dict[str, Any]:
    """Test Paper II prediction: GPRA (self-report) < MONA (audit) conductivity.

    This is THE critical test from the paper series. If it holds across
    hundreds of networks, the verification-culture finding moves from
    "observed pattern" to "empirically validated."
    """
    gpra_results = [
        compute_verification_conductivity(n.promises, n.edges) for n in gpra_networks
    ]
    mona_results = [
        compute_verification_conductivity(n.promises, n.edges) for n in mona_networks
    ]

    gpra_sigmas = [r.sigma for r in gpra_results]
    mona_sigmas = [r.sigma for r in mona_results]

    gpra_mean = mean(gpra_sigmas) if gpra_sigmas else 0.0
    mona_mean = mean(mona_sigmas) if mona_sigmas else 0.0

    return {
        "gpra_mean_sigma": round(gpra_mean, 6),
        "mona_mean_sigma": round(mona_mean, 6),
        "gpra_regime_distribution": dict(Counter(r.regime for r in gpra_results)),
        "mona_regime_distribution": dict(Counter(r.regime for r in mona_results)),
        "hypothesis_supported": mona_mean > gpra_mean,
        "sigma_difference": round(mona_mean - gpra_mean, 6),
        "gpra_count": len(gpra_networks),
        "mona_count": len(mona_networks),
    }
