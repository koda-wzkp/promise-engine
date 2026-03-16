/**
 * Canopy View Renderer — Procedural forest visualization.
 *
 * Each promise is a tree. Root promises (no dependencies) are tall trunks
 * at the bottom. Dependent promises branch upward as smaller trees.
 * Edges are underground root networks connecting the trees.
 *
 * Visual encoding:
 *   Tree height/size → FMEA severity
 *   Canopy saturation → channel capacity (verification quality)
 *   Canopy sway speed → RPN (risk)
 *   Canopy glow → superspreader score
 *   Root thickness → cascade probability
 *   Root style → incentive compatibility
 */

import { hashSeed, seededRandom, seededRange, promiseVariation } from "./noise";
import type { NodeVisualEncoding, EdgeVisualEncoding } from "@/lib/utils/visual-encoding";

interface CanopyNode {
  id: string;
  x: number;
  y: number;
  status: string;
  encoding: NodeVisualEncoding;
  isSelected: boolean;
  isAffected: boolean;
}

interface CanopyEdge {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  encoding?: EdgeVisualEncoding;
}

const STATUS_CANOPY_COLORS: Record<string, { trunk: string; canopy: string[]; accent: string }> = {
  verified: {
    trunk: "#5C4A32",
    canopy: ["#1a5f4a", "#22734f", "#2d8a5e"],
    accent: "#4ADE80",
  },
  declared: {
    trunk: "#5C4A32",
    canopy: ["#1e40af", "#2563eb", "#3b82f6"],
    accent: "#93C5FD",
  },
  degraded: {
    trunk: "#5C4A32",
    canopy: ["#78350f", "#92400e", "#b45309"],
    accent: "#FCD34D",
  },
  violated: {
    trunk: "#4A3728",
    canopy: ["#7f1d1d", "#991b1b", "#b91c1c"],
    accent: "#FCA5A5",
  },
  unverifiable: {
    trunk: "#6B6B6B",
    canopy: ["#4c1d95", "#5b21b6", "#7c3aed"],
    accent: "#C4B5FD",
  },
};

function getColors(status: string) {
  return STATUS_CANOPY_COLORS[status] ?? STATUS_CANOPY_COLORS.declared;
}

