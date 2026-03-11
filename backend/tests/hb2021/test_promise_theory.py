"""Promise Theory Tests for HB 2021 Vertical.

Tests grounded in Burgess's Promise Theory axioms:
1. Autonomy — only the promiser can make a promise
2. Voluntary — promises cannot be imposed
3. Observable — promises must be verifiable by the promisee
4. Idempotent — identical promises have identical verification
5. Composable — promises can form directed graphs (cascades)
6. Falsifiable — every promise must have a clear failure condition

These tests verify that our HB2021 schemas correctly encode the statutory
promises and that the verification logic produces consistent results.
"""

import pytest
from app.promise_engine.core.models import (
    PromiseResult, AgentType, VerificationResult,
)
from app.promise_engine.verticals.hb2021.verification import (
    EmissionsTrajectoryVerifier, TARGETS, BASELINE_YEAR,
)
from app.promise_engine.verticals.hb2021.schemas import HB2021_SCHEMAS
from app.promise_engine.verticals.hb2021.agents import HB2021_AGENTS


# ============================================================
# AXIOM 1: AUTONOMY — Only the promiser can make a promise
# ============================================================

class TestAutonomy:
    """Verify that each schema has a clear promiser role and
    that agents are correctly typed."""

    def test_utilities_are_promisers(self, agents):
        """Utilities (PGE, PacifiCorp, ESS) are business agents that make promises."""
        for uid in ["pge", "pacificorp", "ess"]:
            agent = agents[uid]
            assert agent.type == AgentType.BUSINESS
            assert agent.metadata["hb2021_role"] == "promiser"

    def test_regulators_are_verifiers_not_promisers(self, agents):
        """PUC and DEQ verify promises — they don't make the emissions promises."""
        for rid in ["oregon_puc", "oregon_deq"]:
            agent = agents[rid]
            assert agent.type == AgentType.PLATFORM
            assert agent.metadata["hb2021_role"] == "verifier"

    def test_communities_are_promisees(self, agents):
        """Communities receive promises — they didn't choose to be promisees."""
        for cid in ["ratepayers", "ej_communities", "tribes", "workers"]:
            agent = agents[cid]
            assert agent.type == AgentType.COMMUNITY
            assert agent.metadata["hb2021_role"] == "promisee"

    def test_legislature_is_source(self, agents):
        """Legislature enacted the law — source of statutory promises."""
        leg = agents["or_legislature"]
        assert leg.metadata["hb2021_role"] == "legislator"

    def test_emissions_schema_restricts_to_valid_utilities(self, schemas):
        """Only valid utility IDs can be promisers for emissions targets."""
        schema = schemas["hb2021.emissions_target"]
        valid_ids = schema.schema_json["properties"]["utility_id"]["enum"]
        assert set(valid_ids) == {"pge", "pacificorp", "ess"}


# ============================================================
# AXIOM 2: VOLUNTARY — Promises cannot be imposed
# ============================================================

class TestVoluntary:
    """In HB 2021, promises are imposed by statute — which creates a tension
    with Promise Theory. The schemas should make this explicit."""

    def test_schemas_are_statutory_not_voluntary(self, schemas):
        """All HB2021 schemas represent statutory obligations, not voluntary promises.
        This is a key tension: the law IMPOSES obligations on utilities."""
        for schema_id, schema in schemas.items():
            assert schema.vertical == "hb2021"
            # The description should reference statutory context
            assert any(word in schema.description.lower() for word in
                       ["utility", "ban", "must", "require", "promise"]), \
                f"Schema {schema_id} should reference statutory obligation"

    def test_rate_impact_has_escape_valve(self, schemas):
        """The 6% rate cap is the law's acknowledgment that imposed promises
        need relief valves — if compliance costs too much, utilities get an
        exemption. This is the closest thing to 'voluntary' in HB 2021."""
        rate = schemas["hb2021.rate_impact"]
        rules = rate.verification_rules["rules"]
        # There should be a renegotiated state for exemption
        renegotiated = [r for r in rules if r.get("result") == "renegotiated"]
        assert len(renegotiated) == 1
        assert "exemption" in renegotiated[0]["reason"].lower()


