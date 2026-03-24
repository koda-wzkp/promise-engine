"use client";

import { useMemo } from "react";
import { hashSeed, seededRandom } from "@/lib/rendering/noise";
import { getStatusColor } from "@/lib/utils/colors";
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

  // Ground line with noise
  const groundY = effectiveHeight * 0.82;
  const groundPath = useMemo(() => {
    const pts = Array.from({ length: 20 }, (_, i) => {
      const gx = (i / 19) * width;
      const gy = groundY + (seededRandom(i * 37 + 7) - 0.5) * 16;
      return `${gx},${gy}`;
    });
    return `M 0,${effectiveHeight} L ${pts.join(" L ")} L ${width},${effectiveHeight} Z`;
  }, [width, effectiveHeight, groundY]);

  // Sort nodes for rendering: tallest (most dependents) in center
  const sortedNodes = useMemo(() => {
    const sorted = [...nodes].sort((a, b) => b.downstreamCount - a.downstreamCount);
    // Place in order: center-out alternation
    const result: SVGNodeData[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i % 2 === 0) result.push(sorted[i]);
      else result.unshift(sorted[i]);
    }
    return result;
  }, [nodes]);

  // Tree scale based on viewport
  const treeScale = isMobile ? 0.75 : 1.0;

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
      {/* Ground gradient overlay */}
      <rect
        x={0} y={groundY - 4}
        width={width} height={effectiveHeight - groundY + 4}
        fill="#4a3a25" opacity={0.3}
      />

      {/* Trees */}
      <g className="nodes">
        {sortedNodes.map((node, idx) => {
          const promise = promiseMap.get(node.id);
          const label = promise
            ? `Promise ${node.id}: ${promise.body.slice(0, 40)}. Status: ${node.status}`
            : `Promise ${node.id}. Status: ${node.status}`;
          const isFocused = focusedNodeId === node.id;
          const isAffected = affectedIds.has(node.id);

          // Tree position: spread along ground line
          const spacing = width / (sortedNodes.length + 1);
          const treeX = spacing * (idx + 1);

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
              style={{
                cursor: "pointer",
                outline: "none",
                transformOrigin: `${treeX}px ${groundY}px`,
              }}
              className={
                !isMobile && !reducedMotion
                  ? `canopy-sway canopy-sway-${idx % 3}`
                  : ""
              }
            >
              {/* Invisible hit area */}
              <rect
                x={treeX - 22} y={groundY - 80 * treeScale}
                width={44} height={Math.max(44, 80 * treeScale)}
                fill="transparent"
              />
              {/* Focus ring */}
              {isFocused && (
                <rect
                  x={treeX - 24} y={groundY - 82 * treeScale}
                  width={48} height={Math.max(48, 84 * treeScale)}
                  rx={4}
                  fill="none" stroke="#2563eb" strokeWidth={2}
                />
              )}
              {/* Cascade highlight */}
              {isAffected && cascadeActive && (
                <rect
                  x={treeX - 20} y={groundY - 76 * treeScale}
                  width={40} height={Math.max(40, 76 * treeScale)}
                  rx={4}
                  fill="none" stroke="#dc2626" strokeWidth={1.5} opacity={0.6}
                  strokeDasharray={reducedMotion ? "none" : "4 3"}
                />
              )}
              {/* The tree */}
              {renderTree(
                { ...node, x: treeX },
                groundY,
                treeScale,
                idx,
              )}
              {/* Label */}
              <rect
                x={treeX - 24} y={groundY + 4}
                width={48} height={isMobile ? 14 : 12}
                rx={2}
                fill={skyBottom} opacity={0.85}
              />
              <text
                x={treeX} y={groundY + (isMobile ? 15 : 14)}
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
        {hoveredNodeId && (() => {
          const node = nodes.find((n) => n.id === hoveredNodeId);
          const promise = node ? promiseMap.get(node.id) : null;
          if (!node || !promise) return null;
          const tx = Math.min(node.x + 14, width - 180);
          const ty = Math.max(40, node.y - 40);
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

        {unobservablePercent !== null && unobservablePercent > 0 && (
          <text
            x={width - 16} y={effectiveHeight - 16}
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
