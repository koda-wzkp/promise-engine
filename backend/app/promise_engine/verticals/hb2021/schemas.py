"""HB 2021 Promise Schemas - Oregon's 100% Clean Electricity Law.

Six schema categories covering the full scope of HB 2021 commitments:

1. Emissions targets (§3) - The core decarbonization promises
2. Clean Energy Plans (§4) - Planning and PUC review
3. Community benefits (§6) - Environmental justice obligations
4. Labor standards (§26) - Workforce protections for renewables
5. Rate impact (§10) - Affordability safeguard (6% cap)
6. Fossil fuel ban (§16) - No new gas plants

Baseline: 0.428 MTCO2e/MWh (average of 2010, 2011, 2012 per DEQ)
"""

from app.promise_engine.core.models import PromiseSchema


# ============================================================
# 1. EMISSIONS TARGETS (§3)
# ============================================================

EMISSIONS_TARGET = PromiseSchema(
    id="hb2021.emissions_target",
    version=1,
    vertical="hb2021",
    name="GHG Emissions Reduction Target",
    description=(
        "Utility promises to reduce greenhouse gas emissions from retail electricity "
        "to 80% below baseline by 2030, 90% by 2035, and 100% by 2040. "
        "Baseline is the average emissions intensity from 2010-2012 as established by DEQ."
    ),
    commitment_type="emissions_reduction",
    stakes="high",
    schema_json={
        "type": "object",
        "properties": {
            "utility_id": {
                "type": "string",
                "enum": ["pge", "pacificorp", "ess"],
                "description": "The reporting utility"
            },
            "reporting_year": {
                "type": "integer",
                "minimum": 2022,
                "description": "Calendar year of emissions data"
            },
            "baseline_emissions_mtco2e_per_mwh": {
                "type": "number",
                "default": 0.428,
                "description": "DEQ-established baseline (avg 2010-2012)"
            },
            "actual_emissions_mtco2e_per_mwh": {
                "type": "number",
                "minimum": 0,
                "description": "Reported emissions intensity for the year"
            },
            "target_year": {
                "type": "integer",
                "enum": [2030, 2035, 2040],
                "description": "Which statutory target applies"
            },
            "required_reduction_pct": {
                "type": "number",
                "enum": [80, 90, 100],
                "description": "Required % reduction from baseline"
            },
            "actual_reduction_pct": {
                "type": "number",
                "description": "Actual % reduction achieved from baseline"
            },
            "data_source": {
                "type": "string",
                "description": "DEQ filing reference or docket number"
            }
        },
        "required": [
            "utility_id", "reporting_year",
            "actual_emissions_mtco2e_per_mwh", "actual_reduction_pct",
            "target_year", "required_reduction_pct"
        ]
    },
    verification_type="automatic",
    verification_rules={
        "type": "trajectory",
        "baseline_year": 2012,
        "baseline_value": 0.428,
        "targets": [
            {"year": 2030, "reduction_pct": 80},
            {"year": 2035, "reduction_pct": 90},
            {"year": 2040, "reduction_pct": 100},
        ],
        "interpolation": "linear",
        "tolerance_pct": 5,
        "rules": [
            {
                "condition": "actual_reduction_pct >= expected_trajectory_pct - tolerance_pct",
                "result": "kept",
                "reason": "On or ahead of linear trajectory to target"
            },
            {
                "condition": "actual_reduction_pct < expected_trajectory_pct - tolerance_pct",
                "result": "broken",
                "reason": "Behind trajectory by more than tolerance threshold"
            },
        ]
    },
    training_eligible=True,
    domain_tags=["climate", "energy", "emissions", "decarbonization", "regulatory"]
)


# ============================================================
# 2. CLEAN ENERGY PLAN (§4)
# ============================================================

