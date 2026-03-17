"use client";

import { getStatusColor, rpnColors } from "@/lib/utils/colors";
import type { NodeVisualEncoding } from "@/lib/utils/visual-encoding";
import type { GraphNode } from "@/lib/types/simulation";

interface EnrichedTooltipProps {
  node: GraphNode;
  encoding: NodeVisualEncoding;
  /** Positioned relative to SVG coordinate space */
  x: number;
  y: number;
  /** Promise body text */
  promiseBody?: string;
  /** Promiser and promisee labels */
  promiser?: string;
  promisee?: string;
  /** Upstream and downstream dependency IDs */
  dependencies?: string[];
  dependents?: string[];
}

/**
 * Rich tooltip popover showing five-field metrics data for a hovered node.
 * Rendered as an HTML overlay positioned over the SVG graph.
 */
export function EnrichedTooltip({
  node,
  encoding,
  x,
  y,
  promiseBody,
  promiser,
  promisee,
  dependencies = [],
  dependents = [],
}: EnrichedTooltipProps) {
  const statusColor = node.status ? getStatusColor(node.status) : "#6b7280";
  const rpnColor = rpnColors[encoding.rpnPriority];

  return (
    <div
      role="tooltip"
      className="absolute z-50 pointer-events-none"
      style={{
        left: x,
        top: y - 10,
        transform: "translate(-50%, -100%)",
        maxWidth: 320,
      }}
    >
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 text-xs leading-relaxed">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
          <span className="font-mono font-bold text-gray-900">{node.id}</span>
          <span
            className="px-1.5 py-0.5 rounded text-white text-[10px] font-medium"
            style={{ backgroundColor: statusColor }}
          >
            {node.status}
          </span>
        </div>

        {/* Promise body */}
        {promiseBody && (
          <p className="text-gray-700 mb-2 line-clamp-2">{promiseBody}</p>
        )}

        {/* Agent info */}
        {promiser && promisee && (
          <p className="text-gray-500 mb-2">
            {promiser} → {promisee}
          </p>
        )}

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
          <div>
            <span className="text-gray-400">RPN:</span>{" "}
            <span className="font-mono font-bold" style={{ color: rpnColor }}>
              {encoding.rpn}
            </span>{" "}
            <span className="text-gray-400 uppercase text-[9px]">
              ({encoding.rpnPriority})
            </span>
          </div>
          <div>
            <span className="text-gray-400">Severity:</span>{" "}
            <span className="font-mono">{encoding.severity}</span>
          </div>
          <div>
            <span className="text-gray-400">Channel:</span>{" "}
            <span className="font-mono">{encoding.channelCapacity.toFixed(1)} bits</span>
          </div>
          <div>
            <span className="text-gray-400">Agency Cost:</span>{" "}
            <span className="font-mono">{encoding.agencyCost.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-400">Moral Hazard:</span>{" "}
            <span className="font-mono">{encoding.moralHazard.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-400">Superspreader:</span>{" "}
            <span className="font-mono">{encoding.superspreaderScore.toFixed(1)}</span>
          </div>
        </div>

        {/* Cascade risk */}
        <div className="text-gray-500 mb-1">
          Cascade Risk: {encoding.directDependents} direct dependent
          {encoding.directDependents !== 1 ? "s" : ""} across{" "}
          {encoding.domainsSpanned} domain
          {encoding.domainsSpanned !== 1 ? "s" : ""}
        </div>

        {/* Dependencies */}
        {dependencies.length > 0 && (
          <div className="text-gray-400">
            Dependencies ← {dependencies.join(", ")}
          </div>
        )}
        {dependents.length > 0 && (
          <div className="text-gray-400">
            Dependents → {dependents.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}