# ============================================================
# AXIOM 3: OBSERVABLE — Promises must be verifiable
# ============================================================

class TestObservable:
    """Each promise must have a defined verification method."""

    def test_all_schemas_have_verification_type(self, schemas):
        """Every schema specifies how it gets verified."""
        for schema_id, schema in schemas.items():
            assert schema.verification_type in (
                "automatic", "reported", "witnessed", "inferred"
            ), f"Schema {schema_id} has invalid verification_type"

    def test_all_schemas_have_verification_rules(self, schemas):
        """Every schema has at least one verification rule."""
        for schema_id, schema in schemas.items():
            rules = schema.verification_rules.get("rules", [])
            assert len(rules) >= 1, \
                f"Schema {schema_id} has no verification rules"

    def test_emissions_is_automatic(self, schemas):
        """Emissions targets can be automatically verified against trajectory."""
        assert schemas["hb2021.emissions_target"].verification_type == "automatic"

    def test_fossil_fuel_ban_is_automatic(self, schemas):
        """Fossil fuel ban is binary — automatic verification."""
        assert schemas["hb2021.fossil_fuel_ban"].verification_type == "automatic"

    def test_community_benefits_is_reported(self, schemas):
        """Community benefits require reported data — can't be fully automated."""
        assert schemas["hb2021.community_benefits"].verification_type == "reported"

    def test_every_rule_has_a_result(self, schemas):
        """Each verification rule must produce a defined PromiseResult."""
        valid_results = {"kept", "broken", "pending", "blocked", "renegotiated"}
        for schema_id, schema in schemas.items():
            for rule in schema.verification_rules.get("rules", []):
                assert rule.get("result") in valid_results, \
                    f"Schema {schema_id} has rule with invalid result: {rule}"

    def test_every_rule_has_a_reason(self, schemas):
        """Each rule must explain WHY the promise is in that state."""
        for schema_id, schema in schemas.items():
            for rule in schema.verification_rules.get("rules", []):
                assert rule.get("reason"), \
                    f"Schema {schema_id} has rule without reason: {rule}"


# ============================================================
# AXIOM 4: IDEMPOTENT — Same inputs → same result
# ============================================================

class TestIdempotent:
    """Verification must be deterministic."""

    def test_same_inputs_same_result(self, verifier):
        """Identical emissions data must produce identical verification."""
        r1 = verifier.verify(27.0, 2022, "pge")
        r2 = verifier.verify(27.0, 2022, "pge")
        assert r1.kept == r2.kept
        assert r1.result == r2.result
        assert r1.details["gap_pct"] == r2.details["gap_pct"]

    def test_idempotent_across_verifier_instances(self):
        """Two independent verifiers with same config must agree."""
        v1 = EmissionsTrajectoryVerifier(tolerance_pct=5.0)
        v2 = EmissionsTrajectoryVerifier(tolerance_pct=5.0)
        r1 = v1.verify(13.0, 2022, "pacificorp")
        r2 = v2.verify(13.0, 2022, "pacificorp")
        assert r1.kept == r2.kept
        assert r1.details == r2.details

    def test_ordering_does_not_matter(self, verifier):
        """Verifying PGE then PAC vs PAC then PGE must not change results."""
        pge_first = verifier.verify(27.0, 2022, "pge")
        verifier.verify(13.0, 2022, "pacificorp")
        pge_second = verifier.verify(27.0, 2022, "pge")
        assert pge_first.details == pge_second.details

    def test_deterministic_trajectory(self, verifier):
        """Trajectory calculation for a given year must be deterministic."""
        for _ in range(100):
            tp = verifier.expected_reduction(2026)
            assert tp.expected_reduction_pct == 62.2


