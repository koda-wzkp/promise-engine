/**
 * Canopy View — Pixel Art Forest Visualization
 *
 * Each promise is a procedurally generated pixel tree. Domains are groves
 * separated by terrain changes. Sky gradient reflects network health.
 *
 * Tree types by status:
 *   Verified   → Full canopy tree with sunlight highlights
 *   Degraded   → Thinning canopy with bare branches poking through
 *   Violated   → Dead tree, bare branches only
 *   Unverifiable → Ghost tree, dithered trunk, outline-only canopy
 *   Declared   → Sapling, small and young
 */

import { PixelRenderer } from "@/components/network/PixelRenderer";
import { pixelPalettes, getStatusPalette } from "@/lib/rendering/pixel-palette";
import { createSeededRandom } from "@/lib/rendering/pixel-prng";
import type { NodeVisualEncoding } from "@/lib/utils/visual-encoding";

export interface CanopyPixelNode {
  id: string;
  x: number;
  y: number;
  status: string;
  domain: string;
  encoding: NodeVisualEncoding;
  isSelected: boolean;
  isAffected: boolean;
}

export interface CanopyPixelEdge {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

interface TreeBounds {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Render the full canopy scene to a PixelRenderer.
 * Returns bounding boxes for hit-testing.
 */
export function renderCanopyPixelScene(
  r: PixelRenderer,
  nodes: CanopyPixelNode[],
  edges: CanopyPixelEdge[],
  domains: string[],
  networkHealth: number,
  spriteFrame: number,
  reducedMotion: boolean
): TreeBounds[] {
  const { pw, ph } = r;
  const groundY = Math.floor(ph * 0.8);
  const skyH = groundY;

  // --- Sky gradient based on network health ---
  if (networkHealth > 70) {
    r.gradient(0, 0, pw, skyH, pixelPalettes.sky.clearLight, pixelPalettes.sky.clear);
    // Clouds
    const cloudRng = createSeededRandom("clouds");
    for (let i = 0; i < 3; i++) {
      const cx = Math.floor(cloudRng() * (pw - 12));
      const cy = Math.floor(cloudRng() * (skyH * 0.4));
      const cw = 6 + Math.floor(cloudRng() * 8);
      r.rect(cx, cy, cw, 2, "#ffffff");
      r.rect(cx + 1, cy - 1, cw - 2, 1, "#ffffff");
    }
  } else if (networkHealth > 40) {
    r.gradient(0, 0, pw, skyH, pixelPalettes.sky.overcast, pixelPalettes.sky.clear);
    const cloudRng = createSeededRandom("clouds-gray");
    for (let i = 0; i < 2; i++) {
      const cx = Math.floor(cloudRng() * (pw - 10));
      const cy = Math.floor(cloudRng() * (skyH * 0.3));
      r.rect(cx, cy, 8, 2, pixelPalettes.sky.overcast);
    }
  } else {
    r.gradient(0, 0, pw, skyH, pixelPalettes.sky.stormy, pixelPalettes.sky.overcast);
  }

  // --- Ground layer ---
  const groundH = ph - groundY;

  // Base ground with domain sections
  const domainWidth = domains.length > 0 ? Math.floor(pw / domains.length) : pw;

  for (let di = 0; di < Math.max(1, domains.length); di++) {
    const sx = di * domainWidth;
    const sw = di === domains.length - 1 ? pw - sx : domainWidth;

    // Base grass
    r.rect(sx, groundY, sw, groundH, pixelPalettes.terrain.grass);

    // Undulating ground line: ±1-2px
    const groundRng = createSeededRandom(`ground-${di}`);
    for (let x = sx; x < sx + sw; x++) {
      const offset = Math.floor(groundRng() * 3) - 1;
      if (offset < 0) {
        // Hill up: fill above groundY
        r.pixel(x, groundY + offset, pixelPalettes.terrain.grass);
      } else if (offset > 0) {
        // Dip: show sky color
        r.pixel(x, groundY, pixelPalettes.sky.clear);
      }
    }

    // Domain-colored ground cover
    const coverRng = createSeededRandom(`cover-${di}`);
    for (let i = 0; i < Math.floor(sw / 4); i++) {
      const fx = sx + Math.floor(coverRng() * sw);
      const fy = groundY + 2 + Math.floor(coverRng() * (groundH * 0.4));
      r.pixel(fx, fy, pixelPalettes.terrain.dirt);
    }

    // Domain separator path
    if (di > 0) {
      for (let y = groundY; y < ph; y++) {
        r.pixel(sx, y, pixelPalettes.terrain.dirt);
      }
    }
  }

  // --- Trees ---
  // Sort by y so back trees draw first
  const sorted = [...nodes].sort((a, b) => a.y - b.y);
  const bounds: TreeBounds[] = [];

  for (const node of sorted) {
    const artPos = r.toPixel(node.x, node.y);
    // Map node y to canvas position above ground
    const treeX = Math.floor((node.x / r.config.width) * pw);
    const treeGroundY = groundY - 1;
    const b = renderPixelTree(r, node, treeX, treeGroundY, spriteFrame, reducedMotion);
    bounds.push(b);
  }

  return bounds;
}

function renderPixelTree(
  r: PixelRenderer,
  node: CanopyPixelNode,
  baseX: number,
  groundY: number,
  spriteFrame: number,
  reducedMotion: boolean
): TreeBounds {
  const palette = getStatusPalette(node.status);
  const rng = createSeededRandom(node.id);
  const dependents = node.encoding.directDependents;

  // Tree height scales with dependent count: 0 deps = 30%, 5+ = 60%
  const heightFraction = 0.3 + Math.min(dependents, 5) / 5 * 0.3;
  const treeH = Math.max(6, Math.floor(r.ph * 0.4 * heightFraction));
  const trunkW = node.status === "declared" ? 1 : (dependents > 3 ? 3 : 2);
  const trunkH = Math.floor(treeH * 0.5);
  const canopyR = Math.max(3, Math.floor(treeH * 0.35));

  // Wind sway offset (1px shift for frame 1)
  const swayOffset = (!reducedMotion && spriteFrame % 2 === 1) ? 1 : 0;
  // Phase offset per tree so they don't sway in unison
  const phaseOffset = Math.floor(rng() * 2);
  const effectiveSway = (!reducedMotion && ((spriteFrame + phaseOffset) % 2 === 1)) ? 1 : 0;

  const topY = groundY - treeH;

  // Selection ring
  if (node.isSelected) {
    r.outline(
      baseX - canopyR - 2,
      topY - 2,
      canopyR * 2 + 4,
      treeH + 4,
      "#2563eb"
    );
  }

  switch (node.status) {
    case "verified":
      drawVerifiedTree(r, rng, palette, baseX, groundY, trunkW, trunkH, canopyR, effectiveSway, node);
      break;
    case "degraded":
      drawDegradedTree(r, rng, palette, baseX, groundY, trunkW, trunkH, canopyR, effectiveSway);
      break;
    case "violated":
      drawViolatedTree(r, rng, palette, baseX, groundY, trunkW, trunkH);
      break;
    case "unverifiable":
      drawUnverifiableTree(r, rng, palette, baseX, groundY, trunkW, trunkH, canopyR);
      break;
    case "declared":
      drawDeclaredTree(r, rng, palette, baseX, groundY, trunkH, canopyR);
      break;
    default:
      drawDeclaredTree(r, rng, palette, baseX, groundY, trunkH, canopyR);
  }

  // Affected overlay: subtle highlight
  if (node.isAffected) {
    r.pixel(baseX - 1, groundY, "#f59e0b");
    r.pixel(baseX + 1, groundY, "#f59e0b");
  }

  return {
    id: node.id,
    x: (baseX - canopyR) * r.ps,
    y: topY * r.ps,
    w: (canopyR * 2) * r.ps,
    h: treeH * r.ps,
  };
}

function drawVerifiedTree(
  r: PixelRenderer,
  rng: () => number,
  palette: { shadow: string; mid: string; light: string; highlight: string },
  baseX: number,
  groundY: number,
  trunkW: number,
  trunkH: number,
  canopyR: number,
  sway: number,
  node: CanopyPixelNode
): void {
  const wood = pixelPalettes.wood;

  // Trunk
  const trunkLeft = baseX - Math.floor(trunkW / 2);
  for (let y = 0; y < trunkH; y++) {
    for (let x = 0; x < trunkW; x++) {
      const color = x === 0 ? wood.trunkDark : wood.trunk;
      r.pixel(trunkLeft + x, groundY - y, color);
    }
  }

  // Canopy — irregular blob via random walk
  const canopyCenter = groundY - trunkH;
  const cx = baseX + sway;
  const canopyPixels: Array<[number, number]> = [];

  // Fill canopy using a circle with procedural irregularity
  for (let dy = -canopyR; dy <= canopyR; dy++) {
    for (let dx = -canopyR; dx <= canopyR; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      const wobble = rng() * 1.5;
      if (dist < canopyR - 0.5 + wobble) {
        canopyPixels.push([cx + dx, canopyCenter + dy]);
      }
    }
  }

  // Draw canopy pixels with color variation
  for (const [px, py] of canopyPixels) {
    const v = rng();
    let color: string;
    if (v < 0.3) color = palette.shadow;
    else if (v < 0.7) color = palette.mid;
    else color = palette.light;
    r.pixel(px, py, color);
  }

  // Sunlight highlight spots
  for (let i = 0; i < 3; i++) {
    const hx = cx + Math.floor(rng() * canopyR * 1.2) - Math.floor(canopyR * 0.6);
    const hy = canopyCenter - Math.floor(rng() * canopyR * 0.6);
    r.pixel(hx, hy, palette.highlight);
  }

  // Fruit/flower pixels for high progress
  if (node.encoding.directDependents > 3) {
    for (let i = 0; i < 2; i++) {
      const fx = cx + Math.floor(rng() * canopyR) - Math.floor(canopyR / 2);
      const fy = canopyCenter + Math.floor(rng() * canopyR * 0.5);
      r.pixel(fx, fy, "#e25555");
    }
  }
}

function drawDegradedTree(
  r: PixelRenderer,
  rng: () => number,
  palette: { shadow: string; mid: string; light: string; highlight: string },
  baseX: number,
  groundY: number,
  trunkW: number,
  trunkH: number,
  canopyR: number,
  sway: number
): void {
  const wood = pixelPalettes.wood;

  // Thinner trunk
  const tw = Math.max(1, trunkW - 1);
  const trunkLeft = baseX - Math.floor(tw / 2);
  for (let y = 0; y < trunkH; y++) {
    for (let x = 0; x < tw; x++) {
      r.pixel(trunkLeft + x, groundY - y, wood.trunk);
    }
  }

  // Thinning canopy (40-60% coverage)
  const canopyCenter = groundY - trunkH;
  const cx = baseX + sway;
  const thinCanopyR = Math.floor(canopyR * 0.8);

  for (let dy = -thinCanopyR; dy <= thinCanopyR; dy++) {
    for (let dx = -thinCanopyR; dx <= thinCanopyR; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < thinCanopyR && rng() < 0.5) {
        const v = rng();
        const color = v < 0.5 ? palette.mid : palette.light;
        r.pixel(cx + dx, canopyCenter + dy, color);
      }
    }
  }