CLEAN_ENERGY_PLAN = PromiseSchema(
    id="hb2021.clean_energy_plan",
    version=1,
    vertical="hb2021",
    name="Clean Energy Plan Submission",
    description=(
        "Utility promises to submit a Clean Energy Plan (CEP) concurrent with each "
        "Integrated Resource Plan (IRP). The CEP must include annual action roadmaps, "
        "community-based renewable energy (CBRE) targets, and environmental justice "
        "assessments. PUC evaluates for public interest and consistency with targets."
    ),
    commitment_type="regulatory_filing",
    stakes="high",
    schema_json={
        "type": "object",
        "properties": {
            "utility_id": {
                "type": "string",
                "enum": ["pge", "pacificorp"]
            },
            "irp_cycle_year": {
                "type": "integer",
                "description": "IRP cycle year"
            },
            "cep_filing_date": {
                "type": "string",
                "format": "date",
                "description": "Date CEP was filed with PUC"
            },
            "cep_docket_number": {
                "type": "string",
                "description": "PUC docket number"
            },
            "puc_disposition": {
                "type": "string",
                "enum": ["accepted", "accepted_with_conditions", "rejected", "pending"],
                "description": "PUC's determination on the CEP"
            },
            "conditions": {
                "type": "array",
                "items": {"type": "string"},
                "description": "List of conditions or required modifications"
            },
            "cbre_targets_included": {
                "type": "boolean",
                "description": "Whether CEP includes community-based renewable energy targets"
            },
            "annual_action_roadmap_included": {
                "type": "boolean",
                "description": "Whether CEP includes year-by-year action plan"
            },
            "ej_assessment_included": {
                "type": "boolean",
                "description": "Whether CEP includes environmental justice assessment"
            }
        },
        "required": ["utility_id", "irp_cycle_year", "puc_disposition"]
    },
    verification_type="reported",
    verification_rules={
        "rules": [
            {
                "if": {"puc_disposition": "accepted"},
                "result": "kept",
                "reason": "CEP accepted by PUC as consistent with public interest"
            },
            {
                "if": {"puc_disposition": "accepted_with_conditions"},
                "result": "renegotiated",
                "reason": "CEP accepted with conditions — partial compliance"
            },
            {
                "if": {"puc_disposition": "rejected"},
                "result": "broken",
                "reason": "CEP rejected by PUC — no approved pathway to targets"
            },
            {
                "if": {"puc_disposition": "pending"},
                "result": "pending",
                "reason": "CEP under PUC review"
            },
        ]
    },
    training_eligible=True,
    domain_tags=["climate", "energy", "planning", "regulatory", "puc"]
)


# ============================================================
# 3. COMMUNITY BENEFITS (§6)
# ============================================================

COMMUNITY_BENEFITS = PromiseSchema(
    id="hb2021.community_benefits",
    version=1,
    vertical="hb2021",
    name="Community Benefits & Environmental Justice",
    description=(
        "Utility promises to convene a Community Benefits and Impacts Advisory Group "
        "and conduct biennial assessments of community benefits and impacts, with "
        "particular focus on environmental justice communities: communities of color, "
        "low-income, tribal, rural, and coastal communities."
    ),
    commitment_type="community_obligation",
    stakes="high",
    schema_json={
        "type": "object",
        "properties": {
            "utility_id": {
                "type": "string",
                "enum": ["pge", "pacificorp"]
            },
            "assessment_period_start": {
                "type": "string",
                "format": "date"
            },
            "assessment_period_end": {
                "type": "string",
                "format": "date"
            },
            "advisory_group_convened": {
                "type": "boolean",
                "description": "Whether UCBIAG has been convened"
            },
            "ej_investment_total_usd": {
                "type": "number",
                "minimum": 0,
                "description": "Total investment in EJ community projects"
            },
            "cbre_projects_count": {
                "type": "integer",
                "minimum": 0,
                "description": "Number of community-based renewable energy projects"
            },
            "cbre_mw_capacity": {
                "type": "number",
                "minimum": 0,
                "description": "Total MW capacity of CBRE projects"
            },
            "local_jobs_created": {
                "type": "integer",
                "minimum": 0
            },
            "rate_impact_on_low_income_pct": {
                "type": "number",
                "description": "Rate change impact on low-income ratepayers (%)"
            },
            "resiliency_projects_count": {
                "type": "integer",
                "minimum": 0
            },
            "advisory_group_recommendations": {
                "type": "array",
                "items": {"type": "string"}
            },
            "recommendations_adopted_count": {
                "type": "integer",
                "minimum": 0
            }
        },
        "required": ["utility_id", "advisory_group_convened"]
    },
    verification_type="reported",
    verification_rules={
        "rules": [
            {
                "if": {"advisory_group_convened": True},
                "result": "kept",
                "reason": "Advisory group convened as required by §6"
            },
            {
                "if": {"advisory_group_convened": False},
                "result": "broken",
                "reason": "Advisory group not convened — statutory requirement unmet"
            },
        ],
        "note": (
            "Deeper verification of community benefit outcomes requires "
            "qualitative assessment beyond automatic verification"
        )
    },
    training_eligible=True,
    domain_tags=["climate", "energy", "equity", "environmental_justice", "community"]
)


