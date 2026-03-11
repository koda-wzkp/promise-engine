"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { Promise as PromiseType, Agent } from "@/lib/types/promise";
import { buildPromiseGraph, layoutGraph, countDependents } from "@/lib/simulation/graph";
import { statusColors, agentColors, hb2021DomainColors } from "@/lib/utils/colors";
import { CascadeResult } from "@/lib/types/simulation";

interface PromiseGraphProps {
  promises: PromiseType[];
  agents: Agent[];
  width?: number;
  height?: number;
  cascadeResult?: CascadeResult | null;
  selectedPromise?: string | null;
  onSelectPromise?: (id: string) => void;
}

export default function PromiseGraph({
  promises,
  agents,
  width = 900,
  height = 700,
  cascadeResult,
  selectedPromise,
  onSelectPromise,
}: PromiseGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom/pan state
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: width, h: height });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  // Reset viewbox when dimensions change
  useEffect(() => {
    setViewBox({ x: 0, y: 0, w: width, h: height });
  }, [width, height]);

  const graph = useMemo(() => {
    const raw = buildPromiseGraph(promises, agents);
    return layoutGraph(raw, width, height);
  }, [promises, agents, width, height]);

  const depCounts = useMemo(() => countDependents(promises), [promises]);

  const maxDepCount = useMemo(() => {
    let max = 0;
    depCounts.forEach((count) => {
      if (count > max) max = count;
    });
    return max;
  }, [depCounts]);

  // Build a set of affected promise IDs for highlighting
  const affectedIds = useMemo(() => {
    if (!cascadeResult) return new Set<string>();
    const ids = new Set(cascadeResult.affectedPromises.map((a) => a.promiseId));
    ids.add(cascadeResult.query.promiseId);
    return ids;
  }, [cascadeResult]);

  const sourceId = cascadeResult?.query.promiseId ?? null;

  // Build a set of affected edges for highlighting
  const affectedEdges = useMemo(() => {
    if (!cascadeResult) return new Set<string>();
    const edges = new Set<string>();
    for (const a of cascadeResult.affectedPromises) {
      const promise = promises.find((p) => p.id === a.promiseId);
      if (promise) {
        for (const depId of promise.depends_on) {
          if (affectedIds.has(depId)) {
            edges.add(`${depId}->${a.promiseId}`);
          }
        }
      }
    }
    return edges;
  }, [cascadeResult, promises, affectedIds]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const n of graph.nodes) {
      if (n.x != null && n.y != null) map.set(n.id, { x: n.x, y: n.y });
    }
    return map;
  }, [graph]);

  // Domain label positions (average position of domain's promise nodes)
  const domainLabels = useMemo(() => {
    const domains = new Map<string, { sx: number; sy: number; count: number }>();
    for (const n of graph.nodes) {
      if (n.type === "promise" && n.domain && n.x != null && n.y != null) {
        const d = domains.get(n.domain) ?? { sx: 0, sy: 0, count: 0 };
        d.sx += n.x;
        d.sy += n.y;
        d.count++;
        domains.set(n.domain, d);
      }
    }
    const labels: { domain: string; x: number; y: number }[] = [];
    domains.forEach(({ sx, sy, count }, domain) => {
      const cx = sx / count;
      const cy = sy / count;
      // Push label outward from center
      const dx = cx - width / 2;
      const dy = cy - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = dist > 0 ? 30 / dist : 0;
      labels.push({
        domain,
        x: cx + dx * scale,
        y: cy + dy * scale - 28,
      });
    });
    return labels;
  }, [graph, width, height]);

  // Zoom handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse position to SVG coords
    const svgX = viewBox.x + (mouseX / rect.width) * viewBox.w;
    const svgY = viewBox.y + (mouseY / rect.height) * viewBox.h;

    const scaleFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const newW = Math.max(200, Math.min(width * 3, viewBox.w * scaleFactor));
    const newH = Math.max(150, Math.min(height * 3, viewBox.h * scaleFactor));

    // Keep the point under the mouse fixed
    const newX = svgX - (mouseX / rect.width) * newW;
    const newY = svgY - (mouseY / rect.height) * newH;

    setViewBox({ x: newX, y: newY, w: newW, h: newH });
  }, [viewBox, width, height]);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    // Only pan if clicking on the background
    const target = e.target as SVGElement;
    if (target.tagName !== "svg" && target.tagName !== "rect") return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y };
  }, [viewBox]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const dx = (e.clientX - panStart.current.x) * (viewBox.w / rect.width);
    const dy = (e.clientY - panStart.current.y) * (viewBox.h / rect.height);
    setViewBox((v) => ({ ...v, x: panStart.current.vx - dx, y: panStart.current.vy - dy }));
  }, [isPanning, viewBox.w, viewBox.h]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  // Quadratic bezier curve for dependency edges
  function getCurvedPath(sx: number, sy: number, tx: number, ty: number) {
    const midX = (sx + tx) / 2;
    const midY = (sy + ty) / 2;
    // Perpendicular offset for the curve
    const dx = tx - sx;
    const dy = ty - sy;
    const len = Math.sqrt(dx * dx + dy * dy);
    const offset = Math.min(len * 0.2, 40);
    // Perpendicular direction
    const px = -dy / (len || 1);
    const py = dx / (len || 1);
    const cx = midX + px * offset;
    const cy = midY + py * offset;
    return `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;
  }

  const hasCascade = cascadeResult != null;

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50" ref={containerRef}>
      {/* Mobile callout */}
      <div className="block border-b border-gray-200 bg-gray-100 px-3 py-2 text-[11px] text-gray-500 sm:hidden">
        For the best simulation experience, view on desktop.
      </div>

      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className={`w-full ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ maxHeight: height }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background rect for pan target */}
        <rect x={viewBox.x} y={viewBox.y} width={viewBox.w} height={viewBox.h} fill="transparent" />

        {/* Defs: arrow markers */}
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 7"
            refX="10"
            refY="3.5"
            markerWidth="7"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
          <marker
            id="arrow-active"
            viewBox="0 0 10 7"
            refX="10"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#eab308" />
          </marker>
          <marker
            id="arrow-hovered"
            viewBox="0 0 10 7"
            refX="10"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
          </marker>
          {/* Glow filter for cascade source */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Domain cluster labels */}
        {domainLabels.map(({ domain, x, y }) => (
          <text
            key={`domain-label-${domain}`}
            x={x}
            y={y}
            textAnchor="middle"
            className="pointer-events-none select-none fill-gray-400 text-[10px] font-sans font-semibold uppercase tracking-wider"
            style={{ color: hb2021DomainColors[domain] ?? "#6b7280" }}
            fill={hb2021DomainColors[domain] ?? "#9ca3af"}
            opacity={0.6}
          >
            {domain}
          </text>
        ))}

        {/* Agent-to-promise edges (very light, behind everything) */}
        {graph.edges
          .filter((e) => e.type === "promiser" || e.type === "promisee")
          .map((edge) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return null;

            return (
              <line
                key={`${edge.type}-${edge.source}-${edge.target}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="#e5e7eb"
                strokeWidth={0.5}
                opacity={hasCascade ? 0.1 : 0.2}
              />
            );
          })}

        {/* Dependency edges — curved bezier */}
        {graph.edges
          .filter((e) => e.type === "depends_on")
          .map((edge) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return null;

            const edgeKey = `${edge.source}->${edge.target}`;
            const isAffected = affectedEdges.has(edgeKey);
            const isConnectedToHovered =
              hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode);

            let stroke = "#cbd5e1";
            let strokeWidth = 1.2;
            let opacity = hasCascade ? 0.15 : 0.35;
            let markerEnd = "url(#arrow)";
            let className = "";

            if (isAffected) {
              stroke = "#eab308";
              strokeWidth = 2.5;
              opacity = 1;
              markerEnd = "url(#arrow-active)";
              className = "edge-flow";
            } else if (isConnectedToHovered) {
              stroke = "#64748b";
              strokeWidth = 2;
              opacity = 0.9;
              markerEnd = "url(#arrow-hovered)";
            }

            return (
              <path
                key={edgeKey}
                d={getCurvedPath(source.x, source.y, target.x, target.y)}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeWidth}
                markerEnd={markerEnd}
                className={className}
                opacity={opacity}
              />
            );
          })}

        {/* Promise nodes */}
        {graph.nodes
          .filter((n) => n.type === "promise")
          .map((node) => {
            if (node.x == null || node.y == null) return null;

            const promise = promises.find((p) => p.id === node.id);
            if (!promise) return null;

            const isSelected = node.id === selectedPromise;
            const isAffected = affectedIds.has(node.id);
            const isSource = node.id === sourceId;
            const isHovered = node.id === hoveredNode;

            // More pronounced size difference for bottleneck nodes
            const depCount = depCounts.get(node.id) ?? 0;
            const baseRadius = 10;
            const maxRadius = 28;
            const radius = maxDepCount > 0
              ? baseRadius + (depCount / maxDepCount) * (maxRadius - baseRadius)
              : baseRadius;

            const color = statusColors[promise.status];

            // During cascade, dim unaffected nodes
            let nodeOpacity = 0.9;
            if (hasCascade && !isAffected) {
              nodeOpacity = 0.25;
            }

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPromise?.(node.id);
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                opacity={nodeOpacity}
              >
                {/* Source glow ring */}
                {isSource && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 8}
                    fill="none"
                    stroke="#eab308"
                    strokeWidth={3}
                    opacity={0.6}
                    filter="url(#glow)"
                    className="cascade-pulse"
                  />
                )}

                {/* Selection ring */}
                {isSelected && !isSource && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 5}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    strokeDasharray="4 2"
                  />
                )}

                {/* Affected pulse ring */}
                {isAffected && !isSource && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 3}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    className="cascade-pulse"
                  />
                )}

                {/* Main circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={color}
                  stroke={isHovered ? "#1e293b" : "rgba(255,255,255,0.3)"}
                  strokeWidth={isHovered ? 2 : 1}
                />

                {/* Promise ID label */}
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none font-mono font-bold"
                  fill="white"
                  fontSize={radius > 16 ? 11 : 9}
                >
                  {node.label}
                </text>

                {/* Hover tooltip with promise body */}
                {isHovered && (
                  <foreignObject
                    x={node.x + radius + 8}
                    y={node.y - 30}
                    width={220}
                    height={70}
                    className="pointer-events-none"
                  >
                    <div className="rounded-md border border-gray-700 bg-gray-900 px-2.5 py-1.5 shadow-xl">
                      <p className="font-mono text-[9px] text-gray-400">{promise.id} · {promise.domain}</p>
                      <p className="mt-0.5 text-[11px] font-medium leading-tight text-white">
                        {promise.body.length > 80 ? promise.body.slice(0, 80) + "…" : promise.body}
                      </p>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}

        {/* Agent nodes */}
        {graph.nodes
          .filter((n) => n.type === "agent")
          .map((node) => {
            if (node.x == null || node.y == null) return null;
            const agent = agents.find((a) => a.id === node.id);
            const agentType = agent?.type ?? "stakeholder";
            const color = agentColors[agentType] ?? "#6b7280";

            return (
              <g key={node.id} opacity={hasCascade ? 0.3 : 0.65}>
                <rect
                  x={node.x - 18}
                  y={node.y - 10}
                  width={36}
                  height={20}
                  rx={4}
                  fill={color}
                  opacity={0.8}
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none font-sans font-medium italic"
                  fill="white"
                  fontSize={8}
                  opacity={0.9}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
      </svg>

      {/* Fixed legend — top-right */}
      <div className="absolute right-2 top-2 flex flex-col gap-1 rounded-md bg-white/90 px-2.5 py-2 text-[10px] text-gray-500 shadow-sm backdrop-blur-sm">
        {(["verified", "declared", "degraded", "violated", "unverifiable"] as const).map((status) => (
          <span key={status} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: statusColors[status] }}
            />
            <span className="capitalize">{status}</span>
          </span>
        ))}
        <span className="mt-1 flex items-center gap-1.5 border-t border-gray-200 pt-1">
          <span className="inline-block h-2.5 w-5 rounded bg-gray-400" />
          <span className="italic">Agent</span>
        </span>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-2 right-2 flex flex-col gap-0.5">
        <button
          onClick={() => setViewBox((v) => ({
            x: v.x + v.w * 0.1,
            y: v.y + v.h * 0.1,
            w: v.w * 0.8,
            h: v.h * 0.8,
          }))}
          className="rounded bg-white/90 px-2 py-0.5 text-xs font-bold text-gray-600 shadow-sm backdrop-blur-sm hover:bg-white"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setViewBox((v) => ({
            x: v.x - v.w * 0.125,
            y: v.y - v.h * 0.125,
            w: Math.min(v.w * 1.25, width * 3),
            h: Math.min(v.h * 1.25, height * 3),
          }))}
          className="rounded bg-white/90 px-2 py-0.5 text-xs font-bold text-gray-600 shadow-sm backdrop-blur-sm hover:bg-white"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => setViewBox({ x: 0, y: 0, w: width, h: height })}
          className="rounded bg-white/90 px-1.5 py-0.5 text-[9px] text-gray-500 shadow-sm backdrop-blur-sm hover:bg-white"
          aria-label="Reset zoom"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
