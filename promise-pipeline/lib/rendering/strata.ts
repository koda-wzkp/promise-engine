/**
 * Strata View Renderer — Procedural geological cross-section visualization.
 *
 * Promise network as geological layers: each domain is a horizontal stratum.
 * Promises are mineral deposits/formations within their domain layer.
 * Edges are fault lines and pressure connections between strata.
 *
 * Visual encoding:
 *   Block width → FMEA severity
 *   Mineral clarity → channel capacity (verification quality)
 *   Pressure glow → RPN (risk)
 *   Heat halo → superspreader score
 *   Fracture width → cascade probability
 *   Fracture style → incentive compatibility
 */

import { hashSeed, seededRandom, seededRange } from "./noise";
import type { NodeVisualEncoding, EdgeVisualEncoding } from "@/lib/utils/visual-encoding";

interface StrataNode {
  id: string;
  x: number;
  y: number;
  domain: string;
  status: string;
  encoding: NodeVisualEncoding;
  isSelected: boolean;
  isAffected: boolean;
}

interface StrataEdge {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  encoding?: EdgeVisualEncoding;
}

interface DomainBand {
  domain: string;
  y: number;
  height: number;
  color: string;
}

const DOMAIN_STRATA_COLORS: Record<string, { base: string; light: string; dark: string }> = {
  Emissions: { base: "#8B4513", light: "#A0522D", dark: "#6B3410" },
  Planning: { base: "#4A6741", light: "#5A7B51", dark: "#3A5231" },
  Verification: { base: "#5C5080", light: "#6E6292", dark: "#4A3E68" },
  Equity: { base: "#2E6B5A", light: "#3E7B6A", dark: "#1E5B4A" },
  Affordability: { base: "#7A6530", light: "#8A7540", dark: "#6A5520" },
  Tribal: { base: "#6B4A6B", light: "#7B5A7B", dark: "#5B3A5B" },
  Workforce: { base: "#4A6B7A", light: "#5A7B8A", dark: "#3A5B6A" },
  Enrichment: { base: "#7A3030", light: "#8A4040", dark: "#6A2020" },
  Facilities: { base: "#6B5020", light: "#7B6030", dark: "#5B4010" },
  Sanctions: { base: "#304A7A", light: "#405A8A", dark: "#203A6A" },
  Cooperation: { base: "#2E6B4A", light: "#3E7B5A", dark: "#1E5B3A" },
  Governance: { base: "#3A6B7A", light: "#4A7B8A", dark: "#2A5B6A" },
};

const STATUS_MINERAL_COLORS: Record<string, { fill: string; highlight: string }> = {
  verified: { fill: "#1a5f4a", highlight: "#4ADE80" },
  declared: { fill: "#1e40af", highlight: "#93C5FD" },
  degraded: { fill: "#78350f", highlight: "#FCD34D" },
  violated: { fill: "#991b1b", highlight: "#FCA5A5" },
  unverifiable: { fill: "#5b21b6", highlight: "#C4B5FD" },
};

function getStrataColor(domain: string) {
  return DOMAIN_STRATA_COLORS[domain] ?? { base: "#5A5A4A", light: "#6A6A5A", dark: "#4A4A3A" };
}

function getMineralColor(status: string) {
  return STATUS_MINERAL_COLORS[status] ?? STATUS_MINERAL_COLORS.declared;
}

export function renderStrataScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  nodes: StrataNode[],
  edges: StrataEdge[],
  domainBands: DomainBand[],
  time: number,
  reducedMotion: boolean
): void {
  // Earth background
  ctx.fillStyle = "#3A3A2E";
  ctx.fillRect(0, 0, width, height);

  // Draw domain strata bands
  for (const band of domainBands) {
    renderStrataBand(ctx, band, width, time);
  }

  // Fault lines (edges)
  for (const edge of edges) {
    renderFaultLine(ctx, edge);
  }

  // Mineral deposits (nodes)
  for (const node of nodes) {
    renderMineral(ctx, node, time, reducedMotion);
  }

  // Surface at top
  ctx.fillStyle = "#4a7c59";
  ctx.fillRect(0, 0, width, 8);
  // Grass
  ctx.fillStyle = "#5a9a69";
  for (let x = 0; x < width; x += 6) {
    const seed = hashSeed(`surface-grass-${x}`);
    const h = 3 + seededRandom(seed) * 5;
    ctx.fillRect(x, 8 - h, 2, h);
  }
}

