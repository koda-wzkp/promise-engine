"use client";

import { MarsPromise, marsDomainColors } from "../../../lib/types/mars-game";
import { computeStatus } from "../../../lib/games/mars-engine";

interface MarsPromiseGraphProps {
  promises: MarsPromise[];
  cascadeIds?: string[];
}

// Node positions in a 400x300 SVG viewport
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  P3: { x: 60, y: 150 },   // Water — central upstream
  P1: { x: 160, y: 90 },   // Life support — high priority
  P8: { x: 160, y: 210 },  // Comms — lower tier
  P4: { x: 260, y: 210 },  // Mining — dependent on water
  P2: { x: 260, y: 45 },   // Housing — dependent on life support
  P6: { x: 260, y: 135 },  // School — dependent on life support
  P7: { x: 60, y: 255 },   // Radiation — standalone
  P5: { x: 360, y: 150 },  // Return — computed from P4+P8
};

const STATUS_NODE_COLORS: Record<string, string> = {
  verified: "#00ff88",
  declared: "#60a5fa",
  degraded: "#f59e0b",
  violated: "#ef4444",
  unverifiable: "#a78bfa",
};

// Edges: [source, target]
const EDGES: [string, string][] = [
  ["P3", "P1"],
  ["P1", "P2"],
  ["P1", "P6"],
  ["P3", "P4"],
  ["P4", "P5"],
  ["P8", "P5"],
];

const HEX_POINTS = (cx: number, cy: number, r: number): string => {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(" ");
};

export default function MarsPromiseGraph({
  promises,
  cascadeIds = [],
}: MarsPromiseGraphProps) {
  const getStatus = (id: string) => {
    const p = promises.find((pr) => pr.id === id);
    return p ? computeStatus(p) : "declared";
  };

  return (
    <div className="rounded border border-[#2d3748] bg-[#111827] p-2">
      <div className="font-mono text-[10px] uppercase tracking-wider text-[#9ca3af] mb-2 px-1">
        Promise Network
      </div>
      <svg
        viewBox="0 0 420 280"
        className="w-full h-auto"
        role="img"
        aria-label="Mars colony promise dependency graph showing 8 promises as hexagonal habitat modules connected by tunnel edges"
      >
        {/* Edges */}
        {EDGES.map(([src, tgt]) => {
          const s = NODE_POSITIONS[src];
          const t = NODE_POSITIONS[tgt];
          if (!s || !t) return null;
          const isCascade = cascadeIds.includes(src) && cascadeIds.includes(tgt);
          return (
            <line
              key={`${src}-${tgt}`}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke={isCascade ? "#ef4444" : "#2d3748"}
              strokeWidth={isCascade ? 2 : 1.5}
              strokeDasharray={isCascade ? "4 2" : undefined}
              className={isCascade ? "animate-pulse" : undefined}
            />
          );
        })}

        {/* Nodes */}
        {promises.map((promise) => {
          const pos = NODE_POSITIONS[promise.id];
          if (!pos) return null;
          const status = getStatus(promise.id);
          const color =
            STATUS_NODE_COLORS[status] ?? "#60a5fa";
          const domainColor = marsDomainColors[promise.domain] ?? "#64748b";
          const isCascaded = cascadeIds.includes(promise.id);
          const R = 22;

          return (
            <g key={promise.id}>
              {/* Hex fill */}
              <polygon
                points={HEX_POINTS(pos.x, pos.y, R)}
                fill={`${color}18`}
                stroke={isCascaded ? "#ef4444" : domainColor}
                strokeWidth={isCascaded ? 2 : 1}
                className={isCascaded ? "animate-pulse" : undefined}
              />
              {/* Inner hex */}
              <polygon
                points={HEX_POINTS(pos.x, pos.y, R - 4)}
                fill={`${color}10`}
                stroke={color}
                strokeWidth={0.5}
              />
              {/* ID */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={color}
                fontSize={9}
                fontFamily="IBM Plex Mono, monospace"
                fontWeight="bold"
              >
                {promise.id}
              </text>
              {/* Status dot */}
              <circle
                cx={pos.x + R - 5}
                cy={pos.y - R + 5}
                r={4}
                fill={color}
              />
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(8, 260)">
          {[
            { color: "#00ff88", label: "Verified" },
            { color: "#60a5fa", label: "Declared" },
            { color: "#f59e0b", label: "Degraded" },
            { color: "#ef4444", label: "Violated" },
            { color: "#a78bfa", label: "Unverifiable" },
          ].map((item, i) => (
            <g key={item.label} transform={`translate(${i * 78}, 0)`}>
              <circle cx={5} cy={0} r={3} fill={item.color} />
              <text
                x={11}
                y={0}
                dominantBaseline="central"
                fill="#9ca3af"
                fontSize={7}
                fontFamily="IBM Plex Mono, monospace"
              >
                {item.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
