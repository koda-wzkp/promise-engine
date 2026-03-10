"""Seed HB 2021 data into the database.

Registers all agents, schemas, and initial promise events (emissions filings,
CEP filings, fossil fuel compliance) so the dashboard can pull from the DB
instead of hardcoded values.

Usage:
    DATABASE_URL=postgresql://... python scripts/seed_hb2021.py

Idempotent — safe to run multiple times. Uses upsert semantics.
"""

import os
import sys
from datetime import datetime
from uuid import uuid4

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import init_database, get_db, Base
from app.promise_engine.storage.repository import PromiseRepository
from app.promise_engine.verticals.hb2021.schemas import HB2021_SCHEMAS
from app.promise_engine.verticals.hb2021.agents import HB2021_AGENTS
from app.promise_engine.core.models import (
    Agent, AgentType, PromiseEvent, PromiseResult, PromiseSchema, SignalStrength,
)


# ============================================================
# SEED DATA: Known HB 2021 filings and compliance records
# ============================================================

EMISSIONS_FILINGS = [
    # PGE emissions history
    {"utility": "pge", "year": 2020, "reduction_pct": 22.0},
    {"utility": "pge", "year": 2021, "reduction_pct": 24.0},
    {"utility": "pge", "year": 2022, "reduction_pct": 27.0},
    # PacifiCorp emissions history
    {"utility": "pacificorp", "year": 2020, "reduction_pct": 10.0},
    {"utility": "pacificorp", "year": 2021, "reduction_pct": 11.0},
    {"utility": "pacificorp", "year": 2022, "reduction_pct": 13.0},
]

CEP_FILINGS = [
    {
        "utility": "pge",
        "irp_cycle_year": 2023,
        "cep_filing_date": "2023-03-31",
        "cep_docket_number": "LC 80",
        "puc_disposition": "accepted_with_conditions",
        "cbre_targets_included": True,
        "annual_action_roadmap_included": True,
        "ej_assessment_included": True,
    },
    {
        "utility": "pacificorp",
        "irp_cycle_year": 2023,
        "cep_filing_date": "2023-05-31",
        "cep_docket_number": "LC 82",
        "puc_disposition": "accepted_with_conditions",
        "cbre_targets_included": True,
        "annual_action_roadmap_included": True,
        "ej_assessment_included": False,
    },
]

COMMUNITY_BENEFITS_FILINGS = [
    {
        "utility": "pge",
        "advisory_group_convened": True,
        "assessment_period": "2023-2024",
    },
    {
        "utility": "pacificorp",
        "advisory_group_convened": True,
        "assessment_period": "2023-2024",
    },
]

FOSSIL_FUEL_REVIEWS = [
    {
        "utility": "pge",
        "review_period_start": "2022-01-01",
        "review_period_end": "2022-12-31",
        "new_gas_plants_permitted": 0,
        "existing_gas_expansions_permitted": 0,
    },
    {
        "utility": "pacificorp",
        "review_period_start": "2022-01-01",
        "review_period_end": "2022-12-31",
        "new_gas_plants_permitted": 0,
        "existing_gas_expansions_permitted": 0,
    },
]


