"""Tests for GPRA parsing and transformation."""

from src.ingestion.gpra.parse import GPRARawGoal
from src.ingestion.gpra.transform import transform_gpra_goals, infer_gpra_dependencies
from src.schema.mapping import map_gpra_status


class TestGPRATransform:
    def _make_goals(self) -> list[GPRARawGoal]:
        return [
            GPRARawGoal(
                agency="Office of Personnel Management",
                goal_type="apg",
                goal_id="OPM-APG-1",
                goal_statement="Reduce average hiring time to 80 days by September 30, 2025",
                status="On Track",
                metric_name="Average hiring time (days)",
                metric_target=80.0,
                metric_actual=95.0,
                quarter="FY24Q3",
                fiscal_year=2024,
                source_file="gpra_fy2024.xlsx",
                source_sheet="APGs",
                source_row=5,
            ),
            GPRARawGoal(
                agency="Office of Personnel Management",
                goal_type="strategic_objective",
                goal_id="OPM-SO-1",
                goal_statement="Modernize federal workforce management",
                status="Noteworthy Progress",
                fiscal_year=2024,
                source_file="gpra_fy2024.xlsx",
                source_sheet="Strategic Objectives",
                source_row=10,
            ),
            GPRARawGoal(
                agency="Department of Energy",
                goal_type="apg",
                goal_id="DOE-APG-1",
                goal_statement="Increase clean energy deployment by 25%",
                status="Met",
                metric_name="Clean energy capacity (GW)",
                metric_target=100.0,
                metric_actual=110.0,
                fiscal_year=2024,
                source_file="gpra_fy2024.xlsx",
                source_sheet="APGs",
                source_row=15,
            ),
        ]

    def test_transform_groups_by_agency(self):
        goals = self._make_goals()
        networks = transform_gpra_goals(goals, fiscal_year=2024)

        # Should create 2 networks: OPM and DOE
        assert len(networks) == 2
        slugs = {n.slug for n in networks}
        assert any("opm" in s or "office-of-personnel" in s for s in slugs)
        assert any("doe" in s or "department-of-energy" in s for s in slugs)

    def test_transform_self_report_verification(self):
        goals = self._make_goals()
        networks = transform_gpra_goals(goals)

        for net in networks:
            for p in net.promises:
                assert p.verification_method == "self-report"

    def test_transform_imposed_origin(self):
        goals = self._make_goals()
        networks = transform_gpra_goals(goals)

        for net in networks:
            for p in net.promises:
                assert p.origin == "imposed"

    def test_status_mapping(self):
        goals = self._make_goals()
        networks = transform_gpra_goals(goals)

        # Find the DOE network
        doe_net = [n for n in networks if "energy" in n.slug or "doe" in n.slug]
        assert len(doe_net) == 1
        doe_promise = doe_net[0].promises[0]
        assert doe_promise.status == "verified"  # "Met" → "verified"

    def test_source_traceability(self):
        goals = self._make_goals()
        networks = transform_gpra_goals(goals)

        for net in networks:
            for p in net.promises:
                assert p.source_raw is not None
                assert "agency" in p.source_raw

    def test_dependency_inference_apg_to_objective(self):
        goals = self._make_goals()
        # Add reference from APG to strategic objective
        goals[0].strategic_objective_ref = "OPM-SO-1"

        networks = transform_gpra_goals(goals)
        opm_net = [n for n in networks if "opm" in n.slug or "office" in n.slug][0]

        # Should have a dependency edge
        assert len(opm_net.edges) > 0
        edge = opm_net.edges[0]
        assert edge.edge_type == "depends_on"
        assert edge.source_promise_id == "OPM-APG-1"
        assert edge.target_promise_id == "OPM-SO-1"
