"use client";

import { RuntimePromise, DependencyEdge, ScenarioTheme } from "../../../lib/games/types";
import { computeStatus } from "../../../lib/games/engine";

interface PromiseGraphProps {
  promises: RuntimePromise[];
  dependencies: DependencyEdge[];
  theme: ScenarioTheme;
}

const NODE_W = 80;
const NODE_H = 36;
const H_GAP = 110;
const V_GAP = 60;

function layoutNodes(
  promises: RuntimePromise[],
  deps: DependencyEdge[]
): Map<string, { x: number; y: number }> {
  // topological sort by column
  const inDegree = new Map<string, number>(promises.map((p) => [p.id, 0]));
  const children = new Map<string, string[]>(promises.map((p) => [p.id, []]));

  for (const d of deps) {
    inDegree.set(d.downstream, (inDegree.get(d.downstream) ?? 0) + 1);
    children.get(d.upstream)?.push(d.downstream);
  }

  const columns: string[][] = [];
  let queue = promises.filter((p) => (inDegree.get(p.id) ?? 0) === 0).map((p) => p.id);
  const visited = new Set<string>();

  while (queue.length) {
    columns.push(queue);
    queue.forEach((id) => visited.add(id));
    const next: string[] = [];
    for (const id of queue) {
      for (const child of children.get(id) ?? []) {
        if (!visited.has(child)) next.push(child);
      }
    }
    queue = [...new Set(next)];
  }

  // add any disconnected
  const remaining = promises.filter((p) => !visited.has(p.id));
  if (remaining.length) columns.push(remaining.map((p) => p.id));

  const positions = new Map<string, { x: number; y: number }>();
  columns.forEach((col, ci) => {
    col.forEach((id, ri) => {
      const totalH = col.length * NODE_H + (col.length - 1) * (V_GAP - NODE_H);
      const startY = -totalH / 2;
      positions.set(id, {
        x: ci * H_GAP + NODE_W / 2,
        y: startY + ri * V_GAP + NODE_H / 2,
      });
    });
  });
  return positions;
}

export default function PromiseGraph({ promises, dependencies, theme }: PromiseGraphProps) {
  const positions = layoutNodes(promises, dependencies);

  const allX = [...positions.values()].map((p) => p.x);
  const allY = [...positions.values()].map((p) => p.y);
  const minX = Math.min(...allX) - NODE_W / 2 - 10;
  const maxX = Math.max(...allX) + NODE_W / 2 + 10;
  const minY = Math.min(...allY) - NODE_H / 2 - 10;
  const maxY = Math.max(...allY) + NODE_H / 2 + 10;
  const svgW = maxX - minX;
  const svgH = maxY - minY;

  return (
    <div
      className="rounded border overflow-x-auto"
      style={{ borderColor: theme.border, backgroundColor: theme.bgCard }}
      role="img"
      aria-label="Promise dependency graph"
    >
      <svg
        viewBox={`${minX} ${minY} ${svgW} ${svgH}`}
        width="100%"
        style={{ minWidth: `${svgW}px`, maxHeight: "260px" }}
      >
        {/* Edges */}
        {dependencies.map((dep, i) => {
          const src = positions.get(dep.upstream);
          const dst = positions.get(dep.downstream);
          if (!src || !dst) return null;
          const upstreamP = promises.find((p) => p.id === dep.upstream);
          const isCascading =
            upstreamP && upstreamP.currentProgress < dep.cascadeThreshold;
          return (
            <line
              key={i}
              x1={src.x + NODE_W / 2}
              y1={src.y}
              x2={dst.x - NODE_W / 2}
              y2={dst.y}
              stroke={isCascading ? theme.danger : theme.border}
              strokeWidth={isCascading ? 2 : 1}
              strokeDasharray={isCascading ? "4 2" : undefined}
            />
          );
        })}

        {/* Nodes */}
        {promises.map((promise) => {
          const pos = positions.get(promise.id);
          if (!pos) return null;
          const status = computeStatus(promise);
          const statusColor = theme.statusColors[status] ?? theme.textMuted;
          const domainColor = theme.domainColors[promise.domain] ?? theme.textMuted;

          return (
            <g key={promise.id} transform={`translate(${pos.x - NODE_W / 2}, ${pos.y - NODE_H / 2})`}>
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={4}
                fill={theme.bgCard}
                stroke={statusColor}
                strokeWidth={1.5}
              />
              <rect
                width={4}
                height={NODE_H}
                rx={2}
                fill={domainColor}
              />
              <text
                x={10}
                y={14}
                fontFamily="monospace"
                fontSize={10}
                fontWeight="bold"
                fill={theme.textBright}
              >
                {promise.id}
              </text>
              <text
                x={10}
                y={26}
                fontFamily="monospace"
                fontSize={8}
                fill={statusColor}
              >
                {Math.round(promise.currentProgress)}%
              </text>
              <text
                x={NODE_W - 4}
                y={26}
                fontFamily="monospace"
                fontSize={7}
                fill={theme.textMuted}
                textAnchor="end"
              >
                {status.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