def seed():
    """Run the full seed."""
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("ERROR: DATABASE_URL environment variable required")
        print("  Example: DATABASE_URL=postgresql://user:pass@host:5432/dbname python scripts/seed_hb2021.py")
        sys.exit(1)

    init_database(db_url)

    with get_db() as db:
        repo = PromiseRepository(db)
        counts = {"agents": 0, "schemas": 0, "events": 0}

        # 1. Seed agents
        print("Seeding agents...")
        for agent_id, agent in HB2021_AGENTS.items():
            repo.save_agent(agent)
            counts["agents"] += 1
        print(f"  {counts['agents']} agents registered")

        # 2. Seed schemas
        print("Seeding schemas...")
        for schema_id, schema in HB2021_SCHEMAS.items():
            repo.save_schema(schema)
            counts["schemas"] += 1
        print(f"  {counts['schemas']} schemas registered")

        # 3. Seed emissions filing events
        print("Seeding emissions filings...")
        deq = HB2021_AGENTS["oregon_deq"]
        for filing in EMISSIONS_FILINGS:
            utility = HB2021_AGENTS[filing["utility"]]
            event = PromiseEvent(
                id=uuid4(),
                timestamp=datetime(filing["year"], 12, 31),
                vertical="hb2021",
                promise_schema_id="hb2021.emissions_target",
                promise_version=1,
                promiser=utility,
                promisee=HB2021_AGENTS["ratepayers"],
                input_context={
                    "utility_id": filing["utility"],
                    "reporting_year": filing["year"],
                    "actual_reduction_pct": filing["reduction_pct"],
                    "baseline_emissions_mtco2e_per_mwh": 0.428,
                    "target_year": 2030,
                    "required_reduction_pct": 80,
                    "data_source": "DEQ annual emissions report",
                },
                output={
                    "actual_reduction_pct": filing["reduction_pct"],
                    "trajectory_status": "in_progress",
                },
                result=PromiseResult.PENDING,
                signal_strength=SignalStrength.IMPLICIT,
                due_by=datetime(2030, 12, 31),
                training_eligible=True,
            )
            repo.save_event(event)
            counts["events"] += 1

        # 4. Seed CEP filings
        print("Seeding Clean Energy Plan filings...")
        puc = HB2021_AGENTS["oregon_puc"]
        for filing in CEP_FILINGS:
            utility = HB2021_AGENTS[filing["utility"]]
            disposition = filing["puc_disposition"]
            if disposition == "accepted":
                result = PromiseResult.KEPT
            elif disposition == "accepted_with_conditions":
                result = PromiseResult.RENEGOTIATED
            elif disposition == "rejected":
                result = PromiseResult.BROKEN
            else:
                result = PromiseResult.PENDING

            event = PromiseEvent(
                id=uuid4(),
                timestamp=datetime(filing["irp_cycle_year"], 6, 30),
                vertical="hb2021",
                promise_schema_id="hb2021.clean_energy_plan",
                promise_version=1,
                promiser=utility,
                promisee=puc,
                input_context={
                    "utility_id": filing["utility"],
                    "irp_cycle_year": filing["irp_cycle_year"],
                    "cep_filing_date": filing["cep_filing_date"],
                    "cep_docket_number": filing["cep_docket_number"],
                    "puc_disposition": disposition,
                    "cbre_targets_included": filing["cbre_targets_included"],
                    "annual_action_roadmap_included": filing["annual_action_roadmap_included"],
                    "ej_assessment_included": filing["ej_assessment_included"],
                },
                output={"puc_disposition": disposition},
                result=result,
                signal_strength=SignalStrength.IMPLICIT,
                training_eligible=True,
            )
            repo.save_event(event)
            counts["events"] += 1

        # 5. Seed community benefits
        print("Seeding community benefits filings...")
        for filing in COMMUNITY_BENEFITS_FILINGS:
            utility = HB2021_AGENTS[filing["utility"]]
            result = PromiseResult.KEPT if filing["advisory_group_convened"] else PromiseResult.BROKEN
            event = PromiseEvent(
                id=uuid4(),
                timestamp=datetime(2024, 6, 30),
                vertical="hb2021",
                promise_schema_id="hb2021.community_benefits",
                promise_version=1,
                promiser=utility,
                promisee=HB2021_AGENTS["ej_communities"],
                input_context={
                    "utility_id": filing["utility"],
                    "advisory_group_convened": filing["advisory_group_convened"],
                    "assessment_period_start": filing["assessment_period"].split("-")[0] + "-01-01",
                    "assessment_period_end": filing["assessment_period"].split("-")[1] + "-12-31",
                },
                output={"advisory_group_convened": filing["advisory_group_convened"]},
                result=result,
                signal_strength=SignalStrength.IMPLICIT,
                training_eligible=True,
            )
            repo.save_event(event)
            counts["events"] += 1

        # 6. Seed fossil fuel ban compliance
        print("Seeding fossil fuel ban reviews...")
        for review in FOSSIL_FUEL_REVIEWS:
            utility = HB2021_AGENTS[review["utility"]]
            compliant = (review["new_gas_plants_permitted"] == 0 and
                        review["existing_gas_expansions_permitted"] == 0)
            result = PromiseResult.KEPT if compliant else PromiseResult.BROKEN
            event = PromiseEvent(
                id=uuid4(),
                timestamp=datetime(2023, 3, 31),
                vertical="hb2021",
                promise_schema_id="hb2021.fossil_fuel_ban",
                promise_version=1,
                promiser=utility,
                promisee=HB2021_AGENTS["ratepayers"],
                input_context={
                    "utility_id": review["utility"],
                    "review_period_start": review["review_period_start"],
                    "review_period_end": review["review_period_end"],
                    "new_gas_plants_permitted": review["new_gas_plants_permitted"],
                    "existing_gas_expansions_permitted": review["existing_gas_expansions_permitted"],
                },
                output={"compliant": compliant},
                result=result,
                signal_strength=SignalStrength.IMPLICIT,
                training_eligible=True,
            )
            repo.save_event(event)
            counts["events"] += 1

        print(f"\nSeed complete:")
        print(f"  Agents:  {counts['agents']}")
        print(f"  Schemas: {counts['schemas']}")
        print(f"  Events:  {counts['events']}")
        print(f"  Total:   {sum(counts.values())} records")


if __name__ == "__main__":
    seed()
