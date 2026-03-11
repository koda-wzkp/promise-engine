"use client";

import { useMemo, useState } from "react";
import { Promise as PromiseType, Agent } from "@/lib/types/promise";
import { buildPromiseGraph, layoutGraph, countDependents } from "@/lib/simulation/graph";
import { statusColors, agentColors } from "@/lib/utils/colors";
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
  width = 800,
  height = 600,
  cascadeResult,
  selectedPromise,
  onSelectPromise,
}: PromiseGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const graph = useMemo(() => {
    const raw = buildPromiseGraph(promises, agents);
    return layoutGraph(raw, width, height);
  }, [promises, agents, width, height]);

  const depCounts = useMemo(() => countDependents(promises), [promises]);

  // Build a set of affected promise IDs for highlighting
  const affectedIds = useMemo(() => {
    if (!cascadeResult) return new Set<string>();
    const ids = new Set(cascadeResult.affectedPromises.map((a) => a.promiseId));
    ids.add(cascadeResult.query.promiseId);
    return ids;
  }, [cascadeResult]);

  // Build a set of affected edges for highlighting
  const affectedEdges = useMemo(() => {
    if (!cascadeResult) return new Set<string>();
    const edges = new Set<string>();
    // The cascade source + all affected promises
    for (const a of cascadeResult.affectedPromises) {
      // Find which edge connects to this affected promise
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

  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ maxHeight: height }}
      >
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 7"
            refX="10"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" />
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
        </defs>

        {/* Edges */}
        {graph.edges
          .filter((e) => e.type === "depends_on")
          .map((edge) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return null;

            const edgeKey = `${edge.source}->${edge.target}`;
            const isAffected = affectedEdges.has(edgeKey);

            return (
              <line
                key={edgeKey}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isAffected ? "#eab308" : "#d1d5db"}
                strokeWidth={isAffected ? 2.5 : 1}
                markerEnd={isAffected ? "url(#arrow-active)" : "url(#arrow)"}
                className={isAffected ? "edge-flow" : ""}
                opacity={isAffected ? 1 : 0.5}
              />
            );
          })}

        {/* Agent-to-promise edges (light) */}
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
                opacity={0.3}
              />
            );
          })}

        {/* Nodes */}
        {graph.nodes.map((node) => {
          if (node.x == null || node.y == null) return null;

          const isPromise = node.type === "promise";
          const isSelected = node.id === selectedPromise;
          const isAffected = affectedIds.has(node.id);
          const isHovered = node.id === hoveredNode;

          if (isPromise) {
            const promise = promises.find((p) => p.id === node.id);
            if (!promise) return null;
            const baseRadius = 12;
            const depCount = depCounts.get(node.id) ?? 0;
            const radius = baseRadius + depCount * 3;
            const color = statusColors[promise.status];

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onClick={() => onSelectPromise?.(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius + (isSelected ? 4 : 0)}
                  fill="none"
                  stroke={isSelected ? "#eab308" : "transparent"}
                  strokeWidth={3}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={color}
                  opacity={isAffected ? 1 : 0.8}
                  className={isAffected ? "cascade-pulse" : ""}
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none fill-white text-[9px] font-mono font-bold"
                >
                  {node.label}
                </text>

                {/* Tooltip on hover */}
                {isHovered && (
                  <foreignObject
                    x={node.x + radius + 5}
                    y={node.y - 20}
                    width={200}
                    height={50}
                  >
                    <div className="rounded bg-gray-900 px-2 py-1 text-[10px] text-white shadow-lg">
                      <p className="font-medium">{promise.body}</p>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          } else {
            // Agent node
            const agent = agents.find((a) => a.id === node.id);
            const agentType = agent?.type ?? "stakeholder";
            const color = agentColors[agentType] ?? "#6b7280";

            return (
              <g key={node.id}>
                <rect
                  x={node.x - 16}
                  y={node.y - 10}
                  width={32}
                  height={20}
                  rx={4}
                  fill={color}
                  opacity={0.7}
                />
                <text
                  x={node.x}
                  y={node.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none fill-white text-[8px] font-mono font-bold"
                >
                  {node.label}
                </text>
              </g>
            );
          }
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex gap-3 rounded bg-white/80 px-2 py-1 text-[10px] text-gray-500 backdrop-blur-sm">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: statusColors.verified }} />
          Verified
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: statusColors.degraded }} />
          Degraded
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: statusColors.violated }} />
          Violated
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: statusColors.declared }} />
          Declared
        </span>
      </div>
    </div>
  );
}
