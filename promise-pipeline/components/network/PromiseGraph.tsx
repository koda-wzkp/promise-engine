"use client";

import { useMemo, useState, useCallback } from "react";
import { Promise as PromiseType, Agent, Threat } from "@/lib/types/promise";
import { buildPromiseGraph, layoutGraph } from "@/lib/simulation/graph";
import type { FiveFieldDiagnostic, HeuristicCPTEntry, ProbabilisticCascadeResult } from "@/lib/types/analysis";
import {
  precomputeNodeEncodings,
  precomputeEdgeEncodings,
} from "@/lib/utils/visual-encoding";
import { getStatusColor } from "@/lib/utils/colors";
import { GraphNodeComponent } from "./GraphNode";
import { GraphEdgeComponent } from "./GraphEdge";
import { EnrichedTooltip } from "./EnrichedTooltip";
import { CascadeRipple } from "./CascadeRipple";

interface PromiseGraphProps {
  promises: PromiseType[];
  agents: Agent[];
  threats?: Threat[];
  width?: number;
  height?: number;
  selectedPromiseId?: string | null;
  affectedIds?: Set<string>;
  certaintyAffectedIds?: Set<string>;
  onNodeClick?: (promiseId: string) => void;
  showAgentNodes?: boolean;
  /** Five-field diagnostic for visual encodings */
  diagnostic?: FiveFieldDiagnostic;
  /** Heuristic CPTs for edge thickness encoding */
  cpts?: Record<string, HeuristicCPTEntry>;
  /** Probabilistic cascade result for probability badges */
  probabilistic?: ProbabilisticCascadeResult;
  /** Whether cascade ripple animation is active */
  cascadeActive?: boolean;
  /** Source promise ID for cascade ripple */
  cascadeSourceId?: string;
}

