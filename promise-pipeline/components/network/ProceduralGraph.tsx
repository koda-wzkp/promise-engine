"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import type { Promise as PromiseType, Agent, Threat } from "@/lib/types/promise";
import type { FiveFieldDiagnostic, HeuristicCPTEntry, ProbabilisticCascadeResult } from "@/lib/types/analysis";
import { buildPromiseGraph } from "@/lib/simulation/graph";
import { layoutWatershed, layoutCanopy, layoutStrata } from "@/lib/simulation/layouts";
import { calculateNetworkHealth } from "@/lib/simulation/cascade";
import type { ViewMode } from "./ViewSwitcher";
import type { SVGNodeData, SVGEdgeData, DomainBand } from "./svg-view-types";
import { WatershedView } from "./WatershedView";
import { CanopyView } from "./CanopyView";
import { StrataView } from "./StrataView";

interface ProceduralGraphProps {
  promises: PromiseType[];
  agents: Agent[];
  threats?: Threat[];
  width: number;
  height: number;
  selectedPromiseId?: string | null;
  affectedIds?: Set<string>;
  onNodeClick?: (promiseId: string) => void;
  diagnostic?: FiveFieldDiagnostic;
  cpts?: Record<string, HeuristicCPTEntry>;
  probabilistic?: ProbabilisticCascadeResult;
  cascadeActive?: boolean;
  cascadeSourceId?: string;
  viewMode: ViewMode;
  /** Per-promise k_effective values from attention allocation. When provided,
   *  node radius and saturation are scaled to reflect attention distribution. */
  attentionAllocation?: Record<string, number>;
}

