"use client";

import { useMemo, useState } from "react";
import { PromiseGraphViewProps } from "./types";
import SVGFilters from "./SVGFilters";
import { statusColors } from "@/lib/utils/colors";
import { noise, hashSeed, fracturePath } from "@/lib/utils/noise";
import { countDependents } from "@/lib/simulation/graph";

/**
 * Strata View — Geological Layers
 *
 * Domains are horizontal geological layers. Surface outcomes rest on
 * foundational promises. Fractures propagate downward from violated
 * promises. Cracked layers indicate structural instability.
 */

interface BlockData {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  layerIndex: number;
  status: string;
  domain: string;
  body: string;
  depCount: number;
}

interface LayerData {
  domain: string;
  y: number;
  h: number;
  color: string;
  index: number;
  hasViolation: boolean;
}

const LAYER_COLORS = [
  "#92400e", "#1e40af", "#047857", "#7c3aed",
  "#b91c1c", "#0e7490", "#4338ca", "#a16207",
  "#15803d", "#9333ea",
];

export default function StrataView({
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

  const affectedIds = useMemo(() => {
    if (!cascadeResult) return new Set<string>();
    const ids = new Set(cascadeResult.affectedPromises.map((a) => a.promiseId));
    ids.add(cascadeResult.query.promiseId);
    return ids;
  }, [cascadeResult]);

  const hasCascade = cascadeResult != null;
  const sourceId = cascadeResult?.query.promiseId ?? null;

  // Layout: horizontal layers by domain, promise blocks embedded within
  const { layers, blocks } = useMemo(() => {
    const domainNames = Array.from(new Set(promises.map((p) => p.domain)));
    const mobile = width < 640;
    const padding = mobile
      ? { top: 20, bottom: 15, left: 15, right: 15 }
      : { top: 30, bottom: 20, left: 30, right: 30 };
    const usableH = height - padding.top - padding.bottom;
    const layerH = usableH / Math.max(domainNames.length, 1);
    const usableW = width - padding.left - padding.right;

    const layerList: LayerData[] = [];
    const blockList: BlockData[] = [];

    for (let di = 0; di < domainNames.length; di++) {
      const domainName = domainNames[di];
      const layerY = padding.top + di * layerH;
      const domainPromises = promises.filter((p) => p.domain === domainName);
      const hasViolation = domainPromises.some(
        (p) => p.status === "violated" || p.status === "broken" || p.status === "repealed",
      );

      layerList.push({
        domain: domainName,
        y: layerY,
        h: layerH,
        color: LAYER_COLORS[di % LAYER_COLORS.length],
        index: di,
        hasViolation,
      });

      // Lay out blocks within the layer
      const gap = mobile ? 3 : 6;
      const blockW = Math.min(
        mobile ? 80 : 120,
        (usableW - (domainPromises.length - 1) * gap) / Math.max(domainPromises.length, 1),
      );
      const blockH = layerH * (mobile ? 0.6 : 0.55);
      const totalBlocksW =
        domainPromises.length * blockW + (domainPromises.length - 1) * gap;
      const startX = padding.left + (usableW - totalBlocksW) / 2;

      for (let pi = 0; pi < domainPromises.length; pi++) {
        const p = domainPromises[pi];
        const depCount = depCounts.get(p.id) ?? 0;
        blockList.push({
          id: p.id,
          x: startX + pi * (blockW + gap),
          y: layerY + (layerH - blockH) / 2,
          w: blockW,
          h: blockH,
          layerIndex: di,
          status: p.status,
          domain: p.domain,
          body: p.body,
          depCount,
        });
      }
    }

    return { layers: layerList, blocks: blockList };
  }, [promises, depCounts, width, height]);

  // Fracture lines from violated promises downward
  const fractures = useMemo(() => {
    const result: { path: string; seed: number; sourceBlock: BlockData }[] = [];
    for (const block of blocks) {
      if (
        block.status === "violated" ||
        block.status === "broken" ||
        block.status === "repealed"
      ) {
        const seed = hashSeed(block.id);
        // Fracture propagates from bottom of block to bottom of view
        const startX = block.x + block.w / 2;
        const startY = block.y + block.h;
        const endY = height - 20;
        if (endY > startY + 10) {
          result.push({
            path: fracturePath(startX, startY, endY, seed, 10),
            seed,
            sourceBlock: block,
          });
        }
      }
    }
    return result;
  }, [blocks, height]);

  // Layer displacement: layers below a violated layer get a subtle sag
  const layerDisplacements = useMemo(() => {
    const displacements = new Map<number, number>();
    let accumSag = 0;
    for (let i = 0; i < layers.length; i++) {
      displacements.set(i, accumSag);
      if (layers[i].hasViolation) {
        accumSag += 2; // Each violated layer adds subtle sag to layers above
      }
    }
    return displacements;
  }, [layers]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full touch-none"
        style={{ maxHeight: height }}
        role="img"
        aria-label={`Geological strata visualization showing ${promises.length} promises in ${layers.length} domain layers.`}
      >
        <desc>
          Domains are geological layers stacked vertically. Promise blocks are embedded in their
          domain layer. Violated promises show fracture lines propagating downward.
        </desc>

        <SVGFilters />

        {/* Background */}
        <rect x={0} y={0} width={width} height={height} fill="#f5f0eb" />

        {/* Layers */}
        {layers.map((layer) => {
          const sag = layerDisplacements.get(layer.index) ?? 0;
          // Depth cue: lower layers are darker
          const depthDarken = layer.index * 0.03;

          return (
            <g key={layer.domain} transform={`translate(0, ${sag})`}>
              {/* Layer band */}
              <rect
                x={0}
                y={layer.y}
                width={width}
                height={layer.h}
                fill={layer.color}
                opacity={0.08 + depthDarken}
                filter="url(#strata-grain)"
              />

              {/* Layer boundary lines */}
              <line
                x1={0}
                y1={layer.y}
                x2={width}
                y2={layer.y}
                stroke={layer.color}
                strokeWidth={0.5}
                opacity={0.2}
              />

              {/* Subtle horizontal striations */}
              {[0.25, 0.5, 0.75].map((frac) => (
                <line
                  key={frac}
                  x1={0}
                  y1={layer.y + layer.h * frac + noise(layer.index, frac) * 2}
                  x2={width}
                  y2={layer.y + layer.h * frac + noise(layer.index + 0.5, frac) * 2}
                  stroke={layer.color}
                  strokeWidth={0.3}
                  opacity={0.06 + depthDarken * 0.5}
                />
              ))}

              {/* Domain label */}
              <text
                x={isMobile ? 4 : 8}
                y={layer.y + (isMobile ? 10 : 14)}
                className="pointer-events-none select-none font-sans font-semibold uppercase"
                fill={layer.color}
                fontSize={isMobile ? 7 : 9}
                letterSpacing="0.06em"
                opacity={0.5}
              >
                {layer.domain}
              </text>
            </g>
          );
        })}

        {/* Fracture lines */}
        {fractures.map((f, i) => {
          const isSourceFracture = sourceId === f.sourceBlock.id;
          return (
            <g key={`fracture-${i}`}>
              {/* Fracture shadow */}
              <path
                d={f.path}
                fill="none"
                stroke="#991b1b"
                strokeWidth={3}
                opacity={0.08}
                strokeLinecap="round"
              />
              {/* Main fracture */}
              <path
                d={f.path}
                fill="none"
                stroke="#991b1b"
                strokeWidth={1.5}
                opacity={isSourceFracture ? 0.7 : 0.35}
                strokeLinecap="round"
                strokeDasharray={isSourceFracture ? "none" : "200"}
                strokeDashoffset={isSourceFracture ? 0 : undefined}
              >
                {isSourceFracture && (
                  <animate
                    attributeName="stroke-dasharray"
                    from="0 200"
                    to="200 0"
                    dur="1.5s"
                    fill="freeze"
                  />
                )}
              </path>
              {/* Dust particles at crack tip */}
              {isSourceFracture &&
                [0, 1, 2].map((pi) => {
                  const tipX =
                    f.sourceBlock.x + f.sourceBlock.w / 2 + noise(f.seed + pi, 0) * 10;
                  return (
                    <circle
                      key={pi}
                      cx={tipX}
                      cy={height - 20}
                      r={1.5}
                      fill="#991b1b"
                      opacity={0}
                    >
                      <animate
                        attributeName="opacity"
                        values="0;0.4;0"
                        dur="1.5s"
                        begin={`${0.8 + pi * 0.2}s`}
                        fill="freeze"
                      />
                      <animate
                        attributeName="cy"
                        from={`${height - 25}`}
                        to={`${height - 35 - pi * 5}`}
                        dur="1.5s"
                        begin={`${0.8 + pi * 0.2}s`}
                        fill="freeze"
                      />
                    </circle>
                  );
                })}
            </g>
          );
        })}

        {/* Promise blocks */}
        {blocks.map((block) => {
          const isHovered = hoveredNode === block.id;
          const isAffected = affectedIds.has(block.id);
          const isSource = block.id === sourceId;
          const dimmed = hasCascade && !isAffected;
          const color = statusColors[block.status as keyof typeof statusColors] ?? "#6b7280";
          const sag = layerDisplacements.get(block.layerIndex) ?? 0;

          const isViolated =
            block.status === "violated" ||
            block.status === "broken" ||
            block.status === "repealed";
          const isUnverifiable = block.status === "unverifiable";

          return (
            <g
              key={block.id}
              transform={`translate(0, ${sag})`}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`Promise ${block.id}: ${block.body}. Status: ${block.status}. ${block.depCount} downstream.`}
              onClick={(e) => {
                e.stopPropagation();
                onPromiseClick(block.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPromiseClick(block.id);
                }
              }}
              onMouseEnter={() => setHoveredNode(block.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onFocus={() => setHoveredNode(block.id)}
              onBlur={() => setHoveredNode(null)}
              opacity={dimmed ? 0.25 : 1}
            >
              {/* Source glow */}
              {isSource && (
                <rect
                  x={block.x - 4}
                  y={block.y - 4}
                  width={block.w + 8}
                  height={block.h + 8}
                  rx={8}
                  fill="none"
                  stroke="#eab308"
                  strokeWidth={3}
                  opacity={0.6}
                  filter="url(#node-glow)"
                  className="cascade-pulse"
                />
              )}

              {/* Affected pulse */}
              {isAffected && !isSource && (
                <rect
                  x={block.x - 2}
                  y={block.y - 2}
                  width={block.w + 4}
                  height={block.h + 4}
                  rx={6}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  className="cascade-pulse"
                />
              )}

              {/* Block background */}
              <rect
                x={block.x}
                y={block.y}
                width={block.w}
                height={block.h}
                rx={4}
                fill={isUnverifiable ? "transparent" : color}
                fillOpacity={isUnverifiable ? 0 : 0.85}
                stroke={isHovered ? "#1e293b" : isUnverifiable ? color : "rgba(255,255,255,0.3)"}
                strokeWidth={isHovered ? 2 : isUnverifiable ? 1.5 : 1}
                strokeDasharray={isUnverifiable ? "4 3" : "none"}
              />

              {/* Crack overlay for violated blocks */}
              {isViolated && (
                <rect
                  x={block.x}
                  y={block.y}
                  width={block.w}
                  height={block.h}
                  rx={4}
                  fill="url(#crack-pattern)"
                  opacity={0.6}
                />
              )}

              {/* Block ID label */}
              <text
                x={block.x + block.w / 2}
                y={block.y + block.h / 2 - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none select-none font-mono font-bold"
                fill={isUnverifiable ? color : "white"}
                fontSize={Math.min(10, block.w * 0.12)}
              >
                {block.id}
              </text>

              {/* Status label inside block */}
              <text
                x={block.x + block.w / 2}
                y={block.y + block.h / 2 + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none select-none font-sans"
                fill={isUnverifiable ? color : "rgba(255,255,255,0.7)"}
                fontSize={7}
                opacity={0.8}
              >
                {block.status}
              </text>

              {/* Hover tooltip */}
              {isHovered && (
                <foreignObject
                  x={Math.min(block.x, width - (isMobile ? 170 : 220))}
                  y={block.y - 55}
                  width={isMobile ? 160 : 210}
                  height={50}
                  className="pointer-events-none"
                >
                  <div className="rounded-md border border-gray-700 bg-gray-900 px-2.5 py-1.5 shadow-xl">
                    <p className="font-mono text-[9px] text-gray-400">
                      {block.id} · {block.domain}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium leading-tight text-white">
                      {block.body.length > 70 ? block.body.slice(0, 70) + "…" : block.body}
                    </p>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend — compact on mobile */}
      <div className="absolute right-2 top-2 flex flex-col gap-0.5 rounded-md bg-white/90 px-2 py-1.5 text-[9px] text-gray-500 shadow-sm backdrop-blur-sm sm:gap-1 sm:px-2.5 sm:py-2 sm:text-[10px]">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded bg-[#1a5f4a] sm:h-2.5 sm:w-4" />
          <span className="hidden sm:inline">Solid block</span>
          <span className="sm:hidden">Solid</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded border border-dashed border-[#5b21b6] sm:h-2.5 sm:w-4" />
          <span>Unverifiable</span>
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          <span className="inline-block h-2.5 w-4 rounded bg-[#991b1b]" style={{
            backgroundImage: "repeating-linear-gradient(30deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 3px)"
          }} />
          Cracked (violated)
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          <span className="inline-block h-0 w-4 border-t border-[#991b1b]" />
          Fracture line
        </span>
      </div>
    </div>
  );
}
