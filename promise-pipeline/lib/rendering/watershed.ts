/**
 * Watershed View — Pixel Art River System Visualization
 *
 * Promises are nodes along a river system. Water flows from upstream
 * (foundational) promises to downstream (dependent) promises.
 * Healthy flow is blue-green. Failure turns the water red.
 * Stream width indicates how many promises depend on the flow.
 */

import { PixelRenderer } from "@/components/network/PixelRenderer";
import { pixelPalettes, getStatusPalette } from "@/lib/rendering/pixel-palette";
import { createSeededRandom } from "@/lib/rendering/pixel-prng";
import type { NodeVisualEncoding } from "@/lib/utils/visual-encoding";

export interface WatershedPixelNode {
  id: string;
  x: number;
  y: number;
  status: string;
  encoding: NodeVisualEncoding;
  isSelected: boolean;
  isAffected: boolean;
  downstreamCount: number;
}

export interface WatershedPixelEdge {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourceStatus: string;
  edgeId: string;
  downstreamCount: number;
}

interface NodeBounds {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Render the watershed scene. Returns bounding boxes for hit-testing.
 */
export function renderWatershedPixelScene(
  r: PixelRenderer,
  nodes: WatershedPixelNode[],
  edges: WatershedPixelEdge[],
  spriteFrame: number,
  reducedMotion: boolean
): NodeBounds[] {
  const { pw, ph } = r;
  const terrain = pixelPalettes.terrain;

  // --- Terrain background with elevation gradient ---
  // Top = lighter (headwaters/mountain), bottom = darker (delta/valley)
  r.gradient(0, 0, pw, ph, "#7a9a6a", "#3a5a3a");

  // Tiled terrain texture (8×8 patches)
  const terrainRng = createSeededRandom("terrain-tex");
  for (let ty = 0; ty < ph; ty += 8) {
    for (let tx = 0; tx < pw; tx += 8) {
      // Procedural terrain variation within each 8x8 block
      for (let dy = 0; dy < 8 && ty + dy < ph; dy++) {
        for (let dx = 0; dx < 8 && tx + dx < pw; dx++) {
          const v = terrainRng();
          if (v < 0.03) {
            r.pixel(tx + dx, ty + dy, terrain.stone);
          } else if (v < 0.06) {
            r.pixel(tx + dx, ty + dy, terrain.dirt);
          }
        }
      }
    }
  }

  // --- Streams (edges) ---
  for (const edge of edges) {
    renderPixelStream(r, edge, spriteFrame, reducedMotion);
  }

  // --- Promise nodes ---
  const bounds: NodeBounds[] = [];
  const sorted = [...nodes].sort((a, b) => a.y - b.y);
  for (const node of sorted) {
    bounds.push(renderPixelNode(r, node));
  }

  return bounds;
}

function renderPixelStream(
  r: PixelRenderer,
  edge: WatershedPixelEdge,
  spriteFrame: number,
  reducedMotion: boolean
): void {
  const terrain = pixelPalettes.terrain;
  const palette = getStatusPalette(edge.sourceStatus);

  // Stream width based on downstream count
  const streamWidth = Math.min(3, 1 + Math.floor(edge.downstreamCount / 2));

  // Map to art coordinates
  const sx = Math.floor((edge.sourceX / r.config.width) * r.pw);
  const sy = Math.floor((edge.sourceY / r.config.height) * r.ph);
  const tx = Math.floor((edge.targetX / r.config.width) * r.pw);
  const ty = Math.floor((edge.targetY / r.config.height) * r.ph);

  // Stream color based on upstream status
  const isFailure = edge.sourceStatus === "violated" || edge.sourceStatus === "degraded";
  const waterColors = isFailure
    ? [palette.shadow, palette.mid, palette.highlight]
    : [terrain.waterDeep, terrain.water, terrain.waterFoam];

  // Draw stepped pixel path with ±1px wobble
  const rng = createSeededRandom(edge.edgeId);
  const steps = Math.max(Math.abs(tx - sx), Math.abs(ty - sy), 1);
  const halfW = Math.floor(streamWidth / 2);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = Math.floor(sx + (tx - sx) * t);
    const py = Math.floor(sy + (ty - sy) * t);

    // Wobble every 4-8 pixels
    const wobbleSeed = Math.floor(i / (4 + Math.floor(rng() * 5)));
    const wobble = (wobbleSeed % 2 === 0) ? Math.floor(rng() * 3) - 1 : 0;

    // Water animation: cycle through 3 frames
    // Phase offset along stream length creates flow illusion
    const phaseOffset = reducedMotion ? 0 : Math.floor(i / 3);
    const colorIdx = (spriteFrame + phaseOffset) % 3;
    const waterColor = waterColors[colorIdx];

    // Draw stream pixels
    for (let w = -halfW; w <= halfW; w++) {
      r.pixel(px + wobble + w, py, waterColor);
    }

    // Riverbed (sand banks) for streams wider than 1px
    if (streamWidth > 1) {
      r.pixel(px + wobble - halfW - 1, py, terrain.sand);
      r.pixel(px + wobble + halfW + 1, py, terrain.sand);
    }
  }
}

function renderPixelNode(
  r: PixelRenderer,
  node: WatershedPixelNode
): NodeBounds {
  const palette = getStatusPalette(node.status);
  const nodeSize = r.config.resolution === 32 ? 5 : 9;
  const half = Math.floor(nodeSize / 2);

  // Map to art coordinates
  const cx = Math.floor((node.x / r.config.width) * r.pw);
  const cy = Math.floor((node.y / r.config.height) * r.ph);

  // Selection indicator
  if (node.isSelected) {
    r.outline(cx - half - 2, cy - half - 2, nodeSize + 4, nodeSize + 4, "#2563eb");
  }

  // Node body (filled square)
  r.rect(cx - half, cy - half, nodeSize, nodeSize, palette.mid);

  // Border
  r.outline(cx - half, cy - half, nodeSize, nodeSize, palette.shadow);

  // Cascade source: pulsing highlight ring
  if (node.isAffected) {
    r.outline(cx - half - 1, cy - half - 1, nodeSize + 2, nodeSize + 2, palette.highlight);
  }

  return {
    id: node.id,
    x: (cx - half) * r.ps,
    y: (cy - half) * r.ps,
    w: nodeSize * r.ps,
    h: nodeSize * r.ps,
  };
}
