"use client";

import { useRef, useEffect, useCallback, useMemo, useState } from "react";
import type { Promise as PromiseType, Agent, Threat } from "@/lib/types/promise";
import type { FiveFieldDiagnostic, HeuristicCPTEntry, ProbabilisticCascadeResult } from "@/lib/types/analysis";
import type { NodeVisualEncoding } from "@/lib/utils/visual-encoding";
import { precomputeNodeEncodings, precomputeEdgeEncodings } from "@/lib/utils/visual-encoding";
import { getStatusColor } from "@/lib/utils/colors";
import { buildPromiseGraph } from "@/lib/simulation/graph";
import { layoutWatershed, layoutCanopy, layoutStrata } from "@/lib/simulation/layouts";
import { calculateNetworkHealth } from "@/lib/simulation/cascade";
import { ATTENTION_BETA } from "@/lib/simulation/softmax";
import { PixelRenderer } from "./PixelRenderer";
import { renderCanopyPixelScene } from "@/lib/rendering/canopy";
import { renderWatershedPixelScene } from "@/lib/rendering/watershed";
import { renderStrataPixelScene } from "@/lib/rendering/strata";
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
  /** Per-promise k_effective values from attention allocation. When provided,
   *  node radius and saturation are scaled to reflect attention distribution. */
  attentionAllocation?: Record<string, number>;
}

/** Sprite animation interval in ms. */
const SPRITE_FRAME_INTERVAL = 300;