# ============================================================
# 4. LABOR STANDARDS (§26)
# ============================================================

LABOR_STANDARDS = PromiseSchema(
    id="hb2021.labor_standards",
    version=1,
    vertical="hb2021",
    name="Responsible Contractor & Labor Standards",
    description=(
        "For renewable energy projects greater than 10 MW, utility promises to require "
        "project labor agreements or prevailing wage and benefits, whether or not "
        "publicly funded. Sub-10MW projects are exempt."
    ),
    commitment_type="labor_compliance",
    stakes="medium",
    schema_json={
        "type": "object",
        "properties": {
            "project_id": {
                "type": "string"
            },
            "project_name": {
                "type": "string"
            },
            "utility_id": {
                "type": "string",
                "enum": ["pge", "pacificorp", "ess"]
            },
            "capacity_mw": {
                "type": "number",
                "minimum": 0,
                "description": "Project capacity in megawatts"
            },
            "requires_labor_standards": {
                "type": "boolean",
                "description": "True if capacity > 10 MW"
            },
            "project_labor_agreement": {
                "type": "boolean",
                "description": "Whether a PLA is in place"
            },
            "prevailing_wage_paid": {
                "type": "boolean",
                "description": "Whether prevailing wage is being paid"
            },
            "worker_count": {
                "type": "integer",
                "minimum": 0
            },
            "local_hire_pct": {
                "type": "number",
                "minimum": 0,
                "maximum": 100,
                "description": "Percentage of workers hired locally"
            }
        },
        "required": ["project_id", "utility_id", "capacity_mw"]
    },
    verification_type="reported",
    verification_rules={
        "rules": [
            {
                "condition": "capacity_mw <= 10",
                "result": "blocked",
                "reason": "Project under 10 MW — labor standards requirement does not apply"
            },
            {
                "condition": "capacity_mw > 10 and (project_labor_agreement or prevailing_wage_paid)",
                "result": "kept",
                "reason": "Project meets labor standards via PLA or prevailing wage"
            },
            {
                "condition": "capacity_mw > 10 and not project_labor_agreement and not prevailing_wage_paid",
                "result": "broken",
                "reason": "Project exceeds 10 MW but lacks PLA and prevailing wage"
            },
        ]
    },
    training_eligible=True,
    domain_tags=["climate", "energy", "labor", "workforce", "construction"]
)


# ============================================================
# 5. RATE IMPACT (§10)
# ============================================================

