/**
 * Low-level pixel drawing primitives for the procedural plant renderer.
 *
 * All functions operate on a flat Uint8ClampedArray (ImageData.data format):
 * 4 bytes per pixel (R, G, B, A), row-major, top-left origin.
 *
 * Coordinates: x=0 is left, y=0 is top, y=(size-1) is ground level.
 */

import type { RGB } from "./colors";

// ─── PRIMITIVE OPERATIONS ───

/** Write one pixel. Out-of-bounds writes are silently ignored. */
export function setPixel(
  pixels: Uint8ClampedArray,
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
  a: number,
  size: number
): void {
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const i = (y * size + x) * 4;
  pixels[i] = r;
  pixels[i + 1] = g;
  pixels[i + 2] = b;
  pixels[i + 3] = a;
}

/** Read a pixel's RGB. Returns null if out of bounds. */
export function getPixel(
  pixels: Uint8ClampedArray,
  x: number,
  y: number,
  size: number
): RGB | null {
  if (x < 0 || x >= size || y < 0 || y >= size) return null;
  const i = (y * size + x) * 4;
  return { r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] };
}

/** Fill a rectangle with a solid color. */
export function fillRect(
  pixels: Uint8ClampedArray,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  g: number,
  b: number,
  size: number
): void {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      setPixel(pixels, px, py, r, g, b, 255, size);
    }
  }
}

/** Bresenham line — pixel-perfect line between two points. */
export function drawLine(
  pixels: Uint8ClampedArray,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number,
  g: number,
  b: number,
  size: number
): void {
  let dx = Math.abs(x1 - x0);
  let dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  while (true) {
    setPixel(pixels, x0, y0, r, g, b, 255, size);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

// ─── PLANT COMPONENT SHAPES ───

/**
 * Draw a trunk from groundY upward for `height` pixels.
 *
 * @param lean  Horizontal drift at the top relative to ground (in pixels).
 *              Positive = lean right. Seeded per plant for uniqueness.
 * @param rand  Seeded random for per-pixel bark texture variation.
 */
export function drawTrunk(
  pixels: Uint8ClampedArray,
  centerX: number,
  groundY: number,
  height: number,
  width: number,
  lean: number,
  trunkColors: RGB[],
  rand: () => number,
  size: number
): void {
  const halfW = Math.floor(width / 2);
  for (let py = groundY; py > groundY - height; py--) {
    const progress = (groundY - py) / height;
    // Trunk narrows slightly as it rises (taper)
    const taperFactor = 1 - progress * 0.25;
    const effectiveHalfW = Math.max(0, Math.round(halfW * taperFactor));
    const tx = centerX + Math.round(progress * lean);
    const color = trunkColors[Math.floor(rand() * trunkColors.length)];

    for (let dx = -effectiveHalfW; dx <= effectiveHalfW; dx++) {
      setPixel(pixels, tx + dx, py, color.r, color.g, color.b, 255, size);
    }
  }
}

/**
 * Scatter leaf pixels in a circular area.
 *
 * @param density  0–1. Higher = more pixels filled. Reduced for stress.
 * @param glowAmt  0–1. If > 0, a fraction of pixels are lightened (streak glow).
 */
export function drawLeafCluster(
  pixels: Uint8ClampedArray,
  cx: number,
  cy: number,
  radius: number,
  leafColors: RGB[],
  rand: () => number,
  density: number,
  glowAmt: number,
  size: number
): void {
  if (radius < 1) return;
  const r2 = radius * radius;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy > r2) continue;
      if (rand() > density) continue;

      const px = Math.round(cx + dx);
      const py = Math.round(cy + dy);
      let color = leafColors[Math.floor(rand() * leafColors.length)];

      // Streak glow: a fraction of leaf pixels get a lighter tint
      if (glowAmt > 0 && rand() < glowAmt) {
        color = {
          r: Math.round(Math.min(255, color.r + (255 - color.r) * 0.35)),
          g: Math.round(Math.min(255, color.g + (255 - color.g) * 0.35)),
          b: Math.round(Math.min(255, color.b + (255 - color.b) * 0.35)),
        };
      }
      setPixel(pixels, px, py, color.r, color.g, color.b, 255, size);
    }
  }
}

/**
 * Draw a single branch line from a trunk attachment point.
 *
 * @param startX  X position on the trunk.
 * @param startY  Y position on the trunk.
 * @param dir     -1 = left, +1 = right.
 * @param len     Branch length in pixels.
 * @param angle   Upward angle: pixels to rise per horizontal pixel (0.5 = 30°, 1 = 45°).
 */
