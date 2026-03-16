"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import type { Promise as PromiseType, Agent, Threat } from "@/lib/types/promise";
import type { FiveFieldDiagnostic, HeuristicCPTEntry, ProbabilisticCascadeResult } from "@/lib/types/analysis";
import type { NodeVisualEncoding, EdgeVisualEncoding } from "@/lib/utils/visual-encoding";
import { precomputeNodeEncodings, precomputeEdgeEncodings } from "@/lib/utils/visual-encoding";
import { getStatusColor } from "@/lib/utils/colors";
import { buildPromiseGraph } from "@/lib/simulation/graph";
import { layoutWatershed, layoutCanopy, layoutStrata } from "@/lib/simulation/layouts";
import { renderCanopyScene } from "@/lib/rendering/canopy";
import { renderWatershedScene } from "@/lib/rendering/watershed";
import { renderStrataScene } from "@/lib/rendering/strata";
import type { ViewMode } from "./ViewSwitcher";

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
}

/** Hit target radius for click detection on canvas nodes. */
const HIT_RADIUS = 20;

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
}: ProceduralGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const reducedMotion = useRef(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => { reducedMotion.current = e.matches; };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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

  // Precompute encodings
  const nodeEncodings = useMemo(() => {
    if (!diagnostic) return {};
    return precomputeNodeEncodings(promises, diagnostic, getStatusColor);
  }, [promises, diagnostic]);

  const edgeEncodings = useMemo(() => {
    if (!diagnostic || !cpts) return {};
    return precomputeEdgeEncodings(promises, diagnostic, cpts);
  }, [promises, diagnostic, cpts]);

  // Build node map for quick lookup
  const nodeMap = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id, n])),
    [graph.nodes]
  );

  const promiseMap = useMemo(
    () => new Map(promises.map((p) => [p.id, p])),
    [promises]
  );

  // Prepare renderer-specific data structures
  const renderData = useMemo(() => {
    const promiseNodes = graph.nodes.filter((n) => n.type === "promise");

    // Default encoding for nodes without diagnostic data
    const defaultEncoding: NodeVisualEncoding = {
      radius: 20,
      saturation: 70,
      pulse: { period: 0, amplitude: 0 },
      rpnPriority: "low",
      rpn: 0,
      glowFilter: null,
      glowRadius: 0,
      severity: 3,
      channelCapacity: 1.0,
      superspreaderScore: 0,
      agencyCost: 0,
      moralHazard: 0,
      incentiveCompatible: "no",
      directDependents: 0,
      domainsSpanned: 0,
    };

    const canvasNodes = promiseNodes.map((n) => ({
      id: n.id,
      x: n.x ?? 0,
      y: n.y ?? 0,
      domain: n.domain ?? "Other",
      status: n.status ?? "declared",
      encoding: nodeEncodings[n.id] ?? defaultEncoding,
      isSelected: selectedPromiseId === n.id,
      isAffected: affectedIds.has(n.id),
    }));

    // Build edges for dependency connections only
    const depEdges = graph.edges.filter((e) => e.type === "depends_on");
    const canvasEdges = depEdges.map((e) => {
      const src = nodeMap.get(e.source);
      const tgt = nodeMap.get(e.target);
      const edgeKey = `${e.source}->${e.target}`;
      return {
        sourceX: src?.x ?? 0,
        sourceY: src?.y ?? 0,
        targetX: tgt?.x ?? 0,
        targetY: tgt?.y ?? 0,
        encoding: edgeEncodings[edgeKey],
      };
    });

    // For strata: compute domain bands
    const domainGroups = new Map<string, typeof canvasNodes>();
    for (const n of canvasNodes) {
      if (!domainGroups.has(n.domain)) domainGroups.set(n.domain, []);
      domainGroups.get(n.domain)!.push(n);
    }
    const domains = [...domainGroups.keys()];
    const bandHeight = height / Math.max(1, domains.length);
    const domainBands = domains.map((domain, i) => ({
      domain,
      y: i * bandHeight,
      height: bandHeight,
      color: "#5A5A4A",
    }));

    return { canvasNodes, canvasEdges, domainBands };
  }, [graph, nodeEncodings, edgeEncodings, selectedPromiseId, affectedIds, nodeMap, height]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas resolution for HiDPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let running = true;

    function draw(time: number) {
      if (!running || !ctx) return;

      ctx.clearRect(0, 0, width, height);

      const { canvasNodes, canvasEdges, domainBands } = renderData;

      switch (viewMode) {
        case "watershed":
          renderWatershedScene(ctx, width, height, canvasNodes, canvasEdges, time, reducedMotion.current);
          break;
        case "canopy":
          renderCanopyScene(ctx, width, height, canvasNodes, canvasEdges, time, reducedMotion.current);
          break;
        case "strata":
          renderStrataScene(ctx, width, height, canvasNodes, canvasEdges, domainBands, time, reducedMotion.current);
          break;
      }

      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [width, height, viewMode, renderData]);

  // Click handler with hit testing
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onNodeClick) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const mx = (e.clientX - rect.left) * scaleX;
      const my = (e.clientY - rect.top) * scaleY;

      // Find closest promise node within hit radius
      let closest: string | null = null;
      let closestDist = HIT_RADIUS;

      for (const node of renderData.canvasNodes) {
        const dx = mx - node.x;
        const dy = my - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closest = node.id;
        }
      }

      if (closest) {
        onNodeClick(closest);
      }
    },
    [onNodeClick, width, height, renderData.canvasNodes]
  );

  // Rₑ and information deficit overlays
  const Re = diagnostic?.epidemiology.Re ?? null;
  const cascadeProne = diagnostic?.epidemiology.cascadeProne ?? false;
  const unobservablePercent = diagnostic?.information.unobservablePercent ?? null;

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className="w-full h-full cursor-crosshair"
        style={{ width, height }}
        aria-label={`Promise network ${viewMode} visualization with ${promises.length} promises`}
        role="img"
      />

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

      {/* Information deficit watermark */}
      {unobservablePercent !== null && unobservablePercent > 0 && (
        <div
          className="absolute bottom-3 right-3 text-white/10 font-mono text-sm select-none pointer-events-none"
          aria-hidden="true"
        >
          {Math.round(unobservablePercent)}% UNOBSERVABLE
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