RATE_IMPACT = PromiseSchema(
    id="hb2021.rate_impact",
    version=1,
    vertical="hb2021",
    name="Rate Impact & Affordability Safeguard",
    description=(
        "Compliance costs must not cause annual rate impacts exceeding 6% of revenue "
        "requirement. If exceeded, the PUC may grant an exemption from compliance "
        "targets for reliability or cost reasons. This is the law's built-in tension: "
        "affordability can override emissions targets."
    ),
    commitment_type="affordability",
    stakes="high",
    schema_json={
        "type": "object",
        "properties": {
            "utility_id": {
                "type": "string",
                "enum": ["pge", "pacificorp"]
            },
            "rate_year": {
                "type": "integer"
            },
            "annual_revenue_requirement_usd": {
                "type": "number",
                "minimum": 0
            },
            "compliance_cost_usd": {
                "type": "number",
                "minimum": 0,
                "description": "Incremental cost of HB 2021 compliance"
            },
            "rate_impact_pct": {
                "type": "number",
                "description": "Compliance cost as % of revenue requirement"
            },
            "exceeds_cap": {
                "type": "boolean",
                "description": "Whether rate impact exceeds 6%"
            },
            "exemption_requested": {
                "type": "boolean"
            },
            "exemption_granted": {
                "type": "boolean"
            },
            "exemption_reason": {
                "type": "string",
                "enum": ["reliability", "cost", "both"],
                "description": "Basis for exemption request"
            }
        },
        "required": ["utility_id", "rate_year", "rate_impact_pct"]
    },
    verification_type="reported",
    verification_rules={
        "rules": [
            {
                "condition": "rate_impact_pct <= 6.0",
                "result": "kept",
                "reason": "Rate impact within 6% statutory cap"
            },
            {
                "condition": "rate_impact_pct > 6.0 and exemption_granted",
                "result": "renegotiated",
                "reason": "Rate impact exceeds cap but PUC granted exemption"
            },
            {
                "condition": "rate_impact_pct > 6.0 and not exemption_granted",
                "result": "broken",
                "reason": "Rate impact exceeds 6% cap without PUC exemption"
            },
        ]
    },
    training_eligible=True,
    domain_tags=["climate", "energy", "affordability", "rates", "regulatory"]
)


# ============================================================
# 6. FOSSIL FUEL BAN (§16)
# ============================================================

FOSSIL_FUEL_BAN = PromiseSchema(
    id="hb2021.fossil_fuel_ban",
    version=1,
    vertical="hb2021",
    name="Fossil Fuel Plant Prohibition",
    description=(
        "Permanent ban on siting new gas-fired power plants in Oregon and on "
        "expanding the capacity of existing gas-fired plants. Applies to all "
        "investor-owned utilities."
    ),
    commitment_type="prohibition",
    stakes="high",
    schema_json={
        "type": "object",
        "properties": {
            "utility_id": {
                "type": "string",
                "enum": ["pge", "pacificorp", "ess"]
            },
            "review_period_start": {
                "type": "string",
                "format": "date"
            },
            "review_period_end": {
                "type": "string",
                "format": "date"
            },
            "new_gas_plants_proposed": {
                "type": "integer",
                "minimum": 0
            },
            "new_gas_plants_permitted": {
                "type": "integer",
                "minimum": 0
            },
            "existing_gas_expansions_proposed": {
                "type": "integer",
                "minimum": 0
            },
            "existing_gas_expansions_permitted": {
                "type": "integer",
                "minimum": 0
            }
        },
        "required": ["utility_id", "review_period_start", "review_period_end"]
    },
    verification_type="automatic",
    verification_rules={
        "rules": [
            {
                "condition": "new_gas_plants_permitted == 0 and existing_gas_expansions_permitted == 0",
                "result": "kept",
                "reason": "No new gas capacity sited or expanded"
            },
            {
                "condition": "new_gas_plants_permitted > 0 or existing_gas_expansions_permitted > 0",
                "result": "broken",
                "reason": "New gas capacity permitted in violation of §16 ban"
            },
        ],
        "note": (
            "Coal-to-gas conversions (e.g. PacifiCorp) may not technically "
            "violate the siting ban but undermine emissions targets"
        )
    },
    training_eligible=True,
    domain_tags=["climate", "energy", "fossil_fuel", "prohibition", "siting"]
)


# ============================================================
# REGISTRY
# ============================================================

HB2021_SCHEMAS = {
    "hb2021.emissions_target": EMISSIONS_TARGET,
    "hb2021.clean_energy_plan": CLEAN_ENERGY_PLAN,
    "hb2021.community_benefits": COMMUNITY_BENEFITS,
    "hb2021.labor_standards": LABOR_STANDARDS,
    "hb2021.rate_impact": RATE_IMPACT,
    "hb2021.fossil_fuel_ban": FOSSIL_FUEL_BAN,
}