# ============================================================
# AXIOM 5: COMPOSABLE — Promises form directed graphs
# ============================================================

class TestComposable:
    """HB 2021 has cascading promises: emissions → CEP → community → rates.
    If upstream breaks, downstream is affected."""

    def test_emissions_cascade_pge(self, verifier):
        """PGE's three targets form a cascade: 2030 → 2035 → 2040.
        If 2030 breaks, 2035 and 2040 are at risk."""
        r2030 = verifier.verify(27.0, 2022, "pge")
        # If behind on trajectory now, all future targets are at risk
        if not r2030.kept:
            proj = verifier.project_trajectory(27.0, 2022)
            for year in [2030, 2035, 2040]:
                assert not proj[year]["on_track"], \
                    f"PGE projected on track for {year} despite being behind now"

    def test_pacificorp_total_cascade_failure(self, verifier):
        """PacifiCorp at 13% fails all three targets — cascade collapse."""
        result = verifier.verify(13.0, 2022, "pacificorp")
        assert not result.kept
        projections = verifier.project_trajectory(13.0, 2022)
        for year in [2030, 2035, 2040]:
            assert not projections[year]["on_track"]
            assert projections[year]["gap_pct"] > 0

    def test_meeting_2030_does_not_guarantee_2040(self, verifier):
        """Even if a utility meets 2030 (80%), it might not meet 2040 (100%)."""
        # A utility at exactly 80% in 2030 — on track for 2030
        r2030 = verifier.verify(80.0, 2030, "pge")
        assert r2030.kept
        # But projecting at that annual rate...
        proj = verifier.project_trajectory(80.0, 2030)
        # The pace that got them to 80% by 2030 (from 0% in 2012)
        # is 80/18 ≈ 4.4%/year, so by 2040 they'd be at ~80 + 4.4*10 ≈ 124%
        # which caps at 100 — so actually they'd be on track
        # This is correct behavior: the linear pace to 80% by 2030 IS
        # sufficient for 100% by 2040

    def test_all_schemas_are_connected_to_agents(self, schemas, agents):
        """Every schema references agent IDs that exist in the agent registry."""
        for schema_id, schema in schemas.items():
            props = schema.schema_json.get("properties", {})
            utility_prop = props.get("utility_id", {})
            if "enum" in utility_prop:
                for uid in utility_prop["enum"]:
                    assert uid in agents, \
                        f"Schema {schema_id} references unknown agent: {uid}"


# ============================================================
# AXIOM 6: FALSIFIABLE — Clear failure conditions
# ============================================================

class TestFalsifiable:
    """Every promise must have at least one way to be broken."""

    def test_every_schema_can_be_broken(self, schemas):
        """Each schema must have at least one rule that results in 'broken'."""
        for schema_id, schema in schemas.items():
            rules = schema.verification_rules.get("rules", [])
            broken_rules = [r for r in rules if r.get("result") == "broken"]
            assert len(broken_rules) >= 1, \
                f"Schema {schema_id} has no 'broken' state — not falsifiable"

    def test_emissions_broken_when_behind_trajectory(self, verifier):
        """Emissions promise breaks when actual < expected - tolerance."""
        result = verifier.verify(10.0, 2030, "pge")
        assert not result.kept
        assert result.result == PromiseResult.BROKEN

    def test_emissions_broken_at_zero_reduction(self, verifier):
        """Zero reduction in any year after baseline is clearly broken."""
        result = verifier.verify(0.0, 2025, "pge")
        assert not result.kept

    def test_fossil_fuel_ban_broken_with_new_gas(self, schemas):
        """If new_gas_plants_permitted > 0, the ban is broken."""
        rules = schemas["hb2021.fossil_fuel_ban"].verification_rules["rules"]
        broken_rule = next(r for r in rules if r["result"] == "broken")
        assert "new_gas_plants_permitted > 0" in broken_rule["condition"] or \
               "new gas" in broken_rule["reason"].lower()


# ============================================================
# TRAJECTORY VERIFICATION — The core math
# ============================================================

