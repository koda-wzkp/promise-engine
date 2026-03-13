"use client";

import { useMemo, useState } from "react";
import { PromiseGraphViewProps } from "./types";
import SVGFilters from "./SVGFilters";
import { statusColors } from "@/lib/utils/colors";
import { noise, hashSeed } from "@/lib/utils/noise";
import { countDependents } from "@/lib/simulation/graph";
import { calculateNetworkHealth } from "@/lib/simulation/scoring";

/**
 * Canopy View — Network Health as Forest
 *
 * Each promise is a tree. Domains are groves. Tree height scales with
 * dependent count. Status determines appearance (full canopy, thinning,
 * bare, ghost). Sky gradient reflects overall health score.
 */

interface TreeData {
  id: string;
  x: number;
  groundY: number;
  height: number;
  trunkWidth: number;
  status: string;
  domain: string;
  body: string;
  depCount: number;
  seed: number;
}

// Procedural tree generation
function generateTreeSVG(tree: TreeData, isHovered: boolean, dimmed: boolean) {
  const { x, groundY, height: treeH, trunkWidth, status, seed } = tree;
  const trunkTop = groundY - treeH;
  const opacity = dimmed ? 0.25 : 1;

  const elements: React.ReactNode[] = [];

  // Trunk
  const trunkTaper = trunkWidth * 0.6;
  elements.push(
    <polygon
      key="trunk"
      points={`${x - trunkWidth / 2},${groundY} ${x + trunkWidth / 2},${groundY} ${x + trunkTaper / 2},${trunkTop + treeH * 0.3} ${x - trunkTaper / 2},${trunkTop + treeH * 0.3}`}
      fill="#8B6914"
      opacity={opacity * 0.85}
    />,
  );

  switch (status) {
    case "verified":
    case "kept": {
      // Full, lush canopy — 3 overlapping ellipses in greens
      const greens = ["#16a34a", "#15803d", "#22c55e"];
      for (let i = 0; i < 3; i++) {
        const rx = (treeH * 0.35 + noise(seed + i, 0) * treeH * 0.08) * (1 + i * 0.05);
        const ry = (treeH * 0.28 + noise(seed, i + 1) * treeH * 0.06) * (1 + i * 0.03);
        const cx = x + noise(seed + i * 0.7, 0.5) * 6;
        const cy = trunkTop + treeH * 0.15 + i * 6 + noise(seed, i * 0.3) * 4;
        elements.push(
          <ellipse
            key={`canopy-${i}`}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={greens[i]}
            opacity={opacity * (0.7 - i * 0.1)}
            filter="url(#canopy-wobble)"
          />,
        );
      }
      break;
    }

    case "declared":
    case "modified":
    case "delayed": {
      // Young sapling — small dotted outline canopy
      const rx = treeH * 0.22;
      const ry = treeH * 0.18;
      elements.push(
        <ellipse
          key="sapling-canopy"
          cx={x}
          cy={trunkTop + treeH * 0.2}
          rx={rx}
          ry={ry}
          fill="#bbf7d0"
          fillOpacity={opacity * 0.3}
          stroke="#16a34a"
          strokeWidth={1.2}
          strokeDasharray="3 2"
          opacity={opacity * 0.6}
        />,
      );
      // Small leaf buds
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 + noise(seed, i) * 0.5;
        const dist = rx * 0.5 + noise(seed + i, 0) * 4;
        elements.push(
          <circle
            key={`bud-${i}`}
            cx={x + Math.cos(angle) * dist}
            cy={trunkTop + treeH * 0.2 + Math.sin(angle) * dist * 0.7}
            r={2}
            fill="#4ade80"
            opacity={opacity * 0.5}
          />,
        );
      }
      break;
    }

    case "degraded":
    case "partial": {
      // Thinning canopy — fewer/smaller ellipses in amber/brown
      const ambers = ["#d97706", "#b45309"];
      for (let i = 0; i < 2; i++) {
        const rx = treeH * 0.2 + noise(seed + i, 0) * treeH * 0.05;
        const ry = treeH * 0.16 + noise(seed, i + 1) * treeH * 0.04;
        elements.push(
          <ellipse
            key={`thin-canopy-${i}`}
            cx={x + noise(seed + i, 0.5) * 5}
            cy={trunkTop + treeH * 0.2 + i * 8}
            rx={rx}
            ry={ry}
            fill={ambers[i]}
            opacity={opacity * 0.45}
          />,
        );
      }
      // Bare branches visible above
      for (let i = 0; i < 3; i++) {
        const angle = -Math.PI / 2 + (i - 1) * 0.6 + noise(seed, i * 0.7) * 0.2;
        const len = treeH * 0.25 + noise(seed + i, 0) * 8;
        elements.push(
          <line
            key={`branch-${i}`}
            x1={x}
            y1={trunkTop + treeH * 0.25}
            x2={x + Math.cos(angle) * len}
            y2={trunkTop + treeH * 0.25 + Math.sin(angle) * len}
            stroke="#92400e"
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={opacity * 0.5}
          />,
        );
      }
      break;
    }

    case "violated":
    case "broken":
    case "repealed": {
      // Bare trunk with angular branches. Red haze at base.
      elements.push(
        <circle
          key="red-haze"
          cx={x}
          cy={groundY - 5}
          r={treeH * 0.3}
          fill="#dc2626"
          filter="url(#red-haze)"
          opacity={opacity * 0.2}
        />,
      );
      for (let i = 0; i < 5; i++) {
        const baseY = trunkTop + treeH * 0.1 + i * (treeH * 0.15);
        const angle = (i % 2 === 0 ? -1 : 1) * (0.5 + noise(seed, i) * 0.4);
        const len = treeH * 0.18 + noise(seed + i, 0) * 10;
        elements.push(
          <line
            key={`dead-branch-${i}`}
            x1={x}
            y1={baseY}
            x2={x + Math.cos(angle) * len * (i % 2 === 0 ? -1 : 1)}
            y2={baseY + Math.sin(angle) * len * -0.5}
            stroke="#78350f"
            strokeWidth={1.2}
            strokeLinecap="round"
            opacity={opacity * 0.6}
          />,
        );
      }
      break;
    }

    case "unverifiable": {
      // Ghost tree — dashed outline of what the canopy should be
      const rx = treeH * 0.3;
      const ry = treeH * 0.24;
      elements.push(
        <ellipse
          key="ghost-canopy"
          cx={x}
          cy={trunkTop + treeH * 0.2}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="#7c3aed"
          strokeWidth={1.2}
          strokeDasharray="4 3"
          opacity={opacity * 0.35}
        />,
      );
      // Question mark
      elements.push(
        <text
          key="question"
          x={x}
          y={trunkTop + treeH * 0.22}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#7c3aed"
          fontSize={treeH * 0.18}
          opacity={opacity * 0.3}
          className="pointer-events-none select-none"
        >
          ?
        </text>,
      );
      break;
    }

    default: {
      // Fallback: simple circle
      elements.push(
        <circle
          key="fallback"
          cx={x}
          cy={trunkTop + treeH * 0.3}
          r={treeH * 0.2}
          fill={statusColors[status as keyof typeof statusColors] ?? "#6b7280"}
          opacity={opacity * 0.5}
        />,
      );
    }
  }

  // Hover highlight ring
  if (isHovered) {
    elements.push(
      <circle
        key="hover-ring"
        cx={x}
        cy={trunkTop + treeH * 0.3}
        r={treeH * 0.38}
        fill="none"
        stroke="#1e293b"
        strokeWidth={1.5}
        strokeDasharray="3 2"
        opacity={0.5}
      />,
    );
  }

  return elements;
}