function renderStrataBand(
  ctx: CanvasRenderingContext2D,
  band: DomainBand,
  width: number,
  time: number
): void {
  const colors = getStrataColor(band.domain);

  // Main band
  const grad = ctx.createLinearGradient(0, band.y, 0, band.y + band.height);
  grad.addColorStop(0, colors.light);
  grad.addColorStop(0.5, colors.base);
  grad.addColorStop(1, colors.dark);
  ctx.fillStyle = grad;

  // Wavy edges for organic look
  ctx.beginPath();
  ctx.moveTo(0, band.y);
  for (let x = 0; x <= width; x += 10) {
    const seed = hashSeed(`strata-top-${band.domain}-${x}`);
    ctx.lineTo(x, band.y + seededRange(seed, -3, 3));
  }
  for (let x = width; x >= 0; x -= 10) {
    const seed = hashSeed(`strata-bot-${band.domain}-${x}`);
    ctx.lineTo(x, band.y + band.height + seededRange(seed, -3, 3));
  }
  ctx.closePath();
  ctx.fill();

  // Sediment texture
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 5; i++) {
    const ly = band.y + (band.height / 6) * (i + 1);
    ctx.beginPath();
    ctx.moveTo(0, ly);
    for (let x = 0; x < width; x += 15) {
      const seed = hashSeed(`sed-${band.domain}-${i}-${x}`);
      ctx.lineTo(x, ly + seededRange(seed, -2, 2));
    }
    ctx.stroke();
  }
  ctx.restore();

  // Domain label
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "bold 10px 'IBM Plex Mono', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(band.domain.toUpperCase(), 8, band.y + band.height / 2);
  ctx.restore();
}

function renderFaultLine(
  ctx: CanvasRenderingContext2D,
  edge: StrataEdge
): void {
  const thickness = edge.encoding?.thickness ?? 1.5;
  const dashArray = edge.encoding?.dashArray ?? "none";
  const opacity = edge.encoding?.opacity ?? 0.5;

  ctx.save();
  ctx.globalAlpha = opacity * 0.6;
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = thickness;
  if (dashArray !== "none") {
    ctx.setLineDash(dashArray.split(/[, ]+/).map(Number));
  }

  // Jagged fault line
  ctx.beginPath();
  ctx.moveTo(edge.sourceX, edge.sourceY);
  const steps = 5;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = edge.sourceX + (edge.targetX - edge.sourceX) * t;
    const y = edge.sourceY + (edge.targetY - edge.sourceY) * t;
    const seed = hashSeed(`fault-${edge.sourceX}-${edge.targetX}-${i}`);
    const jitter = seededRange(seed, -8, 8);
    ctx.lineTo(x + jitter, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function renderMineral(
  ctx: CanvasRenderingContext2D,
  node: StrataNode,
  time: number,
  reducedMotion: boolean
): void {
  const { encoding } = node;
  const colors = getMineralColor(node.status);
  const sat = encoding.saturation / 100;

  // Block dimensions from severity
  const blockW = 16 + encoding.severity * 4;
  const blockH = 12 + encoding.severity * 2.5;

  ctx.save();
  ctx.translate(node.x, node.y);

  // Selection
  if (node.isSelected) {
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.strokeRect(-blockW / 2 - 4, -blockH / 2 - 4, blockW + 8, blockH + 8);
  }

  // Heat halo for superspreaders
  if (encoding.glowFilter) {
    ctx.shadowColor = colors.highlight;
    ctx.shadowBlur = encoding.glowRadius * 2;
  }

  // Pressure glow from RPN
  if (!reducedMotion && encoding.pulse.period > 0) {
    const speed = 0.002 / (encoding.pulse.period / 1000);
    const glowPhase = (Math.sin(time * speed) + 1) / 2;
    ctx.fillStyle = colors.highlight;
    ctx.globalAlpha = glowPhase * 0.15;
    ctx.fillRect(-blockW / 2 - 3, -blockH / 2 - 3, blockW + 6, blockH + 6);
    ctx.globalAlpha = 1;
  }

  // Mineral block
  ctx.fillStyle = colors.fill;
  ctx.globalAlpha = sat;

  // Slightly irregular shape
  const seed = hashSeed(node.id);
  ctx.beginPath();
  ctx.moveTo(-blockW / 2 + seededRange(seed, 0, 3), -blockH / 2);
  ctx.lineTo(blockW / 2 - seededRange(seed + 1, 0, 3), -blockH / 2 + seededRange(seed + 2, 0, 2));
  ctx.lineTo(blockW / 2, blockH / 2 - seededRange(seed + 3, 0, 2));
  ctx.lineTo(-blockW / 2 + seededRange(seed + 4, 0, 2), blockH / 2);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;

  // Crystal/mineral highlight
  ctx.fillStyle = colors.highlight;
  ctx.globalAlpha = sat * 0.3;
  ctx.beginPath();
  ctx.moveTo(-blockW * 0.2, -blockH * 0.3);
  ctx.lineTo(0, -blockH * 0.1);
  ctx.lineTo(-blockW * 0.1, blockH * 0.1);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 1;

  // Affected overlay
  if (node.isAffected) {
    ctx.fillStyle = "rgba(245, 158, 11, 0.3)";
    ctx.fillRect(-blockW / 2 - 2, -blockH / 2 - 2, blockW + 4, blockH + 4);
  }

  // Label
  ctx.fillStyle = "#fff";
  ctx.font = "bold 8px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(node.id, 0, 0);

  ctx.restore();
}
