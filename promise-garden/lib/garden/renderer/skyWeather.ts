/**
 * Sky gradient and ambient weather particle system.
 *
 * getSkyGradient() returns a CSS linear-gradient string based on the
 * overall garden reliability score. The background CSS transition (2s ease)
 * handles smooth score-to-score animation.
 *
 * Ambient particles make the garden feel alive:
 *   - Fireflies: soft yellow, gentle float near mature plants. Reliability > 70%.
 *   - Dust motes: slow drift in empty areas. Signals "barren land."
 *   - Raindrops: fast downward. Appears when reliability is declining.
 *   - Pollen:    slow drift from flowers. Appears near relationships/creative at maturity.
 *
 * Max 20 particles on screen. Mobile-first performance.
 */

import type { PlantConfig } from "./plantGenerator";

// ─── SKY GRADIENT ───

interface GradientStop {
  minScore: number;
  gradient: string;
}

// Gradient bands from stormy (0) to golden-hour (100)
const GRADIENT_BANDS: GradientStop[] = [
  {
    minScore: 80,
    gradient:
      "linear-gradient(180deg, #87CEEB 0%, #B3E5FC 40%, #E0F6FF 70%, #FFF8E1 100%)",
  },
  {
    minScore: 60,
    gradient:
      "linear-gradient(180deg, #90A4AE 0%, #B0BEC5 40%, #CFD8DC 70%, #ECEFF1 100%)",
  },
  {
    minScore: 40,
    gradient:
      "linear-gradient(180deg, #78909C 0%, #90A4AE 40%, #B0BEC5 100%)",
  },
  {
    minScore: 20,
    gradient:
      "linear-gradient(180deg, #546E7A 0%, #78909C 40%, #90A4AE 100%)",
  },
  {
    minScore: 0,
    gradient:
      "linear-gradient(180deg, #37474F 0%, #455A64 40%, #546E7A 100%)",
  },
];

/**
 * Get the CSS gradient string for the sky based on reliability score (0–1).
 * Apply with `style={{ background: getSkyGradient(score), transition: "background 2s ease" }}`.
 */
export function getSkyGradient(reliabilityScore: number): string {
  const pct = reliabilityScore * 100;
  for (const band of GRADIENT_BANDS) {
    if (pct >= band.minScore) return band.gradient;
  }
  return GRADIENT_BANDS[GRADIENT_BANDS.length - 1].gradient;
}

// ─── AMBIENT PARTICLES ───

export type AmbientParticleType = "firefly" | "dust" | "raindrop" | "pollen";

export interface AmbientParticle {
  type: AmbientParticleType;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  opacity: number;
  size: number;    // 1–2 pixels
  color: string;
  lifespan: number; // Frames remaining before removal
}

const PARTICLE_COLORS: Record<AmbientParticleType, string> = {
  firefly:  "#FFF9C4",
  dust:     "#C4B5A0",
  raindrop: "#B3E5FC",
  pollen:   "#FFF9C4",
};

const MAX_PARTICLES = 20;

/**
 * Spawn ambient particles based on garden state.
 * Returns new particles to add to the existing pool.
 */
