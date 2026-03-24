"use client";

import { useMemo } from "react";
import { hashSeed, seededRandom } from "@/lib/rendering/noise";
import { getStatusColor } from "@/lib/utils/colors";
import type { SVGViewProps } from "./svg-view-types";

/** Determine stream color based on endpoint statuses. */
function streamColor(srcStatus: string, tgtStatus: string): string {
  if (srcStatus === "violated" || tgtStatus === "violated") return "#dc2626";
  if (srcStatus === "degraded" || tgtStatus === "degraded") return "#d97706";
  if (srcStatus === "unverifiable" || tgtStatus === "unverifiable") return "#8b5cf6";
  return "#60a5fa";
}

function streamDash(srcStatus: string, tgtStatus: string): string | undefined {
  if (srcStatus === "unverifiable" || tgtStatus === "unverifiable") return "6 4";
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
  const svgHeight = isMobile ? width * 1.6 : width * 0.65;
  const effectiveHeight = Math.min(height, svgHeight);

  // Compute particle data once
  const particles = useMemo(() => {
    if (isMobile || reducedMotion) return [];
    return edges.slice(0, 20).flatMap((edge, ei) => {
      const src = nodes.find((n) => n.id === edge.sourceId);
      const tgt = nodes.find((n) => n.id === edge.targetId);
      if (!src || !tgt) return [];
      const midX = (src.x + tgt.x) / 2;
      const midY = (src.y + tgt.y) / 2;
      const seed = hashSeed(edge.edgeId);
      const controlX = midX + (seededRandom(seed) - 0.5) * 60;
      const controlY = midY + (seededRandom(seed + 1) - 0.5) * 40;
      const pathD = `M ${src.x} ${src.y} Q ${controlX} ${controlY} ${tgt.x} ${tgt.y}`;
      const color = streamColor(src.status, tgt.status);
      const count = Math.min(2, Math.max(1, Math.floor(edge.downstreamCount / 2)));
      return Array.from({ length: count }, (_, pi) => ({
        key: `${edge.edgeId}-p${pi}`,
        pathD,
        color,
        dur: `${3 + seededRandom(seed + pi + 10) * 2}s`,
      }));
    });
  }, [edges, nodes, isMobile, reducedMotion]);

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
        <linearGradient id="watershed-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e4df" />
          <stop offset="100%" stopColor="#c4b9a8" />
        </linearGradient>
      </defs>

      {/* Background */}
      <g className="background">
        <rect width={width} height={effectiveHeight} fill="url(#watershed-bg)" />
      </g>

      {/* Streams (edges) */}
      <g className="edges">
        {edges.map((edge) => {
          const src = nodes.find((n) => n.id === edge.sourceId);
          const tgt = nodes.find((n) => n.id === edge.targetId);
          if (!src || !tgt) return null;
          const midX = (src.x + tgt.x) / 2;
          const midY = (src.y + tgt.y) / 2;
          const seed = hashSeed(edge.edgeId);
          const controlX = midX + (seededRandom(seed) - 0.5) * 60;
          const controlY = midY + (seededRandom(seed + 1) - 0.5) * 40;
          const color = streamColor(src.status, tgt.status);
          const sw = 2 + Math.min(edge.downstreamCount, 5);
          const dash = streamDash(src.status, tgt.status);

          return (
            <path
              key={edge.edgeId}
              d={`M ${src.x} ${src.y} Q ${controlX} ${controlY} ${tgt.x} ${tgt.y}`}
              stroke={color}
              strokeWidth={sw}
              fill="none"
              opacity={0.6}
              strokeLinecap="round"
              strokeDasharray={dash}
            />
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

      {/* Nodes */}
      <g className="nodes">
        {nodes.map((node) => {
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
                x={node.x - 22}
                y={node.y - 22}
                width={44}
                height={44}
                fill="transparent"
              />
              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill={color}
                stroke={isFocused ? "#2563eb" : color}
                strokeWidth={isFocused ? 2 : 1.5}
                opacity={0.9}
                className={isAffected && cascadeActive && !reducedMotion ? "watershed-pulse" : ""}
              />
              {/* Label background */}
              <rect
                x={node.x - 24}
                y={node.y - r - (isMobile ? 18 : 16)}
                width={48}
                height={isMobile ? 14 : 12}
                rx={2}
                fill="#e8e4df"
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
                {node.id.length > 8 ? node.id.slice(0, 8) + "…" : node.id}
              </text>
            </g>
          );
        })}
      </g>

      {/* Overlays */}
      <g className="overlays">
        {/* Tooltip for hovered node */}
        {hoveredNodeId && (() => {
          const node = nodes.find((n) => n.id === hoveredNodeId);
          const promise = node ? promiseMap.get(node.id) : null;
          if (!node || !promise) return null;
          const tx = Math.min(node.x + 14, width - 180);
          const ty = node.y - 10;
          const bodyText = promise.body.length > 50 ? promise.body.slice(0, 50) + "…" : promise.body;
          return (
            <g>
              <rect x={tx} y={ty - 28} width={170} height={42} rx={6} fill="#111827" opacity={0.9} />
              <text x={tx + 8} y={ty - 12} fontFamily="'IBM Plex Mono', monospace" fontSize={11} fill="#fff" fontWeight="bold">
                {node.id}
              </text>
              <text x={tx + 8} y={ty + 2} fontFamily="'IBM Plex Mono', monospace" fontSize={10} fill="rgba(255,255,255,0.7)">
                {bodyText}
              </text>
            </g>
          );
        })()}

        {/* UNOBSERVABLE watermark */}
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
