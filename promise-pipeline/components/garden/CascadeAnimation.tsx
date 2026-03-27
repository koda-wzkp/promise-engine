"use client";

/**
 * CascadeAnimation — Visual wilting propagation through dependency edges.
 *
 * When a promise degrades, this component shows the cascade ripple
 * through the dependency graph as a wave of stress.
 */

import { useState, useEffect, useRef } from "react";
import type { GardenPromise } from "@/lib/types/garden-phase2";

interface CascadeAnimationProps {
  /** The promise that triggered the cascade */
  sourceId: string;
  /** All promises (to trace dependency graph) */
  promises: GardenPromise[];
  /** Position lookup by promise ID */
  positions: Map<string, { x: number; y: number }>;
  /** Called when the animation completes */
  onComplete?: () => void;
}

interface CascadeWave {
  fromId: string;
  toId: string;
  progress: number; // 0–1
}

/**
 * BFS to find cascading promises from the source.
 * Returns edges in BFS order with depth.
 */
function traceCascadeEdges(
  sourceId: string,
  promises: GardenPromise[]
): Array<{ from: string; to: string; depth: number }> {
  const dependents = new Map<string, string[]>();
  for (const p of promises) {
    for (const depId of p.depends_on) {
      if (!dependents.has(depId)) dependents.set(depId, []);
      dependents.get(depId)!.push(p.id);
    }
  }

  const edges: Array<{ from: string; to: string; depth: number }> = [];
  const visited = new Set<string>([sourceId]);
  const queue = [{ id: sourceId, depth: 0 }];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    const deps = dependents.get(id) || [];
    for (const depId of deps) {
      if (!visited.has(depId)) {
        visited.add(depId);
        edges.push({ from: id, to: depId, depth: depth + 1 });
        queue.push({ id: depId, depth: depth + 1 });
      }
    }
  }

  return edges;
}

export function CascadeAnimation({
  sourceId,
  promises,
  positions,
  onComplete,
}: CascadeAnimationProps) {
  const [waves, setWaves] = useState<CascadeWave[]>([]);
  const animRef = useRef<number>(0);
  const startTime = useRef<number>(0);
  const edges = useRef(traceCascadeEdges(sourceId, promises));

  const WAVE_DURATION = 600; // ms per wave
  const WAVE_DELAY = 200;    // ms delay between depth levels

  useEffect(() => {
    const allEdges = edges.current;
    if (allEdges.length === 0) {
      onComplete?.();
      return;
    }

    const maxDepth = Math.max(...allEdges.map((e) => e.depth));
    const totalDuration = WAVE_DURATION + maxDepth * WAVE_DELAY;

    startTime.current = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime.current;

      if (elapsed > totalDuration) {
        setWaves([]);
        onComplete?.();
        return;
      }

      const activeWaves: CascadeWave[] = [];
      for (const edge of allEdges) {
        const edgeStart = (edge.depth - 1) * WAVE_DELAY;
        const edgeElapsed = elapsed - edgeStart;

        if (edgeElapsed > 0 && edgeElapsed < WAVE_DURATION) {
          activeWaves.push({
            fromId: edge.from,
            toId: edge.to,
            progress: Math.min(1, edgeElapsed / WAVE_DURATION),
          });
        }
      }

      setWaves(activeWaves);
      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, [sourceId, onComplete]);

  if (waves.length === 0) return null;

  return (
    <g role="img" aria-label="Cascade propagation animation" aria-live="polite">
      {waves.map((wave) => {
        const fromPos = positions.get(wave.fromId);
        const toPos = positions.get(wave.toId);
        if (!fromPos || !toPos) return null;

        const currentX = fromPos.x + (toPos.x - fromPos.x) * wave.progress;
        const currentY = fromPos.y + (toPos.y - fromPos.y) * wave.progress;

        return (
          <g key={`${wave.fromId}-${wave.toId}`}>
            {/* Wave line (partial) */}
            <line
              x1={fromPos.x}
              y1={fromPos.y}
              x2={currentX}
              y2={currentY}
              stroke="#e63946"
              strokeWidth={2}
              opacity={0.7 * (1 - wave.progress * 0.3)}
              strokeLinecap="round"
            />
            {/* Wave pulse at the leading edge */}
            <circle
              cx={currentX}
              cy={currentY}
              r={4 + wave.progress * 2}
              fill="none"
              stroke="#e63946"
              strokeWidth={1.5}
              opacity={0.8 * (1 - wave.progress)}
            />
          </g>
        );
      })}
    </g>
  );
}
