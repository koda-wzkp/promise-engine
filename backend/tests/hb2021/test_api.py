"""API Endpoint Tests for HB 2021.

Tests the REST API layer — request/response format, status codes,
content types, error handling, and data consistency.

Note: These tests require the Flask app to initialize, including
database connection. Tests that don't need the full app stack use
the verifier/schemas/agents fixtures directly instead.
"""

import pytest
import json
from app.promise_engine.verticals.hb2021.verification import EmissionsTrajectoryVerifier
from app.promise_engine.verticals.hb2021.schemas import HB2021_SCHEMAS
from app.promise_engine.verticals.hb2021.agents import HB2021_AGENTS


# ============================================================
# DASHBOARD ENDPOINT — Unit tests (no Flask needed)
# ============================================================

class TestDashboardData:
    """Test the dashboard data assembly logic."""

    def test_dashboard_has_both_utilities(self):
        """Dashboard should include PGE and PacifiCorp."""
        from app.api.hb2021 import _build_utility_summaries
        summaries = _build_utility_summaries()
        ids = [s["id"] for s in summaries]
        assert "pge" in ids
        assert "pacificorp" in ids

    def test_utility_summary_structure(self):
        """Each utility summary has required fields."""
        from app.api.hb2021 import _build_utility_summaries
        summaries = _build_utility_summaries()
        for summary in summaries:
            assert "id" in summary
            assert "name" in summary
            assert "emissions" in summary
            assert "projections" in summary
            assert "clean_energy_plan" in summary
            assert "community_benefits" in summary
            assert "fossil_fuel_ban" in summary

    def test_emissions_data_is_consistent(self):
        """Emissions data in dashboard matches verifier output."""
        from app.api.hb2021 import _build_utility_summaries
        verifier = EmissionsTrajectoryVerifier()
        summaries = _build_utility_summaries()

        for summary in summaries:
            uid = summary["id"]
            actual = summary["emissions"]["actual_reduction_pct"]
            year = summary["emissions"]["reporting_year"]

            # Verify independently
            result = verifier.verify(actual, year, uid)
            assert summary["emissions"]["gap_pct"] == result.details["gap_pct"]
            assert summary["emissions"]["expected_reduction_pct"] == \
                result.details["expected_reduction_pct"]

    def test_projections_match_verifier(self):
        """Dashboard projections must match standalone verifier output."""
        from app.api.hb2021 import _build_utility_summaries
        verifier = EmissionsTrajectoryVerifier()
        summaries = _build_utility_summaries()

        for summary in summaries:
            actual = summary["emissions"]["actual_reduction_pct"]
            year = summary["emissions"]["reporting_year"]
            proj = verifier.project_trajectory(actual, year)

            for target_year in [2030, 2035, 2040]:
                api_proj = summary["projections"][target_year]
                calc_proj = proj[target_year]
                assert api_proj["projected_pct"] == calc_proj["projected_pct"]
                assert api_proj["on_track"] == calc_proj["on_track"]

    def test_trajectory_expected_covers_full_range(self):
        """Trajectory expected data should cover 2020-2040."""
        from app.api.hb2021 import _build_utility_summaries
        summaries = _build_utility_summaries()
        for summary in summaries:
            trajectory = summary["emissions"]["trajectory_expected"]
            years = [t["year"] for t in trajectory]
            assert min(years) == 2020
            assert max(years) == 2040
            assert len(trajectory) == 21  # 2020 through 2040 inclusive


# ============================================================
# TRAJECTORY ENDPOINT — Unit tests
# ============================================================

class TestTrajectoryEndpoint:
    """Test trajectory calculation logic."""

    def test_full_trajectory_has_all_years(self):
        """Full trajectory covers baseline to 2040."""
        verifier = EmissionsTrajectoryVerifier()
        points = []
        for y in range(2012, 2041):
            tp = verifier.expected_reduction(y)
            points.append({"year": y, "expected": tp.expected_reduction_pct})

        assert len(points) == 29  # 2012 through 2040
        assert points[0]["expected"] == 0.0
        assert points[-1]["expected"] == 100.0

    def test_single_year_query(self):
        """Single year query returns correct structure."""
        verifier = EmissionsTrajectoryVerifier()
        tp = verifier.expected_reduction(2026)
        assert tp.year == 2026
        assert tp.next_target_year == 2030
        assert tp.next_target_pct == 80.0
        assert tp.years_remaining == 4


# ============================================================
# VERIFY-EMISSIONS ENDPOINT — Unit tests
# ============================================================

