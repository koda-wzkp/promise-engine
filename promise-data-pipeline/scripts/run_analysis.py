#!/usr/bin/env python3
"""Compute all Paper I-VI metrics for all networks.

Usage:
    python scripts/run_analysis.py [--network SLUG] [--skip-load]
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from dataclasses import asdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.analysis.boltzmann import compute_boltzmann_equilibrium
from src.analysis.cascade import identify_riskiest_cascades
from src.analysis.graph_metrics import compute_graph_metrics
from src.analysis.health import compute_network_health
from src.analysis.percolation import compute_verification_conductivity
from src.analysis.phase_diagram import assign_phase
from src.schema.network import PromiseNetwork

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("run_analysis")


def analyze_network(network: PromiseNetwork) -> dict:
    """Run full analysis suite on a promise network."""
    logger.info(f"Analyzing '{network.slug}' ({len(network.promises)} promises, {len(network.edges)} edges)")

    results = {}

    # Paper I: Boltzmann
    boltzmann = compute_boltzmann_equilibrium(network.promises, network.edges)
    results["boltzmann"] = asdict(boltzmann)

    # Paper II: Percolation
    percolation = compute_verification_conductivity(network.promises, network.edges)
    results["percolation"] = asdict(percolation)

    # Health score
    health = compute_network_health(network.promises)
    results["health"] = asdict(health)

    # Graph metrics
    graph = compute_graph_metrics(network.promises, network.edges)
    results["graph"] = asdict(graph)

    # Cascade risk (top 5)
    cascades = identify_riskiest_cascades(network.promises, network.edges, top_n=5)
    results["cascade_riskiest"] = [asdict(c) for c in cascades]

    # Phase assignment (Paper VI)
    phase = assign_phase(boltzmann, percolation)
    results["phase"] = asdict(phase)

    logger.info(
        f"  Health: {health.overall:.2%} | "
        f"Conductivity: {percolation.sigma:.4f} ({percolation.regime}) | "
        f"Boltzmann: {boltzmann.regime} (m={boltzmann.magnetization:.3f}) | "
        f"Phase: {phase.phase}"
    )

    return results


def main():
    parser = argparse.ArgumentParser(description="Run analysis on promise networks")
    parser.add_argument("--network", type=str, help="Analyze a specific network slug")
    parser.add_argument("--skip-load", action="store_true", help="Don't save results to Supabase")
    parser.add_argument("--output", type=Path, help="Save results to JSON file")
    args = parser.parse_args()

    # For now, this script expects networks to be loaded from Supabase
    # or passed via import. Placeholder for CLI usage.
    logger.info("Analysis pipeline ready. Import and call analyze_network() with PromiseNetwork objects.")
    logger.info("Example: from scripts.run_analysis import analyze_network")


if __name__ == "__main__":
    main()
