/**
 * Deterministic noise utilities for procedural network graph rendering.
 * Matches the approach used in promise-garden for visual consistency.
 */

export function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function seededRange(seed: number, min: number, max: number): number {
  return min + seededRandom(seed) * (max - min);
}

/** Per-promise visual variation — deterministic from ID. */
export function promiseVariation(promiseId: string) {
  const seed = hashSeed(promiseId);
  return {
    scale: 0.85 + seededRandom(seed) * 0.3,
    lean: seededRange(seed + 1, -4, 4),
    hueShift: seededRange(seed + 2, -8, 8),
    density: 0.8 + seededRandom(seed + 3) * 0.4,
    branchAngle: seededRange(seed + 4, -15, 15),
  };
}
