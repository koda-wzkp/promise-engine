"use client";

import { GraphNode as GraphNodeType } from "@/lib/types/simulation";
import { getStatusColor, agentColors, rpnColors } from "@/lib/utils/colors";
import type { NodeVisualEncoding } from "@/lib/utils/visual-encoding";

interface GraphNodeProps {
  node: GraphNodeType;
  size: number;
  isSelected: boolean;
  isAffected: boolean;
  isCertaintyAffected?: boolean;
  onClick: (id: string) => void;
  encoding?: NodeVisualEncoding;
  /** Probability badge shown during cascade simulation */
  cascadeProbBadge?: { percent: number; status: string } | null;
  onHover?: (id: string | null) => void;
}

export function GraphNodeComponent({
  node,
  size,
  isSelected,
  isAffected,
  isCertaintyAffected = false,
  onClick,
  encoding,
  cascadeProbBadge,
  onHover,
}: GraphNodeProps) {
  const x = node.x || 0;
  const y = node.y || 0;

  if (node.type === "agent") {
    const color = agentColors[node.label.toLowerCase()] || "#6b7280";
    return (
      <g>
        <rect
          x={x - 20}
          y={y - 12}
          width={40}
          height={24}
          rx={4}
          fill="white"
          stroke={color}
          strokeWidth={1.5}
          className="cursor-default"
        />
        <text
          x={x}
          y={y + 4}
          textAnchor="middle"
          className="text-[9px] font-mono fill-gray-600 pointer-events-none"
        >
          {node.label.length > 6 ? node.id : node.label}
        </text>
      </g>
    );
  }

  const color = node.status ? getStatusColor(node.status) : "#6b7280";

  // Use encoding-based radius if available, else fallback
  const radius = encoding ? encoding.radius : Math.max(12, size);

  // Saturation filter from channel capacity
  const saturation = encoding ? encoding.saturation : 100;

  // Pulse animation parameters
  const pulse = encoding?.pulse ?? { period: 0, amplitude: 0 };
  const hasPulse = pulse.period > 0;

  // Glow for superspreaders
  const glowFilter = encoding?.glowFilter ?? null;

  // RPN priority border for prefers-reduced-motion
  const rpnPriority = encoding?.rpnPriority ?? "low";
  const rpnBorderColor = rpnColors[rpnPriority];
  const showRpnBorder = rpnPriority === "critical" || rpnPriority === "high";

  return (
    <g
      onClick={() => onClick(node.id)}
      onMouseEnter={() => onHover?.(node.id)}
      onMouseLeave={() => onHover?.(null)}
      className="cursor-pointer"
      role="button"
      aria-label={`Promise ${node.id}: ${node.label}${encoding ? `. RPN ${encoding.rpn} ${rpnPriority}. ${encoding.directDependents} dependents.` : ""}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(node.id);
        }
      }}
      onFocus={() => onHover?.(node.id)}
      onBlur={() => onHover?.(null)}
      style={{
        filter: [
          glowFilter,
          saturation < 100 ? `saturate(${saturation}%)` : null,
        ]
          .filter(Boolean)
          .join(" ") || undefined,
      }}
    >
      {/* Selection / certainty ring */}
      <circle
        cx={x}
        cy={y}
        r={radius + 4}
        fill="transparent"
        stroke={isSelected ? "#2563eb" : isCertaintyAffected ? "#7c3aed" : "transparent"}
        strokeWidth={2}
        strokeDasharray={isCertaintyAffected && !isSelected ? "4,3" : "none"}
      />

      {/* RPN priority static border (prefers-reduced-motion fallback) */}
      {showRpnBorder && (
        <circle
          cx={x}
          cy={y}
          r={radius + 2}
          fill="transparent"
          stroke={rpnBorderColor}
          strokeWidth={2}
          className="motion-safe:hidden"
        />
      )}

      {/* Main node circle — with pulse animation for high RPN */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={color}
        opacity={isAffected ? 1 : 0.85}
        className={isAffected ? "cascade-pulse" : ""}
      >
        {hasPulse && (
          <animate
            attributeName="r"
            values={`${radius};${radius + pulse.amplitude};${radius}`}
            dur={`${pulse.period}ms`}
            repeatCount="indefinite"
            className="motion-reduce:hidden"
          />
        )}
      </circle>

      {/* Node label */}
      <text
        x={x}
        y={y + 3}
        textAnchor="middle"
        className="text-[10px] font-mono fill-white pointer-events-none font-bold"
      >
        {node.id}
      </text>

      {/* Cascade probability badge during simulation */}
      {cascadeProbBadge && (
        <g>
          <rect
            x={x + radius - 2}
            y={y - radius - 8}
            width={32}
            height={16}
            rx={3}
            fill="white"
            stroke={getStatusColor(cascadeProbBadge.status)}
            strokeWidth={1}
          />
          <text
            x={x + radius + 14}
            y={y - radius + 3}
            textAnchor="middle"
            className="text-[8px] font-mono font-bold pointer-events-none"
            fill={getStatusColor(cascadeProbBadge.status)}
          >
            {cascadeProbBadge.percent}%
          </text>
        </g>
      )}

      {/* Tooltip (basic, for non-hover-capable devices) */}
      <title>
        {node.id}: {node.label}
        {node.status ? ` (${node.status})` : ""}
        {encoding ? `\nRPN: ${encoding.rpn} (${rpnPriority})` : ""}
        {encoding ? `\nChannel: ${encoding.channelCapacity.toFixed(1)} bits` : ""}
        {encoding ? `\nDependents: ${encoding.directDependents}` : ""}
      </title>
    </g>
  );
}
