"use client";

import { useMemo } from "react";
import { hashSeed, seededRandom } from "@/lib/rendering/noise";
import type { SVGViewProps, SVGNodeData } from "./svg-view-types";

/** Render a procedural tree based on promise status. */
function renderTree(
  node: SVGNodeData,
  groundY: number,
  scale: number,
  index: number,
) {
  const { x, status, downstreamCount, id } = node;
  const seed = hashSeed(id);
  const treeHeight = (30 + downstreamCount * 12) * scale;
  const trunkWidth = (4 + Math.min(downstreamCount, 6)) * scale;
  const trunkHeight = treeHeight * 0.35;
  const canopyRadius = treeHeight * 0.45;

  const n = (offset: number) => seededRandom(seed + offset);

  switch (status) {
    case "verified":
      return (
        <g key={`tree-${id}`}>
          <rect
            x={x - trunkWidth / 2} y={groundY - trunkHeight}
            width={trunkWidth} height={trunkHeight}
            fill="#5c3d2e" rx={1}
          />
          <ellipse
            cx={x + (n(0) - 0.5) * 8} cy={groundY - trunkHeight - canopyRadius * 0.6}
            rx={canopyRadius * (0.9 + (n(1) - 0.5) * 0.2)}
            ry={canopyRadius * (0.75 + (n(2) - 0.5) * 0.2)}
            fill="#2d6a4f" opacity={0.85}
          />
          <ellipse
            cx={x - canopyRadius * 0.3 + (n(3) - 0.5) * 6}
            cy={groundY - trunkHeight - canopyRadius * 0.5}
            rx={canopyRadius * 0.7} ry={canopyRadius * 0.6}
            fill="#40916c" opacity={0.7}
          />
          <ellipse
            cx={x + canopyRadius * 0.25 + (n(4) - 0.5) * 6}
            cy={groundY - trunkHeight - canopyRadius * 0.45}
            rx={canopyRadius * 0.65} ry={canopyRadius * 0.55}
            fill="#52b788" opacity={0.6}
          />
        </g>
      );

    case "degraded":
      return (
        <g key={`tree-${id}`}>
          <rect
            x={x - trunkWidth / 2} y={groundY - trunkHeight}
            width={trunkWidth} height={trunkHeight}
            fill="#5c3d2e" rx={1}
          />
          <ellipse
            cx={x} cy={groundY - trunkHeight - canopyRadius * 0.4}
            rx={canopyRadius * 0.6} ry={canopyRadius * 0.45}
            fill="#b45309" opacity={0.7}
          />
          <ellipse
            cx={x + canopyRadius * 0.15}
            cy={groundY - trunkHeight - canopyRadius * 0.35}
            rx={canopyRadius * 0.45} ry={canopyRadius * 0.35}
            fill="#d97706" opacity={0.5}
          />
          <line
            x1={x - 3} y1={groundY - trunkHeight - canopyRadius * 0.7}
            x2={x - canopyRadius * 0.4} y2={groundY - treeHeight * 0.85}
            stroke="#5c3d2e" strokeWidth={1.5} strokeLinecap="round"
          />
          <line
            x1={x + 2} y1={groundY - trunkHeight - canopyRadius * 0.65}
            x2={x + canopyRadius * 0.35} y2={groundY - treeHeight * 0.9}
            stroke="#5c3d2e" strokeWidth={1.5} strokeLinecap="round"
          />
        </g>
      );

    case "violated": {
      const branches = Array.from({ length: 4 }, (_, i) => {
        const angle = -30 + i * 20 + (n(i + 10) - 0.5) * 30;
        const len = canopyRadius * (0.4 + n(i + 20) * 0.2);
        const rad = (angle * Math.PI) / 180;
        return {
          x2: x + Math.sin(rad) * len,
          y2: groundY - trunkHeight * 1.2 - Math.cos(rad) * len * 0.6,
        };
      });
      return (
        <g key={`tree-${id}`}>
          <rect
            x={x - trunkWidth / 2} y={groundY - trunkHeight * 1.2}
            width={trunkWidth} height={trunkHeight * 1.2}
            fill="#4a3728" rx={1}
          />
          {branches.map((b, i) => (
            <line
              key={i}
              x1={x} y1={groundY - trunkHeight * 1.1}
              x2={b.x2} y2={b.y2}
              stroke="#4a3728" strokeWidth={1.5} strokeLinecap="round"
            />
          ))}
        </g>
      );
    }

    case "unverifiable":
      return (
        <g key={`tree-${id}`} opacity={0.5}>
          <rect
            x={x - trunkWidth / 2} y={groundY - trunkHeight}
            width={trunkWidth} height={trunkHeight}
            fill="none" stroke="#7c3aed" strokeWidth={1} strokeDasharray="4 3" rx={1}
          />
          <ellipse
            cx={x} cy={groundY - trunkHeight - canopyRadius * 0.5}
            rx={canopyRadius * 0.7} ry={canopyRadius * 0.55}
            fill="none" stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="6 4"
          />
        </g>
      );

    case "declared":
    default:
      return (
        <g key={`tree-${id}`} opacity={0.7}>
          <rect
            x={x - 1.5} y={groundY - trunkHeight * 0.6}
            width={3} height={trunkHeight * 0.6}
            fill="#5c3d2e" rx={0.5}
          />
          <ellipse
            cx={x} cy={groundY - trunkHeight * 0.6 - canopyRadius * 0.25}
            rx={canopyRadius * 0.35} ry={canopyRadius * 0.3}
            fill="none" stroke="#1e40af" strokeWidth={1} strokeDasharray="3 3"
          />
        </g>
      );
  }
}

