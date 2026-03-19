"""Transform parsed GPRA records into Promise schema objects."""

from __future__ import annotations

import logging
import re
from dataclasses import asdict
from datetime import datetime
from typing import Optional

from ...schema.mapping import GPRA_AGENCY_CODES, map_gpra_status
from ...schema.network import PromiseNetwork
from ...schema.promise import Agent, DependencyEdge, Promise
from .parse import GPRARawGoal

logger = logging.getLogger(__name__)


def _parse_target_date(target_str: Optional[str]) -> Optional[datetime]:
    """Parse GPRA target dates like 'September 30, 2025' or 'FY2024 Q4'."""
    if not target_str:
        return None
    try:
        return datetime.strptime(target_str, "%B %d, %Y")
    except ValueError:
        pass
    # Try 'September 30, 2025' without day
    try:
        return datetime.strptime(target_str, "%B %Y")
    except ValueError:
        pass
    # Try FY format
    match = re.search(r"FY\s*(\d{2,4})", target_str, re.IGNORECASE)
    if match:
        year = int(match.group(1))
        if year < 100:
            year += 2000
        return datetime(year, 9, 30)  # GPRA fiscal year ends Sept 30
    return None


def _infer_domain(goal: GPRARawGoal) -> str:
    """Infer a domain from the goal statement and agency."""
    text = (goal.goal_statement or "").lower()
    # Simple keyword-based domain inference
    domain_keywords = {
        "health": ["health", "medical", "disease", "hospital", "patient", "veteran"],
        "education": ["education", "student", "school", "learning", "literacy"],
        "defense": ["defense", "military", "security", "threat"],
        "environment": ["environment", "climate", "emission", "energy", "clean"],
        "economy": ["economic", "employment", "job", "workforce", "business"],
        "infrastructure": ["infrastructure", "transport", "highway", "bridge"],
        "technology": ["technology", "cyber", "digital", "innovation", "IT"],
        "justice": ["justice", "crime", "law enforcement", "prison"],
        "housing": ["housing", "homeless", "shelter"],
        "agriculture": ["agriculture", "farm", "food", "nutrition"],
        "diplomacy": ["diplomacy", "foreign", "international", "treaty"],
        "fiscal": ["budget", "fiscal", "revenue", "tax", "spending"],
        "social": ["social", "welfare", "poverty", "disability"],
    }
    for domain, keywords in domain_keywords.items():
        if any(kw in text for kw in keywords):
            return domain
    return "general"


def transform_gpra_goals(
    goals: list[GPRARawGoal],
    fiscal_year: Optional[int] = None,
) -> list[PromiseNetwork]:
    """Transform GPRA goals into PromiseNetworks, one per agency.

    Groups goals by agency and creates a separate network for each.
    """
    # Group by agency
    by_agency: dict[str, list[GPRARawGoal]] = {}
    for goal in goals:
        by_agency.setdefault(goal.agency, []).append(goal)

    networks: list[PromiseNetwork] = []
    for agency_name, agency_goals in by_agency.items():
        fy = fiscal_year or agency_goals[0].fiscal_year or 0
        agency_slug = agency_name.lower().replace(" ", "-").replace(".", "")[:30]
        network = _transform_agency(agency_name, agency_slug, agency_goals, fy)
        networks.append(network)

    logger.info(f"Transformed {len(goals)} GPRA goals into {len(networks)} networks")
    return networks


def _transform_agency(
    agency_name: str,
    agency_slug: str,
    goals: list[GPRARawGoal],
    fiscal_year: int,
) -> PromiseNetwork:
    """Transform one agency's goals into a PromiseNetwork."""
    network = PromiseNetwork(
        slug=f"gpra-{agency_slug}-fy{fiscal_year}",
        name=f"{agency_name} (FY{fiscal_year})",
        source_type="gpra",
        metadata={
            "agency": agency_name,
            "fiscal_year": fiscal_year,
            "goal_count": len(goals),
        },
    )

    # Create agents
    # Look up agency code
    agency_code = None
    for code, name in GPRA_AGENCY_CODES.items():
        if name.lower() in agency_name.lower() or agency_name.lower() in name.lower():
            agency_code = code
            break
    if not agency_code:
        agency_code = agency_name.upper().replace(" ", "")[:6]

    agency_agent = Agent(
        external_id=agency_code,
        name=agency_name,
        type="agency",
        short=agency_code,
    )
    public_agent = Agent(
        external_id="PUBLIC",
        name="American Public",
        type="government",
        short="PUB",
    )
    network.add_agent(agency_agent)
    network.add_agent(public_agent)

    # Transform each goal
    for goal in goals:
        target_dt = _parse_target_date(goal.target_date)

        promise = Promise(
            external_id=goal.goal_id,
            ref=f"GPRA/{agency_code}/{goal.goal_id}",
            promiser=agency_agent.external_id,
            promisee=public_agent.external_id,
            body=goal.goal_statement,
            domain=_infer_domain(goal),
            status=map_gpra_status(goal.status or ""),
            target=target_dt,
            progress=goal.metric_actual,
            required=goal.metric_target,
            note=goal.narrative,
            polarity="+",
            origin="imposed",
            verification_method="self-report",
            verification_source=f"{agency_name} Annual Performance Report",
            verification_metric=goal.metric_name,
            verification_frequency="quarterly",
            source_raw=asdict(goal),
        )
        network.add_promise(promise)

    # Infer dependencies
    edges = infer_gpra_dependencies(goals, network)
    for edge in edges:
        network.add_edge(edge)

    return network


def infer_gpra_dependencies(
    goals: list[GPRARawGoal],
    network: PromiseNetwork,
) -> list[DependencyEdge]:
    """Infer dependency edges within GPRA goals.

    - APGs reference parent Strategic Objectives → depends_on edge
    - Goals within the same strategic objective area are related
    """
    edges: list[DependencyEdge] = []
    promise_ids = {p.external_id for p in network.promises}

    # APGs depend on their parent strategic objectives
    for goal in goals:
        if goal.goal_type == "apg" and goal.strategic_objective_ref:
            if goal.goal_id in promise_ids and goal.strategic_objective_ref in promise_ids:
                edges.append(DependencyEdge(
                    source_promise_id=goal.goal_id,
                    target_promise_id=goal.strategic_objective_ref,
                    edge_type="depends_on",
                    metadata={"reason": "APG implements strategic objective"},
                ))

    return edges
