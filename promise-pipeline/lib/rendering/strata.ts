/**
 * Strata View — Pixel Art Geological Layers Visualization
 *
 * Domains are horizontal geological strata. Foundational promises are deep
 * bedrock. Surface promises rest on top. Violations create fracture lines
 * that propagate upward. If bedrock cracks, everything above shifts.
 *
 * Layer ordering: domains sorted by how many other domains depend on them
 * (most depended-on = deepest layer).
 */

import { PixelRenderer } from "@/components/network/PixelRenderer";
import { pixelPalettes, getStatusPalette } from "@/lib/rendering/pixel-palette";
import { createSeededRandom } from "@/lib/rendering/pixel-prng";
import type { NodeVisualEncoding } from "@/lib/utils/visual-encoding";

export interface StrataPixelNode {
  id: string;
  x: number;
  y: number;
  domain: string;
  status: string;
  encoding: NodeVisualEncoding;
  isSelected: boolean;
  isAffected: boolean;
  layerIndex: number;
}

export interface StrataDomainBand {
  domain: string;
  y: number;
  height: number;
  layerIndex: number;
  dependedOnCount: number;
}

interface BlockBounds {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Render the strata scene. Returns bounding boxes for hit-testing.
 */
export function renderStrataPixelScene(
  r: PixelRenderer,
  nodes: StrataPixelNode[],
  domainBands: StrataDomainBand[],
  violatedIds: Set<string>,
  spriteFrame: number,
  reducedMotion: boolean
): BlockBounds[] {
  const { pw, ph } = r;

  // --- Layer rendering ---
  for (const band of domainBands) {
    renderStrataLayer(r, band, pw);
  }

  // Layer boundaries: 2px horizontal lines of deepStone
  for (const band of domainBands) {
    const artY = Math.floor((band.y / r.config.height) * ph);
    r.rect(0, artY, pw, 2, pixelPalettes.terrain.deepStone);
  }

  // --- Promise blocks ---
  const bounds: BlockBounds[] = [];
  for (const node of nodes) {
    bounds.push(renderStrataBlock(r, node));
  }

  // --- Fracture lines from violated promises ---
  for (const node of nodes) {
    if (node.status === "violated") {
      renderFractureLine(r, node, domainBands, nodes);
    }
  }

  return bounds;
}

function renderStrataLayer(
  r: PixelRenderer,
  band: StrataDomainBand,
  canvasWidth: number
): void {
  const { ph } = r;
  const artY = Math.floor((band.y / r.config.height) * ph);
  const artH = Math.max(1, Math.floor((band.height / r.config.height) * ph));
  const rng = createSeededRandom(`layer-${band.domain}`);

  // Deeper layers are darker. layerIndex 0 = surface (light), high = deep (dark).
  const depthFactor = band.layerIndex / Math.max(1, band.dependedOnCount + 3);
  const baseGray = Math.floor(100 - depthFactor * 40);

  // Generate 8×8 rock texture pattern
  for (let dy = 0; dy < artH; dy++) {
    for (let dx = 0; dx < canvasWidth; dx++) {
      const v = rng();
      let r_val = baseGray, g_val = baseGray - 5, b_val = baseGray - 10;

      if (v < 0.05) {
        // Stone detail
        r_val -= 20;
        g_val -= 20;
        b_val -= 15;
      } else if (v < 0.1) {
        // Lighter spot
        r_val += 10;
        g_val += 10;
        b_val += 12;
      }

      r_val = Math.max(30, Math.min(180, r_val));
      g_val = Math.max(25, Math.min(175, g_val));
      b_val = Math.max(20, Math.min(170, b_val));

      r.pixel(dx, artY + dy, `rgb(${r_val},${g_val},${b_val})`);
    }
  }

  // Sediment texture lines
  const lineRng = createSeededRandom(`sed-${band.domain}`);
  for (let i = 0; i < 3; i++) {
    const ly = artY + Math.floor(artH * (i + 1) / 4);
    for (let x = 0; x < canvasWidth; x++) {
      if (lineRng() < 0.7) {
        const jitter = Math.floor(lineRng() * 3) - 1;
        r.pixel(x, ly + jitter, pixelPalettes.terrain.deepStone);
      }
    }
  }
}

function renderStrataBlock(
  r: PixelRenderer,
  node: StrataPixelNode
): BlockBounds {
  const palette = getStatusPalette(node.status);
  const rng = createSeededRandom(node.id);
  const { pw, ph } = r;

  // Map to art coordinates
  const cx = Math.floor((node.x / r.config.width) * pw);
  const cy = Math.floor((node.y / r.config.height) * ph);

  // Width proportional to dependents (min 3, max 8 tiles)
  const tilePx = r.config.resolution === 32 ? 3 : 5;
  const depWidth = Math.max(3, Math.min(8, 3 + node.encoding.directDependents));
  const blockW = depWidth * tilePx;
  const blockH = Math.floor(blockW * 0.6);

  const bx = cx - Math.floor(blockW / 2);
  const by = cy - Math.floor(blockH / 2);

  // Selection
  if (node.isSelected) {
    r.outline(bx - 2, by - 2, blockW + 4, blockH + 4, "#2563eb");
  }

  switch (node.status) {
    case "verified":
      // Solid clean fill
      r.rect(bx, by, blockW, blockH, palette.mid);
      break;

    case "degraded":
      // Fill with 25% weathered pixels
      for (let dy = 0; dy < blockH; dy++) {
        for (let dx = 0; dx < blockW; dx++) {
          const color = rng() < 0.25 ? palette.shadow : palette.mid;
          r.pixel(bx + dx, by + dy, color);
        }
      }
      break;

    case "violated":
      // Fill with crack pattern
      r.rect(bx, by, blockW, blockH, palette.mid);
      // Diagonal crack lines
      for (let i = 0; i < 3; i++) {
        const startX = Math.floor(rng() * blockW);
        const startY = Math.floor(rng() * blockH);
        for (let s = 0; s < Math.min(blockW, blockH); s++) {
          const crackX = bx + ((startX + s) % blockW);
          const crackY = by + ((startY + s) % blockH);
          r.pixel(crackX, crackY, palette.shadow);
        }
      }
      break;

    case "unverifiable":
      // Outline only — the "fossil" that might not be real
      r.outline(bx, by, blockW, blockH, palette.mid);
      break;

    case "declared":
      // Light fill with dashed border
      r.rect(bx, by, blockW, blockH, palette.highlight);
      // Dashed border (every other pixel)
      for (let dx = 0; dx < blockW; dx++) {
        if (dx % 2 === 0) {
          r.pixel(bx + dx, by, palette.mid);
          r.pixel(bx + dx, by + blockH - 1, palette.mid);
        }
      }
      for (let dy = 0; dy < blockH; dy++) {
        if (dy % 2 === 0) {
          r.pixel(bx, by + dy, palette.mid);
          r.pixel(bx + blockW - 1, by + dy, palette.mid);
        }
      }
      break;

    default:
      r.rect(bx, by, blockW, blockH, palette.mid);
  }

  // Affected stress pixels
  if (node.isAffected) {
    const stressRng = createSeededRandom(`stress-${node.id}`);
    for (let i = 0; i < 3; i++) {
      const sx = bx + Math.floor(stressRng() * blockW);
      const sy = by + Math.floor(stressRng() * blockH);
      r.pixel(sx, sy, pixelPalettes.degraded.mid);
    }
  }

  return {
    id: node.id,
    x: bx * r.ps,
    y: by * r.ps,
    w: blockW * r.ps,
    h: blockH * r.ps,
  };
}

function renderFractureLine(
  r: PixelRenderer,
  violatedNode: StrataPixelNode,
  domainBands: StrataDomainBand[],
  allNodes: StrataPixelNode[]
): void {
  const { pw, ph } = r;
  const violated = pixelPalettes.violated;
  const rng = createSeededRandom(`fracture-${violatedNode.id}`);

  // Fracture starts from top edge of violated block and goes upward
  const cx = Math.floor((violatedNode.x / r.config.width) * pw);
  const startY = Math.floor((violatedNode.y / r.config.height) * ph);

  // Propagate upward to surface (y = 0)
  let fracX = cx;
  for (let y = startY; y > 2; y--) {
    // Horizontal jitter every 3-4 vertical pixels
    if (y % (3 + Math.floor(rng() * 2)) === 0) {
      fracX += Math.floor(rng() * 3) - 1;
    }

    const color = rng() < 0.7 ? violated.shadow : violated.mid;
    r.pixel(fracX, y, color);
  }
}
