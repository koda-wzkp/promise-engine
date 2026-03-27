"use client";

/**
 * CollectionArtifact
 *
 * Individual artifact display in the collection grid.
 * Procedural visual based on artifact properties.
 */

import { useRef, useEffect } from "react";
import type { GardenPromise } from "@/lib/types/personal";
import { seededRandom } from "@/lib/garden/renderer/seededRandom";

interface CollectionArtifactProps {
  promise: GardenPromise;
  isFossil?: boolean;
  onClick: () => void;
}

const DOMAIN_COLORS: Record<string, { primary: string; secondary: string }> = {
  health: { primary: "#2E7D32", secondary: "#81C784" },
  work: { primary: "#4E342E", secondary: "#8D6E63" },
  relationships: { primary: "#AD1457", secondary: "#F48FB1" },
  creative: { primary: "#4527A0", secondary: "#9575CD" },
  financial: { primary: "#1B5E20", secondary: "#558B2F" },
};

export function CollectionArtifact({
  promise,
  isFossil = false,
  onClick,
}: CollectionArtifactProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 64;
    canvas.width = size;
    canvas.height = size;

    const rand = seededRandom(promise.id + "-artifact");
    const colors = DOMAIN_COLORS[promise.domain] ?? {
      primary: "#607D8B",
      secondary: "#90A4AE",
    };

    // Clear
    ctx.clearRect(0, 0, size, size);

    if (isFossil) {
      // Fossil: stone/mineral texture
      drawFossil(ctx, size, rand);
    } else {
      // Artifact: crystalline/organic/ethereal based on k regime
      drawArtifactShape(ctx, size, rand, colors, promise.kRegime);
    }
  }, [promise.id, promise.domain, promise.kRegime, isFossil]);

  const ariaLabel = isFossil
    ? `Fossil: ${promise.body} (${promise.domain})`
    : `Artifact: ${promise.body} (${promise.domain})`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <canvas
        ref={canvasRef}
        width={64}
        height={64}
        style={{
          width: 56,
          height: 56,
          imageRendering: "auto",
        }}
        aria-hidden="true"
      />
      <p className="text-xs text-gray-600 line-clamp-2 text-center leading-tight">
        {promise.body}
      </p>
    </button>
  );
}

// ─── Drawing functions ───

function drawArtifactShape(
  ctx: CanvasRenderingContext2D,
  size: number,
  rand: () => number,
  colors: { primary: string; secondary: string },
  kRegime: string
) {
  const cx = size / 2;
  const cy = size / 2;

  // Glow
  const gradient = ctx.createRadialGradient(cx, cy, 4, cx, cy, size / 2);
  gradient.addColorStop(0, colors.primary + "40");
  gradient.addColorStop(1, "transparent");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  if (kRegime === "physics") {
    // Crystalline: geometric faceted shape
    drawCrystal(ctx, cx, cy, size * 0.35, rand, colors);
  } else if (kRegime === "ecological") {
    // Organic: rounded, flowing shape
    drawOrganic(ctx, cx, cy, size * 0.3, rand, colors);
  } else {
    // Composting / ethereal: soft, cloud-like
    drawEthereal(ctx, cx, cy, size * 0.3, rand, colors);
  }
}

function drawCrystal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rand: () => number,
  colors: { primary: string; secondary: string }
) {
  const facets = 5 + Math.floor(rand() * 4);
  ctx.beginPath();
  for (let i = 0; i < facets; i++) {
    const angle = (i / facets) * Math.PI * 2 - Math.PI / 2;
    const variation = 0.8 + rand() * 0.4;
    const x = cx + Math.cos(angle) * r * variation;
    const y = cy + Math.sin(angle) * r * variation;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = colors.primary;
  ctx.fill();

  // Highlight facet
  ctx.beginPath();
  const ha = rand() * Math.PI * 2;
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(ha) * r * 0.8, cy + Math.sin(ha) * r * 0.8);
  ctx.lineTo(
    cx + Math.cos(ha + 0.6) * r * 0.6,
    cy + Math.sin(ha + 0.6) * r * 0.6
  );
  ctx.closePath();
  ctx.fillStyle = colors.secondary + "80";
  ctx.fill();
}

function drawOrganic(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rand: () => number,
  colors: { primary: string; secondary: string }
) {
  // Blobby organic shape using bezier curves
  ctx.beginPath();
  const points = 6;
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const nextAngle = ((i + 1) / points) * Math.PI * 2;
    const variation = 0.7 + rand() * 0.6;
    const x = cx + Math.cos(angle) * r * variation;
    const y = cy + Math.sin(angle) * r * variation;
    const cpx = cx + Math.cos((angle + nextAngle) / 2) * r * (0.5 + rand() * 0.8);
    const cpy = cy + Math.sin((angle + nextAngle) / 2) * r * (0.5 + rand() * 0.8);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.quadraticCurveTo(cpx, cpy, x, y);
  }
  ctx.closePath();
  ctx.fillStyle = colors.primary;
  ctx.fill();

  // Inner highlight
  ctx.beginPath();
  ctx.arc(cx - r * 0.15, cy - r * 0.15, r * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = colors.secondary + "50";
  ctx.fill();
}

function drawEthereal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rand: () => number,
  colors: { primary: string; secondary: string }
) {
  // Soft layered circles
  for (let i = 3; i >= 0; i--) {
    const offsetX = (rand() - 0.5) * r * 0.4;
    const offsetY = (rand() - 0.5) * r * 0.4;
    const layerR = r * (0.5 + i * 0.2);
    ctx.beginPath();
    ctx.arc(cx + offsetX, cy + offsetY, layerR, 0, Math.PI * 2);
    ctx.fillStyle = (i % 2 === 0 ? colors.primary : colors.secondary) + "30";
    ctx.fill();
  }

  // Core
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = colors.primary + "90";
  ctx.fill();
}

function drawFossil(
  ctx: CanvasRenderingContext2D,
  size: number,
  rand: () => number
) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.3;

  // Stone base
  ctx.beginPath();
  const points = 7;
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const variation = 0.8 + rand() * 0.4;
    const x = cx + Math.cos(angle) * r * variation;
    const y = cy + Math.sin(angle) * r * variation;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "#9E9E9E";
  ctx.fill();

  // Texture lines
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const y = cy - r * 0.3 + i * r * 0.3;
    ctx.moveTo(cx - r * 0.5, y + rand() * 3);
    ctx.lineTo(cx + r * 0.5, y + rand() * 3);
    ctx.strokeStyle = "#BDBDBD";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // Sparkle
  const sx = cx + (rand() - 0.5) * r * 0.6;
  const sy = cy + (rand() - 0.5) * r * 0.6;
  ctx.fillStyle = "#FFFFFF80";
  ctx.fillRect(sx - 1, sy - 1, 2, 2);
}
