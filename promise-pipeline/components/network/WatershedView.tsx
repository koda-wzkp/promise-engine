"use client";

import { useMemo, useState } from "react";
import { PromiseGraphViewProps } from "./types";
import SVGFilters from "./SVGFilters";
import { statusColors } from "@/lib/utils/colors";
import { noise, hashSeed, organicBezier } from "@/lib/utils/noise";
import { countDependents } from "@/lib/simulation/graph";

/**
 * Watershed View — Cascade as River System
 *
 * Promises flow downhill like water through a landscape. Headwater promises
 * (no dependencies) are at the top. Delta promises (no dependents) are at
 * the bottom. Stream width indicates downstream impact.
 */

interface LayoutNode {
  id: string;
  x: number;
  y: number;
  depth: number;
  radius: number;
  status: string;
  domain: string;
  body: string;
  depCount: number;
}

interface StreamEdge {
  sourceId: string;
  targetId: string;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  width: number;
  seed: number;
  isAffected: boolean;
  sourceStatus: string;
  targetStatus: string;
}

const FAILING = new Set(["violated", "broken", "degraded", "repealed", "legally_challenged"]);
const HEALTHY = new Set(["verified", "declared", "kept", "partial", "delayed", "modified"]);

function getStreamColor(sourceStatus: string, targetStatus: string): string {
  if (FAILING.has(sourceStatus) || FAILING.has(targetStatus)) return "#dc2626";
  if (sourceStatus === "degraded" || targetStatus === "degraded") return "#d97706";
  if (sourceStatus === "unverifiable" || targetStatus === "unverifiable") return "#7c3aed";
  return "#059669";
}

function getStreamOpacity(sourceStatus: string, targetStatus: string): number {
  if (FAILING.has(sourceStatus) || FAILING.has(targetStatus)) return 0.7;
  return 0.5;
}

