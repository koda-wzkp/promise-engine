/**
 * Layout algorithms for the three ecological visualization modes.
 *
 * Watershed: Top-down flow layout. Root promises at top, dependents flow downward
 *   like tributaries merging into rivers. Node pools are sized by FMEA severity.
 *
 * Canopy: Bottom-up tree layout. Root promises are trunks at the bottom,
 *   dependents branch upward like a forest canopy. Severity = tree height.
 *
 * Strata: Horizontal geological layers. Promises grouped by domain into
 *   horizontal strata. Severity = block width within the layer.
 */

import { Promise } from "../types/promise";
import { PromiseGraph, GraphNode } from "../types/simulation";

/**
 * Compute topological depth for each promise (distance from root nodes).
 * Root nodes (no dependencies) have depth 0.
 */
function computeDepths(promises: Promise[]): Map<string, number> {
  const promiseIds = new Set(promises.map((p) => p.id));
  const depths = new Map<string, number>();
  const reverseMap = new Map<string, string[]>();

  for (const p of promises) {
    if (!reverseMap.has(p.id)) reverseMap.set(p.id, []);
    for (const depId of p.depends_on) {
      if (!reverseMap.has(depId)) reverseMap.set(depId, []);
      reverseMap.get(depId)!.push(p.id);
    }
  }

  // BFS from roots (nodes with no depends_on within the network)
  const roots = promises.filter(
    (p) => p.depends_on.length === 0 || p.depends_on.every((d) => !promiseIds.has(d))
  );
  const queue: Array<{ id: string; depth: number }> = roots.map((r) => ({
    id: r.id,
    depth: 0,
  }));

  for (const r of roots) depths.set(r.id, 0);

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    const dependents = reverseMap.get(id) || [];
    for (const dep of dependents) {
      const existing = depths.get(dep) ?? -1;
      if (depth + 1 > existing) {
        depths.set(dep, depth + 1);
        queue.push({ id: dep, depth: depth + 1 });
      }
    }
  }

  // Ensure every promise has a depth
  for (const p of promises) {
    if (!depths.has(p.id)) depths.set(p.id, 0);
  }

  return depths;
}

/**
 * Watershed layout — top-down flow.
 * Roots at the top, dependents flow downward. Agent nodes on the sides.
 */
export function layoutWatershed(
  graph: PromiseGraph,
  promises: Promise[],
  width: number,
  height: number
): PromiseGraph {
  const nodes = graph.nodes.map((n) => ({ ...n }));
  const edges = [...graph.edges];
  const depths = computeDepths(promises);

  const maxDepth = Math.max(0, ...depths.values());
  const promiseNodes = nodes.filter((n) => n.type === "promise");
  const agentNodes = nodes.filter((n) => n.type === "agent");

  // Group by depth layer
  const layers = new Map<number, GraphNode[]>();
  for (const node of promiseNodes) {
    const depth = depths.get(node.id) ?? 0;
    if (!layers.has(depth)) layers.set(depth, []);
    layers.get(depth)!.push(node);
  }

  // Layout each layer horizontally
  const topPad = 40;
  const bottomPad = 60;
  const sidePad = 60;
  const layerCount = maxDepth + 1;
  const layerHeight = (height - topPad - bottomPad) / Math.max(1, layerCount);

  for (const [depth, layerNodes] of layers.entries()) {
    const y = topPad + depth * layerHeight + layerHeight / 2;
    const nodeCount = layerNodes.length;
    const spacing = (width - sidePad * 2) / Math.max(1, nodeCount + 1);
    for (let i = 0; i < nodeCount; i++) {
      layerNodes[i].x = sidePad + spacing * (i + 1);
      layerNodes[i].y = y;
    }
  }

  // Agent nodes on the right side
  for (let i = 0; i < agentNodes.length; i++) {
    agentNodes[i].x = width - 30;
    agentNodes[i].y = topPad + (i / Math.max(1, agentNodes.length - 1)) * (height - topPad - bottomPad);
  }

  return { nodes, edges };
}

