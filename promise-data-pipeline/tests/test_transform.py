"""Tests for promise schema transformation logic."""

from datetime import date, datetime

from src.schema.mapping import map_gpra_status, map_mona_status, map_mona_sector
from src.schema.promise import Promise, DependencyEdge, PromiseSnapshot
from src.schema.network import PromiseNetwork
from src.schema.validation import validate_promise, validate_network


class TestStatusMapping:
    def test_gpra_met(self):
        assert map_gpra_status("Met") == "verified"

    def test_gpra_exceeded(self):
        assert map_gpra_status("Exceeded") == "verified"

    def test_gpra_not_met(self):
        assert map_gpra_status("Not Met") == "violated"

    def test_gpra_on_track(self):
        assert map_gpra_status("On Track") == "declared"

    def test_gpra_focus_area(self):
        assert map_gpra_status("Focus Area") == "degraded"

    def test_gpra_unknown_defaults_to_declared(self):
        assert map_gpra_status("Some Unknown Status") == "declared"

    def test_mona_met(self):
        assert map_mona_status("Met") == "verified"

    def test_mona_met_with_delay(self):
        assert map_mona_status("Met with delay") == "degraded"

    def test_mona_not_met(self):
        assert map_mona_status("Not met") == "violated"

    def test_mona_waived(self):
        assert map_mona_status("Waived") == "declared"

    def test_mona_cancelled(self):
        assert map_mona_status("Cancelled") == "declared"

    def test_mona_sector_fiscal(self):
        assert map_mona_sector("Fiscal") == "fiscal"

    def test_mona_sector_unknown(self):
        assert map_mona_sector("Something New") == "something new"

    def test_mona_sector_empty(self):
        assert map_mona_sector("") == "unclassified"


class TestPromiseValidation:
    def test_valid_promise(self):
        p = Promise(
            external_id="TEST-1",
            body="Test promise body",
            domain="fiscal",
            status="verified",
            verification_method="audit",
            promiser="GOV",
            promisee="IMF",
            source_raw={"test": True},
        )
        result = validate_promise(p)
        assert result.valid
        assert len(result.errors) == 0

    def test_missing_body(self):
        p = Promise(
            external_id="TEST-2",
            body="",
            domain="fiscal",
            status="verified",
            verification_method="audit",
        )
        result = validate_promise(p)
        assert not result.valid
        assert any("body" in e for e in result.errors)

    def test_invalid_status(self):
        p = Promise(
            external_id="TEST-3",
            body="Test",
            domain="fiscal",
            status="invalid_status",
            verification_method="audit",
        )
        result = validate_promise(p)
        assert not result.valid

    def test_warnings_for_missing_fields(self):
        p = Promise(
            external_id="TEST-4",
            body="Test",
            domain="fiscal",
            status="verified",
            verification_method="audit",
        )
        result = validate_promise(p)
        assert result.valid  # Warnings don't make it invalid
        assert len(result.warnings) > 0  # Should warn about missing promiser, etc.


class TestNetworkValidation:
    def _make_network(self) -> PromiseNetwork:
        net = PromiseNetwork(slug="test-net", name="Test", source_type="mona")
        from src.schema.promise import Agent

        a1 = Agent(external_id="GOV", name="Government", type="government")
        a2 = Agent(external_id="IMF", name="IMF", type="international_org")
        net.add_agent(a1)
        net.add_agent(a2)

        p1 = Promise(
            external_id="P-1",
            body="Promise 1",
            domain="fiscal",
            status="verified",
            verification_method="audit",
            promiser="GOV",
            promisee="IMF",
            source_raw={},
        )
        p2 = Promise(
            external_id="P-2",
            body="Promise 2",
            domain="monetary",
            status="declared",
            verification_method="audit",
            promiser="GOV",
            promisee="IMF",
            source_raw={},
        )
        net.add_promise(p1)
        net.add_promise(p2)

        edge = DependencyEdge(
            source_promise_id="P-2",
            target_promise_id="P-1",
            edge_type="depends_on",
        )
        net.add_edge(edge)

        return net

    def test_valid_network(self):
        net = self._make_network()
        result = validate_network(net)
        assert result.valid

    def test_duplicate_promise_ids(self):
        net = self._make_network()
        # Manually add a duplicate (bypassing the dedup in add_promise)
        dup = Promise(
            external_id="P-1",
            body="Duplicate",
            domain="fiscal",
            status="verified",
            verification_method="audit",
        )
        net.promises.append(dup)

        result = validate_network(net)
        assert not result.valid

    def test_orphan_edge(self):
        net = self._make_network()
        net.add_edge(DependencyEdge(
            source_promise_id="NONEXISTENT",
            target_promise_id="P-1",
            edge_type="depends_on",
        ))
        result = validate_network(net)
        assert not result.valid

    def test_network_summary(self):
        net = self._make_network()
        summary = net.summary()
        assert summary["num_promises"] == 2
        assert summary["num_agents"] == 2
        assert summary["num_edges"] == 1
        assert "verified" in summary["status_distribution"]