export function spawnAmbientParticles(
  plants: PlantConfig[],
  reliabilityScore: number,
  previousReliabilityScore: number,
  gardenBounds: { width: number; height: number; groundLineY: number },
  existingCount: number
): AmbientParticle[] {
  const toAdd: AmbientParticle[] = [];
  const available = MAX_PARTICLES - existingCount;
  if (available <= 0) return toAdd;

  const { width, height, groundLineY } = gardenBounds;

  // Fireflies near mature plants when reliability > 70%
  if (reliabilityScore > 0.7 && toAdd.length < available) {
    const maturePlants = plants.filter(
      (p) => p.growthStage === "mature" && Math.random() < 0.1
    );
    for (const plant of maturePlants.slice(0, 2)) {
      if (toAdd.length >= available) break;
      toAdd.push({
        type: "firefly",
        x: plant.position.x + (Math.random() - 0.5) * 60,
        y: groundLineY - 20 - Math.random() * 60,
        velocityX: (Math.random() - 0.5) * 0.4,
        velocityY: (Math.random() - 0.5) * 0.4,
        opacity: 0.6 + Math.random() * 0.4,
        size: 1,
        color: PARTICLE_COLORS.firefly,
        lifespan: 120 + Math.floor(Math.random() * 120),
      });
    }
  }

  // Dust motes in empty garden areas
  if (plants.length < 5 && toAdd.length < available && Math.random() < 0.05) {
    toAdd.push({
      type: "dust",
      x: Math.random() * width,
      y: Math.random() * groundLineY,
      velocityX: (Math.random() - 0.5) * 0.2,
      velocityY: (Math.random() - 0.5) * 0.1,
      opacity: 0.3 + Math.random() * 0.3,
      size: 1,
      color: PARTICLE_COLORS.dust,
      lifespan: 180 + Math.floor(Math.random() * 180),
    });
  }

  // Raindrops when reliability is declining
  const isDeclinning = reliabilityScore < previousReliabilityScore - 0.02;
  if (isDeclinning && toAdd.length < available && Math.random() < 0.3) {
    toAdd.push({
      type: "raindrop",
      x: Math.random() * width,
      y: 0,
      velocityX: (Math.random() - 0.5) * 0.3,
      velocityY: 2 + Math.random() * 2,
      opacity: 0.5 + Math.random() * 0.4,
      size: 1,
      color: PARTICLE_COLORS.raindrop,
      lifespan: Math.round(groundLineY / 3), // Falls to ground
    });
  }

  // Pollen near flowering plants (relationships / creative at maturity)
  const floweringPlants = plants.filter(
    (p) =>
      (p.domain === "relationships" || p.domain === "creative") &&
      p.growthStage === "mature" &&
      Math.random() < 0.05
  );
  for (const plant of floweringPlants.slice(0, 2)) {
    if (toAdd.length >= available) break;
    toAdd.push({
      type: "pollen",
      x: plant.position.x + (Math.random() - 0.5) * 20,
      y: groundLineY - 30 - Math.random() * 40,
      velocityX: (Math.random() - 0.5) * 0.5,
      velocityY: -0.1 - Math.random() * 0.3, // Drifts slightly upward
      opacity: 0.7,
      size: 1,
      color: PARTICLE_COLORS.pollen,
      lifespan: 90 + Math.floor(Math.random() * 90),
    });
  }

  return toAdd;
}

/**
 * Update ambient particles and draw them on the overlay canvas.
 * Returns the updated particle array (expired ones removed).
 */
export function updateAmbientParticles(
  ctx: CanvasRenderingContext2D,
  particles: AmbientParticle[],
  plants: PlantConfig[],
  reliabilityScore: number,
  previousReliabilityScore: number,
  gardenBounds: { width: number; height: number; groundLineY: number },
  time: number
): AmbientParticle[] {
  const { width, height, groundLineY } = gardenBounds;
  const surviving: AmbientParticle[] = [];

  for (const p of particles) {
    const next = { ...p, lifespan: p.lifespan - 1 };
    if (next.lifespan <= 0) continue;

    // Physics
    next.x += next.velocityX;
    next.y += next.velocityY;

    // Domain-specific behavior
    if (next.type === "firefly") {
      // Gentle random float: add small random perturbation each frame
      next.velocityX += (Math.random() - 0.5) * 0.08;
      next.velocityY += (Math.random() - 0.5) * 0.08;
      // Clamp speed
      next.velocityX = Math.max(-0.5, Math.min(0.5, next.velocityX));
      next.velocityY = Math.max(-0.5, Math.min(0.5, next.velocityY));
      // Blink: opacity oscillates
      next.opacity = 0.4 + 0.6 * Math.abs(Math.sin(time * 0.003 + p.x * 0.1));
    } else if (next.type === "raindrop") {
      // Raindrops disappear when they hit ground
      if (next.y >= groundLineY) continue;
    } else if (next.type === "pollen") {
      // Pollen drifts outward slowly, fades at end of lifespan
      if (next.lifespan < 30) next.opacity *= 0.95;
    } else if (next.type === "dust") {
      // Fade in/out at ends of lifespan
      if (next.lifespan < 30) next.opacity *= 0.97;
    }

    // Wrap around horizontally for dust
    if (next.type === "dust") {
      if (next.x < 0) next.x = width;
      if (next.x > width) next.x = 0;
    }

    // Don't draw if out of canvas bounds
    if (next.y < 0 || next.y > height || next.x < 0 || next.x > width) {
      surviving.push(next);
      continue;
    }

    // Draw
    ctx.globalAlpha = Math.max(0, next.opacity);
    ctx.fillStyle = next.color;
    ctx.fillRect(Math.round(next.x), Math.round(next.y), next.size, next.size);

    surviving.push(next);
  }

  ctx.globalAlpha = 1;

  // Spawn new particles (throttled — only occasionally)
  if (Math.random() < 0.05) {
    const newParticles = spawnAmbientParticles(
      plants,
      reliabilityScore,
      previousReliabilityScore,
      gardenBounds,
      surviving.length
    );
    surviving.push(...newParticles);
  }

  return surviving;
}
