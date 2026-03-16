"use client";

import { GraphEdge as GraphEdgeType, GraphNode } from "@/lib/types/simulation";
import type { EdgeVisualEncoding } from "@/lib/utils/visual-encoding";

interface GraphEdgeProps {
  edge: GraphEdgeType;
  sourceNode: GraphNode;
  targetNode: GraphNode;
  isActive: boolean;
  encoding?: EdgeVisualEncoding;
}

export function GraphEdgeComponent({
  edge,
  sourceNode,
  targetNode,
  isActive,
  encoding,
}: GraphEdgeProps) {
  const sx = sourceNode.x || 0;
  const sy = sourceNode.y || 0;
  const tx = targetNode.x || 0;
  const ty = targetNode.y || 0;

  const isThreat = edge.type === "threat";
  const isDependency = edge.type === "depends_on";
  const isVerificationDep = edge.type === "verification_dependency";
  const isAgentEdge = edge.type === "promiser" || edge.type === "promisee";

  // Base color from edge type
  const color = isThreat
    ? "#b91c1c"
    : isVerificationDep
    ? "#7c3aed"
    : isActive
    ? "#f59e0b"
    : isDependency
    ? "#6b7280"
    : "#d1d5db";

  // Apply encoding for dependency edges, fallback for others
  let strokeWidth: number;
  let dashArray: string;
  let opacity: number;

  if (isDependency && encoding) {
    strokeWidth = encoding.thickness;
    dashArray = encoding.dashArray;
    opacity = isActive ? 1 : encoding.opacity;
  } else {
    strokeWidth = isThreat ? 1.5 : isVerificationDep ? 1.5 : isDependency ? 1.5 : 0.75;
    dashArray = isThreat ? "4,3" : isVerificationDep ? "6,3" : "none";
    opacity = isAgentEdge ? 0.3 : isActive ? 1 : 0.6;
  }

  // Calculate arrow position (slightly before target)
  const dx = tx - sx;
  const dy = ty - sy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const offsetDist = isDependency || isThreat ? 18 : 14;
  const arrowX = tx - (dx / len) * offsetDist;
  const arrowY = ty - (dy / len) * offsetDist;

  const markerId = isThreat
    ? "arrowhead-threat"
    : isVerificationDep
    ? "arrowhead-verification"
    : isActive
    ? "arrowhead-active"
    : isDependency
    ? "arrowhead-dep"
    : "arrowhead-agent";

  return (
    <line
      x1={sx}
      y1={sy}
      x2={arrowX}
      y2={arrowY}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={dashArray}
      opacity={opacity}
      markerEnd={isDependency || isThreat || isVerificationDep ? `url(#${markerId})` : undefined}
      className={isActive ? "cascade-pulse" : ""}
    />
  );
}
