"use client";

import { useMemo } from "react";
import { hashSeed, seededRandom } from "@/lib/rendering/noise";
import { getStatusColor } from "@/lib/utils/colors";
import type { SVGViewProps } from "./svg-view-types";

/** Determine stream color pair based on endpoint statuses. */
function streamColors(srcStatus: string, tgtStatus: string): { base: string; bright: string } {
  if (srcStatus === "violated" || tgtStatus === "violated")
    return { base: "#f87171", bright: "#dc2626" };
  if (srcStatus === "degraded" || tgtStatus === "degraded")
    return { base: "#fbbf24", bright: "#d97706" };
  if (srcStatus === "unverifiable" || tgtStatus === "unverifiable")
    return { base: "#c4b5fd", bright: "#8b5cf6" };
  return { base: "#93c5fd", bright: "#60a5fa" };
}

function streamDash(srcStatus: string, tgtStatus: string): string | undefined {
  if (srcStatus === "unverifiable" || tgtStatus === "unverifiable") return "8 4";
  return undefined;
}

export function WatershedView({
  nodes,
  edges,
  width,
  height,
  onNodeClick,
  hoveredNodeId,
  onNodeHover,
  onNodeBlur,
  focusedNodeId,
  affectedIds,
  cascadeActive,
  promiseMap,
  isMobile,
  reducedMotion,
  unobservablePercent,
}: SVGViewProps) {
  // Adjust height so all tiers fit without scrolling
  const svgHeight = isMobile ? width * 1.5 : width * 0.7;
  const effectiveHeight = Math.min(height, svgHeight);

  // Compute tiered positions: remap node y to fit within SVG with padding
  const tieredNodes = useMemo(() => {
    if (nodes.length === 0) return nodes;
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxY = Math.max(...nodes.map((n) => n.y));
    const yRange = maxY - minY || 1;
    const topPad = 30;
    const bottomPad = 30;
    const availH = effectiveHeight - topPad - bottomPad;

    return nodes.map((n) => ({
      ...n,
      y: topPad + ((n.y - minY) / yRange) * availH,
    }));
  }, [nodes, effectiveHeight]);

  // Remap edges to match tiered node positions
  const tieredEdges = useMemo(() => {
    const nodePos = new Map<string, { x: number; y: number }>(
      tieredNodes.map((n) => [n.id, { x: n.x, y: n.y }])
    );
    return edges.map((e) => {
      const src = nodePos.get(e.sourceId);
      const tgt = nodePos.get(e.targetId);
      return {
        ...e,
        sourceX: src?.x ?? e.sourceX,
        sourceY: src?.y ?? e.sourceY,
        targetX: tgt?.x ?? e.targetX,
        targetY: tgt?.y ?? e.targetY,
      };
    });
  }, [edges, tieredNodes]);

  // Compute particle flow for desktop
  const particles = useMemo(() => {
    if (isMobile || reducedMotion) return [];
    return tieredEdges.slice(0, 20).flatMap((edge, ei) => {
      const midX = (edge.sourceX + edge.targetX) / 2;
      const midY = (edge.sourceY + edge.targetY) / 2;
      const seed = hashSeed(edge.edgeId);
      const controlX = midX + (seededRandom(seed) - 0.5) * 40;
      const pathD = `M ${edge.sourceX} ${edge.sourceY} Q ${controlX} ${midY} ${edge.targetX} ${edge.targetY}`;
      const { bright } = streamColors(edge.sourceStatus, edge.targetStatus);
      const count = Math.min(2, Math.max(1, Math.floor(edge.downstreamCount / 2)));
      return Array.from({ length: count }, (_, pi) => ({
        key: `${edge.edgeId}-p${pi}`,
        pathD,
        color: bright,
        dur: `${3 + seededRandom(seed + pi + 10) * 2}s`,
      }));
    });
  }, [tieredEdges, isMobile, reducedMotion]);

  // Active tooltip node: show on tap or hover
  const activeTooltipId = focusedNodeId || hoveredNodeId;

  return (
    <svg
      viewBox={`0 0 ${width} ${effectiveHeight}`}
      width={width}
      height={effectiveHeight}
      role="img"
      aria-label={`Promise network visualization — watershed view. ${nodes.length} promises.`}
      style={{ display: "block" }}
    >
      <defs>
        {/* Terrain gradient: highlands at top, delta/floodplain at bottom */}
        <linearGradient id="watershed-terrain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4c5a9" />
          <stop offset="50%" stopColor="#b8a88a" />
          <stop offset="100%" stopColor="#8a9a7b" />
        </linearGradient>
      </defs>

      {/* Terrain background */}
      <g className="background">
        <rect width={width} height={effectiveHeight} fill="url(#watershed-terrain)" />
      </g>

      {/* Streams (edges) — dual-layer for water effect */}
      <g className="edges">
        {tieredEdges.map((edge) => {
          const midY = (edge.sourceY + edge.targetY) / 2;
          const seed = hashSeed(edge.edgeId);
          const controlX = (edge.sourceX + edge.targetX) / 2 + (seededRandom(seed) - 0.5) * 40;
          const { base, bright } = streamColors(edge.sourceStatus, edge.targetStatus);
          const sw = 3 + Math.min(edge.downstreamCount, 8) * 1.5;
          const dash = streamDash(edge.sourceStatus, edge.targetStatus);
          const pathD = `M ${edge.sourceX} ${edge.sourceY} Q ${controlX} ${midY} ${edge.targetX} ${edge.targetY}`;

          return (
            <g key={edge.edgeId}>
              {/* Wide stream bed */}
              <path
                d={pathD}
                stroke={base}
                strokeWidth={sw}
                fill="none"
                opacity={0.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={dash}
              />
              {/* Bright center current */}
              <path
                d={pathD}
                stroke={bright}
                strokeWidth={sw * 0.4}
                fill="none"
                opacity={0.7}
                strokeLinecap="round"
                strokeDasharray={dash}
              />
            </g>
          );
        })}
      </g>

      {/* Particle flow — desktop only, motion enabled */}
      {particles.length > 0 && (
        <g className="particles">
          {particles.map((p) => (
            <circle key={p.key} r="2" fill={p.color} opacity="0.8">
              <animateMotion dur={p.dur} repeatCount="indefinite" path={p.pathD} />
            </circle>
          ))}
        </g>
      )}

      {/* Nodes — spring/pool appearance */}
      <g className="nodes">
        {tieredNodes.map((node) => {
          const baseR = isMobile ? 10 : 12;
          const r = Math.min(24, baseR + node.downstreamCount * 2);
          const color = getStatusColor(node.status);
          const isAffected = affectedIds.has(node.id);
          const isFocused = focusedNodeId === node.id;
          const promise = promiseMap.get(node.id);
          const label = promise
            ? `Promise ${node.id}: ${promise.body.slice(0, 40)}. Status: ${node.status}`
            : `Promise ${node.id}. Status: ${node.status}`;

          return (
            <g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-label={label}
              onClick={() => onNodeClick?.(node.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onNodeClick?.(node.id);
                }
              }}
              onMouseEnter={() => onNodeHover?.(node.id)}
              onMouseLeave={() => onNodeBlur?.()}
              onFocus={() => onNodeHover?.(node.id)}
              onBlur={() => onNodeBlur?.()}
              style={{ cursor: "pointer", outline: "none" }}
            >
              {/* Invisible hit area for 44px minimum */}
              <rect
                x={node.x - 22} y={node.y - 22}
                width={44} height={44}
                fill="transparent"
              />
              {/* Outer glow */}
              <circle
                cx={node.x} cy={node.y} r={r + 2}
                fill={color} opacity={0.2}
              />
              {/* Main node */}
              <circle
                cx={node.x} cy={node.y} r={r}
                fill={color}
                stroke={isFocused ? "#2563eb" : color}
                strokeWidth={isFocused ? 3 : 1.5}
                opacity={0.85}
                className={isAffected && cascadeActive && !reducedMotion ? "watershed-pulse" : ""}
              />
              {/* Light reflection */}
              <circle
                cx={node.x} cy={node.y} r={r * 0.4}
                fill="white" opacity={0.3}
              />
              {/* Label background */}
              <rect
                x={node.x - 24}
                y={node.y - r - (isMobile ? 18 : 16)}
                width={48}
                height={isMobile ? 14 : 12}
                rx={2}
                fill="#d4c5a9"
                opacity={0.85}
              />
              {/* Label text */}
              <text
                x={node.x}
                y={node.y - r - (isMobile ? 7 : 6)}
                textAnchor="middle"
                fontFamily="'IBM Plex Mono', monospace"
                fontSize={isMobile ? 11 : 13}
                fill="#1f2937"
              >
                {node.id.length > 8 ? node.id.slice(0, 8) + "\u2026" : node.id}
              </text>
            </g>
          );
        })}
      </g>

      {/* Overlays — tooltip last for z-order */}
      <g className="overlays">
        {activeTooltipId && (() => {
          const node = tieredNodes.find((n) => n.id === activeTooltipId);
          const promise = node ? promiseMap.get(node.id) : null;
          if (!node || !promise) return null;

          const tooltipWidth = Math.min(width * 0.7, 300);
          const tooltipHeight = 52;
          const tooltipX = Math.max(8, Math.min(node.x - tooltipWidth / 2, width - tooltipWidth - 8));
          // Above node if room, below otherwise
          const baseR = isMobile ? 10 : 12;
          const nodeR = Math.min(24, baseR + node.downstreamCount * 2);
          const tooltipY = node.y - nodeR - tooltipHeight - 8 > 0
            ? node.y - nodeR - tooltipHeight - 8
            : node.y + nodeR + 8;
          const bodyText = promise.body.length > 60 ? promise.body.slice(0, 60) + "\u2026" : promise.body;

          return (
            <g style={{ pointerEvents: "none" }}>
              <rect
                x={tooltipX} y={tooltipY}
                width={tooltipWidth} height={tooltipHeight}
                rx={6}
                fill="#1a1a2e" opacity={0.95}
              />
              <text
                x={tooltipX + 10} y={tooltipY + 18}
                fontFamily="'IBM Plex Mono', monospace"
                fontSize={13} fontWeight="bold" fill="#ffffff"
              >
                {node.id}
              </text>
              <text
                x={tooltipX + 10} y={tooltipY + 36}
                fontFamily="'IBM Plex Sans', sans-serif"
                fontSize={11} fill="#d1d5db"
              >
                {bodyText}
              </text>
            </g>
          );
        })()}

        {unobservablePercent !== null && unobservablePercent > 0 && (
          <text
            x={width - 16}
            y={effectiveHeight - 16}
            textAnchor="end"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize={13}
            fill="rgba(0,0,0,0.25)"
            style={{ userSelect: "none" }}
          >
            {Math.round(unobservablePercent)}% UNOBSERVABLE
          </text>
        )}
      </g>
    </svg>
  );
}
