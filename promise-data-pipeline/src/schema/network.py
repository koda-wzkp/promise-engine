"""PromiseNetwork — a collection of promises, agents, and dependency edges."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Optional
from uuid import uuid4

from .promise import Agent, DependencyEdge, Promise, PromiseSnapshot


@dataclass
class PromiseNetwork:
    slug: str
    name: str
    source_type: str  # 'gpra' | 'mona'
    description: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None
    agents: list[Agent] = field(default_factory=list)
    promises: list[Promise] = field(default_factory=list)
    edges: list[DependencyEdge] = field(default_factory=list)
    snapshots: list[PromiseSnapshot] = field(default_factory=list)
    id: str = field(default_factory=lambda: str(uuid4()))

    # Internal lookup caches
    _agent_map: dict[str, Agent] = field(default_factory=dict, repr=False)
    _promise_map: dict[str, Promise] = field(default_factory=dict, repr=False)

    def add_agent(self, agent: Agent) -> Agent:
        if agent.external_id not in self._agent_map:
            self.agents.append(agent)
            self._agent_map[agent.external_id] = agent
        return self._agent_map[agent.external_id]

    def add_promise(self, promise: Promise) -> Promise:
        if promise.external_id not in self._promise_map:
            self.promises.append(promise)
            self._promise_map[promise.external_id] = promise
        return self._promise_map[promise.external_id]

    def add_edge(self, edge: DependencyEdge) -> None:
        self.edges.append(edge)

    def add_snapshot(self, snapshot: PromiseSnapshot) -> None:
        self.snapshots.append(snapshot)

    def get_agent(self, external_id: str) -> Optional[Agent]:
        return self._agent_map.get(external_id)

    def get_promise(self, external_id: str) -> Optional[Promise]:
        return self._promise_map.get(external_id)

    def get_dependencies(self, promise_external_id: str) -> list[DependencyEdge]:
        """Get edges where this promise depends on others."""
        return [e for e in self.edges if e.source_promise_id == promise_external_id]

    def get_dependents(self, promise_external_id: str) -> list[DependencyEdge]:
        """Get edges where other promises depend on this one."""
        return [e for e in self.edges if e.target_promise_id == promise_external_id]

    @property
    def status_distribution(self) -> dict[str, int]:
        dist: dict[str, int] = {}
        for p in self.promises:
            dist[p.status] = dist.get(p.status, 0) + 1
        return dist

    @property
    def domain_distribution(self) -> dict[str, int]:
        dist: dict[str, int] = {}
        for p in self.promises:
            dist[p.domain] = dist.get(p.domain, 0) + 1
        return dist

    def summary(self) -> dict[str, Any]:
        return {
            "slug": self.slug,
            "name": self.name,
            "source_type": self.source_type,
            "num_agents": len(self.agents),
            "num_promises": len(self.promises),
            "num_edges": len(self.edges),
            "num_snapshots": len(self.snapshots),
            "status_distribution": self.status_distribution,
            "domain_distribution": self.domain_distribution,
        }