export default function WatershedView({
  promises,
  agents,
  domains,
  simulationState,
  onPromiseClick,
  width,
  height,
}: PromiseGraphViewProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const { cascadeResult } = simulationState;

  const depCounts = useMemo(() => countDependents(promises), [promises]);

  // Topological layout: compute depth for each promise
  const layout = useMemo(() => {
    // Build adjacency: who depends on whom
    const depMap = new Map<string, string[]>(); // id → depends_on
    const reverseMap = new Map<string, string[]>(); // id → dependents
    for (const p of promises) {
      depMap.set(p.id, p.depends_on.filter((d) => promises.some((pp) => pp.id === d)));
      if (!reverseMap.has(p.id)) reverseMap.set(p.id, []);
      for (const dep of p.depends_on) {
        const list = reverseMap.get(dep) ?? [];
        list.push(p.id);
        reverseMap.set(dep, list);
      }
    }

    // Compute topological depth via BFS from roots
    const depths = new Map<string, number>();
    const queue: string[] = [];

    // Roots: promises with no dependencies (headwaters)
    for (const p of promises) {
      const deps = depMap.get(p.id) ?? [];
      if (deps.length === 0) {
        depths.set(p.id, 0);
        queue.push(p.id);
      }
    }

    // BFS to assign depths
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDepth = depths.get(current) ?? 0;
      const children = reverseMap.get(current) ?? [];
      for (const child of children) {
        const existing = depths.get(child) ?? -1;
        if (currentDepth + 1 > existing) {
          depths.set(child, currentDepth + 1);
          queue.push(child);
        }
      }
    }

    // Handle disconnected promises
    for (const p of promises) {
      if (!depths.has(p.id)) depths.set(p.id, 0);
    }

    const maxDepth = Math.max(1, ...Array.from(depths.values()));
    const maxDepCount = Math.max(1, ...Array.from(depCounts.values()));

    // Group by depth for horizontal distribution
    const byDepth = new Map<number, typeof promises>();
    for (const p of promises) {
      const d = depths.get(p.id) ?? 0;
      const group = byDepth.get(d) ?? [];
      group.push(p);
      byDepth.set(d, group);
    }

    const padding = { top: 60, bottom: 40, left: 60, right: 60 };
    const usableW = width - padding.left - padding.right;
    const usableH = height - padding.top - padding.bottom;

    const nodes: LayoutNode[] = [];
    for (const p of promises) {
      const depth = depths.get(p.id) ?? 0;
      const group = byDepth.get(depth) ?? [p];
      const idx = group.indexOf(p);
      const count = group.length;
      const depCount = depCounts.get(p.id) ?? 0;

      // Y = depth (top to bottom)
      const y = padding.top + (depth / maxDepth) * usableH;

      // X = spread within depth layer, with noise jitter
      const baseX = count === 1
        ? padding.left + usableW / 2
        : padding.left + (idx / (count - 1)) * usableW;
      const jitter = noise(hashSeed(p.id) * 0.1, depth * 0.3) * 20;
      const x = Math.max(padding.left, Math.min(width - padding.right, baseX + jitter));

      // Radius scales with dependent count
      const baseRadius = 8;
      const maxRadius = 24;
      const radius = baseRadius + (depCount / maxDepCount) * (maxRadius - baseRadius);

      nodes.push({
        id: p.id,
        x,
        y,
        depth,
        radius,
        status: p.status,
        domain: p.domain,
        body: p.body,
        depCount,
      });
    }

    return { nodes, maxDepth };
  }, [promises, depCounts, width, height]);

  // Build stream edges
  const streams = useMemo(() => {
    const nodeMap = new Map(layout.nodes.map((n) => [n.id, n]));
    const edges: StreamEdge[] = [];
    const affectedIds = cascadeResult
      ? new Set([
          cascadeResult.query.promiseId,
          ...cascadeResult.affectedPromises.map((a) => a.promiseId),
        ])
      : new Set<string>();

    for (const p of promises) {
      const target = nodeMap.get(p.id);
      if (!target) continue;
      for (const depId of p.depends_on) {
        const source = nodeMap.get(depId);
        if (!source) continue;
        const isAffected = affectedIds.has(p.id) && affectedIds.has(depId);
        const depCount = depCounts.get(depId) ?? 0;
        const maxDep = Math.max(1, ...Array.from(depCounts.values()));
        const streamWidth = 2 + (depCount / maxDep) * 8;

        edges.push({
          sourceId: depId,
          targetId: p.id,
          sx: source.x,
          sy: source.y,
          tx: target.x,
          ty: target.y,
          width: streamWidth,
          seed: hashSeed(depId + p.id),
          isAffected,
          sourceStatus: source.status,
          targetStatus: target.status,
        });
      }
    }
    return edges;
  }, [layout, promises, depCounts, cascadeResult]);

  const affectedIds = useMemo(() => {
    if (!cascadeResult) return new Set<string>();
    const ids = new Set(cascadeResult.affectedPromises.map((a) => a.promiseId));
    ids.add(cascadeResult.query.promiseId);
    return ids;
  }, [cascadeResult]);

  const sourceId = cascadeResult?.query.promiseId ?? null;
  const hasCascade = cascadeResult != null;

  // Terrain background gradient
  const terrainY = height - 30;

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ maxHeight: height }}
        role="img"
        aria-label={`Watershed visualization showing ${promises.length} promises as a river system. Healthy flow is green, failure cascades are red.`}
      >
        <desc>
          Promises flow from headwaters (top, no dependencies) to delta (bottom, leaf promises).
          Stream width indicates downstream impact. Color indicates health status.
        </desc>

        <SVGFilters />

        {/* Background terrain gradient */}
        <defs>
          <linearGradient id="terrain-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0fdf4" />
            <stop offset="50%" stopColor="#ecfdf5" />
            <stop offset="100%" stopColor="#d1fae5" />
          </linearGradient>
          <linearGradient id="terrain-bg-failing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef2f2" />
            <stop offset="50%" stopColor="#fef2f2" />
            <stop offset="100%" stopColor="#fee2e2" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={hasCascade ? "url(#terrain-bg-failing)" : "url(#terrain-bg)"}
        />

        {/* Subtle terrain texture */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="transparent"
          filter="url(#organic-texture)"
          opacity={0.03}
        />

        {/* Terrain ground line */}
        <path
          d={(() => {
            const parts = [`M 0 ${terrainY}`];
            for (let x = 0; x <= width; x += 20) {
              const y = terrainY + noise(x * 0.01, 42) * 8;
              parts.push(`L ${x} ${y}`);
            }
            parts.push(`L ${width} ${height} L 0 ${height} Z`);
            return parts.join(" ");
          })()}
          fill="#a7f3d0"
          opacity={0.3}
        />

        {/* Stream beds (wide, low opacity) */}
        {streams.map((s, i) => {
          const color = getStreamColor(s.sourceStatus, s.targetStatus);
          const dimmed = hasCascade && !s.isAffected;
          return (
            <path
              key={`bed-${i}`}
              d={organicBezier(s.sx, s.sy, s.tx, s.ty, s.seed, 35)}
              fill="none"
              stroke={color}
              strokeWidth={s.width + 4}
              strokeLinecap="round"
              opacity={dimmed ? 0.05 : 0.12}
            />
          );
        })}

        {/* Stream currents (thinner, animated) */}
        {streams.map((s, i) => {
          const color = getStreamColor(s.sourceStatus, s.targetStatus);
          const opacity = getStreamOpacity(s.sourceStatus, s.targetStatus);
          const dimmed = hasCascade && !s.isAffected;
          const pathD = organicBezier(s.sx, s.sy, s.tx, s.ty, s.seed, 35);
          const pathId = `stream-${i}`;

          return (
            <g key={`current-${i}`}>
              <path
                id={pathId}
                d={pathD}
                fill="none"
                stroke={s.isAffected ? "#eab308" : color}
                strokeWidth={s.isAffected ? s.width + 1 : s.width}
                strokeLinecap="round"
                opacity={dimmed ? 0.08 : s.isAffected ? 0.9 : opacity}
                strokeDasharray={s.isAffected ? "8 4" : "none"}
              >
                {s.isAffected && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from="24"
                    to="0"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                )}
              </path>

              {/* Particle flow — small circles along the path */}
              {!dimmed &&
                [0, 1, 2].map((pi) => (
                  <circle
                    key={pi}
                    r={1.5}
                    fill={s.isAffected ? "#eab308" : color}
                    opacity={s.isAffected ? 0.9 : 0.6}
                  >
                    <animateMotion
                      dur={`${2 + pi * 0.5}s`}
                      begin={`${pi * 0.7}s`}
                      repeatCount="indefinite"
                      path={pathD}
                    />
                  </circle>
                ))}
            </g>
          );
        })}

        {/* Promise nodes */}
        {layout.nodes.map((node) => {
          const isSelected = node.id === simulationState.selectedPromise;
          const isAffected = affectedIds.has(node.id);
          const isSource = node.id === sourceId;
          const isHovered = node.id === hoveredNode;
          const color = statusColors[node.status as keyof typeof statusColors] ?? "#6b7280";
          const dimmed = hasCascade && !isAffected;

          // Organic radius variation
          const seed = hashSeed(node.id);
          const breathe = noise(seed * 0.5, 0) * 2;
          const r = node.radius + breathe;

          return (
            <g
              key={node.id}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`Promise ${node.id}: ${node.body}. Status: ${node.status}. ${node.depCount} downstream.`}
              onClick={(e) => {
                e.stopPropagation();
                onPromiseClick(node.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPromiseClick(node.id);
                }
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onFocus={() => setHoveredNode(node.id)}
              onBlur={() => setHoveredNode(null)}
              opacity={dimmed ? 0.25 : 1}
            >
              {/* Source glow (headwater spring) */}
              {isSource && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r + 10}
                  fill="none"
                  stroke="#eab308"
                  strokeWidth={3}
                  opacity={0.6}
                  filter="url(#spring-glow)"
                  className="cascade-pulse"
                />
              )}

              {/* Selection ring */}
              {isSelected && !isSource && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r + 5}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />
              )}

              {/* Affected pulse ring */}
              {isAffected && !isSource && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r + 3}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  className="cascade-pulse"
                />
              )}

              {/* Main node */}
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill={color}
                stroke={isHovered ? "#1e293b" : "rgba(255,255,255,0.4)"}
                strokeWidth={isHovered ? 2 : 1}
              />

              {/* ID label */}
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none select-none font-mono font-bold"
                fill="white"
                fontSize={r > 14 ? 10 : 8}
              >
                {node.id}
              </text>

              {/* Hover tooltip */}
              {isHovered && (
                <foreignObject
                  x={node.x + r + 8}
                  y={node.y - 28}
                  width={200}
                  height={60}
                  className="pointer-events-none"
                >
                  <div className="rounded-md border border-gray-700 bg-gray-900 px-2.5 py-1.5 shadow-xl">
                    <p className="font-mono text-[9px] text-gray-400">
                      {node.id} · {node.domain}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium leading-tight text-white">
                      {node.body.length > 70 ? node.body.slice(0, 70) + "…" : node.body}
                    </p>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}

        {/* Depth labels (left side) */}
        {Array.from({ length: layout.maxDepth + 1 }, (_, i) => {
          const y = 60 + (i / layout.maxDepth) * (height - 100);
          return (
            <text
              key={`depth-${i}`}
              x={12}
              y={y}
              className="pointer-events-none select-none font-mono"
              fill="#9ca3af"
              fontSize={9}
              opacity={0.5}
            >
              {i === 0 ? "headwaters" : i === layout.maxDepth ? "delta" : ""}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute right-2 top-2 flex flex-col gap-1 rounded-md bg-white/90 px-2.5 py-2 text-[10px] text-gray-500 shadow-sm backdrop-blur-sm">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1 w-4 rounded-full bg-[#059669]" />
          Healthy flow
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1 w-4 rounded-full bg-[#dc2626]" />
          Failure cascade
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1 w-4 rounded-full border border-dashed border-[#d97706] bg-transparent" />
          Degraded tributary
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1 w-4 rounded-full bg-[#eab308]" />
          Cascade path
        </span>
      </div>
    </div>
  );
}
