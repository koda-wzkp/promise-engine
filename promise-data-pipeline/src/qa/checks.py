"""Data integrity checks for ingested promise networks."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from ..schema.network import PromiseNetwork

logger = logging.getLogger(__name__)


@dataclass
class CheckResult:
    name: str
    passed: bool
    message: str
    details: dict[str, Any] | None = None


def run_integrity_checks(network: PromiseNetwork) -> list[CheckResult]:
    """Run all integrity checks on a network."""
    checks = [
        _check_has_promises(network),
        _check_has_agents(network),
        _check_no_orphan_edges(network),
        _check_status_values(network),
        _check_source_traceability(network),
        _check_verification_method(network),
    ]
    passed = sum(1 for c in checks if c.passed)
    logger.info(f"Integrity checks for '{network.slug}': {passed}/{len(checks)} passed")
    return checks


def _check_has_promises(network: PromiseNetwork) -> CheckResult:
    count = len(network.promises)
    return CheckResult(
        name="has_promises",
        passed=count > 0,
        message=f"Network has {count} promises",
    )


def _check_has_agents(network: PromiseNetwork) -> CheckResult:
    count = len(network.agents)
    return CheckResult(
        name="has_agents",
        passed=count >= 2,
        message=f"Network has {count} agents (need ≥2 for promiser/promisee)",
    )


def _check_no_orphan_edges(network: PromiseNetwork) -> CheckResult:
    promise_ids = {p.external_id for p in network.promises}
    orphans = []
    for edge in network.edges:
        if edge.source_promise_id not in promise_ids:
            orphans.append(f"source={edge.source_promise_id}")
        if edge.target_promise_id not in promise_ids:
            orphans.append(f"target={edge.target_promise_id}")
    return CheckResult(
        name="no_orphan_edges",
        passed=len(orphans) == 0,
        message=f"Found {len(orphans)} orphan edge references" if orphans else "No orphan edges",
        details={"orphans": orphans[:10]} if orphans else None,
    )


def _check_status_values(network: PromiseNetwork) -> CheckResult:
    valid = {"verified", "declared", "degraded", "violated", "unverifiable"}
    invalid = []
    for p in network.promises:
        if p.status not in valid:
            invalid.append(f"{p.external_id}: '{p.status}'")
    return CheckResult(
        name="valid_status_values",
        passed=len(invalid) == 0,
        message=f"Found {len(invalid)} promises with invalid status" if invalid else "All statuses valid",
        details={"invalid": invalid[:10]} if invalid else None,
    )


def _check_source_traceability(network: PromiseNetwork) -> CheckResult:
    missing = sum(1 for p in network.promises if p.source_raw is None)
    total = len(network.promises)
    return CheckResult(
        name="source_traceability",
        passed=missing == 0,
        message=f"{total - missing}/{total} promises have source_raw populated",
    )


def _check_verification_method(network: PromiseNetwork) -> CheckResult:
    valid = {"filing", "audit", "self-report", "sensor", "benchmark", "none"}
    invalid = []
    for p in network.promises:
        if p.verification_method not in valid:
            invalid.append(f"{p.external_id}: '{p.verification_method}'")
    return CheckResult(
        name="valid_verification_methods",
        passed=len(invalid) == 0,
        message=(
            f"Found {len(invalid)} invalid verification methods" if invalid
            else "All verification methods valid"
        ),
        details={"invalid": invalid[:10]} if invalid else None,
    )


def run_mona_specific_checks(network: PromiseNetwork) -> list[CheckResult]:
    """Additional checks specific to MONA networks."""
    checks = run_integrity_checks(network)

    # MONA-specific: all verification methods should be "audit"
    non_audit = [p for p in network.promises if p.verification_method != "audit"]
    checks.append(CheckResult(
        name="mona_audit_verification",
        passed=len(non_audit) == 0,
        message=(
            f"{len(non_audit)} promises don't have audit verification"
            if non_audit else "All MONA promises use audit verification"
        ),
    ))

    # MONA-specific: should have at least one review-based dependency
    gates_edges = [e for e in network.edges if e.edge_type == "gates"]
    checks.append(CheckResult(
        name="mona_has_gating_edges",
        passed=len(gates_edges) > 0,
        message=f"Network has {len(gates_edges)} gating edges (prior actions)",
    ))

    return checks


def run_gpra_specific_checks(network: PromiseNetwork) -> list[CheckResult]:
    """Additional checks specific to GPRA networks."""
    checks = run_integrity_checks(network)

    # GPRA-specific: all verification methods should be "self-report"
    non_self = [p for p in network.promises if p.verification_method != "self-report"]
    checks.append(CheckResult(
        name="gpra_self_report_verification",
        passed=len(non_self) == 0,
        message=(
            f"{len(non_self)} promises don't have self-report verification"
            if non_self else "All GPRA promises use self-report verification"
        ),
    ))

    return checks