export function ProceduralGraph({
  promises,
  agents,
  threats = [],
  width,
  height,
  selectedPromiseId,
  affectedIds = new Set(),
  onNodeClick,
  diagnostic,
  cpts,
  probabilistic,
  cascadeActive = false,
  cascadeSourceId,
  viewMode,
  attentionAllocation,
}: ProceduralGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isMobile = width < 768;

  // Build graph with layout
  const graph = useMemo(() => {
    const raw = buildPromiseGraph(promises, agents, threats);
    switch (viewMode) {
      case "watershed": return layoutWatershed(raw, promises, width, height);
      case "canopy": return layoutCanopy(raw, promises, width, height);
      case "strata": return layoutStrata(raw, promises, width, height);
      default: return layoutWatershed(raw, promises, width, height);
    }
  }, [promises, agents, threats, width, height, viewMode]);

  // Node map for quick lookup
  const nodeMap = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id, n])),
    [graph.nodes]
  );

  const promiseMap = useMemo(
    () => new Map(promises.map((p) => [p.id, p])),
    [promises]
  );

  // Network health for sky gradient
  const networkHealth = useMemo(() => {
    try {
      return calculateNetworkHealth(promises).overall;
    } catch {
      return 75;
    }
  }, [promises]);

  // Count downstream dependents per promise
  const downstreamCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of promises) {
      for (const dep of p.depends_on) {
        counts.set(dep, (counts.get(dep) ?? 0) + 1);
      }
    }
    return counts;
  }, [promises]);

  // Build SVG node data
  const svgNodes: SVGNodeData[] = useMemo(() => {
    const promiseNodes = graph.nodes.filter((n) => n.type === "promise");
    return promiseNodes.map((n) => ({
      id: n.id,
      x: n.x ?? 0,
      y: n.y ?? 0,
      domain: n.domain ?? "Other",
      status: n.status ?? "declared",
      downstreamCount: downstreamCounts.get(n.id) ?? 0,
      isSelected: selectedPromiseId === n.id,
      isAffected: affectedIds.has(n.id),
      layerIndex: 0,
    }));
  }, [graph, selectedPromiseId, affectedIds, downstreamCounts]);

  // Build SVG edge data
  const svgEdges: SVGEdgeData[] = useMemo(() => {
    return graph.edges
      .filter((e) => e.type === "depends_on")
      .map((e) => {
        const src = nodeMap.get(e.source);
        const tgt = nodeMap.get(e.target);
        return {
          edgeId: `${e.source}->${e.target}`,
          sourceId: e.source,
          targetId: e.target,
          sourceX: src?.x ?? 0,
          sourceY: src?.y ?? 0,
          targetX: tgt?.x ?? 0,
          targetY: tgt?.y ?? 0,
          sourceStatus: src?.status ?? "declared",
          targetStatus: tgt?.status ?? "declared",
          downstreamCount: downstreamCounts.get(e.source) ?? 0,
        };
      });
  }, [graph.edges, nodeMap, downstreamCounts]);

  // Domain bands for strata view
  const domainBands: DomainBand[] = useMemo(() => {
    const domainSet = new Set(svgNodes.map((n) => n.domain));
    const domains = [...domainSet];

    const domainDependedOn = new Map<string, number>();
    for (const domain of domains) domainDependedOn.set(domain, 0);
    for (const p of promises) {
      for (const depId of p.depends_on) {
        const depPromise = promiseMap.get(depId);
        if (depPromise && depPromise.domain !== p.domain) {
          domainDependedOn.set(depPromise.domain, (domainDependedOn.get(depPromise.domain) ?? 0) + 1);
        }
      }
    }

    const sorted = [...domains].sort((a, b) => (domainDependedOn.get(b) ?? 0) - (domainDependedOn.get(a) ?? 0));
    const bandHeight = height / Math.max(1, sorted.length);

    return sorted.map((domain, i) => ({
      domain,
      y: i * bandHeight,
      height: bandHeight,
      layerIndex: i,
      dependedOnCount: domainDependedOn.get(domain) ?? 0,
    }));
  }, [svgNodes, promises, promiseMap, height]);

  // Diagnostic data
  const Re = diagnostic?.epidemiology.Re ?? null;
  const cascadeProne = diagnostic?.epidemiology.cascadeProne ?? false;
  const unobservablePercent = diagnostic?.information.unobservablePercent ?? null;

  const handleNodeHover = useCallback((id: string) => setHoveredNode(id), []);
  const handleNodeBlur = useCallback(() => setHoveredNode(null), []);

  // Shared props for SVG views
  const viewProps = {
    nodes: svgNodes,
    edges: svgEdges,
    width,
    height,
    networkHealth,
    domainBands,
    onNodeClick,
    hoveredNodeId: hoveredNode,
    onNodeHover: handleNodeHover,
    onNodeBlur: handleNodeBlur,
    focusedNodeId: selectedPromiseId,
    affectedIds,
    cascadeActive,
    promiseMap,
    isMobile,
    reducedMotion,
    unobservablePercent,
  };

  return (
    <div className="relative w-full h-full">
      {/* SVG visualization */}
      <div className="w-full overflow-hidden">
        {viewMode === "watershed" && <WatershedView {...viewProps} />}
        {viewMode === "canopy" && <CanopyView {...viewProps} />}
        {viewMode === "strata" && <StrataView {...viewProps} />}
      </div>

      {/* Rₑ Indicator overlay */}
      {Re !== null && (
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-xs font-mono text-white/90"
          role="status"
          aria-live="polite"
        >
          <span>
            R<sub>e</sub> = {Re.toFixed(2)}
          </span>
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{
              backgroundColor: Re < 0.8 ? "#4ADE80" : Re < 1.0 ? "#FCD34D" : "#FCA5A5",
            }}
          />
          <span className="text-white/60">
            {cascadeProne ? "Cascade-Prone" : Re < 0.8 ? "Contained" : "Near Threshold"}
          </span>
        </div>
      )}

      {/* Cascade indicator */}
      {cascadeActive && (
        <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-amber-500/80 backdrop-blur-sm text-xs font-medium text-white">
          Simulating Cascade
        </div>
      )}
    </div>
  );
}