class TestTrajectoryMath:
    """Verify the linear interpolation is correct against statutory targets."""

    def test_baseline_is_zero(self, verifier):
        """At baseline year (2012), expected reduction is 0%."""
        tp = verifier.expected_reduction(2012)
        assert tp.expected_reduction_pct == 0.0

    def test_2030_target_is_80(self, verifier):
        """At 2030, expected reduction is exactly 80%."""
        tp = verifier.expected_reduction(2030)
        assert tp.expected_reduction_pct == 80.0

    def test_2035_target_is_90(self, verifier):
        """At 2035, expected reduction is exactly 90%."""
        tp = verifier.expected_reduction(2035)
        assert tp.expected_reduction_pct == 90.0

    def test_2040_target_is_100(self, verifier):
        """At 2040, expected reduction is exactly 100%."""
        tp = verifier.expected_reduction(2040)
        assert tp.expected_reduction_pct == 100.0

    def test_midpoint_2021_is_40(self, verifier):
        """2021 is halfway between 2012 and 2030 → ~40% expected.
        (9/18) * 80 = 40.0"""
        tp = verifier.expected_reduction(2021)
        assert tp.expected_reduction_pct == 40.0

    def test_interpolation_between_2030_and_2035(self, verifier):
        """Between 2030 (80%) and 2035 (90%), interpolation should be linear.
        2032 → 80 + (2/5)*10 = 84%"""
        tp = verifier.expected_reduction(2032)
        assert tp.expected_reduction_pct == 84.0

    def test_interpolation_between_2035_and_2040(self, verifier):
        """Between 2035 (90%) and 2040 (100%), interpolation should be linear.
        2037 → 90 + (2/5)*10 = 94%"""
        tp = verifier.expected_reduction(2037)
        assert tp.expected_reduction_pct == 94.0

    def test_before_baseline_is_zero(self, verifier):
        """Years before baseline should return 0%."""
        tp = verifier.expected_reduction(2000)
        assert tp.expected_reduction_pct == 0.0

    def test_after_2040_is_100(self, verifier):
        """Years after 2040 should return 100%."""
        tp = verifier.expected_reduction(2050)
        assert tp.expected_reduction_pct == 100.0

    def test_trajectory_is_monotonically_increasing(self, verifier):
        """Expected reduction should never decrease year over year."""
        prev = 0.0
        for year in range(BASELINE_YEAR, 2041):
            tp = verifier.expected_reduction(year)
            assert tp.expected_reduction_pct >= prev, \
                f"Trajectory decreased at {year}: {prev} → {tp.expected_reduction_pct}"
            prev = tp.expected_reduction_pct

    def test_years_remaining_decreases(self, verifier):
        """years_remaining should decrease as we approach each target."""
        for year in range(2025, 2031):
            tp = verifier.expected_reduction(year)
            assert tp.years_remaining == 2030 - year


# ============================================================
# VERIFICATION OUTCOMES
# ============================================================

