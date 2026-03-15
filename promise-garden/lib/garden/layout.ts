import type { PersonalDomain } from "../types/personal";
import type { PlantState } from "../types/garden";
import { hashSeed, seededRandom } from "../utils/noise";

// Domain cluster centers in isometric space.
// Arranged so the user develops spatial memory.
const DOMAIN_CENTERS: Record<PersonalDomain, { x: number; y: number }> = {
  health: { x: -200, y: -150 },
  work: { x: 200, y: -150 },
  relationships: { x: 0, y: 0 },
  creative: { x: -200, y: 150 },
  financial: { x: 200, y: 150 },
};

const CLUSTER_RADIUS = 120;
const MIN_PLANT_DISTANCE = 40;

/**
 * Compute position for a new plant within its domain cluster.
 * Uses noise-driven jitter so plants don't form a grid.
 */
export function computePlantPosition(
  promiseId: string,
  domain: PersonalDomain,
  existingPlants: PlantState[]
): { x: number; y: number } {
  const center = DOMAIN_CENTERS[domain];
  const seed = hashSeed(promiseId);
  const domainPlants = existingPlants.filter((p) => p.domain === domain);

  // Try up to 20 positions to avoid overlap
  for (let attempt = 0; attempt < 20; attempt++) {
    const angle = seededRandom(seed + attempt) * Math.PI * 2;
    const radius = seededRandom(seed + attempt + 100) * CLUSTER_RADIUS;
    const x = center.x + Math.cos(angle) * radius;
    const y = center.y + Math.sin(angle) * radius;

    const tooClose = domainPlants.some((p) => {
      const dx = p.position.x - x;
      const dy = p.position.y - y;
      return Math.sqrt(dx * dx + dy * dy) < MIN_PLANT_DISTANCE;
    });

    if (!tooClose) {
      return { x: Math.round(x), y: Math.round(y) };
    }
  }

  // Fallback: expand outward from center
  const count = domainPlants.length;
  const angle = (count / 8) * Math.PI * 2;
  const radius = CLUSTER_RADIUS + (count / 8) * 30;
  return {
    x: Math.round(center.x + Math.cos(angle) * radius),
    y: Math.round(center.y + Math.sin(angle) * radius),
  };
}

/**
 * Convert world coordinates to isometric screen coordinates.
 */
export function worldToIso(wx: number, wy: number): { sx: number; sy: number } {
  return {
    sx: (wx - wy) * 0.866, // cos(30°) ≈ 0.866
    sy: (wx + wy) * 0.5,   // sin(30°) = 0.5
  };
}

/**
 * Convert isometric screen coordinates back to world coordinates.
 */
export function isoToWorld(sx: number, sy: number): { wx: number; wy: number } {
  return {
    wx: sx / 1.732 + sy,
    wy: sy - sx / 1.732,
  };
}

/**
 * Get the bounding box of all plants in world coordinates.
 */
export function getGardenBounds(plants: PlantState[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (plants.length === 0) {
    return { minX: -300, minY: -250, maxX: 300, maxY: 250, width: 600, height: 500 };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of plants) {
    minX = Math.min(minX, p.position.x);
    minY = Math.min(minY, p.position.y);
    maxX = Math.max(maxX, p.position.x);
    maxY = Math.max(maxY, p.position.y);
  }

  // Add padding
  const pad = 150;
  return {
    minX: minX - pad,
    minY: minY - pad,
    maxX: maxX + pad,
    maxY: maxY + pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  };
}

/**
 * Get domain cluster center in screen space.
 */
export function getDomainCenter(domain: PersonalDomain): { sx: number; sy: number } {
  const wc = DOMAIN_CENTERS[domain];
  return worldToIso(wc.x, wc.y);
}
