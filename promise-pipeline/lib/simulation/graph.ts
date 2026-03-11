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
 * Simple force-directed layout for graph visualization.
 * Groups promises by domain, places agents on the periphery.
 */
export function layoutGraph(graph: PromiseGraph, width: number, height: number): PromiseGraph {
  const centerX = width / 2;
  const centerY = height / 2;

  // Collect unique domains from promise nodes
  const domains = Array.from(new Set(
    graph.nodes.filter((n) => n.type === "promise" && n.domain).map((n) => n.domain!)
  ));

  // Assign angular sectors to each domain
  const domainAngle = (2 * Math.PI) / Math.max(domains.length, 1);
  const domainMap = new Map(domains.map((d, i) => [d, i * domainAngle]));

  // Promise ring radius
  const promiseRadius = Math.min(width, height) * 0.3;
  // Agent ring radius (outer)
  const agentRadius = Math.min(width, height) * 0.42;

  const positioned = graph.nodes.map((node, i) => {
    if (node.type === "promise" && node.domain) {
      const baseAngle = domainMap.get(node.domain) ?? 0;
      // Find index within domain for slight offset
      const domainNodes = graph.nodes.filter(
        (n) => n.type === "promise" && n.domain === node.domain
      );
      const idx = domainNodes.indexOf(node);
      const spread = domainAngle * 0.7;
      const angle = baseAngle + ((idx / Math.max(domainNodes.length - 1, 1)) - 0.5) * spread;

      return {
        ...node,
        x: centerX + promiseRadius * Math.cos(angle),
        y: centerY + promiseRadius * Math.sin(angle),
      };
    } else {
      // Agent: place on outer ring, evenly spaced
      const agentNodes = graph.nodes.filter((n) => n.type === "agent");
      const idx = agentNodes.indexOf(node);
      const angle = (idx / Math.max(agentNodes.length, 1)) * 2 * Math.PI;
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