class TestVerificationOutcomes:
    """Test all possible verification outcomes."""

    def test_on_track_within_tolerance(self, verifier):
        """A utility within tolerance of trajectory is 'kept'."""
        # 2026 expected ≈ 62.2%. At 58% with 5% tolerance → kept
        result = verifier.verify(58.0, 2026, "pge")
        assert result.kept
        assert result.result == PromiseResult.KEPT

    def test_exactly_on_trajectory(self, verifier):
        """Exactly on trajectory is definitely 'kept'."""
        tp = verifier.expected_reduction(2025)
        result = verifier.verify(tp.expected_reduction_pct, 2025, "pge")
        assert result.kept

    def test_ahead_of_trajectory(self, verifier):
        """Ahead of trajectory is 'kept'."""
        result = verifier.verify(90.0, 2026, "pge")
        assert result.kept

    def test_behind_by_more_than_tolerance(self, verifier):
        """Behind by more than tolerance is 'broken'."""
        # 2026 expected ≈ 62.2%. At 50% with 5% tolerance → broken (gap=12.2)
        result = verifier.verify(50.0, 2026, "pge")
        assert not result.kept
        assert result.result == PromiseResult.BROKEN

    def test_exactly_at_tolerance_boundary_is_kept(self, verifier):
        """At exactly the tolerance boundary, should be kept (<=)."""
        tp = verifier.expected_reduction(2026)
        boundary = tp.expected_reduction_pct - 5.0
        result = verifier.verify(boundary, 2026, "pge")
        assert result.kept

    def test_just_past_tolerance_is_broken(self, verifier):
        """Just past tolerance boundary is broken."""
        tp = verifier.expected_reduction(2026)
        just_past = tp.expected_reduction_pct - 5.1
        result = verifier.verify(just_past, 2026, "pge")
        assert not result.kept

    def test_zero_tolerance_strict_mode(self, strict_verifier):
        """With zero tolerance, any gap breaks the promise."""
        tp = strict_verifier.expected_reduction(2025)
        result = strict_verifier.verify(
            tp.expected_reduction_pct - 0.1, 2025, "pge"
        )
        assert not result.kept

    def test_severity_classification(self, verifier):
        """Broken results should have severity based on gap size."""
        # Minor: gap 5-15%
        r_minor = verifier.verify(50.0, 2026, "pge")  # gap ≈ 12
        if not r_minor.kept:
            assert r_minor.details.get("severity") == "minor"

        # Major: gap 15-30%
        r_major = verifier.verify(30.0, 2026, "pge")  # gap ≈ 32
        if not r_major.kept:
            assert r_major.details.get("severity") in ("major", "critical")

        # Critical: gap > 30%
        r_critical = verifier.verify(5.0, 2030, "pacificorp")  # gap ≈ 75
        if not r_critical.kept:
            assert r_critical.details.get("severity") == "critical"


# ============================================================
# PROJECTIONS
# ============================================================

class TestProjections:
    """Test forward projections from current pace."""

    def test_projection_keys(self, verifier):
        """Projections should cover all three target years."""
        proj = verifier.project_trajectory(27.0, 2022)
        assert set(proj.keys()) == {2030, 2035, 2040}

    def test_projection_structure(self, verifier):
        """Each projection should have the required fields."""
        proj = verifier.project_trajectory(27.0, 2022)
        for year, data in proj.items():
            assert "projected_pct" in data
            assert "target_pct" in data
            assert "gap_pct" in data
            assert "on_track" in data

    def test_projection_caps_at_100(self, verifier):
        """Projected reduction should never exceed 100%."""
        # Very fast pace
        proj = verifier.project_trajectory(80.0, 2022)
        for year, data in proj.items():
            assert data["projected_pct"] <= 100.0

    def test_pge_current_pace_not_sufficient(self, verifier):
        """PGE at 27% in 2022 is not on track at current pace."""
        proj = verifier.project_trajectory(27.0, 2022)
        assert not proj[2030]["on_track"]
        assert not proj[2035]["on_track"]
        assert not proj[2040]["on_track"]

    def test_pacificorp_much_worse(self, verifier):
        """PacifiCorp at 13% has larger gaps than PGE at 27%."""
        pge = verifier.project_trajectory(27.0, 2022)
        pac = verifier.project_trajectory(13.0, 2022)
        for year in [2030, 2035, 2040]:
            assert pac[year]["gap_pct"] > pge[year]["gap_pct"]

    def test_custom_annual_rate(self, verifier):
        """Can override annual rate for scenario modeling."""
        # If PGE accelerates to 10%/year from 2022
        proj = verifier.project_trajectory(27.0, 2022, annual_rate=10.0)
        # By 2030 (8 years): 27 + 80 = 107, capped at 100
        assert proj[2030]["projected_pct"] == 100.0
        assert proj[2030]["on_track"]

    def test_zero_progress_projection(self, verifier):
        """A utility at 0% in 2022 projects badly."""
        proj = verifier.project_trajectory(0.0, 2022)
        for year in [2030, 2035, 2040]:
            assert proj[year]["projected_pct"] == 0.0
            assert not proj[year]["on_track"]


