/**
 * Deterministic PRNG seeded by a string (promise ID).
 *
 * Uses a Mulberry32-style algorithm with a string hash seed.
 * Same seed always produces the same sequence — plants look
 * identical across renders, sessions, and devices.
 *
 * Usage:
 *   const rand = seededRandom(promiseId);
 *   const x = rand();  // 0–1
 *   const y = rand();  // different value, same seed sequence
 */
export function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return function () {
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967296;
  };
}
