// Simplified noise utilities for procedural plant generation.
// Uses a deterministic hash-based approach to avoid the simplex-noise
// dependency in the garden renderer while maintaining visual variety.

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
 * Simple deterministic pseudo-random from seed.
 * Returns value in [0, 1).
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Get a seeded random in a range [min, max].
 */
export function seededRange(seed: number, min: number, max: number): number {
  return min + seededRandom(seed) * (max - min);
}

/**
 * 2D noise approximation using hash-based approach.
 * Returns value in [-1, 1].
 */
export function noise2D(x: number, y: number): number {
  const seed = hashSeed(`${x.toFixed(4)},${y.toFixed(4)}`);
  return seededRandom(seed) * 2 - 1;
}

/**
 * 2D noise mapped to [0, 1].
 */
export function noise2DUnit(x: number, y: number): number {
  return (noise2D(x, y) + 1) * 0.5;
}

/**
 * Generate subtle variation values for a plant based on its promise ID.
 */
export function plantVariation(promiseId: string): {
  canopyScale: number; // ±15%
  branchAngle: number; // ±10°
  trunkLean: number; // ±3°
  hueShift: number; // ±5° in HSL
  leafDensity: number; // 0.8–1.2
} {
  const seed = hashSeed(promiseId);
  return {
    canopyScale: 0.85 + seededRandom(seed) * 0.3,
    branchAngle: seededRange(seed + 1, -10, 10),
    trunkLean: seededRange(seed + 2, -3, 3),
    hueShift: seededRange(seed + 3, -5, 5),
    leafDensity: 0.8 + seededRandom(seed + 4) * 0.4,
  };
}