/**
 * Canopy layout — bottom-up tree.
 * Roots (trunks) at the bottom, dependents branch upward.
 */
export function layoutCanopy(
  graph: PromiseGraph,
  promises: Promise[],
  width: number,
  height: number
): PromiseGraph {
  const nodes = graph.nodes.map((n) => ({ ...n }));
  const edges = [...graph.edges];
  const depths = computeDepths(promises);

  const maxDepth = Math.max(0, ...depths.values());
  const promiseNodes = nodes.filter((n) => n.type === "promise");
  const agentNodes = nodes.filter((n) => n.type === "agent");

  // Group by depth layer
  const layers = new Map<number, GraphNode[]>();
  for (const node of promiseNodes) {
    const depth = depths.get(node.id) ?? 0;
    if (!layers.has(depth)) layers.set(depth, []);
    layers.get(depth)!.push(node);
  }

  // Layout layers bottom-up (depth 0 at bottom)
  const topPad = 40;
  const bottomPad = 60;
  const sidePad = 60;
  const layerCount = maxDepth + 1;
  const layerHeight = (height - topPad - bottomPad) / Math.max(1, layerCount);

  for (const [depth, layerNodes] of layers.entries()) {
    // Invert: depth 0 at bottom
    const y = height - bottomPad - depth * layerHeight - layerHeight / 2;
    const nodeCount = layerNodes.length;
    const spacing = (width - sidePad * 2) / Math.max(1, nodeCount + 1);
    for (let i = 0; i < nodeCount; i++) {
      layerNodes[i].x = sidePad + spacing * (i + 1);
      layerNodes[i].y = y;
    }
  }

  // Agent nodes on the left side
  for (let i = 0; i < agentNodes.length; i++) {
    agentNodes[i].x = 30;
    agentNodes[i].y = topPad + (i / Math.max(1, agentNodes.length - 1)) * (height - topPad - bottomPad);
  }

  return { nodes, edges };
}

/**
 * Strata layout — horizontal geological layers grouped by domain.
 * Each domain is a horizontal band. Promises are placed within their band.
 */
export function layoutStrata(
  graph: PromiseGraph,
  promises: Promise[],
  width: number,
  height: number
): PromiseGraph {
  const nodes = graph.nodes.map((n) => ({ ...n }));
  const edges = [...graph.edges];
  const depths = computeDepths(promises);

  const promiseNodes = nodes.filter((n) => n.type === "promise");
  const agentNodes = nodes.filter((n) => n.type === "agent");

  // Group by domain
  const domainGroups = new Map<string, GraphNode[]>();
  for (const node of promiseNodes) {
    const domain = node.domain || "Other";
    if (!domainGroups.has(domain)) domainGroups.set(domain, []);
    domainGroups.get(domain)!.push(node);
  }

  const domains = [...domainGroups.keys()];
  const topPad = 30;
  const bottomPad = 50;
  const sidePad = 50;
  const bandHeight = (height - topPad - bottomPad) / Math.max(1, domains.length);

  for (let di = 0; di < domains.length; di++) {
    const domain = domains[di];
    const domNodes = domainGroups.get(domain)!;

    // Sort by depth within domain for left-to-right ordering
    domNodes.sort((a, b) => (depths.get(a.id) ?? 0) - (depths.get(b.id) ?? 0));

    const bandY = topPad + di * bandHeight + bandHeight / 2;
    const nodeCount = domNodes.length;
    const spacing = (width - sidePad * 2) / Math.max(1, nodeCount + 1);

    for (let i = 0; i < nodeCount; i++) {
      domNodes[i].x = sidePad + spacing * (i + 1);
      domNodes[i].y = bandY;
    }
  }

  // Agent nodes on the far right
  for (let i = 0; i < agentNodes.length; i++) {
    agentNodes[i].x = width - 30;
    agentNodes[i].y = topPad + (i / Math.max(1, agentNodes.length - 1)) * (height - topPad - bottomPad);
  }

  return { nodes, edges };
}