export function drawBranch(
  pixels: Uint8ClampedArray,
  startX: number,
  startY: number,
  dir: number,
  len: number,
  angle: number,
  color: RGB,
  size: number
): { tipX: number; tipY: number } {
  const endX = startX + dir * len;
  const endY = startY - Math.round(len * angle);
  drawLine(pixels, startX, startY, endX, endY, color.r, color.g, color.b, size);
  return { tipX: endX, tipY: endY };
}

/**
 * Draw a triangular pine layer (for financial/conifer domain).
 * Layer bottom is at (cx, baseY), spans `width` pixels, peaks at (cx, baseY - height).
 */
export function drawPineLayer(
  pixels: Uint8ClampedArray,
  cx: number,
  baseY: number,
  layerWidth: number,
  layerHeight: number,
  color: RGB,
  rand: () => number,
  size: number
): void {
  for (let dy = 0; dy < layerHeight; dy++) {
    // Triangle: at dy=0 (top), width=1; at dy=layerHeight-1, width=layerWidth
    const w = Math.round(1 + (layerWidth - 1) * (dy / Math.max(1, layerHeight - 1)));
    const halfW = Math.floor(w / 2);
    const py = baseY - (layerHeight - 1 - dy);

    for (let dx = -halfW; dx <= halfW; dx++) {
      // Slight color variation for depth
      const col: RGB = rand() < 0.2
        ? { r: Math.max(0, color.r - 20), g: Math.max(0, color.g - 20), b: Math.max(0, color.b - 20) }
        : color;
      setPixel(pixels, cx + dx, py, col.r, col.g, col.b, 255, size);
    }
  }
}

/**
 * Draw tiny flower/fruit dots scattered across a canopy area.
 *
 * @param count  Number of accent dots to place.
 */
export function drawAccentDots(
  pixels: Uint8ClampedArray,
  cx: number,
  cy: number,
  spread: number,
  count: number,
  color: RGB,
  rand: () => number,
  size: number
): void {
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = rand() * spread;
    const px = Math.round(cx + Math.cos(angle) * dist);
    const py = Math.round(cy + Math.sin(angle) * dist * 0.7); // Slightly squashed
    setPixel(pixels, px, py, color.r, color.g, color.b, 255, size);
    // 2×2 dot for visibility
    setPixel(pixels, px + 1, py, color.r, color.g, color.b, 255, size);
    setPixel(pixels, px, py + 1, color.r, color.g, color.b, 255, size);
  }
}

/**
 * Draw a seed mound (dirt mound with a tiny seed pip visible on top).
 */
export function drawSeedMound(
  pixels: Uint8ClampedArray,
  cx: number,
  groundY: number,
  soilColor: RGB,
  seedColor: RGB,
  size: number
): void {
  // Dirt mound: 5px wide, 2px tall
  fillRect(pixels, cx - 2, groundY - 1, 5, 2, soilColor.r, soilColor.g, soilColor.b, size);
  // Seed pip: 1px dark dot on top
  setPixel(pixels, cx, groundY - 2, seedColor.r, seedColor.g, seedColor.b, 255, size);
}

/**
 * Draw a dead stump — grey trunk with bare branch stubs.
 */
export function drawDeadStump(
  pixels: Uint8ClampedArray,
  centerX: number,
  groundY: number,
  height: number,
  trunkWidth: number,
  stumpColor: RGB,
  branchColor: RGB,
  rand: () => number,
  size: number
): void {
  const halfW = Math.floor(trunkWidth / 2);

  // Main stump body
  for (let py = groundY; py > groundY - height; py--) {
    const progress = (groundY - py) / height;
    const taper = Math.max(0, halfW - Math.floor(progress * halfW));
    for (let dx = -taper; dx <= taper; dx++) {
      setPixel(pixels, centerX + dx, py, stumpColor.r, stumpColor.g, stumpColor.b, 255, size);
    }
  }

  // 2 bare branch stubs at top 40%
  const stub1Y = Math.round(groundY - height * 0.6);
  const stub2Y = Math.round(groundY - height * 0.45);

  const stubLen = Math.max(2, Math.round(size * 0.1));
  drawLine(pixels, centerX, stub1Y, centerX - stubLen, stub1Y - 1, branchColor.r, branchColor.g, branchColor.b, size);
  drawLine(pixels, centerX, stub2Y, centerX + stubLen, stub2Y - 1, branchColor.r, branchColor.g, branchColor.b, size);

  // Stump top ring
  setPixel(pixels, centerX - 1, groundY - height, stumpColor.r, stumpColor.g, stumpColor.b, 255, size);
  setPixel(pixels, centerX, groundY - height, branchColor.r, branchColor.g, branchColor.b, 255, size);
  setPixel(pixels, centerX + 1, groundY - height, stumpColor.r, stumpColor.g, stumpColor.b, 255, size);
}