/** Positioned tree with layout data. */
interface PositionedTree {
  node: SVGNodeData;
  treeX: number;
  treeGroundY: number;
  scale: number;
  labelY: number;
}

export function CanopyView({
  nodes,
  edges,
  width,
  height,
  networkHealth,
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

  // Sky colors based on network health
  const skyTop = networkHealth > 70 ? "#87CEEB" : networkHealth > 40 ? "#b0c4d8" : "#8a9bae";
  const skyBottom = networkHealth > 70 ? "#E0F6FF" : networkHealth > 40 ? "#d1d5db" : "#9ca3af";

  // Ground line at 75% — leaves room for trees above and roots/labels below
  const groundY = effectiveHeight * 0.75;

  const groundPath = useMemo(() => {
    const pts = Array.from({ length: 20 }, (_, i) => {
      const gx = (i / 19) * width;
      const gy = groundY + (seededRandom(i * 37 + 7) - 0.5) * 16;
      return `${gx},${gy}`;
    });
    return `M 0,${effectiveHeight} L ${pts.join(" L ")} L ${width},${effectiveHeight} Z`;
  }, [width, effectiveHeight, groundY]);

  // Compute positioned trees — memoized to avoid flash on selection change
  const positionedTrees: PositionedTree[] = useMemo(() => {
    const padding = isMobile ? 24 : 40;

    if (isMobile) {
      // Mobile: 2 staggered rows for depth
      const sorted = [...nodes].sort((a, b) => b.downstreamCount - a.downstreamCount);
      const half = Math.ceil(sorted.length / 2);
      const backRow = sorted.slice(0, half);  // Most dependents → back
      const frontRow = sorted.slice(half);     // Fewer dependents → front

      const result: PositionedTree[] = [];

      // Back row: at groundY, scale 0.8
      const backSpacing = (width - padding * 2) / Math.max(1, backRow.length + 1);
      for (let i = 0; i < backRow.length; i++) {
        const treeX = padding + backSpacing * (i + 1);
        // Stagger labels: even at groundY+16, odd at groundY+28
        const labelOff = i % 2 === 0 ? 16 : 28;
        result.push({
          node: backRow[i],
          treeX,
          treeGroundY: groundY,
          scale: 0.8,
          labelY: groundY + labelOff,
        });
      }

      // Front row: at groundY + 15, scale 1.0
      const frontSpacing = (width - padding * 2) / Math.max(1, frontRow.length + 1);
      for (let i = 0; i < frontRow.length; i++) {
        const treeX = padding + frontSpacing * (i + 1) + frontSpacing * 0.3;
        // Stagger labels: even at groundY+31, odd at groundY+43
        const labelOff = i % 2 === 0 ? 31 : 43;
        result.push({
          node: frontRow[i],
          treeX,
          treeGroundY: groundY + 15,
          scale: 1.0,
          labelY: groundY + labelOff,
        });
      }

      return result;
    } else {
      // Desktop: single row sorted by domain for clustering
      const sorted = [...nodes].sort((a, b) => a.domain.localeCompare(b.domain));
      const spacing = (width - padding * 2) / Math.max(1, sorted.length + 1);
      return sorted.map((node, idx) => ({
        node,
        treeX: padding + spacing * (idx + 1),
        treeGroundY: groundY,
        scale: 1.0,
        labelY: groundY + 20,
      }));
    }
  }, [nodes, width, groundY, isMobile]);

  // Resolve overlapping labels by offsetting
  const labelPositions = useMemo(() => {
    const positions = positionedTrees.map((t) => ({
      x: t.treeX,
      y: t.labelY,
    }));
    const labelWidth = isMobile ? 48 : 56;

    // Sort by x to check adjacency
    const indexed = positions.map((p, i) => ({ ...p, i }));
    indexed.sort((a, b) => a.x - b.x);
    for (let k = 1; k < indexed.length; k++) {
      if (Math.abs(indexed[k].x - indexed[k - 1].x) < labelWidth &&
          Math.abs(indexed[k].y - indexed[k - 1].y) < 14) {
        indexed[k].y += 14;
      }
    }

    // Map back to original order
    const result = new Array(positions.length);
    for (const item of indexed) {
      result[item.i] = { x: item.x, y: item.y };
    }
    return result;
  }, [positionedTrees, isMobile]);

  // Tree scale based on viewport (used for hit areas)
  const treeScale = isMobile ? 0.75 : 1.0;

  // Active tooltip node: show on tap (focusedNodeId) or hover
  const activeTooltipId = focusedNodeId || hoveredNodeId;

  return (
    <svg
      viewBox={`0 0 ${width} ${effectiveHeight}`}
      width={width}
      height={effectiveHeight}
      role="img"
      aria-label={`Promise network visualization — canopy view. ${nodes.length} promises. Network health: ${networkHealth}.`}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="canopy-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor={skyBottom} />
        </linearGradient>
      </defs>

      {/* Sky background */}
      <g className="background">
        <rect width={width} height={effectiveHeight} fill="url(#canopy-sky)" />
      </g>

      {/* Ground */}
      <path d={groundPath} fill="#5c4a32" />
      <rect
        x={0} y={groundY - 4}
        width={width} height={effectiveHeight - groundY + 4}
        fill="#4a3a25" opacity={0.3}
      />

      {/* Trees — rendered from memoized positions */}
      <g className="nodes">
        {positionedTrees.map((pt, idx) => {
          const { node, treeX, treeGroundY, scale } = pt;
          const promise = promiseMap.get(node.id);
          const label = promise
            ? `Promise ${node.id}: ${promise.body.slice(0, 40)}. Status: ${node.status}`
            : `Promise ${node.id}. Status: ${node.status}`;
          const isFocused = focusedNodeId === node.id;
          const isAffected = affectedIds.has(node.id);
          const treeHeight = (30 + node.downstreamCount * 12) * scale;
          const labelPos = labelPositions[idx];

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
              style={{
                cursor: "pointer",
                outline: "none",
                transformOrigin: `${treeX}px ${treeGroundY}px`,
              }}
              className={
                !isMobile && !reducedMotion
                  ? `canopy-sway canopy-sway-${idx % 3}`
                  : ""
              }
            >
              {/* Invisible hit area */}
              <rect
                x={treeX - 22} y={treeGroundY - Math.max(44, treeHeight)}
                width={44} height={Math.max(44, treeHeight + 20)}
                fill="transparent"
              />
              {/* Focus / selection highlight ring */}
              {isFocused && (
                <rect
                  x={treeX - 24} y={treeGroundY - treeHeight - 4}
                  width={48} height={treeHeight + 8}
                  rx={4}
                  fill="none" stroke="#2563eb" strokeWidth={3}
                />
              )}
              {/* Cascade highlight */}
              {isAffected && cascadeActive && (
                <rect
                  x={treeX - 20} y={treeGroundY - treeHeight}
                  width={40} height={treeHeight}
                  rx={4}
                  fill="none" stroke="#dc2626" strokeWidth={1.5} opacity={0.6}
                  strokeDasharray={reducedMotion ? "none" : "4 3"}
                />
              )}
              {/* The tree */}
              {renderTree(
                { ...node, x: treeX },
                treeGroundY,
                scale,
                idx,
              )}
              {/* Label below ground line */}
              <rect
                x={labelPos.x - (isMobile ? 24 : 28)}
                y={labelPos.y - (isMobile ? 10 : 11)}
                width={isMobile ? 48 : 56}
                height={isMobile ? 14 : 15}
                rx={2}
                fill={skyBottom} opacity={0.85}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                fontFamily="'IBM Plex Mono', monospace"
                fontSize={width < 500 ? 9 : isMobile ? 10 : 12}
                fill="#1f2937"
              >
                {node.id.length > 8 ? node.id.slice(0, 8) + "\u2026" : node.id}
              </text>
            </g>
          );
        })}
      </g>

      {/* Overlays — tooltip rendered last for z-order */}
      <g className="overlays">
        {activeTooltipId && (() => {
          const pt = positionedTrees.find((t) => t.node.id === activeTooltipId);
          const promise = pt ? promiseMap.get(pt.node.id) : null;
          if (!pt || !promise) return null;

          const tooltipWidth = Math.min(width * 0.7, 300);
          const tooltipHeight = 52;
          const tooltipX = Math.max(8, Math.min(pt.treeX - tooltipWidth / 2, width - tooltipWidth - 8));
          // Above the tree if room, below ground otherwise
          const treeTop = pt.treeGroundY - (30 + pt.node.downstreamCount * 12) * pt.scale;
          const tooltipY = treeTop - tooltipHeight - 8 > 0
            ? treeTop - tooltipHeight - 8
            : pt.treeGroundY + 40;
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
                {pt.node.id}
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

      </g>
    </svg>
  );
}
