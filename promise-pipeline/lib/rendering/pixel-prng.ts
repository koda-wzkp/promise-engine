/**
 * Deterministic PRNG for pixel art rendering.
 *
 * Seed-based procedural generation — same promise ID always produces
 * the same visual. No external dependencies.
 */

/** Hash a string to a 32-bit integer seed. */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Create a seeded PRNG that returns values in [0, 1).
 * Uses a linear congruential generator.
 */
export function createSeededRandom(seed: string): () => number {
  let state = hashString(seed);
  if (state === 0) state = 1; // Avoid zero state
  return () => {
    state = (state * 1664525 + 1013904223) & 0xffffffff;
    return (state >>> 0) / 0xffffffff;
  };
}
