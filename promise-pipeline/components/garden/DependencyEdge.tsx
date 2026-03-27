"use client";

/**
 * DependencyEdge — Phase 2 Underground Connection Rendering
 *
 * Renders dependency connections between plants as underground root lines.
 * At normal zoom: subtle lines between plant bases.
 * At sub-promise zoom: full root network visible.
 *
 * When a dependency source degrades, the connection pulses.
 */

import { useRef, useEffect } from "react";
import { GardenPromise } from "@/lib/types/garden";
import { PromiseStatus } from "@/lib/types/promise";

interface DependencyEdgeProps {
  /** The promise that depends on another */
  from: GardenPromise;
  /** The promise being depended on */
  to: GardenPromise;
  /** Position of the "from" plant (relative to garden container) */
  fromPos: { x: number; y: number };
  /** Position of the "to" plant */
  toPos: { x: number; y: number };
  /** Current animation time */
  time: number;
  /** Zoom-based opacity (0-1) */
  opacity: number;
}

const STATUS_LINE_COLORS: Record<PromiseStatus, string> = {
  verified: "rgba(76, 175, 80, 0.6)",
  declared: "rgba(141, 110, 99, 0.4)",
  degraded: "rgba(255, 152, 0, 0.7)",
  violated: "rgba(244, 67, 54, 0.6)",
  unverifiable: "rgba(120, 144, 156, 0.4)",
};

export function DependencyEdge({
  from,
  to,
  fromPos,
  toPos,
  time,
  opacity,
}: DependencyEdgeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isStressed = to.status === "degraded" || to.status === "violated";
  const pulsePhase = isStressed ? Math.sin(time * 0.003) * 0.3 + 0.7 : 1;

  useEffect(() => {
    if (opacity < 0.05) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = Math.abs(toPos.x - fromPos.x) + 40;
    const height = 40;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // Draw curved underground connection
    const startX = 20;
    const endX = width - 20;
    const midY = height * 0.7;

    ctx.beginPath();
    ctx.moveTo(startX, 5);
    ctx.quadraticCurveTo(
      (startX + endX) / 2,
      midY,
      endX,
      5
    );

    const color = STATUS_LINE_COLORS[to.status];
    ctx.strokeStyle = color;
    ctx.lineWidth = isStressed ? 2 : 1.5;
    ctx.globalAlpha = opacity * pulsePhase;

    // Dashed line for stressed connections
    if (isStressed) {
      const dashOffset = (time * 0.05) % 12;
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = dashOffset;
    }

    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // Direction arrow at midpoint
    const arrowX = (startX + endX) / 2;
    const arrowY = midY * 0.6;
    ctx.beginPath();
    ctx.moveTo(arrowX - 3, arrowY - 2);
    ctx.lineTo(arrowX + 3, arrowY);
    ctx.lineTo(arrowX - 3, arrowY + 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity * 0.6;
    ctx.fill();
  }, [fromPos, toPos, to.status, time, opacity, isStressed, pulsePhase]);

  if (opacity < 0.05) return null;

  const left = Math.min(fromPos.x, toPos.x) - 20;
  const top = Math.max(fromPos.y, toPos.y);

  return (
    <canvas
      ref={canvasRef}
      className="absolute pointer-events-none"
      style={{
        left,
        top,
        opacity,
        transition: "opacity 0.3s ease",
      }}
      aria-hidden="true"
    />
  );
}
