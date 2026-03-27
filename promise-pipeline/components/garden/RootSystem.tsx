"use client";

/**
 * RootSystem — Phase 2 Sub-Promise Visualization
 *
 * Renders sub-promises as a root system beneath the parent plant.
 * Each root = a sub-promise. Root health reflects sub-promise status.
 *
 * At normal zoom: hidden (only parent plant visible)
 * At plant/roots zoom: roots appear beneath the plant
 */

import { useRef, useEffect } from "react";
import { GardenPromise } from "@/lib/types/garden";
import { PromiseStatus } from "@/lib/types/promise";
import type { PersonalDomain } from "@/lib/types/personal";

interface RootSystemProps {
  parent: GardenPromise;
  children: GardenPromise[];
  /** 0-1 opacity based on zoom level */
  opacity: number;
  time: number;
  onSelectChild?: (childId: string) => void;
}

const ROOT_CANVAS_SIZE = 64;

const STATUS_COLORS: Record<PromiseStatus, string> = {
  verified: "#4CAF50",
  declared: "#8D6E63",
  degraded: "#FF9800",
  violated: "#9E9E9E",
  unverifiable: "#78909C",
};

const DOMAIN_ROOT_COLORS: Record<PersonalDomain, { main: string; tip: string }> = {
  health: { main: "#5D4037", tip: "#4CAF50" },
  work: { main: "#3E2723", tip: "#33691E" },
  relationships: { main: "#6D4C41", tip: "#AD1457" },
  creative: { main: "#5D4037", tip: "#4527A0" },
  financial: { main: "#4E342E", tip: "#827717" },
};

export function RootSystem({
  parent,
  children,
  opacity,
  time,
  onSelectChild,
}: RootSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (opacity < 0.05) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = ROOT_CANVAS_SIZE;
    canvas.height = ROOT_CANVAS_SIZE;
    ctx.clearRect(0, 0, ROOT_CANVAS_SIZE, ROOT_CANVAS_SIZE);

    const domain = (parent.domain as PersonalDomain) || "work";
    const rootColors = DOMAIN_ROOT_COLORS[domain] ?? DOMAIN_ROOT_COLORS.work;
    const childCount = children.length;
    if (childCount === 0) return;

    const centerX = ROOT_CANVAS_SIZE / 2;
    const topY = 4; // Just below the plant base

    // Draw each root from center spreading outward
    children.forEach((child, i) => {
      const angle = ((i / childCount) * Math.PI * 0.8) + Math.PI * 0.1;
      const length = 16 + (i % 3) * 8;
      const statusColor = STATUS_COLORS[child.status];

      // Sway based on time
      const sway = Math.sin(time * 0.001 + i * 1.7) * 1.5;

      const endX = centerX + Math.cos(angle) * length + sway;
      const endY = topY + Math.sin(angle) * length * 0.7 + Math.abs(sway) * 0.5;

      // Mid-point for curve
      const midX = centerX + Math.cos(angle) * length * 0.5 + sway * 0.3;
      const midY = topY + Math.sin(angle) * length * 0.35;

      // Root line
      ctx.beginPath();
      ctx.moveTo(centerX, topY);
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.strokeStyle = rootColors.main;
      ctx.lineWidth = child.status === "violated" ? 1 : 2;
      ctx.stroke();

      // Root tip (status indicator)
      ctx.beginPath();
      ctx.arc(endX, endY, 3, 0, Math.PI * 2);
      ctx.fillStyle = statusColor;
      ctx.fill();

      // Small branch roots for verified children
      if (child.status === "verified") {
        for (let b = 0; b < 2; b++) {
          const branchAngle = angle + (b === 0 ? 0.3 : -0.3);
          const branchLen = 6;
          const bx = midX + Math.cos(branchAngle) * branchLen;
          const by = midY + Math.sin(branchAngle) * branchLen * 0.5;
          ctx.beginPath();
          ctx.moveTo(midX, midY);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = rootColors.tip;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });
  }, [parent, children, opacity, time]);

  if (opacity < 0.05 || children.length === 0) return null;

  return (
    <div
      className="relative"
      style={{
        opacity,
        transition: "opacity 0.4s ease",
      }}
    >
      <canvas
        ref={canvasRef}
        width={ROOT_CANVAS_SIZE}
        height={ROOT_CANVAS_SIZE}
        style={{
          width: ROOT_CANVAS_SIZE * 2,
          height: ROOT_CANVAS_SIZE * 2,
          imageRendering: "pixelated",
        }}
        aria-label={`Root system with ${children.length} sub-promises`}
      />

      {/* Sub-promise labels (visible at high zoom) */}
      {opacity > 0.7 && (
        <div className="flex flex-wrap gap-1 mt-1 justify-center">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => onSelectChild?.(child.id)}
              className={`text-[10px] px-1.5 py-0.5 rounded-full border transition-colors ${
                child.status === "verified"
                  ? "border-green-400 text-green-700 bg-green-50"
                  : child.status === "violated"
                  ? "border-gray-300 text-gray-500 bg-gray-50"
                  : child.status === "degraded"
                  ? "border-orange-300 text-orange-700 bg-orange-50"
                  : "border-gray-200 text-gray-600 bg-white"
              }`}
            >
              {child.body.slice(0, 20)}{child.body.length > 20 ? "..." : ""}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
