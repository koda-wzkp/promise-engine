"use client";

import { useMemo } from "react";
import { hashSeed, seededRandom } from "@/lib/rendering/noise";
import { getStatusColor } from "@/lib/utils/colors";
import type { SVGViewProps, SVGNodeData } from "./svg-view-types";

/** Generate a jagged fracture path from startY downward. */
function generateFracturePath(startX: number, startY: number, endY: number): string {
  const points = [`M ${startX} ${startY}`];
  let x = startX;
  let y = startY;
  const step = 8;
  let i = 0;
  while (y < endY) {
    y += step;
    x += (seededRandom(Math.abs(Math.round(x * 10 + y * 10)) + i) - 0.5) * 12;
    points.push(`L ${x} ${y}`);
    i++;
  }
  return points.join(" ");
}

export function StrataView({
  nodes,
  edges,
  width,
  height,
  domainBands,
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

  // Domain layer colors — derive from domain index
  const layerBaseColors = [
    "#94a3b8", "#a78bfa", "#6ee7b7", "#fbbf24", "#f87171",
    "#67e8f9", "#c084fc", "#86efac", "#fca5a5", "#a5b4fc",
  ];

  // Group nodes by domain
  const nodesByDomain = useMemo(() => {
    const map = new Map<string, SVGNodeData[]>();
    for (const n of nodes) {
      const domain = n.domain ?? "Other";
      if (!map.has(domain)) map.set(domain, []);
      map.get(domain)!.push(n);
    }
    return map;
  }, [nodes]);

  // Fracture lines from violated promises
  const fractures = useMemo(() => {
    if (!domainBands || domainBands.length === 0) return [];
    const maxY = domainBands.reduce((m, b) => Math.max(m, b.y + b.height), 0);
    return nodes
      .filter((n) => n.status === "violated")
      .map((n) => ({
        id: n.id,
        path: generateFracturePath(n.x, n.y, Math.min(maxY, effectiveHeight - 10)),
      }));
  }, [nodes, domainBands, effectiveHeight]);

  return (
    <svg
      viewBox={`0 0 ${width} ${effectiveHeight}`}
      width={width}
      height={effectiveHeight}
      role="img"
      aria-label={`Promise network visualization — strata view. ${nodes.length} promises across ${domainBands?.length ?? 0} domains.`}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="strata-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#4b5563" />
        </linearGradient>
        <pattern
          id="violation-hatch"
          width={6} height={6}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,0,0,0.3)" strokeWidth={1} />
        </pattern>
      </defs>

      {/* Background */}
      <g className="background">
        <rect width={width} height={effectiveHeight} fill="url(#strata-bg)" />
      </g>

      {/* Domain layers */}
      <g className="layers">
        {(domainBands ?? []).map((band, bi) => {
          const baseColor = layerBaseColors[bi % layerBaseColors.length];
          const opacityMult = 0.7 + 0.3 * (bi / Math.max(1, (domainBands?.length ?? 1) - 1));
          return (
            <g key={band.domain}>
              {/* Layer fill */}
              <rect
                x={0} y={band.y}
                width={width} height={band.height}
                fill={baseColor}
                opacity={0.25 * opacityMult}
              />
              {/* Geological grain lines */}
              {[0, 1, 2].map((li) => (
                <line
                  key={li}
                  x1={0}
                  y1={band.y + (li + 1) * band.height / 4}
                  x2={width}
                  y2={band.y + (li + 1) * band.height / 4 + (seededRandom(bi * 100 + li) - 0.5) * 6}
                  stroke="rgba(0,0,0,0.08)"
                  strokeWidth={0.5}
                />
              ))}
              {/* Border between layers */}
              <line
                x1={0} y1={band.y + band.height}
                x2={width} y2={band.y + band.height}
                stroke="rgba(0,0,0,0.15)"
                strokeWidth={1}
              />
              {/* Domain label */}
              <text
                x={isMobile ? 8 : 16}
                y={band.y + 16}
                fontFamily="'IBM Plex Mono', monospace"
                fontSize={isMobile ? 10 : 11}
                fill="rgba(255,255,255,0.6)"
                fontWeight="bold"
              >
                {band.domain}
              </text>
            </g>
          );
        })}
      </g>

      {/* Fracture lines */}
      <g className="edges">
        {fractures.map((f) => (
          <path
            key={`fracture-${f.id}`}
            d={f.path}
            stroke="#991b1b"
            strokeWidth={isMobile ? 2 : 1.5}
            fill="none"
            opacity={0.7}
            strokeLinecap="round"
            className={cascadeActive && !reducedMotion ? "strata-fracture-grow" : ""}
          />
        ))}
      </g>

      {/* Promise blocks */}
      <g className="nodes">
        {nodes.map((node) => {
          const blockW = Math.min(width * 0.15, 40 + node.downstreamCount * 10);
          const band = (domainBands ?? []).find((b) => b.domain === (node.domain ?? "Other"));
          const blockH = band ? Math.max(20, band.height * 0.5) : 24;
          const bx = node.x - blockW / 2;
          const by = node.y - blockH / 2;
          const color = getStatusColor(node.status);
          const isUnverifiable = node.status === "unverifiable";
          const isViolated = node.status === "violated";
          const isAffected = affectedIds.has(node.id);
          const isFocused = focusedNodeId === node.id;
          const promise = promiseMap.get(node.id);
          const label = promise
            ? `Promise ${node.id}: ${promise.body.slice(0, 40)}. Status: ${node.status}`
            : `Promise ${node.id}. Status: ${node.status}`;

          return (
            <g
              key={node.id}
              data-promise-node="true"
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
                x={bx - Math.max(0, (44 - blockW) / 2)}
                y={by - Math.max(0, (44 - blockH) / 2)}
                width={Math.max(44, blockW)}
                height={Math.max(44, blockH)}
                fill="transparent"
              />
              {/* Block */}
              <rect
                x={bx} y={by}
                width={blockW} height={blockH}
                rx={4}
                fill={isUnverifiable ? "transparent" : color}
                opacity={isUnverifiable ? 0.4 : 0.85}
                stroke={isUnverifiable ? color : isFocused ? "#2563eb" : "none"}
                strokeWidth={isUnverifiable ? 1.5 : isFocused ? 2 : 0}
                strokeDasharray={isUnverifiable ? "5 3" : "none"}
              />
              {/* Violation cross-hatch overlay */}
              {isViolated && (
                <rect
                  x={bx} y={by}
                  width={blockW} height={blockH}
                  rx={4} fill="url(#violation-hatch)"
                />
              )}
              {/* Focus ring (non-unverifiable) */}
              {isFocused && !isUnverifiable && (
                <rect
                  x={bx - 2} y={by - 2}
                  width={blockW + 4} height={blockH + 4}
                  rx={6}
                  fill="none" stroke="#2563eb" strokeWidth={2}
                />
              )}
              {/* Cascade highlight */}
              {isAffected && cascadeActive && (
                <rect
                  x={bx - 1} y={by - 1}
                  width={blockW + 2} height={blockH + 2}
                  rx={5} fill="none" stroke="#dc2626" strokeWidth={1.5} opacity={0.7}
                />
              )}
              {/* Label */}
              <rect
                x={node.x - 24} y={by - (isMobile ? 16 : 14)}
                width={48} height={isMobile ? 14 : 12}
                rx={2}
                fill="#4b5563" opacity={0.7}
              />
              <text
                x={node.x} y={by - (isMobile ? 5 : 4)}
                textAnchor="middle"
                fontFamily="'IBM Plex Mono', monospace"
                fontSize={isMobile ? 11 : 13}
                fill="rgba(255,255,255,0.9)"
              >
                {node.id.length > 8 ? node.id.slice(0, 8) + "…" : node.id}
              </text>
            </g>
          );
        })}
      </g>

      {/* Overlays */}
      <g className="overlays">
        {(focusedNodeId || hoveredNodeId) && (() => {
          const activeId = focusedNodeId || hoveredNodeId;
          const node = nodes.find((n) => n.id === activeId);
          const promise = node ? promiseMap.get(node.id) : null;
          if (!node || !promise) return null;

          const tooltipWidth = Math.min(width * 0.75, 300);
          const tooltipPadding = 10;
          const line1 = promise.body.slice(0, 45);
          const line2Raw = promise.body.slice(45);
          const line2 = line2Raw.length > 40 ? line2Raw.slice(0, 40) + "\u2026" : line2Raw;
          const hasLine2 = line2Raw.length > 0;
          const tooltipHeight = hasLine2 ? 66 : 52;
          const tooltipX = Math.max(8, Math.min(node.x - tooltipWidth / 2, width - tooltipWidth - 8));
          const tooltipY = Math.max(8, node.y - tooltipHeight - 16);
          const clipId = `strata-tooltip-clip-${node.id}`;

          return (
            <g style={{ pointerEvents: "none" }}>
              <defs>
                <clipPath id={clipId}>
                  <rect x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight} rx={6} />
                </clipPath>
              </defs>
              <rect
                x={tooltipX} y={tooltipY}
                width={tooltipWidth} height={tooltipHeight}
                rx={6}
                fill="#1a1a2e" opacity={0.95}
              />
              <g clipPath={`url(#${clipId})`}>
                <text
                  x={tooltipX + tooltipPadding} y={tooltipY + 18}
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize={13} fontWeight="bold" fill="#ffffff"
                >
                  {node.id}
                </text>
                <text
                  x={tooltipX + tooltipPadding} y={tooltipY + 36}
                  fontFamily="'IBM Plex Sans', sans-serif"
                  fontSize={11} fill="#d1d5db"
                >
                  {line1}
                </text>
                {hasLine2 && (
                  <text
                    x={tooltipX + tooltipPadding} y={tooltipY + 50}
                    fontFamily="'IBM Plex Sans', sans-serif"
                    fontSize={11} fill="#d1d5db"
                  >
                    {line2}
                  </text>
                )}
              </g>
            </g>
          );
        })()}

      </g>
    </svg>
  );
}
