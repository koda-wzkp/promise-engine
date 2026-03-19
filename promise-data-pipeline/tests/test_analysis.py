"""Tests for the analysis modules."""

from src.schema.promise import Agent, DependencyEdge, Promise
from src.schema.network import PromiseNetwork
from src.analysis.health import compute_network_health
from src.analysis.boltzmann import compute_boltzmann_equilibrium
from src.analysis.percolation import compute_verification_conductivity, test_verification_culture_hypothesis
from src.analysis.cascade import simulate_cascade, identify_riskiest_cascades
from src.analysis.graph_metrics import compute_graph_metrics


def _make_network(
    statuses: list[str],
    verification: str = "audit",
    with_edges: bool = True,
) -> PromiseNetwork:
    """Build a test network with given statuses."""
    net = PromiseNetwork(slug="test", name="Test", source_type="mona")
    net.add_agent(Agent(external_id="GOV", name="Gov", type="government"))
    net.add_agent(Agent(external_id="IMF", name="IMF", type="international_org"))

    for i, status in enumerate(statuses):
        net.add_promise(Promise(
            external_id=f"P-{i}",
            body=f"Promise {i}",
            domain="fiscal",
            status=status,
            verification_method=verification,
            promiser="GOV",
            promisee="IMF",
            source_raw={},
        ))

    if with_edges and len(statuses) > 1:
        for i in range(1, len(statuses)):
            net.add_edge(DependencyEdge(
                source_promise_id=f"P-{i}",
                target_promise_id=f"P-{i-1}",
                edge_type="depends_on",
            ))

    return net


class TestHealth:
    def test_all_verified(self):
        net = _make_network(["verified", "verified", "verified"])
        health = compute_network_health(net.promises)
        assert health.overall == 1.0
        assert health.verified_rate == 1.0
        assert health.violated_rate == 0.0

    def test_all_violated(self):
        net = _make_network(["violated", "violated", "violated"])
        health = compute_network_health(net.promises)
        assert health.overall == 0.0
        assert health.violated_rate == 1.0

    def test_mixed(self):
        net = _make_network(["verified", "violated", "declared"])
        health = compute_network_health(net.promises)
        assert 0.0 < health.overall < 1.0

    def test_empty(self):
        health = compute_network_health([])
        assert health.overall == 0.0
        assert health.promise_count == 0


class TestBoltzmann:
    def test_ordered_regime(self):
        net = _make_network(["verified"] * 10)
        result = compute_boltzmann_equilibrium(net.promises, net.edges)
        assert result.magnetization > 0.5
        assert result.regime == "ordered"

    def test_disordered(self):
        statuses = ["verified", "violated", "declared", "degraded", "unverifiable"]
        net = _make_network(statuses)
        result = compute_boltzmann_equilibrium(net.promises, net.edges)
        assert result.regime in ("disordered", "spin_glass")

    def test_empty(self):
        result = compute_boltzmann_equilibrium([], [])
        assert result.magnetization == 0.0


class TestPercolation:
    def test_conductor(self):
        net = _make_network(["verified"] * 5, verification="audit")
        result = compute_verification_conductivity(net.promises, net.edges)
        assert result.sigma > 0.6
        assert result.regime == "conductor"

    def test_insulator(self):
        net = _make_network(["violated"] * 5, verification="none")
        result = compute_verification_conductivity(net.promises, net.edges)
        assert result.sigma < 0.3
        assert result.regime == "insulator"

    def test_verification_hypothesis(self):
        gpra_nets = [_make_network(["verified", "violated", "declared"], verification="self-report")]
        mona_nets = [_make_network(["verified", "violated", "declared"], verification="audit")]

        result = test_verification_culture_hypothesis(gpra_nets, mona_nets)
        assert result["hypothesis_supported"]  # MONA (audit) > GPRA (self-report)
        assert result["mona_mean_sigma"] > result["gpra_mean_sigma"]


class TestCascade:
    def test_cascade_propagation(self):
        net = _make_network(["verified", "verified", "verified"])
        result = simulate_cascade("P-0", net.promises, net.edges)
        # P-0 is the root; P-1 depends on P-0, P-2 depends on P-1
        assert result.cascade_size >= 1
        assert "P-0" in result.affected_promises

    def test_no_cascade(self):
        net = _make_network(["verified"], with_edges=False)
        result = simulate_cascade("P-0", net.promises, net.edges)
        assert result.cascade_size == 1  # Only the trigger itself

    def test_riskiest(self):
        net = _make_network(["verified"] * 5)
        results = identify_riskiest_cascades(net.promises, net.edges, top_n=3)
        # First promise in chain should have largest cascade
        if results:
            assert results[0].cascade_size >= results[-1].cascade_size


class TestGraphMetrics:
    def test_basic_metrics(self):
        net = _make_network(["verified", "verified", "verified"])
        metrics = compute_graph_metrics(net.promises, net.edges)
        assert metrics.num_nodes == 3
        assert metrics.num_edges == 2
        assert metrics.connected_components == 1

    def test_empty(self):
        metrics = compute_graph_metrics([], [])
        assert metrics.num_nodes == 0