  // Bare branches poking above canopy
  for (let i = 0; i < 2; i++) {
    const bx = cx + Math.floor(rng() * 4) - 2;
    const by = canopyCenter - thinCanopyR - 1;
    r.pixel(bx, by, wood.branch);
    r.pixel(bx + (rng() > 0.5 ? 1 : -1), by - 1, wood.branch);
  }
}

function drawViolatedTree(
  r: PixelRenderer,
  rng: () => number,
  palette: { shadow: string; mid: string; light: string; highlight: string },
  baseX: number,
  groundY: number,
  trunkW: number,
  trunkH: number
): void {
  const wood = pixelPalettes.wood;

  // Trunk in dark wood
  const trunkLeft = baseX - Math.floor(trunkW / 2);
  for (let y = 0; y < trunkH; y++) {
    for (let x = 0; x < trunkW; x++) {
      r.pixel(trunkLeft + x, groundY - y, wood.trunkDark);
    }
  }

  // Bare branches (3-5) at procedural angles
  const branchCount = 3 + Math.floor(rng() * 3);
  const branchTop = groundY - trunkH;
  for (let i = 0; i < branchCount; i++) {
    const angle = (rng() - 0.5) * 1.2; // -0.6 to 0.6
    const length = 3 + Math.floor(rng() * 4);
    let bx = baseX;
    let by = branchTop;
    for (let s = 0; s < length; s++) {
      bx += angle > 0 ? 1 : -1;
      by -= 1;
      r.pixel(Math.floor(bx), by, wood.branch);
    }
  }

  // Dark pixels at base
  r.pixel(baseX - 1, groundY, palette.shadow);
  r.pixel(baseX, groundY + 1, palette.shadow);
  r.pixel(baseX + 1, groundY, palette.shadow);
}

function drawUnverifiableTree(
  r: PixelRenderer,
  rng: () => number,
  palette: { shadow: string; mid: string; light: string; highlight: string },
  baseX: number,
  groundY: number,
  trunkW: number,
  trunkH: number,
  canopyR: number
): void {
  // Dithered trunk (every other pixel)
  const trunkLeft = baseX - Math.floor(trunkW / 2);
  for (let y = 0; y < trunkH; y++) {
    for (let x = 0; x < trunkW; x++) {
      if ((x + y) % 2 === 0) {
        r.pixel(trunkLeft + x, groundY - y, palette.shadow);
      }
    }
  }

  // Canopy outline only
  const canopyCenter = groundY - trunkH;
  for (let dy = -canopyR; dy <= canopyR; dy++) {
    for (let dx = -canopyR; dx <= canopyR; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Only boundary pixels
      if (dist >= canopyR - 1.2 && dist < canopyR + 0.5) {
        r.pixel(baseX + dx, canopyCenter + dy, palette.light);
      }
    }
  }
}

function drawDeclaredTree(
  r: PixelRenderer,
  rng: () => number,
  palette: { shadow: string; mid: string; light: string; highlight: string },
  baseX: number,
  groundY: number,
  trunkH: number,
  canopyR: number
): void {
  // Thin trunk (1px), short
  const shortTrunk = Math.max(3, Math.floor(trunkH * 0.6));
  for (let y = 0; y < shortTrunk; y++) {
    r.pixel(baseX, groundY - y, pixelPalettes.wood.trunk);
  }

  // Small canopy cluster: 4-8 pixels
  const top = groundY - shortTrunk;
  const clusterSize = 4 + Math.floor(rng() * 5);
  const placed: Array<[number, number]> = [[baseX, top]];

  for (let i = 1; i < clusterSize; i++) {
    const base = placed[Math.floor(rng() * placed.length)];
    const dx = Math.floor(rng() * 3) - 1;
    const dy = Math.floor(rng() * 2) - 1;
    const nx = base[0] + dx;
    const ny = base[1] + dy;
    placed.push([nx, ny]);
  }

  for (const [px, py] of placed) {
    const color = rng() > 0.5 ? palette.light : palette.highlight;
    r.pixel(px, py, color);
  }

  // 1-2 side leaf pixels
  r.pixel(baseX + 1, top + 1, palette.light);
  if (rng() > 0.5) {
    r.pixel(baseX - 1, top, palette.highlight);
  }
}
