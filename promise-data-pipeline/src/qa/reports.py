"""QA report generation for ingestion runs."""

from __future__ import annotations

import json
import logging
import random
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

from ..schema.network import PromiseNetwork
from ..schema.validation import validate_network

logger = logging.getLogger(__name__)


@dataclass
class QAReport:
    source: str
    run_date: str
    records_parsed: int
    records_transformed: int
    records_failed: int
    coverage: dict[str, int] = field(default_factory=dict)
    status_distribution: dict[str, int] = field(default_factory=dict)
    missing_fields: dict[str, int] = field(default_factory=dict)
    anomalies: list[str] = field(default_factory=list)
    sample_records: list[dict[str, Any]] = field(default_factory=list)
    validation_errors: list[str] = field(default_factory=list)
    validation_warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    def save(self, output_dir: Path) -> Path:
        output_dir.mkdir(parents=True, exist_ok=True)
        filename = f"qa_{self.source}_{self.run_date.replace(':', '-').replace(' ', '_')}.json"
        path = output_dir / filename
        with open(path, "w") as f:
            json.dump(self.to_dict(), f, indent=2, default=str)
        logger.info(f"QA report saved to {path}")
        return path

    @property
    def needs_manual_review(self) -> bool:
        """Whether this run produced enough anomalies to warrant manual review."""
        if self.records_transformed == 0:
            return True
        failure_rate = self.records_failed / max(self.records_parsed, 1)
        return failure_rate > 0.05 or len(self.anomalies) > 10


def generate_qa_report(
    source: str,
    networks: list[PromiseNetwork],
    records_parsed: int,
    records_failed: int = 0,
) -> QAReport:
    """Generate a QA report for an ingestion run.

    Args:
        source: 'gpra' or 'mona'.
        networks: Transformed PromiseNetworks.
        records_parsed: Total records parsed from source files.
        records_failed: Records that failed during transformation.
    """
    report = QAReport(
        source=source,
        run_date=datetime.utcnow().isoformat(),
        records_parsed=records_parsed,
        records_transformed=sum(len(n.promises) for n in networks),
        records_failed=records_failed,
    )

    # Coverage: how many promises per network/agency
    for net in networks:
        report.coverage[net.slug] = len(net.promises)

    # Aggregate status distribution
    for net in networks:
        for status, count in net.status_distribution.items():
            report.status_distribution[status] = (
                report.status_distribution.get(status, 0) + count
            )

    # Check for missing fields
    missing_counts: dict[str, int] = {
        "target": 0,
        "progress": 0,
        "required": 0,
        "promiser": 0,
        "promisee": 0,
        "note": 0,
        "source_raw": 0,
    }
    all_promises = [p for n in networks for p in n.promises]
    for p in all_promises:
        if p.target is None:
            missing_counts["target"] += 1
        if p.progress is None:
            missing_counts["progress"] += 1
        if p.required is None:
            missing_counts["required"] += 1
        if not p.promiser:
            missing_counts["promiser"] += 1
        if not p.promisee:
            missing_counts["promisee"] += 1
        if not p.note:
            missing_counts["note"] += 1
        if p.source_raw is None:
            missing_counts["source_raw"] += 1
    report.missing_fields = missing_counts

    # Detect anomalies
    for net in networks:
        result = validate_network(net)
        report.validation_errors.extend(result.errors)
        report.validation_warnings.extend(result.warnings[:50])  # Cap warnings

        # Check for suspicious patterns
        if len(net.promises) == 0:
            report.anomalies.append(f"Network '{net.slug}' has no promises")
        if net.status_distribution.get("declared", 0) > len(net.promises) * 0.8:
            report.anomalies.append(
                f"Network '{net.slug}': >80% of promises are 'declared' (possibly missing outcomes)"
            )

    # Sample records for manual spot-check
    if all_promises:
        sample_size = min(5, len(all_promises))
        sample = random.sample(all_promises, sample_size)
        report.sample_records = [p.to_dict() for p in sample]

    return report
