"""Transform parsed MONA records into Promise schema objects."""

from __future__ import annotations

import logging
from dataclasses import asdict
from datetime import datetime
from typing import Optional

from ...schema.mapping import map_mona_sector, map_mona_status
from ...schema.network import PromiseNetwork
from ...schema.promise import Agent, DependencyEdge, Promise, PromiseSnapshot
from .parse import MONAArrangement, MONACondition, MONAQuantitativeCondition, MONAReview

logger = logging.getLogger(__name__)


def _condition_promise_id(cond: MONACondition) -> str:
    return f"SC-{cond.arrangement_id}-{cond.review_number}-{cond.condition_number}"


def _qpc_promise_id(qpc: MONAQuantitativeCondition) -> str:
    clean_name = qpc.criterion_name[:30].replace(" ", "_").replace("/", "-")
    return f"QPC-{qpc.arrangement_id}-{qpc.review_number}-{clean_name}"


def transform_mona_arrangement(
    arrangement: MONAArrangement,
    conditions: list[MONACondition],
    qpcs: list[MONAQuantitativeCondition],
    reviews: list[MONAReview],
) -> PromiseNetwork:
    """Transform a complete MONA arrangement into a PromiseNetwork."""
    country_slug = arrangement.country.lower().replace(" ", "-").replace(",", "")
    arr_type = arrangement.arrangement_type.lower()
    year = arrangement.approval_date.year if arrangement.approval_date else "unknown"

    network = PromiseNetwork(
        slug=f"mona-{country_slug}-{arr_type}-{year}",
        name=f"{arrangement.country} {arrangement.arrangement_type} ({year})",
        source_type="mona",
        metadata={
            "arrangement_id": arrangement.arrangement_id,
            "total_sdr": arrangement.total_amount_sdr,
            "arrangement_type": arrangement.arrangement_type,
            "approval_date": str(arrangement.approval_date) if arrangement.approval_date else None,
            "expiration_date": str(arrangement.expiration_date) if arrangement.expiration_date else None,
            "status": arrangement.status,
        },
    )

    # Create agents
    country_code = arrangement.country.upper()[:3]
    country_agent = Agent(
        external_id=country_code,
        name=f"{arrangement.country} Government",
        type="government",
        short=country_code,
    )
    imf_agent = Agent(
        external_id="IMF",
        name="International Monetary Fund",
        type="international_org",
        short="IMF",
    )
    network.add_agent(country_agent)
    network.add_agent(imf_agent)

    # Transform structural conditions
    for cond in conditions:
        promise_id = _condition_promise_id(cond)
        target_dt = datetime.combine(cond.test_date, datetime.min.time()) if cond.test_date else None

        promise = Promise(
            external_id=promise_id,
            ref=f"MONA/{cond.arrangement_id}/R{cond.review_number}/C{cond.condition_number}",
            promiser=country_agent.external_id,
            promisee=imf_agent.external_id,
            body=cond.description,
            domain=map_mona_sector(cond.sector or ""),
            status=map_mona_status(cond.status or ""),
            target=target_dt,
            origin="negotiated",
            verification_method="audit",
            verification_source="IMF Executive Board Review",
            verification_frequency="per_review",
            source_raw=asdict(cond),
        )
        network.add_promise(promise)

    # Transform quantitative conditions
    for qpc in qpcs:
        promise_id = _qpc_promise_id(qpc)
        target_dt = datetime.combine(qpc.test_date, datetime.min.time()) if qpc.test_date else None

        promise = Promise(
            external_id=promise_id,
            ref=f"MONA/{qpc.arrangement_id}/R{qpc.review_number}/QPC",
            promiser=country_agent.external_id,
            promisee=imf_agent.external_id,
            body=qpc.criterion_name,
            domain="quantitative",
            status=map_mona_status(qpc.status or ""),
            target=target_dt,
            progress=qpc.actual_value,
            required=qpc.target_value,
            origin="negotiated",
            verification_method="audit",
            verification_source="IMF Executive Board Review",
            verification_metric=qpc.criterion_name,
            source_raw=asdict(qpc),
        )
        network.add_promise(promise)

    return network


