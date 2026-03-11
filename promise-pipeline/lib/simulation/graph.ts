import { Promise, Agent } from "../types/promise";
import { PromiseGraph, GraphNode, GraphEdge } from "../types/simulation";

/**
 * Build a graph representation from promises and agents.
 * Nodes: each promise + each agent
 * Edges: depends_on (promise→promise), promiser (agent→promise), promisee (promise→agent)
 */
export function buildPromiseGraph(promises: Promise[], agents: Agent[]): PromiseGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Add agent nodes
  for (const agent of agents) {
    nodes.push({
      id: agent.id,
      type: "agent",
      label: agent.short,
    });
  }

  // Add promise nodes
  for (const promise of promises) {
    nodes.push({
      id: promise.id,
      type: "promise",
      label: promise.id,
      status: promise.status,
      domain: promise.domain,
    });

    // Promiser edge: agent → promise
    edges.push({
      source: promise.promiser,
      target: promise.id,
      type: "promiser",
    });

    // Promisee edge: promise → agent
    edges.push({
      source: promise.id,
      target: promise.promisee,
      type: "promisee",
    });

    // Dependency edges: upstream promise → this promise
    for (const depId of promise.depends_on) {
      edges.push({
        source: depId,
        target: promise.id,
        type: "depends_on",
      });
    }
  }

  return { nodes, edges };
}

/**
 * Domain-clustered layout with wider spread and agent orbiting.
 * Promises are grouped by domain into distinct clusters with visual separation.
 * Agents orbit the periphery near their associated promise clusters.
 */
export function layoutGraph(graph: PromiseGraph, width: number, height: number): PromiseGraph {
  const centerX = width / 2;
  const centerY = height / 2;

  // Collect unique domains from promise nodes
  const domains = Array.from(new Set(
    graph.nodes.filter((n) => n.type === "promise" && n.domain).map((n) => n.domain!)
  ));

  // Assign angular sectors to each domain with more separation
  const domainAngle = (2 * Math.PI) / Math.max(domains.length, 1);
  const domainMap = new Map(domains.map((d, i) => [d, i * domainAngle - Math.PI / 2]));

  // Use more of the available space
  const promiseRadius = Math.min(width, height) * 0.32;
  const agentRadius = Math.min(width, height) * 0.46;

  // Build a map: agent → which domains they're connected to (promiser edges)
  const agentDomains = new Map<string, string[]>();
  for (const edge of graph.edges) {
    if (edge.type === "promiser") {
      const promiseNode = graph.nodes.find((n) => n.id === edge.target);
      if (promiseNode?.domain) {
        const existing = agentDomains.get(edge.source) ?? [];
        if (!existing.includes(promiseNode.domain)) {
          existing.push(promiseNode.domain);
        }
        agentDomains.set(edge.source, existing);
      }
    }
  }

  const positioned = graph.nodes.map((node) => {
    if (node.type === "promise" && node.domain) {
      const baseAngle = domainMap.get(node.domain) ?? 0;
      const domainNodes = graph.nodes.filter(
        (n) => n.type === "promise" && n.domain === node.domain
      );
      const idx = domainNodes.indexOf(node);
      const count = domainNodes.length;

      // Spread within the domain sector — use more of the angular space
      // but leave gaps between domains for visual separation
      const sectorSize = domainAngle * 0.65;
      let angle: number;
      if (count === 1) {
        angle = baseAngle;
      } else {
        angle = baseAngle + ((idx / (count - 1)) - 0.5) * sectorSize;
      }

      // Stagger radius slightly for nodes in same domain to reduce overlap
      const radiusJitter = (idx % 2 === 0 ? -1 : 1) * Math.min(width, height) * 0.04;
      const r = promiseRadius + radiusJitter;

      return {
        ...node,
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      };
    } else {
      // Agent: place near the average angle of their associated domains
      const domains = agentDomains.get(node.id) ?? [];
      let angle: number;

      if (domains.length > 0) {
        // Compute average angle of associated domains
        let sumSin = 0, sumCos = 0;
        for (const d of domains) {
          const a = domainMap.get(d) ?? 0;
          sumSin += Math.sin(a);
          sumCos += Math.cos(a);
        }
        angle = Math.atan2(sumSin / domains.length, sumCos / domains.length);

        // Slight offset per agent to avoid overlap
        const agentNodes = graph.nodes.filter((n) => n.type === "agent");
        const sameAngleAgents = agentNodes.filter((n) => {
          const ad = agentDomains.get(n.id) ?? [];
          return ad.some((d) => domains.includes(d));
        });
        const subIdx = sameAngleAgents.indexOf(node);
        const spread = 0.25;
        angle += (subIdx - (sameAngleAgents.length - 1) / 2) * spread;
      } else {
        // Fallback: evenly space unconnected agents
        const agentNodes = graph.nodes.filter((n) => n.type === "agent");
        const idx = agentNodes.indexOf(node);
        angle = (idx / Math.max(agentNodes.length, 1)) * 2 * Math.PI;
      }

      return {
        ...node,
        x: centerX + agentRadius * Math.cos(angle),
        y: centerY + agentRadius * Math.sin(angle),
      };
    }
  });

  return { nodes: positioned, edges: graph.edges };
}

/**
 * Get all promises that depend on a given promise (direct + transitive).
 * These are downstream — they break if the given promise breaks.
 */
export function getDependents(promiseId: string, promises: Promise[]): string[] {
  const visited = new Set<string>();
  const queue = [promiseId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    // Find all promises that list `current` in their depends_on
    for (const p of promises) {
      if (p.depends_on.includes(current) && !visited.has(p.id)) {
        visited.add(p.id);
        queue.push(p.id);
      }
    }
  }

  return Array.from(visited);
}

/**
 * Get all promises that a given promise depends on (direct + transitive).
 * These are upstream — if they break, the given promise is at risk.
 */
export function getDependencies(promiseId: string, promises: Promise[]): string[] {
  const visited = new Set<string>();
  const promise = promises.find((p) => p.id === promiseId);
  if (!promise) return [];

  const queue = [...promise.depends_on];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    const upstream = promises.find((p) => p.id === current);
    if (upstream) {
      for (const dep of upstream.depends_on) {
        if (!visited.has(dep)) queue.push(dep);
      }
    }
  }

  return Array.from(visited);
}

/**
 * Count how many promises depend on each promise (direct dependents only).
 * Used for sizing nodes by importance.
 */
export function countDependents(promises: Promise[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of promises) {
    counts.set(p.id, 0);
  }
  for (const p of promises) {
    for (const depId of p.depends_on) {
      counts.set(depId, (counts.get(depId) ?? 0) + 1);
    }
  }
  return counts;
}