export function PromiseGraphView({
  promises,
  agents,
  threats = [],
  width = 800,
  height = 600,
  selectedPromiseId,
  affectedIds = new Set(),
  certaintyAffectedIds = new Set(),
  onNodeClick,
  showAgentNodes = true,
  diagnostic,
  cpts,
  probabilistic,
  cascadeActive = false,
  cascadeSourceId,
}: PromiseGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [legendExpanded, setLegendExpanded] = useState(false);

  const graph = useMemo(() => {
    const raw = buildPromiseGraph(promises, agents, threats);
    return layoutGraph(raw, width, height);
  }, [promises, agents, threats, width, height]);

  const nodeMap = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id, n])),
    [graph.nodes]
  );

  const promiseMap = useMemo(
    () => new Map(promises.map((p) => [p.id, p])),
    [promises]
  );

  const agentMap = useMemo(
    () => new Map(agents.map((a) => [a.id, a])),
    [agents]
  );

  // Precompute visual encodings from diagnostic
  const nodeEncodings = useMemo(() => {
    if (!diagnostic) return {};
    return precomputeNodeEncodings(promises, diagnostic, getStatusColor);
  }, [promises, diagnostic]);

  const edgeEncodings = useMemo(() => {
    if (!diagnostic || !cpts) return {};
    return precomputeEdgeEncodings(promises, diagnostic, cpts);
  }, [promises, diagnostic, cpts]);

  // Build reverse dependency map for tooltip
  const reverseDeps = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const p of promises) {
      for (const depId of p.depends_on) {
        if (!map.has(depId)) map.set(depId, []);
        map.get(depId)!.push(p.id);
      }
    }
    return map;
  }, [promises]);

  const handleNodeClick = useCallback(
    (id: string) => {
      const node = nodeMap.get(id);
      if (node?.type === "promise" && onNodeClick) {
        onNodeClick(id);
      }
    },
    [nodeMap, onNodeClick]
  );

  const filteredNodes = showAgentNodes
    ? graph.nodes
    : graph.nodes.filter((n) => n.type === "promise");

  const filteredEdges = showAgentNodes
    ? graph.edges
    : graph.edges.filter(
        (e) => e.type === "depends_on" || e.type === "threat" || e.type === "verification_dependency"
      );

  // Epidemiology metrics for Rₑ indicator
  const Re = diagnostic?.epidemiology.Re ?? null;
  const cascadeProne = diagnostic?.epidemiology.cascadeProne ?? false;

  // Information deficit for watermark
  const unobservablePercent = diagnostic?.information.unobservablePercent ?? null;

  // Cascade source node position for ripple
  const cascadeSourceNode = cascadeSourceId ? nodeMap.get(cascadeSourceId) : null;
  const cascadeMaxDepth = probabilistic
    ? Math.max(1, ...probabilistic.affectedPromises.map((a) => a.cascadeDepth))
    : 1;

  // Hovered node data for enriched tooltip
  const hoveredNodeData = hoveredNode ? nodeMap.get(hoveredNode) : null;
  const hoveredPromise = hoveredNode ? promiseMap.get(hoveredNode) : null;
  const hoveredEncoding = hoveredNode ? nodeEncodings[hoveredNode] : null;

  return (
    <div className="relative" style={{ maxHeight: height }}>
      {/* Rₑ Indicator — persistent top-left */}
      {Re !== null && (
        <div
          className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/90 backdrop-blur-sm border border-gray-200 text-xs font-mono"
          role="status"
          aria-live="polite"
        >
          <span className="text-gray-700">
            R<sub>e</sub> = {Re.toFixed(2)}
          </span>
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{
              backgroundColor: Re < 0.8 ? "#1a5f4a" : Re < 1.0 ? "#78350f" : "#991b1b",
            }}
          />
          <span className="text-gray-500">
            {cascadeProne ? "Cascade-Prone" : Re < 0.8 ? "Contained" : "Near Threshold"}
          </span>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        style={{ maxHeight: height }}
      >
        <defs>
          <marker
            id="arrowhead-dep"
            viewBox="0 0 10 7"
            refX="9"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
          <marker
            id="arrowhead-threat"
            viewBox="0 0 10 7"
            refX="9"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#b91c1c" />
          </marker>
          <marker
            id="arrowhead-active"
            viewBox="0 0 10 7"
            refX="9"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
          </marker>
          <marker
            id="arrowhead-verification"
            viewBox="0 0 10 7"
            refX="9"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#7c3aed" />
          </marker>
          <marker
            id="arrowhead-agent"
            viewBox="0 0 10 7"
            refX="9"
            refY="3.5"
            markerWidth="6"
            markerHeight="5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#d1d5db" />
          </marker>
        </defs>

        {/* Information deficit watermark */}
        {unobservablePercent !== null && unobservablePercent > 0 && (
          <text
            x={width - 16}
            y={height - 16}
            textAnchor="end"
            className="font-mono"
            style={{
              fontSize: "14px",
              fill: "#1a1a2e",
              opacity: 0.1,
              userSelect: "none",
            }}
            aria-hidden="true"
          >
            {Math.round(unobservablePercent)}% UNOBSERVABLE
          </text>
        )}

        {/* Cascade ripple animation */}
        {cascadeActive && cascadeSourceNode && (
          <CascadeRipple
            sourceX={cascadeSourceNode.x || 0}
            sourceY={cascadeSourceNode.y || 0}
            maxDepth={cascadeMaxDepth}
            active={cascadeActive}
          />
        )}

        {/* Edges */}
        {filteredEdges.map((edge, i) => {
          const sourceNode = nodeMap.get(edge.source);
          const targetNode = nodeMap.get(edge.target);
          if (!sourceNode || !targetNode) return null;

          const isActive =
            affectedIds.has(edge.source) || affectedIds.has(edge.target);

          // Look up edge encoding for dependency edges
          const edgeKey = `${edge.source}->${edge.target}`;
          const encoding = edge.type === "depends_on" ? edgeEncodings[edgeKey] : undefined;

          return (
            <GraphEdgeComponent
              key={`${edge.source}-${edge.target}-${i}`}
              edge={edge}
              sourceNode={sourceNode}
              targetNode={targetNode}
              isActive={isActive}
              encoding={encoding}
            />
          );
        })}

        {/* Nodes */}
        {filteredNodes.map((node) => {
          const encoding = nodeEncodings[node.id];
          const baseSize = 12;
          const size = encoding ? encoding.radius : baseSize;

          // Build probability badge during active cascade
          let cascadeProbBadge: { percent: number; status: string } | null = null;
          if (probabilistic && affectedIds.has(node.id)) {
            const probEntry = probabilistic.affectedPromises.find(
              (pe) => pe.promiseId === node.id
            );
            if (probEntry) {
              cascadeProbBadge = {
                percent: Math.round(probEntry.confidence * 100),
                status: probEntry.mostLikelyNewStatus,
              };
            }
          }

          return (
            <GraphNodeComponent
              key={node.id}
              node={node}
              size={size}
              isSelected={selectedPromiseId === node.id}
              isAffected={affectedIds.has(node.id)}
              isCertaintyAffected={certaintyAffectedIds.has(node.id)}
              onClick={handleNodeClick}
              encoding={encoding}
              cascadeProbBadge={cascadeProbBadge}
              onHover={setHoveredNode}
            />
          );
        })}

        {/* Legend — collapsible */}
        <g transform={`translate(10, ${height - (legendExpanded ? 210 : 30)})`}>
          <g
            onClick={() => setLegendExpanded(!legendExpanded)}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={legendExpanded ? "Collapse legend" : "Expand legend"}
            aria-expanded={legendExpanded}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setLegendExpanded(!legendExpanded);
              }
            }}
          >
            <text className="text-[10px] fill-gray-500 font-medium" y={0}>
              Legend {legendExpanded ? "▾" : "▸"}
            </text>
          </g>

          {legendExpanded && (
            <g transform="translate(0, 14)">
              {/* Edge types */}
              <text className="text-[9px] fill-gray-400 font-medium" y={0}>
                Edges
              </text>
              <line x1={0} y1={10} x2={20} y2={10} stroke="#6b7280" strokeWidth={1.5} />
              <text className="text-[9px] fill-gray-500" x={24} y={13}>
                Dependency
              </text>
              <line x1={0} y1={24} x2={20} y2={24} stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="6,3" />
              <text className="text-[9px] fill-gray-500" x={24} y={27}>
                Verification Dep.
              </text>
              <line x1={0} y1={38} x2={20} y2={38} stroke="#b91c1c" strokeWidth={1.5} strokeDasharray="4,3" />
              <text className="text-[9px] fill-gray-500" x={24} y={41}>
                Threat
              </text>

              {/* Visual encodings */}
              <text className="text-[9px] fill-gray-400 font-medium" y={60}>
                Visual Encodings
              </text>
              <circle cx={5} cy={72} r={4} fill="#1a5f4a" opacity={0.85} />
              <circle cx={16} cy={72} r={6} fill="#1a5f4a" opacity={0.85} />
              <text className="text-[9px] fill-gray-500" x={26} y={75}>
                Node Size = Downstream impact (FMEA severity)
              </text>

              <circle cx={5} cy={88} r={5} fill="#1a5f4a" opacity={1} />
              <circle cx={18} cy={88} r={5} fill="#1a5f4a" opacity={0.35} />
              <text className="text-[9px] fill-gray-500" x={26} y={91}>
                Saturation = Verification quality (channel capacity)
              </text>

              <circle cx={8} cy={104} r={5} fill="#991b1b" opacity={0.85} />
              <text className="text-[9px] fill-gray-500" x={18} y={107}>
                Pulse = Risk level (RPN) [Static border on reduced motion]
              </text>

              {/* Edge encodings */}
              <line x1={0} y1={118} x2={20} y2={118} stroke="#6b7280" strokeWidth={3} />
              <line x1={0} y1={127} x2={20} y2={127} stroke="#6b7280" strokeWidth={1} />
              <text className="text-[9px] fill-gray-500" x={24} y={124}>
                Edge Thickness = Cascade probability
              </text>

              <line x1={0} y1={140} x2={20} y2={140} stroke="#6b7280" strokeWidth={1.5} />
              <text className="text-[9px] fill-gray-500" x={24} y={143}>
                ——— Independent verification
              </text>

              <line x1={0} y1={154} x2={20} y2={154} stroke="#6b7280" strokeWidth={1.5} strokeDasharray="8,4" />
              <text className="text-[9px] fill-gray-500" x={24} y={157}>
                – – – Partial oversight
              </text>

              <line x1={0} y1={168} x2={20} y2={168} stroke="#6b7280" strokeWidth={1.5} strokeDasharray="3,3" />
              <text className="text-[9px] fill-gray-500" x={24} y={171}>
                · · · · No incentive-compatible verification
              </text>
            </g>
          )}
        </g>
      </svg>

      {/* Enriched tooltip — HTML overlay */}
      {hoveredNodeData && hoveredNodeData.type === "promise" && hoveredEncoding && hoveredPromise && (
        <EnrichedTooltip
          node={hoveredNodeData}
          encoding={hoveredEncoding}
          x={(hoveredNodeData.x || 0) * (1)} // Scale will be handled by container
          y={(hoveredNodeData.y || 0) * (1)}
          promiseBody={hoveredPromise.body}
          promiser={agentMap.get(hoveredPromise.promiser)?.name ?? hoveredPromise.promiser}
          promisee={agentMap.get(hoveredPromise.promisee)?.name ?? hoveredPromise.promisee}
          dependencies={hoveredPromise.depends_on}
          dependents={reverseDeps.get(hoveredNode!) ?? []}
        />
      )}
    </div>
  );
}