def infer_mona_dependencies(
    conditions: list[MONACondition],
    reviews: list[MONAReview],
    network: PromiseNetwork,
) -> list[DependencyEdge]:
    """Infer dependency edges from MONA structure.

    1. Prior Actions (PA) MUST be met before a review can be completed.
    2. Reviews are sequential — Review N depends on Review N-1.
    3. Conditions in later reviews may reference earlier structural benchmarks.
    """
    edges: list[DependencyEdge] = []
    promise_ids_in_network = {p.external_id for p in network.promises}

    # Group conditions by review number
    by_review: dict[int, list[MONACondition]] = {}
    for cond in conditions:
        by_review.setdefault(cond.review_number, []).append(cond)

    # Prior actions gate other conditions within the same review
    for review_num, review_conds in by_review.items():
        prior_actions = [c for c in review_conds if c.condition_type == "PA"]
        other_conds = [c for c in review_conds if c.condition_type != "PA"]

        for pa in prior_actions:
            pa_id = _condition_promise_id(pa)
            if pa_id not in promise_ids_in_network:
                continue
            for other in other_conds:
                other_id = _condition_promise_id(other)
                if other_id not in promise_ids_in_network:
                    continue
                edge = DependencyEdge(
                    source_promise_id=other_id,
                    target_promise_id=pa_id,
                    edge_type="gates",
                    metadata={"reason": "Prior action gates review completion"},
                )
                edges.append(edge)

    # Sequential review dependencies: conditions in review N+1 depend on
    # prior actions in review N
    review_numbers = sorted(by_review.keys())
    for i in range(1, len(review_numbers)):
        prev_num = review_numbers[i - 1]
        curr_num = review_numbers[i]

        prev_pas = [c for c in by_review.get(prev_num, []) if c.condition_type == "PA"]
        curr_conds = by_review.get(curr_num, [])

        for curr in curr_conds:
            curr_id = _condition_promise_id(curr)
            if curr_id not in promise_ids_in_network:
                continue
            for prev_pa in prev_pas:
                prev_id = _condition_promise_id(prev_pa)
                if prev_id not in promise_ids_in_network:
                    continue
                edge = DependencyEdge(
                    source_promise_id=curr_id,
                    target_promise_id=prev_id,
                    edge_type="depends_on",
                    metadata={"reason": "Sequential review dependency"},
                )
                edges.append(edge)

    return edges


def build_time_series(
    conditions: list[MONACondition],
    reviews: list[MONAReview],
    network: PromiseNetwork,
) -> list[PromiseSnapshot]:
    """Build time-series snapshots from review completions.

    For each completed review, snapshot every condition's status at that date.
    This gives us the promise network state at each review — the Paper III
    requirement for Langevin dynamics / Kramers escape rate analysis.
    """
    snapshots: list[PromiseSnapshot] = []
    promise_ids_in_network = {p.external_id for p in network.promises}

    completed_reviews = sorted(
        [r for r in reviews if r.completion_date is not None],
        key=lambda r: r.review_number,
    )

    for review in completed_reviews:
        # Get all conditions up to and including this review
        relevant_conditions = [
            c for c in conditions if c.review_number <= review.review_number
        ]
        review_date = datetime.combine(review.completion_date, datetime.min.time())

        for cond in relevant_conditions:
            cond_id = _condition_promise_id(cond)
            if cond_id not in promise_ids_in_network:
                continue
            snapshot = PromiseSnapshot(
                promise_external_id=cond_id,
                status=map_mona_status(cond.status or ""),
                snapshot_date=review_date,
                source_document=f"MONA Review {review.review_number}",
                metadata={
                    "arrangement_id": review.arrangement_id,
                    "review_number": review.review_number,
                },
            )
            snapshots.append(snapshot)

    return snapshots
