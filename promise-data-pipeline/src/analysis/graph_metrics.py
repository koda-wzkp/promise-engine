"""Graph metrics for promise networks: betweenness centrality, clustering, etc."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import networkx as nx

from ..schema.promise import DependencyEdge, Promise


@dataclass
class GraphMetrics:
    num_nodes: int
    num_edges: int
    density: float
    avg_degree: float
    max_degree: int
    connected_components: int
    largest_component_size: int
    avg_clustering: float
    betweenness_centrality: dict[str, float]
    degree_centrality: dict[str, float]
    top_central_nodes: list[str]  # Top 5 by betweenness


def build_networkx_graph(
    promises: list[Promise],
    edges: list[DependencyEdge],
) -> nx.DiGraph:
    """Build a NetworkX directed graph from promises and edges."""
    G = nx.DiGraph()

    for p in promises:
        G.add_node(p.external_id, status=p.status, domain=p.domain)

    for e in edges:
        if G.has_node(e.source_promise_id) and G.has_node(e.target_promise_id):
            G.add_edge(
                e.source_promise_id,
                e.target_promise_id,
                edge_type=e.edge_type,
                weight=e.weight,
            )

    return G


def compute_graph_metrics(
    promises: list[Promise],
    edges: list[DependencyEdge],
) -> GraphMetrics:
    """Compute graph-theoretic metrics on the promise dependency network."""
    G = build_networkx_graph(promises, edges)

    if G.number_of_nodes() == 0:
        return GraphMetrics(
            num_nodes=0,
            num_edges=0,
            density=0.0,
            avg_degree=0.0,
            max_degree=0,
            connected_components=0,
            largest_component_size=0,
            avg_clustering=0.0,
            betweenness_centrality={},
            degree_centrality={},
            top_central_nodes=[],
        )

    # Basic metrics
    num_nodes = G.number_of_nodes()
    num_edges = G.number_of_edges()
    density = nx.density(G)

    degrees = [d for _, d in G.degree()]
    avg_degree = sum(degrees) / len(degrees) if degrees else 0.0
    max_degree = max(degrees) if degrees else 0

    # Connected components (undirected view)
    undirected = G.to_undirected()
    components = list(nx.connected_components(undirected))
    largest_component = max(components, key=len) if components else set()

    # Clustering (on undirected)
    avg_clustering = nx.average_clustering(undirected)

    # Centrality
    betweenness = nx.betweenness_centrality(G)
    degree_cent = nx.degree_centrality(G)

    # Top 5 by betweenness
    sorted_by_betweenness = sorted(betweenness.items(), key=lambda x: x[1], reverse=True)
    top_central = [node for node, _ in sorted_by_betweenness[:5]]

    return GraphMetrics(
        num_nodes=num_nodes,
        num_edges=num_edges,
        density=round(density, 6),
        avg_degree=round(avg_degree, 4),
        max_degree=max_degree,
        connected_components=len(components),
        largest_component_size=len(largest_component),
        avg_clustering=round(avg_clustering, 6),
        betweenness_centrality={k: round(v, 6) for k, v in betweenness.items()},
        degree_centrality={k: round(v, 6) for k, v in degree_cent.items()},
        top_central_nodes=top_central,
    )


def compute_betweenness(
    promise_id: str,
    promises: list[Promise],
    edges: list[DependencyEdge],
) -> float:
    """Compute betweenness centrality for a single promise."""
    G = build_networkx_graph(promises, edges)
    bc = nx.betweenness_centrality(G)
    return bc.get(promise_id, 0.0)