export default function CanopyView({
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
  const isMobile = width < 640;

  const depCounts = useMemo(() => countDependents(promises), [promises]);
  const health = useMemo(() => calculateNetworkHealth(promises), [promises]);

  const affectedIds = useMemo(() => {
    if (!cascadeResult) return new Set<string>();
    const ids = new Set(cascadeResult.affectedPromises.map((a) => a.promiseId));
    ids.add(cascadeResult.query.promiseId);
    return ids;
  }, [cascadeResult]);

  const hasCascade = cascadeResult != null;
  const sourceId = cascadeResult?.query.promiseId ?? null;

  // Layout: group promises by domain into groves
  const trees = useMemo(() => {
    const domainNames = Array.from(new Set(promises.map((p) => p.domain)));
    const maxDepCount = Math.max(1, ...Array.from(depCounts.values()));
    const mobile = width < 640;
    const groundY = height - (mobile ? 35 : 50);
    const padding = mobile ? { left: 20, right: 20 } : { left: 40, right: 40 };
    const usableW = width - padding.left - padding.right;

    // Divide horizontal space by domain
    const groveWidth = usableW / Math.max(domainNames.length, 1);
    const result: TreeData[] = [];

    for (let di = 0; di < domainNames.length; di++) {
      const domainName = domainNames[di];
      const grovePromises = promises.filter((p) => p.domain === domainName);
      const groveLeft = padding.left + di * groveWidth;

      for (let pi = 0; pi < grovePromises.length; pi++) {
        const p = grovePromises[pi];
        const depCount = depCounts.get(p.id) ?? 0;
        const seed = hashSeed(p.id);

        // X: spread within grove
        const count = grovePromises.length;
        const baseX = count === 1
          ? groveLeft + groveWidth / 2
          : groveLeft + groveWidth * 0.1 + (pi / (count - 1)) * groveWidth * 0.8;
        const x = baseX + noise(seed * 0.1, 0) * 8;

        // Tree height scales with dependent count
        const minH = 40;
        const maxH = Math.min(height * 0.55, 180);
        const treeHeight = minH + (depCount / maxDepCount) * (maxH - minH);

        // Trunk width scales too
        const trunkWidth = 3 + (depCount / maxDepCount) * 5;

        result.push({
          id: p.id,
          x,
          groundY,
          height: treeHeight,
          trunkWidth,
          status: p.status,
          domain: p.domain,
          body: p.body,
          depCount,
          seed,
        });
      }
    }

    return result;
  }, [promises, depCounts, width, height]);

  // Domain labels
  const domainLabels = useMemo(() => {
    const domainNames = Array.from(new Set(promises.map((p) => p.domain)));
    const mobile = width < 640;
    const padding = mobile ? { left: 20, right: 20 } : { left: 40, right: 40 };
    const usableW = width - padding.left - padding.right;
    const groveWidth = usableW / Math.max(domainNames.length, 1);

    return domainNames.map((name, i) => ({
      name,
      x: padding.left + i * groveWidth + groveWidth / 2,
      y: height - (mobile ? 10 : 20),
    }));
  }, [promises, width, height]);

  // Sky gradient based on health
  const skyStops = useMemo(() => {
    const score = health.overall;
    if (score >= 80) return { top: "#E0F6FF", bottom: "#87CEEB" };
    if (score >= 50) return { top: "#e5e7eb", bottom: "#9ca3af" };
    return { top: "#6b7280", bottom: "#4b5563" };
  }, [health]);

  // Ground line
  const groundY = height - 50;

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full touch-none"
        style={{ maxHeight: height }}
        role="img"
        aria-label={`Forest canopy visualization showing ${promises.length} promises as trees. Network health: ${health.overall}%.`}
      >
        <desc>
          Each promise is a tree. Verified promises have full green canopies. Degraded trees are
          thinning. Violated trees are bare. Tree height indicates downstream importance.
        </desc>

        <SVGFilters />

        {/* Sky gradient */}
        <defs>
          <linearGradient id="sky-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyStops.top} />
            <stop offset="100%" stopColor={skyStops.bottom} />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={width} height={height} fill="url(#sky-gradient)" />

        {/* Ground */}
        <path
          d={(() => {
            const parts = [`M 0 ${groundY}`];
            for (let x = 0; x <= width; x += 15) {
              const y = groundY + noise(x * 0.015, 7.7) * 5;
              parts.push(`L ${x} ${y}`);
            }
            parts.push(`L ${width} ${height} L 0 ${height} Z`);
            return parts.join(" ");
          })()}
          fill="#4d7c0f"
          opacity={0.25}
        />

        {/* Grass texture ground fill */}
        <rect
          x={0}
          y={groundY - 5}
          width={width}
          height={height - groundY + 5}
          fill="#65a30d"
          opacity={0.15}
        />

        {/* Trees — sorted back to front (taller trees behind) for depth */}
        {[...trees]
          .sort((a, b) => a.height - b.height)
          .map((tree) => {
            const isHovered = hoveredNode === tree.id;
            const isAffected = affectedIds.has(tree.id);
            const isSource = tree.id === sourceId;
            const dimmed = hasCascade && !isAffected;

            // Wind sway — CSS transform on canopy group
            const swayPhase = tree.seed % 10;
            const swayStyle = {
              transformOrigin: `${tree.x}px ${tree.groundY}px`,
              animation: `tree-sway ${3 + (tree.seed % 20) * 0.1}s ease-in-out ${swayPhase * 0.3}s infinite alternate`,
            };

            return (
              <g
                key={tree.id}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`Promise ${tree.id}: ${tree.body}. Status: ${tree.status}. ${tree.depCount} downstream.`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPromiseClick(tree.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPromiseClick(tree.id);
                  }
                }}
                onMouseEnter={() => setHoveredNode(tree.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onFocus={() => setHoveredNode(tree.id)}
                onBlur={() => setHoveredNode(null)}
              >
                {/* Source glow */}
                {isSource && (
                  <circle
                    cx={tree.x}
                    cy={tree.groundY - tree.height * 0.4}
                    r={tree.height * 0.4}
                    fill="none"
                    stroke="#eab308"
                    strokeWidth={3}
                    opacity={0.5}
                    filter="url(#node-glow)"
                    className="cascade-pulse"
                  />
                )}

                {/* Affected pulse */}
                {isAffected && !isSource && (
                  <circle
                    cx={tree.x}
                    cy={tree.groundY - tree.height * 0.4}
                    r={tree.height * 0.35}
                    fill="none"
                    stroke={statusColors[tree.status as keyof typeof statusColors] ?? "#6b7280"}
                    strokeWidth={2}
                    className="cascade-pulse"
                  />
                )}

                {/* Tree with sway */}
                <g style={swayStyle}>
                  {generateTreeSVG(tree, isHovered, dimmed)}
                </g>

                {/* ID label on ground */}
                <text
                  x={tree.x}
                  y={tree.groundY + 12}
                  textAnchor="middle"
                  className="pointer-events-none select-none font-mono"
                  fill="#374151"
                  fontSize={8}
                  opacity={dimmed ? 0.2 : 0.6}
                >
                  {tree.id}
                </text>

                {/* Hover tooltip */}
                {isHovered && (
                  <foreignObject
                    x={tree.x + 15}
                    y={tree.groundY - tree.height - 10}
                    width={isMobile ? 150 : 200}
                    height={60}
                    className="pointer-events-none"
                  >
                    <div className="rounded-md border border-gray-700 bg-gray-900 px-2.5 py-1.5 shadow-xl">
                      <p className="font-mono text-[9px] text-gray-400">
                        {tree.id} · {tree.domain}
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium leading-tight text-white">
                        {tree.body.length > 70 ? tree.body.slice(0, 70) + "…" : tree.body}
                      </p>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}

        {/* Domain labels on ground */}
        {domainLabels.map((dl) => (
          <text
            key={dl.name}
            x={dl.x}
            y={dl.y}
            textAnchor="middle"
            className="pointer-events-none select-none font-sans font-semibold uppercase"
            fill="#374151"
            fontSize={isMobile ? 7 : 9}
            letterSpacing="0.05em"
            opacity={0.45}
          >
            {dl.name}
          </text>
        ))}

        {/* Health score in sky */}
        <text
          x={width - 15}
          y={25}
          textAnchor="end"
          className="pointer-events-none select-none font-mono"
          fill={health.overall >= 50 ? "#374151" : "#e5e7eb"}
          fontSize={11}
          opacity={0.5}
        >
          Health: {health.overall}%
        </text>
      </svg>

      {/* Sway animation keyframes */}
      <style>{`
        @keyframes tree-sway {
          from { transform: rotate(-1deg); }
          to { transform: rotate(1deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="tree-sway"] { animation: none !important; }
        }
      `}</style>

      {/* Legend — compact on mobile */}
      <div className="absolute left-2 top-2 flex flex-col gap-0.5 rounded-md bg-white/90 px-2 py-1.5 text-[9px] text-gray-500 shadow-sm backdrop-blur-sm sm:gap-1 sm:px-2.5 sm:py-2 sm:text-[10px]">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#16a34a] sm:h-3 sm:w-3" />
          <span className="hidden sm:inline">Verified (full canopy)</span>
          <span className="sm:hidden">Verified</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full border border-dashed border-[#16a34a] bg-[#bbf7d0]/30 sm:h-3 sm:w-3" />
          <span className="hidden sm:inline">Declared (sapling)</span>
          <span className="sm:hidden">Declared</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#d97706] sm:h-3 sm:w-3" />
          <span className="hidden sm:inline">Degraded (thinning)</span>
          <span className="sm:hidden">Degraded</span>
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          <span className="inline-block h-3 w-3 rounded-full bg-[#78350f]" />
          Violated (bare)
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          <span className="inline-block h-3 w-3 rounded-full border border-dashed border-[#7c3aed]" />
          Unverifiable (ghost)
        </span>
      </div>
    </div>
  );
}
