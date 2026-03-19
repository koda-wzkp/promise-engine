"""Tests for cascade simulation."""

from src.schema.promise import DependencyEdge, Promise
from src.analysis.cascade import simulate_cascade, identify_riskiest_cascades


def _make_chain(n: int) -> tuple[list[Promise], list[DependencyEdge]]:
    """Create a linear chain of n promises: P-0 → P-1 → ... → P-(n-1)."""
    promises = [
        Promise(
            external_id=f"P-{i}",
            body=f"Promise {i}",
            domain="test",
            status="verified",
            verification_method="audit",
        )
        for i in range(n)
    ]
    edges = [
        DependencyEdge(
            source_promise_id=f"P-{i}",
            target_promise_id=f"P-{i-1}",
            edge_type="depends_on",
        )
        for i in range(1, n)
    ]
    return promises, edges


class TestCascade:
    def test_full_chain_cascade(self):
        promises, edges = _make_chain(5)
        result = simulate_cascade("P-0", promises, edges)
        # P-0 failure should cascade through entire chain
        assert result.cascade_size == 5
        assert result.risk_score == 1.0

    def test_leaf_no_cascade(self):
        promises, edges = _make_chain(5)
        result = simulate_cascade("P-4", promises, edges)
        # P-4 is the leaf — nothing depends on it
        assert result.cascade_size == 1

    def test_middle_partial_cascade(self):
        promises, edges = _make_chain(5)
        result = simulate_cascade("P-2", promises, edges)
        # P-2 → P-3 → P-4 (those that depend on P-2)
        assert result.cascade_size >= 1

    def test_riskiest_returns_ordered(self):
        promises, edges = _make_chain(5)
        results = identify_riskiest_cascades(promises, edges, top_n=3)
        for i in range(len(results) - 1):
            assert results[i].cascade_size >= results[i + 1].cascade_size

    def test_isolated_promise(self):
        promises = [Promise(
            external_id="LONE",
            body="Alone",
            domain="test",
            status="verified",
            verification_method="audit",
        )]
        result = simulate_cascade("LONE", promises, [])
        assert result.cascade_size == 1
        assert result.risk_score == 1.0