interface HitBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useRef(false);
  const hitBoxesRef = useRef<HitBox[]>([]);
  const [hoveredNode, setHoveredNode] = useState<{ id: string; x: number; y: number } | null>(null);

  // Pixel resolution: 32px on mobile, 64px on desktop
  const [resolution, setResolution] = useState<32 | 64>(
    typeof window !== "undefined" && window.innerWidth < 768 ? 32 : 64
  );

  // Listen for resize to switch resolution
  useEffect(() => {
    const handleResize = () => {
      setResolution(window.innerWidth < 768 ? 32 : 64);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Prepare pixel-art render data
  // Baseline k when attention is evenly distributed (used for scaling)
  const attentionBaselineK = ATTENTION_BETA;

  const renderData = useMemo(() => {
    const promiseNodes = graph.nodes.filter((n) => n.type === "promise");

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

    const pixelNodes = promiseNodes.map((n) => {
      let encoding = nodeEncodings[n.id] ?? defaultEncoding;

      // Scale radius and saturation by attention allocation when active.
      // k / baseline gives a relative scale: 1.0 = normal, <1 = neglected, >1 = prioritized.
      if (attentionAllocation && attentionAllocation[n.id] !== undefined) {
        const k = attentionAllocation[n.id];
        const kScale = k / attentionBaselineK;
        // Radius: range ~70–130% of base (never fully disappears, never huge)
        const radiusScale = 0.7 + 0.6 * Math.min(1.0, Math.max(0.0, kScale));
        // Saturation: range ~20–100% (fades out for neglected promises)
        const satScale = 0.2 + 0.8 * Math.min(1.0, Math.max(0.0, kScale));
        encoding = {
          ...encoding,
          radius: Math.round(encoding.radius * radiusScale),
          saturation: Math.round(encoding.saturation * satScale),
        };
      }

      return {
        id: n.id,
        x: n.x ?? 0,
        y: n.y ?? 0,
        domain: n.domain ?? "Other",
        status: n.status ?? "declared",
        encoding,
        isSelected: selectedPromiseId === n.id,
        isAffected: affectedIds.has(n.id),
        downstreamCount: downstreamCounts.get(n.id) ?? 0,
        layerIndex: 0,
      };
    });

    // Build edges for dependency connections
    const depEdges = graph.edges.filter((e) => e.type === "depends_on");
    const pixelEdges = depEdges.map((e) => {
      const src = nodeMap.get(e.source);
      const tgt = nodeMap.get(e.target);
      return {
        sourceX: src?.x ?? 0,
        sourceY: src?.y ?? 0,
        targetX: tgt?.x ?? 0,
        targetY: tgt?.y ?? 0,
        sourceStatus: src?.status ?? "declared",
        edgeId: `${e.source}->${e.target}`,
        downstreamCount: downstreamCounts.get(e.source) ?? 0,
      };
    });

    // Domains
    const domainSet = new Set(pixelNodes.map((n) => n.domain));
    const domains = [...domainSet];

    // Strata domain bands — sort by cross-domain dependency count (most = deepest)
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
    const sortedDomains = [...domains].sort((a, b) => (domainDependedOn.get(b) ?? 0) - (domainDependedOn.get(a) ?? 0));
    const bandHeight = height / Math.max(1, sortedDomains.length);
    const domainBands = sortedDomains.map((domain, i) => ({
      domain,
      y: i * bandHeight,
      height: bandHeight,
      layerIndex: i,
      dependedOnCount: domainDependedOn.get(domain) ?? 0,
    }));

    // Set layer index on nodes
    const domainLayerMap = new Map(sortedDomains.map((d, i) => [d, i]));
    for (const n of pixelNodes) {
      n.layerIndex = domainLayerMap.get(n.domain) ?? 0;
    }

    // Violated IDs for fracture lines
    const violatedIds = new Set(pixelNodes.filter((n) => n.status === "violated").map((n) => n.id));

    return { pixelNodes, pixelEdges, domains, domainBands, violatedIds };
  }, [graph, nodeEncodings, selectedPromiseId, affectedIds, nodeMap, height, width, promises, promiseMap, downstreamCounts, attentionAllocation, attentionBaselineK]);

  // Main render + sprite animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let spriteFrame = 0;

    function draw() {
      if (!canvas) return;
      let renderer: PixelRenderer;
      try {
        renderer = new PixelRenderer(canvas, resolution, width, height);
      } catch {
        return;
      }

      renderer.clear();
      const { pixelNodes, pixelEdges, domains, domainBands, violatedIds } = renderData;

      let hitBoxes: HitBox[] = [];

      switch (viewMode) {
        case "canopy":
          hitBoxes = renderCanopyPixelScene(
            renderer, pixelNodes, pixelEdges, domains,
            networkHealth, spriteFrame, reducedMotion.current
          );
          break;
        case "watershed":
          hitBoxes = renderWatershedPixelScene(
            renderer, pixelNodes, pixelEdges,
            spriteFrame, reducedMotion.current
          );
          break;
        case "strata":
          hitBoxes = renderStrataPixelScene(
            renderer, pixelNodes, domainBands, violatedIds,
            spriteFrame, reducedMotion.current
          );
          break;
      }

      hitBoxesRef.current = hitBoxes;
    }

    // Initial draw
    draw();

    // Sprite-frame animation: setInterval, NOT requestAnimationFrame
    // If reduced motion is preferred, don't animate
    if (reducedMotion.current) return;

    const intervalId = setInterval(() => {
      spriteFrame++;
      draw();
    }, SPRITE_FRAME_INTERVAL);

    return () => clearInterval(intervalId);
  }, [width, height, viewMode, renderData, resolution, networkHealth]);

  // Click handler using hit-box map
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onNodeClick) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (const box of hitBoxesRef.current) {
        if (mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h) {
          onNodeClick(box.id);
          return;
        }
      }
    },
    [onNodeClick]
  );

  // Mousemove for tooltip hover
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      for (const box of hitBoxesRef.current) {
        if (mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h) {
          setHoveredNode({ id: box.id, x: e.clientX - rect.left, y: e.clientY - rect.top });
          return;
        }
      }
      setHoveredNode(null);
    },
    []
  );

  const handleMouseLeave = useCallback(() => setHoveredNode(null), []);

  // Find hovered promise data for tooltip
  const hoveredPromise = hoveredNode ? promiseMap.get(hoveredNode.id) : null;

  // Rₑ and information deficit overlays
  const Re = diagnostic?.epidemiology.Re ?? null;
  const cascadeProne = diagnostic?.epidemiology.cascadeProne ?? false;
  const unobservablePercent = diagnostic?.information.unobservablePercent ?? null;

  // Promise node labels as HTML overlays
  const labelPositions = useMemo(() => {
    return hitBoxesRef.current.map((box) => ({
      id: box.id,
      x: box.x + box.w / 2,
      y: box.y - 4,
    }));
  }, [hitBoxesRef.current]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full cursor-pointer"
        style={{ imageRendering: "pixelated" }}
        role="img"
        aria-label={`${viewMode} visualization of promise network. ${promises.length} promises across ${renderData.domains.length} domains. Network health: ${networkHealth} out of 100.`}
      />

      {/* HTML text labels — screen reader accessible, crisp at any zoom */}
      {renderData.pixelNodes.map((node) => {
        const box = hitBoxesRef.current.find((b) => b.id === node.id);
        if (!box) return null;
        return (
          <span
            key={node.id}
            className="absolute font-mono text-[9px] pointer-events-none whitespace-nowrap"
            style={{
              left: box.x + box.w / 2,
              top: box.y - 10,
              transform: "translateX(-50%)",
              color: "#1f2937",
            }}
            aria-hidden="true"
          >
            {node.id}
          </span>
        );
      })}

      {/* Tooltip on hover */}
      {hoveredNode && hoveredPromise && (
        <div
          className="absolute z-50 px-3 py-2 rounded-lg bg-gray-900/90 backdrop-blur-sm text-xs text-white shadow-lg pointer-events-none"
          style={{
            left: Math.min(hoveredNode.x + 12, width - 200),
            top: hoveredNode.y + 12,
          }}
        >
          <div className="font-mono font-bold">{hoveredPromise.id}</div>
          <div className="text-white/70 mt-0.5">
            {hoveredPromise.body.length > 60
              ? hoveredPromise.body.slice(0, 60) + "…"
              : hoveredPromise.body}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: getStatusColor(hoveredPromise.status) }}
            />
            <span className="capitalize">{hoveredPromise.status}</span>
            <span className="text-white/50">
              {downstreamCounts.get(hoveredPromise.id) ?? 0} dependents
            </span>
          </div>
        </div>
      )}

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
