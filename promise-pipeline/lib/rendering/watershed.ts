/**
 * Watershed View Renderer — Procedural river system visualization.
 *
 * Promise network as a watershed: root promises are mountain springs at the top,
 * dependents flow downward as tributaries merging into wider rivers.
 * Nodes are pools/reservoirs where streams converge.
 *
 * Visual encoding:
 *   Pool size → FMEA severity
 *   Water clarity → channel capacity (verification quality)
 *   Ripple rate → RPN (risk)
 *   Pool glow → superspreader (confluence points)
 *   Stream width → cascade probability
 *   Stream style → incentive compatibility
 */

import { hashSeed, seededRandom, seededRange } from "./noise";
import type { NodeVisualEncoding, EdgeVisualEncoding } from "@/lib/utils/visual-encoding";

interface WatershedNode {
  id: string;
  x: number;
  y: number;
  status: string;
  encoding: NodeVisualEncoding;
  isSelected: boolean;
  isAffected: boolean;
}

interface WatershedEdge {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  encoding?: EdgeVisualEncoding;
}

const STATUS_WATER_COLORS: Record<string, { pool: string; accent: string; depth: string }> = {
  verified: { pool: "#1a5f4a", accent: "#4ADE80", depth: "#0d3d2e" },
  declared: { pool: "#1e40af", accent: "#93C5FD", depth: "#0f2666" },
  degraded: { pool: "#78350f", accent: "#FCD34D", depth: "#4a2008" },
  violated: { pool: "#991b1b", accent: "#FCA5A5", depth: "#5a1010" },
  unverifiable: { pool: "#5b21b6", accent: "#C4B5FD", depth: "#3b1280" },
};

function getWaterColors(status: string) {
  return STATUS_WATER_COLORS[status] ?? STATUS_WATER_COLORS.declared;
}

export function renderWatershedScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  nodes: WatershedNode[],
  edges: WatershedEdge[],
  time: number,
  reducedMotion: boolean
): void {
  // Terrain gradient (mountain top to valley bottom)
  const terrainGrad = ctx.createLinearGradient(0, 0, 0, height);
  terrainGrad.addColorStop(0, "#8B9E7A"); // Mountain green
  terrainGrad.addColorStop(0.3, "#6B8E5E"); // Mid slope
  terrainGrad.addColorStop(0.7, "#4A7C4A"); // Valley
  terrainGrad.addColorStop(1, "#3A6A3A"); // Deep valley
  ctx.fillStyle = terrainGrad;
  ctx.fillRect(0, 0, width, height);

  // Terrain texture — contour lines
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 1;
  for (let y = 30; y < height; y += 35) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x < width; x += 20) {
      const seed = hashSeed(`contour-${y}-${x}`);
      const offset = seededRange(seed, -6, 6);
      ctx.lineTo(x, y + offset);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Rocky texture patches
  ctx.save();
  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 30; i++) {
    const seed = hashSeed(`rock-${i}`);
    const rx = seededRandom(seed) * width;
    const ry = seededRandom(seed + 1) * height;
    const rw = 8 + seededRandom(seed + 2) * 20;
    ctx.fillStyle = "#4a4a3a";
    ctx.beginPath();
    ctx.ellipse(rx, ry, rw, rw * 0.6, seededRange(seed + 3, 0, Math.PI), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Streams (edges) — drawn as flowing water
  for (const edge of edges) {
    renderStream(ctx, edge, time, reducedMotion);
  }

  // Pools (nodes)
  const sorted = [...nodes].sort((a, b) => a.y - b.y);
  for (const node of sorted) {
    renderPool(ctx, node, time, reducedMotion);
  }
}

function renderStream(
  ctx: CanvasRenderingContext2D,
  edge: WatershedEdge,
  time: number,
  reducedMotion: boolean
): void {
  const thickness = edge.encoding?.thickness ?? 1.5;
  const dashArray = edge.encoding?.dashArray ?? "none";
  const opacity = edge.encoding?.opacity ?? 0.6;

  const midX = (edge.sourceX + edge.targetX) / 2;
  const midY = (edge.sourceY + edge.targetY) / 2;

  // Water flow offset
  const waveOffset = reducedMotion ? 0 : Math.sin(time * 0.002 + edge.sourceX * 0.01) * 6;

  // Main water body
  ctx.save();
  ctx.globalAlpha = opacity * 0.7;
  ctx.strokeStyle = "#4A90D9";
  ctx.lineWidth = thickness * 1.5;
  ctx.lineCap = "round";
  if (dashArray !== "none") {
    ctx.setLineDash(dashArray.split(/[, ]+/).map(Number));
  }
  ctx.beginPath();
  ctx.moveTo(edge.sourceX, edge.sourceY);
  ctx.quadraticCurveTo(midX + waveOffset, midY, edge.targetX, edge.targetY);
  ctx.stroke();

  // Shimmer highlight
  ctx.strokeStyle = "#87CEEB";
  ctx.lineWidth = Math.max(1, thickness * 0.5);
  ctx.globalAlpha = opacity * 0.35;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(edge.sourceX + 1, edge.sourceY - 1);
  ctx.quadraticCurveTo(midX + waveOffset + 2, midY - 1, edge.targetX + 1, edge.targetY - 1);
  ctx.stroke();

  ctx.restore();
}

function renderPool(
  ctx: CanvasRenderingContext2D,
  node: WatershedNode,
  time: number,
  reducedMotion: boolean
): void {
  const { encoding } = node;
  const colors = getWaterColors(node.status);

  // Pool size from severity
  const poolRadius = 12 + encoding.severity * 3.5;
  const sat = encoding.saturation / 100;

  ctx.save();
  ctx.translate(node.x, node.y);

  // Selection indicator
  if (node.isSelected) {
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, poolRadius + 6, poolRadius * 0.55 + 6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Glow for superspreaders
  if (encoding.glowFilter) {
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = encoding.glowRadius * 2;
  }

  // Pool shadow (depth)
  ctx.fillStyle = colors.depth;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.ellipse(0, 2, poolRadius + 2, (poolRadius + 2) * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pool body (isometric ellipse)
  ctx.fillStyle = colors.pool;
  ctx.globalAlpha = sat;
  ctx.beginPath();
  ctx.ellipse(0, 0, poolRadius, poolRadius * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Water surface highlight
  ctx.fillStyle = colors.accent;
  ctx.globalAlpha = sat * 0.3;
  ctx.beginPath();
  ctx.ellipse(-poolRadius * 0.2, -poolRadius * 0.08, poolRadius * 0.5, poolRadius * 0.2, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Ripple rings from RPN
  if (!reducedMotion && encoding.pulse.period > 0) {
    const speed = 0.003 / (encoding.pulse.period / 1000);
    const ripplePhase = (time * speed) % 1;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1;
    ctx.globalAlpha = sat * (1 - ripplePhase) * 0.3;
    ctx.beginPath();
    ctx.ellipse(
      0, 0,
      poolRadius * (0.5 + ripplePhase * 0.7),
      poolRadius * 0.5 * (0.5 + ripplePhase * 0.7),
      0, 0, Math.PI * 2
    );
    ctx.stroke();
  }

  ctx.globalAlpha = 1;

  // Affected indicator
  if (node.isAffected) {
    ctx.fillStyle = "rgba(245, 158, 11, 0.3)";
    ctx.beginPath();
    ctx.ellipse(0, 0, poolRadius + 4, (poolRadius + 4) * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Label
  ctx.fillStyle = "#fff";
  ctx.font = "bold 9px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(node.id, 0, 0);

  ctx.restore();
}
