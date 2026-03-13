import { createNoise2D } from "simplex-noise";

// Shared noise instance — seeded deterministically for consistent renders
const noise2D = createNoise2D(() => 0.42);

/**
 * Get 2D simplex noise value in range [-1, 1].
 */
export function noise(x: number, y: number): number {
  return noise2D(x, y);
}

/**
 * Get noise value mapped to [0, 1].
 */
export function noiseUnit(x: number, y: number): number {
  return (noise2D(x, y) + 1) * 0.5;
}

/**
 * Hash a string to a stable numeric seed.
 */
export function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

/**
 * Generate organic bezier path between two points with noise-driven control points.
 */
export function organicBezier(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  seed: number,
  amplitude = 40,
): string {
  const midX = (sx + tx) / 2;
  const midY = (sy + ty) / 2;
  const dx = tx - sx;
  const dy = ty - sy;
  const len = Math.sqrt(dx * dx + dy * dy);
  const px = -dy / (len || 1);
  const py = dx / (len || 1);
  const offset = noise(seed * 0.3, seed * 0.7) * amplitude;
  const cx = midX + px * offset;
  const cy = midY + py * offset;
  return `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;
}

/**
 * Generate a jagged fracture path going downward with noise-driven jitter.
 */
export function fracturePath(
  startX: number,
  startY: number,
  endY: number,
  seed: number,
  steps = 8,
): string {
  const stepSize = (endY - startY) / steps;
  let x = startX;
  let y = startY;
  const parts = [`M ${x} ${y}`];
  for (let i = 1; i <= steps; i++) {
    x += noise(seed + i * 0.5, i * 0.3) * 18;
    y += stepSize + noise(seed + i * 0.7, i * 0.5) * 4;
    parts.push(`L ${x} ${y}`);
  }
  return parts.join(" ");
}
