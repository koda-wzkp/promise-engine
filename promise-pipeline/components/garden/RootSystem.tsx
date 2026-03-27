"use client";

/**
 * RootSystem — Sub-promise visualization rendered as roots beneath a plant.
 *
 * Each sub-promise is a root tendril. Root health (color) reflects sub-promise
 * status: green = verified, amber = declared/degraded, grey = violated.
 * Root connections show dependencies between sub-promises.
 */

import { useMemo } from "react";
import type { GardenPromise } from "@/lib/types/garden-phase2";
import type { PromiseStatus } from "@/lib/types/promise";

interface RootSystemProps {
  parent: GardenPromise;
  subPromises: GardenPromise[];
  /** 0–1 opacity based on zoom level */
  opacity: number;
  /** Called when a root (sub-promise) is tapped */
  onRootClick?: (promiseId: string) => void;
}

const ROOT_COLORS: Record<PromiseStatus, string> = {
  verified: "#2d6a4f",
  declared: "#606c38",
  degraded: "#bc6c25",
  violated: "#6c757d",
  unverifiable: "#adb5bd",
};

interface RootLayout {
  id: string;
  x: number;
  y: number;
  status: PromiseStatus;
  body: string;
  dependsOn: string[];
}

function layoutRoots(children: GardenPromise[], width: number): RootLayout[] {
  const count = children.length;
  if (count === 0) return [];

  const spacing = width / (count + 1);

  return children.map((child, i) => ({
    id: child.id,
    x: spacing * (i + 1),
    y: 30 + (i % 2 === 0 ? 0 : 15), // staggered depth
    status: child.status,
    body: child.body,
    dependsOn: child.depends_on,
  }));
}

export function RootSystem({ parent, subPromises, opacity, onRootClick }: RootSystemProps) {
  const width = 320;
  const height = 100;

  const roots = useMemo(() => layoutRoots(subPromises, width), [subPromises, width]);

  // Build a map for dependency edges between sub-promises
  const childIds = new Set(subPromises.map((c) => c.id));
  const rootById = new Map(roots.map((r) => [r.id, r]));

  if (opacity <= 0 || subPromises.length === 0) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto"
      style={{ opacity, transition: "opacity 0.3s ease" }}
      role="img"
      aria-label={`Root system for "${parent.body}" with ${subPromises.length} sub-promise${subPromises.length !== 1 ? "s" : ""}`}
    >
      {/* Root connection line from plant base to each root */}
      {roots.map((root) => (
        <line
          key={`stem-${root.id}`}
          x1={width / 2}
          y1={0}
          x2={root.x}
          y2={root.y}
          stroke={ROOT_COLORS[root.status]}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.6}
        />
      ))}

      {/* Dependency edges between sub-promises */}
      {roots.map((root) =>
        root.dependsOn
          .filter((depId) => childIds.has(depId))
          .map((depId) => {
            const dep = rootById.get(depId);
            if (!dep) return null;
            return (
              <line
                key={`dep-${root.id}-${depId}`}
                x1={root.x}
                y1={root.y}
                x2={dep.x}
                y2={dep.y}
                stroke="#8d99ae"
                strokeWidth={1}
                strokeDasharray="4 2"
                opacity={0.4}
              />
            );
          })
      )}

      {/* Root nodes */}
      {roots.map((root) => (
        <g
          key={root.id}
          onClick={() => onRootClick?.(root.id)}
          style={{ cursor: onRootClick ? "pointer" : "default" }}
          role="button"
          tabIndex={0}
          aria-label={`Sub-promise: ${root.body}. Status: ${root.status}`}
        >
          {/* Root bulb */}
          <circle
            cx={root.x}
            cy={root.y}
            r={8}
            fill={ROOT_COLORS[root.status]}
            stroke="#fff"
            strokeWidth={1}
            opacity={0.85}
          />
          {/* Status indicator */}
          <circle
            cx={root.x}
            cy={root.y}
            r={3}
            fill={root.status === "verified" ? "#95d5b2" : root.status === "violated" ? "#e5e5e5" : "#dda15e"}
          />
          {/* Label */}
          <text
            x={root.x}
            y={root.y + 20}
            textAnchor="middle"
            fontSize={8}
            fill="#4a5568"
            opacity={0.8}
          >
            {root.body.length > 20 ? root.body.slice(0, 18) + "..." : root.body}
          </text>
        </g>
      ))}
    </svg>
  );
}
