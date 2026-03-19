"""Tests for MONA parsing (using fixture data)."""

from datetime import date
from src.ingestion.mona.parse import MONAArrangement, MONACondition, MONAReview
from src.ingestion.mona.transform import (
    transform_mona_arrangement,
    infer_mona_dependencies,
    build_time_series,
)
from src.schema.mapping import map_mona_status


class TestMONATransform:
    def _make_arrangement(self) -> tuple:
        arrangement = MONAArrangement(
            arrangement_id=501,
            country="Argentina",
            arrangement_type="SBA",
            approval_date=date(2022, 3, 25),
            expiration_date=date(2025, 3, 24),
            total_amount_sdr=31914.0,
            status="Active",
        )

        conditions = [
            MONACondition(
                arrangement_id=501,
                country="Argentina",
                condition_type="PA",
                review_number=1,
                condition_number=0,
                description="Submit 2022 budget to Congress",
                sector="Fiscal",
                test_date=date(2022, 6, 15),
                status="Met",
            ),
            MONACondition(
                arrangement_id=501,
                country="Argentina",
                condition_type="SB",
                review_number=1,
                condition_number=1,
                description="Publish quarterly fiscal reports",
                sector="Fiscal",
                test_date=date(2022, 6, 15),
                status="Met with delay",
            ),
            MONACondition(
                arrangement_id=501,
                country="Argentina",
                condition_type="PA",
                review_number=2,
                condition_number=2,
                description="Implement tax reform",
                sector="Fiscal",
                test_date=date(2022, 9, 15),
                status="Not met",
            ),
        ]

        reviews = [
            MONAReview(
                arrangement_id=501,
                country="Argentina",
                review_number=1,
                scheduled_date=date(2022, 6, 15),
                completion_date=date(2022, 7, 1),
                status="Completed",
            ),
            MONAReview(
                arrangement_id=501,
                country="Argentina",
                review_number=2,
                scheduled_date=date(2022, 9, 15),
                completion_date=None,
                status="Not completed",
            ),
        ]

        return arrangement, conditions, reviews

    def test_transform_creates_network(self):
        arr, conds, reviews = self._make_arrangement()
        network = transform_mona_arrangement(arr, conds, [], reviews)

        assert network.slug == "mona-argentina-sba-2022"
        assert network.source_type == "mona"
        assert len(network.agents) == 2
        assert len(network.promises) == 3

    def test_transform_status_mapping(self):
        arr, conds, reviews = self._make_arrangement()
        network = transform_mona_arrangement(arr, conds, [], reviews)

        statuses = {p.external_id: p.status for p in network.promises}
        assert statuses["SC-501-1-0"] == "verified"      # Met
        assert statuses["SC-501-1-1"] == "degraded"       # Met with delay
        assert statuses["SC-501-2-2"] == "violated"       # Not met

    def test_transform_verification_method(self):
        arr, conds, reviews = self._make_arrangement()
        network = transform_mona_arrangement(arr, conds, [], reviews)

        for p in network.promises:
            assert p.verification_method == "audit"

    def test_dependency_inference(self):
        arr, conds, reviews = self._make_arrangement()
        network = transform_mona_arrangement(arr, conds, [], reviews)
        edges = infer_mona_dependencies(conds, reviews, network)

        # PA in review 1 should gate SB in review 1
        gate_edges = [e for e in edges if e.edge_type == "gates"]
        assert len(gate_edges) > 0

        # Review 2 conditions should depend on review 1 PAs
        dep_edges = [e for e in edges if e.edge_type == "depends_on"]
        assert len(dep_edges) > 0

    def test_time_series(self):
        arr, conds, reviews = self._make_arrangement()
        network = transform_mona_arrangement(arr, conds, [], reviews)
        snapshots = build_time_series(conds, reviews, network)

        # Only review 1 is completed, so snapshots should only be from review 1
        assert len(snapshots) > 0
        for snap in snapshots:
            assert snap.source_document == "MONA Review 1"

    def test_source_traceability(self):
        arr, conds, reviews = self._make_arrangement()
        network = transform_mona_arrangement(arr, conds, [], reviews)

        for p in network.promises:
            assert p.source_raw is not None
            assert "arrangement_id" in p.source_raw
