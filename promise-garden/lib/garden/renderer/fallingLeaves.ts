/**
 * Falling leaf particle system.
 *
 * When a plant transitions from healthy to stressed, individual leaf pixels
 * detach and drift downward. This is the most emotionally impactful animation
 * in the garden — you watch your promise lose life in real time.
 *
 * Each leaf is a 2×2 pixel rectangle that detaches from the plant's canopy,
 * drifts downward with slight horizontal wobble, and shifts from green to
 * brown as it falls (simulating autumn color change).
 *
 * Leaves land on the ground and remain for 3 seconds, then fade out.
 * On plant death (stressLevel → 1.0): a final burst of 8–12 leaves falls
 * and those leaves stay permanently (death scene).
 *
 * prefers-reduced-motion: no animation spawned; stressed plants simply
 * show fewer leaves in their canopy via the density reduction in plantGenerator.
 */

import { getLeafFallColor, hexToRGB, DOMAIN_PALETTES } from "./colors";
import type { PlantConfig } from "./plantGenerator";

export interface FallingLeaf {
  x: number;
  y: number;
  color: string;           // Original leaf color (shifts to brown as it falls)
  velocityX: number;       // Slight horizontal drift (±0.3 px/frame)
  velocityY: number;       // Downward: 0.5–1.0 px/frame
  opacity: number;         // 1.0 → fades as it approaches ground
  lifePhase: "falling" | "resting";
  restFrames: number;      // Frames spent on ground (counts up to restMax)
  restMax: number;         // ~90 frames (3s at 30fps)
  permanent: boolean;      // True for death-burst leaves (stay forever)
  fallDistance: number;    // Total distance fallen (for color interpolation)
  maxFallDistance: number; // Expected fall distance to ground
  sourcePromiseId: string;
}

// ─── SPAWN FUNCTIONS ───

/**
 * Spawn falling leaves when a plant's stress increases.
 *
 * Trigger: when stressLevel crosses a threshold (0.1, 0.3, 0.5, 0.7, 0.9),
 * spawn 2–4 leaves. At stressLevel → 1.0, spawn a final death burst (8–12).
 */
export function spawnFallingLeaves(
  plant: PlantConfig,
  previousStress: number,
  currentStress: number,
  plantPosition: { x: number; y: number },  // Screen position of plant base
  canopyBounds: { top: number; left: number; width: number; height: number },
  groundLineY: number
): FallingLeaf[] {
  const thresholds = [0.1, 0.3, 0.5, 0.7, 0.9];
  const crossed = thresholds.filter((t) => previousStress < t && currentStress >= t);

  if (crossed.length === 0 && currentStress < 1.0) return [];

  const palette = DOMAIN_PALETTES[plant.domain];
  const leafColors = palette.leaf;
  const leaves: FallingLeaf[] = [];

  const isDeath = currentStress >= 1.0;
  const count = isDeath ? 8 + Math.floor(Math.random() * 5) : 2 + Math.floor(Math.random() * 3);

  for (let i = 0; i < count; i++) {
    // Random position within canopy bounds
    const startX = canopyBounds.left + Math.random() * canopyBounds.width;
    const startY = canopyBounds.top + Math.random() * canopyBounds.height;
    const colorHex = leafColors[Math.floor(Math.random() * leafColors.length)];
    const fallDist = groundLineY - startY;

    leaves.push({
      x: startX,
      y: startY,
      color: colorHex,
      velocityX: (Math.random() - 0.5) * 0.6,
      velocityY: 0.5 + Math.random() * 0.5,
      opacity: 1.0,
      lifePhase: "falling",
      restFrames: 0,
      restMax: 90, // 3 seconds at 30fps
      permanent: isDeath,
      fallDistance: 0,
      maxFallDistance: Math.max(1, fallDist),
      sourcePromiseId: plant.promiseId,
    });
  }

  return leaves;
}

// ─── UPDATE AND RENDER ───

/**
 * Update leaf physics and draw on the overlay canvas.
 * Returns the updated leaf array (faded/expired leaves removed).
 */
export function updateFallingLeaves(
  ctx: CanvasRenderingContext2D,
  leaves: FallingLeaf[],
  groundLineY: number
): FallingLeaf[] {
  const surviving: FallingLeaf[] = [];

  for (const leaf of leaves) {
    let next = { ...leaf };

    if (next.lifePhase === "falling") {
      // Physics update
      next.x += next.velocityX;
      next.y += next.velocityY;
      next.fallDistance += next.velocityY;

      // Horizontal wobble: small sinusoidal added to drift
      next.velocityX += (Math.random() - 0.5) * 0.05;
      next.velocityX = Math.max(-0.6, Math.min(0.6, next.velocityX));

      // Fade as it nears the ground
      const fallProgress = Math.min(1, next.fallDistance / next.maxFallDistance);
      next.opacity = Math.max(0.2, 1 - fallProgress * 0.3);

      // Color shifts from green to brown as it falls
      const fallColor = getLeafFallColor(next.color, fallProgress);

      // Landed?
      if (next.y >= groundLineY) {
        next.y = groundLineY;
        next.lifePhase = "resting";
        next.velocityX = 0;
        next.velocityY = 0;
      }

      // Draw 2×2 pixel leaf
      const { r, g, b } = hexToRGB(fallColor);
      ctx.globalAlpha = next.opacity;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(Math.round(next.x), Math.round(next.y), 2, 2);
    } else {
      // Resting on ground
      if (!next.permanent) {
        next.restFrames++;
        // Fade out after resting
        if (next.restFrames > next.restMax) {
          next.opacity -= 0.05;
          if (next.opacity <= 0) continue; // Remove expired leaf
        }
      }

      // Draw resting leaf (brown-ish)
      const restColor = getLeafFallColor(next.color, 1.0);
      const { r, g, b } = hexToRGB(restColor);
      ctx.globalAlpha = Math.max(0, next.opacity);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(Math.round(next.x), Math.round(next.y), 2, 2);
    }

    surviving.push(next);
  }

  ctx.globalAlpha = 1;
  return surviving;
}