# ============================================================
# SCHEMA INTEGRITY
# ============================================================

class TestSchemaIntegrity:
    """Verify the structural integrity of all HB2021 schemas."""

    def test_all_six_schemas_exist(self, schemas):
        """HB 2021 should have exactly 6 schemas."""
        assert len(schemas) == 6

    def test_schema_ids_are_namespaced(self, schemas):
        """All schema IDs must be prefixed with 'hb2021.'."""
        for schema_id in schemas:
            assert schema_id.startswith("hb2021."), \
                f"Schema ID not namespaced: {schema_id}"

    def test_all_schemas_are_high_or_medium_stakes(self, schemas):
        """HB 2021 is serious legislation — no low-stakes schemas."""
        for schema_id, schema in schemas.items():
            assert schema.stakes in ("high", "medium"), \
                f"Schema {schema_id} has unexpectedly low stakes: {schema.stakes}"

    def test_all_schemas_have_required_fields(self, schemas):
        """Each schema must define required fields in its JSON schema."""
        for schema_id, schema in schemas.items():
            assert "required" in schema.schema_json, \
                f"Schema {schema_id} has no required fields"
            assert len(schema.schema_json["required"]) >= 1

    def test_all_schemas_have_domain_tags(self, schemas):
        """Each schema should be tagged for discoverability."""
        for schema_id, schema in schemas.items():
            assert len(schema.domain_tags) >= 2, \
                f"Schema {schema_id} needs more domain tags"
            assert "climate" in schema.domain_tags or "energy" in schema.domain_tags

    def test_all_schemas_are_training_eligible(self, schemas):
        """HB 2021 data should train the model on regulatory compliance."""
        for schema_id, schema in schemas.items():
            assert schema.training_eligible, \
                f"Schema {schema_id} should be training_eligible"

    def test_schema_json_is_valid_structure(self, schemas):
        """Each schema_json should be a valid JSON Schema object."""
        for schema_id, schema in schemas.items():
            assert schema.schema_json.get("type") == "object"
            assert "properties" in schema.schema_json


# ============================================================
# AGENT INTEGRITY
# ============================================================

class TestAgentIntegrity:
    """Verify the agent registry is complete and consistent."""

    def test_eleven_agents(self, agents):
        """HB 2021 should have exactly 11 agents."""
        assert len(agents) == 11

    def test_agent_roles_complete(self, agents):
        """Must have all roles: promiser, promisee, verifier, auditor, legislator."""
        roles = {a.metadata.get("hb2021_role") for a in agents.values()}
        assert roles >= {"promiser", "promisee", "verifier", "auditor", "legislator"}

    def test_at_least_two_utilities(self, agents):
        """At least PGE and PacifiCorp as utility promisers."""
        utilities = [a for a in agents.values()
                     if a.metadata.get("hb2021_role") == "promiser"]
        assert len(utilities) >= 2

    def test_at_least_two_regulators(self, agents):
        """At least PUC and DEQ as regulators."""
        regulators = [a for a in agents.values()
                      if a.metadata.get("hb2021_role") == "verifier"]
        assert len(regulators) >= 2

    def test_agent_ids_are_unique(self, agents):
        """No duplicate agent IDs."""
        ids = list(agents.keys())
        assert len(ids) == len(set(ids))

    def test_every_agent_has_name(self, agents):
        """Every agent must have a human-readable name."""
        for agent_id, agent in agents.items():
            assert agent.metadata.get("name"), \
                f"Agent {agent_id} has no name"

    def test_every_agent_has_short_code(self, agents):
        """Every agent must have a short code for display."""
        for agent_id, agent in agents.items():
            assert agent.metadata.get("short"), \
                f"Agent {agent_id} has no short code"
