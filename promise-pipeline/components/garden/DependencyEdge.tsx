"use client";

/**
 * DependencyEdge — Underground connection rendering between plants.
 *
 * At normal zoom: subtle lines between plant bases.
 * At sub-promise zoom: full root network visible.
 * When a dependency source degrades: the connection pulses.
 */

import type { GardenPromise } from "@/lib/types/garden-phase2";
import type { PromiseStatus } from "@/lib/types/promise";

interface DependencyEdgeProps {
  /** The promise that has the dependency (A depends on B) */
  from: GardenPromise;
  /** The dependency source (B) */
  to: GardenPromise;
  /** Position of 'from' plant base */
  fromPos: { x: number; y: number };
  /** Position of 'to' plant base */
  toPos: { x: number; y: number };
  /** Current zoom level opacity (higher = more detail) */
  detailOpacity: number;
}

function getEdgeColor(sourceStatus: PromiseStatus): string {
  switch (sourceStatus) {
    case "verified":
      return "#2d6a4f";
    case "declared":
      return "#606c38";
    case "degraded":
      return "#bc6c25";
    case "violated":
      return "#e63946";
    default:
      return "#8d99ae";
  }
}

function shouldPulse(sourceStatus: PromiseStatus): boolean {
  return sourceStatus === "degraded" || sourceStatus === "violated";
}

export function DependencyEdge({
  from,
  to,
  fromPos,
  toPos,
  detailOpacity,
}: DependencyEdgeProps) {
  const color = getEdgeColor(to.status);
  const pulse = shouldPulse(to.status);
  const midY = Math.max(fromPos.y, toPos.y) + 20;

  // Curved path through underground
  const d = `M ${fromPos.x} ${fromPos.y} Q ${(fromPos.x + toPos.x) / 2} ${midY}, ${toPos.x} ${toPos.y}`;

  return (
    <g
      role="img"
      aria-label={`${from.body} depends on ${to.body} (${to.status})`}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={pulse ? 2.5 : 1.5}
        strokeLinecap="round"
        opacity={Math.max(0.2, detailOpacity * 0.6)}
        style={{
          transition: "opacity 0.3s ease, stroke-width 0.3s ease",
        }}
        className={pulse ? "animate-pulse" : ""}
      />

      {/* Arrow indicator at dependency target */}
      <circle
        cx={toPos.x}
        cy={toPos.y}
        r={3}
        fill={color}
        opacity={detailOpacity * 0.8}
      />

      {/* Detailed label at higher zoom */}
      {detailOpacity > 0.5 && (
        <text
          x={(fromPos.x + toPos.x) / 2}
          y={midY + 12}
          textAnchor="middle"
          fontSize={9}
          fill="#6c757d"
          opacity={detailOpacity * 0.6}
        >
          depends on
        </text>
      )}
    </g>
  );
}