export function renderCanopyScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  nodes: CanopyNode[],
  edges: CanopyEdge[],
  time: number,
  reducedMotion: boolean
): void {
  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.5);
  skyGrad.addColorStop(0, "#87CEEB");
  skyGrad.addColorStop(1, "#E0F6FF");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Ground
  const groundY = height * 0.75;
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
  groundGrad.addColorStop(0, "#4a7c59");
  groundGrad.addColorStop(0.3, "#3d6b4a");
  groundGrad.addColorStop(1, "#2d4a35");
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, width, height - groundY);

  // Grass texture
  ctx.save();
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 60; i++) {
    const seed = hashSeed(`grass-${i}`);
    const gx = seededRandom(seed) * width;
    const gy = groundY + seededRandom(seed + 1) * (height - groundY) * 0.3;
    const gh = 4 + seededRandom(seed + 2) * 8;
    ctx.strokeStyle = "#2d5a3a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + seededRange(seed + 3, -3, 3), gy - gh);
    ctx.stroke();
  }
  ctx.restore();

  // Underground root connections (edges)
  ctx.save();
  for (const edge of edges) {
    const rootY = groundY + 15;
    const thickness = edge.encoding?.thickness ?? 1.5;
    const dashArray = edge.encoding?.dashArray ?? "none";
    const opacity = edge.encoding?.opacity ?? 0.4;

    ctx.globalAlpha = opacity * 0.6;
    ctx.strokeStyle = "#5C4A32";
    ctx.lineWidth = thickness;
    if (dashArray !== "none") {
      ctx.setLineDash(dashArray.split(/[, ]+/).map(Number));
    } else {
      ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.moveTo(edge.sourceX, rootY);
    const midX = (edge.sourceX + edge.targetX) / 2;
    const dip = 20 + thickness * 5;
    ctx.quadraticCurveTo(midX, rootY + dip, edge.targetX, rootY);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();

  // Sort nodes by y (back to front)
  const sorted = [...nodes].sort((a, b) => a.y - b.y);

  for (const node of sorted) {
    renderTree(ctx, node, groundY, time, reducedMotion);
  }
}

function renderTree(
  ctx: CanvasRenderingContext2D,
  node: CanopyNode,
  groundY: number,
  time: number,
  reducedMotion: boolean
): void {
  const { encoding } = node;
  const variation = promiseVariation(node.id);
  const colors = getColors(node.status);

  // Tree dimensions from encoding
  const severity = encoding.severity;
  const treeHeight = 30 + severity * 12; // 42-150px
  const trunkWidth = 3 + severity * 0.8;
  const canopyRadius = 10 + severity * 4;

  // Base position — trees stand on the ground
  const baseX = node.x;
  const baseY = groundY - 2;

  ctx.save();
  ctx.translate(baseX, baseY);

  // Sway animation from RPN
  if (!reducedMotion && encoding.pulse.period > 0) {
    const swaySpeed = 0.003 / (encoding.pulse.period / 1000);
    const swayAmount = encoding.pulse.amplitude * 0.4;
    const sway = Math.sin(time * swaySpeed + hashSeed(node.id)) * swayAmount;
    ctx.rotate((sway * Math.PI) / 180);
  }

  // Apply trunk lean
  ctx.rotate((variation.lean * Math.PI) / 180);

  // Saturation from channel capacity
  const sat = encoding.saturation / 100;

  // Selection ring
  if (node.isSelected) {
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -treeHeight, canopyRadius + 6, canopyRadius * 0.7 + 6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Glow for superspreaders
  if (encoding.glowFilter) {
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = encoding.glowRadius * 2;
  }

  // Trunk
  ctx.fillStyle = colors.trunk;
  ctx.beginPath();
  ctx.moveTo(-trunkWidth / 2, 0);
  ctx.quadraticCurveTo(
    -trunkWidth / 2.5,
    -treeHeight * 0.4,
    -trunkWidth / 3,
    -treeHeight * 0.65
  );
  ctx.lineTo(trunkWidth / 3, -treeHeight * 0.65);
  ctx.quadraticCurveTo(
    trunkWidth / 2.5,
    -treeHeight * 0.4,
    trunkWidth / 2,
    0
  );
  ctx.closePath();
  ctx.fill();

  // Bark texture
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 4; i++) {
    const seed = hashSeed(node.id + `-bark-${i}`);
    const bx = (-trunkWidth / 3) + seededRandom(seed) * (trunkWidth * 0.66);
    ctx.beginPath();
    ctx.moveTo(bx, -treeHeight * 0.12 * (i + 1));
    ctx.lineTo(bx + seededRange(seed + 1, -2, 2), -treeHeight * 0.12 * (i + 2));
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  // Canopy — multiple ellipses for organic shape
  const canopyY = -treeHeight;

  // Main canopy body
  ctx.globalAlpha = sat;
  ctx.fillStyle = colors.canopy[0];
  ctx.beginPath();
  ctx.ellipse(0, canopyY, canopyRadius, canopyRadius * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();

  // Depth layer
  ctx.fillStyle = colors.canopy[1] ?? colors.canopy[0];
  ctx.globalAlpha = sat * 0.4;
  ctx.beginPath();
  ctx.ellipse(
    canopyRadius * 0.1,
    canopyY + canopyRadius * 0.08,
    canopyRadius * 0.7,
    canopyRadius * 0.5,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Light highlight
  ctx.fillStyle = colors.canopy[2] ?? colors.canopy[0];
  ctx.globalAlpha = sat * 0.35;
  ctx.beginPath();
  ctx.ellipse(
    -canopyRadius * 0.2,
    canopyY - canopyRadius * 0.2,
    canopyRadius * 0.35,
    canopyRadius * 0.28,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.globalAlpha = 1;

  // Affected pulse overlay
  if (node.isAffected) {
    ctx.fillStyle = "rgba(245, 158, 11, 0.25)";
    ctx.beginPath();
    ctx.ellipse(0, canopyY, canopyRadius + 4, canopyRadius * 0.72 + 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Label
  ctx.fillStyle = "#fff";
  ctx.font = "bold 9px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(node.id, 0, canopyY);

  ctx.restore();
}