class TestVerifyEmissionsEndpoint:
    """Test emissions verification logic used by the endpoint."""

    def test_valid_verification(self):
        """Standard verification request produces correct result."""
        verifier = EmissionsTrajectoryVerifier()
        result = verifier.verify(
            actual_reduction_pct=27.0,
            reporting_year=2022,
            utility_id="pge",
        )
        assert result.details["utility_id"] == "pge"
        assert result.details["reporting_year"] == 2022

    def test_custom_tolerance(self):
        """Custom tolerance changes kept/broken boundary."""
        strict = EmissionsTrajectoryVerifier(tolerance_pct=0.0)
        lenient = EmissionsTrajectoryVerifier(tolerance_pct=50.0)

        # Both verify the same data
        r_strict = strict.verify(27.0, 2022, "pge")
        r_lenient = lenient.verify(27.0, 2022, "pge")

        # With 50% tolerance, 27% at 44% expected → gap 17% < 50% → kept
        assert r_lenient.kept
        # With 0% tolerance, 27% at 44% expected → gap 17% > 0% → broken
        assert not r_strict.kept


# ============================================================
# AGENTS ENDPOINT — Unit tests
# ============================================================

class TestAgentsEndpoint:
    """Test agent listing and filtering logic."""

    def test_filter_by_role(self):
        """Filtering by hb2021_role works correctly."""
        promisers = [a for a in HB2021_AGENTS.values()
                     if a.metadata.get("hb2021_role") == "promiser"]
        assert len(promisers) == 3  # pge, pacificorp, ess

        verifiers = [a for a in HB2021_AGENTS.values()
                     if a.metadata.get("hb2021_role") == "verifier"]
        assert len(verifiers) == 2  # puc, deq

    def test_filter_by_type(self):
        """Filtering by agent type works correctly."""
        from app.promise_engine.core.models import AgentType

        businesses = [a for a in HB2021_AGENTS.values()
                      if a.type == AgentType.BUSINESS]
        assert len(businesses) == 3

        communities = [a for a in HB2021_AGENTS.values()
                       if a.type == AgentType.COMMUNITY]
        assert len(communities) == 4

        platforms = [a for a in HB2021_AGENTS.values()
                     if a.type == AgentType.PLATFORM]
        assert len(platforms) == 4  # puc, deq, legislature, cub

    def test_agent_lookup_by_id(self):
        """Individual agent lookup returns correct agent."""
        pge = HB2021_AGENTS.get("pge")
        assert pge is not None
        assert pge.metadata["name"] == "Portland General Electric"

    def test_unknown_agent_returns_none(self):
        """Looking up nonexistent agent returns None."""
        assert HB2021_AGENTS.get("nonexistent") is None


# ============================================================
# SCHEMAS ENDPOINT — Unit tests
# ============================================================

class TestSchemasEndpoint:
    """Test schema listing logic."""

    def test_all_schemas_returned(self):
        """All 6 HB2021 schemas should be returned."""
        assert len(HB2021_SCHEMAS) == 6

    def test_schema_serialization(self):
        """Schemas should be serializable to JSON."""
        for schema_id, schema in HB2021_SCHEMAS.items():
            data = {
                "id": schema.id,
                "name": schema.name,
                "description": schema.description,
                "commitment_type": schema.commitment_type,
                "stakes": schema.stakes,
                "verification_type": schema.verification_type,
                "domain_tags": schema.domain_tags,
            }
            # Should not raise
            serialized = json.dumps(data)
            parsed = json.loads(serialized)
            assert parsed["id"] == schema_id

    def test_schema_json_is_serializable(self):
        """The full schema_json and verification_rules must be JSON-serializable."""
        for schema_id, schema in HB2021_SCHEMAS.items():
            # These must not throw
            json.dumps(schema.schema_json)
            json.dumps(schema.verification_rules)


# ============================================================
# RESPONSE FORMAT CONSISTENCY
# ============================================================

class TestResponseFormat:
    """Verify API response format conventions."""

    def test_verification_result_is_json_serializable(self):
        """Verification results must be serializable for API responses."""
        verifier = EmissionsTrajectoryVerifier()
        result = verifier.verify(27.0, 2022, "pge")

        response = {
            "kept": result.kept,
            "result": result.result.value,
            "violation": result.violation,
            "details": result.details,
        }
        # Must not raise
        serialized = json.dumps(response)
        parsed = json.loads(serialized)
        assert parsed["result"] in ("kept", "broken", "pending", "blocked", "renegotiated")

    def test_projection_is_json_serializable(self):
        """Projection results must be JSON-serializable."""
        verifier = EmissionsTrajectoryVerifier()
        proj = verifier.project_trajectory(27.0, 2022)

        # int keys need to be converted to strings for JSON
        response = {str(k): v for k, v in proj.items()}
        serialized = json.dumps(response)
        parsed = json.loads(serialized)
        assert "2030" in parsed
        assert "2035" in parsed
        assert "2040" in parsed
