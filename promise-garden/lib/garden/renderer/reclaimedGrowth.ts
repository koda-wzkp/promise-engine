/**
 * Reclaimed plant renderer — new growth emerging from a dead stump.
 *
 * Visual structure (bottom to top):
 *
 * 1. Dead stump base: grey trunk pixels, ~40% of the original plant's height.
 *    Preserved as the plant looked when it died — bark texture, branch stubs,
 *    no leaves. Color: #9E9E9E (grey).
 *
 * 2. Transition zone: 2–3 pixels where grey wood meets new green.
 *    Mix of grey and the new domain's trunk color. Moss/lichen texture
 *    (scattered green pixels on grey surface).
 *
 * 3. New growth: a fresh plant growing from the top of the stump.
 *    Uses the NEW promise's domain/duration/stakes for its shape.
 *    Growth progress applies only to the new portion.
 *    The new plant's trunk is thinner (it's young, growing from an unusual base).
 *
 * The stump base never changes. It is a permanent record of the failure.
 * The new growth on top is the recovery. Together they tell a story.
 */

import type { PlantConfig } from "./plantGenerator";
import { seededRandom } from "./seededRandom";
import { DOMAIN_PALETTES, desaturateForStress, hexToRGB } from "./colors";
import {
  setPixel,
  drawTrunk,
  drawBranch,
  drawLeafCluster,
  drawDeadStump,
} from "./plantShapes";

/**
 * Generate a reclaimed plant: dead stump base with new growth on top.
 *
 * @param stumpConfig  The original dead promise's config.
 * @param newConfig    The reclaiming promise's config.
 */
export function generateReclaimedPlant(
  stumpConfig: PlantConfig,
  newConfig: PlantConfig,
  time: number,
  canvasSize: number
): ImageData {
  const data = new ImageData(canvasSize, canvasSize);
  const size = canvasSize;
  const groundY = size - 1;
  const cx = size >> 1;

  // ── 1. Dead stump base (bottom 40%) ──────────────────────────────────────

  const stumpPalette = DOMAIN_PALETTES[stumpConfig.domain];
  const stumpColor = hexToRGB(stumpPalette.deadTrunk);
  const branchColor = hexToRGB(stumpPalette.deadBranch);
  const stumpRand = seededRandom(stumpConfig.promiseId);

  // Stump height: 40% of what the original plant's max height would be
  const MAX_HEIGHTS: Record<string, Record<string, number>> = {
    short:  { low: 8,  medium: 10, high: 12 },
    medium: { low: 16, medium: 19, high: 22 },
    long:   { low: 24, medium: 27, high: 30 },
  };
  const origMaxH = Math.round(
    (MAX_HEIGHTS[stumpConfig.durationTier]?.[stumpConfig.stakesTier] ?? 19) * size / 32
  );
  const stumpH = Math.round(origMaxH * 0.4);
  const stumpWidth = Math.min(3, 1 + (stumpConfig.stakesTier === "high" ? 1 : 0));

  drawDeadStump(data.data, cx, groundY, stumpH, stumpWidth, stumpColor, branchColor, stumpRand, size);

  // ── 2. Transition zone: moss/lichen (2–3 px above stump top) ─────────────

  const stumpTopY = groundY - stumpH;
  const transitionH = 3;
  const mossColor = hexToRGB("#558B2F"); // Moss green
  const lichColor = hexToRGB("#C8B8A0"); // Lichen cream
  const transRand = seededRandom(stumpConfig.promiseId + "transition");

  for (let dy = 0; dy < transitionH; dy++) {
    const py = stumpTopY + dy; // dy=0 is stump top, going downward
    for (let dx = -1; dx <= 1; dx++) {
      if (transRand() < 0.5) {
        // Mix of moss and lichen on the grey stump surface
        const col = transRand() < 0.6 ? mossColor : lichColor;
        setPixel(data.data, cx + dx, py, col.r, col.g, col.b, 255, size);
      }
    }
  }

  // ── 3. New growth from stump top ─────────────────────────────────────────

  // New plant starts from stump top, grows upward
  // Max height is reduced — the plant starts mid-air above a stump
  const newPalette = DOMAIN_PALETTES[newConfig.domain];
  const newMaxH = Math.round(
    (MAX_HEIGHTS[newConfig.durationTier]?.[newConfig.stakesTier] ?? 19) * size / 32
  );
  // Reduced max height: plant only has remaining canvas space above stump
  const availableH = stumpTopY - 2; // Leave 2px gap for transition
  const newHeight = Math.round(
    Math.min(availableH, newMaxH * 0.6) * (0.15 + newConfig.growthProgress * 0.85)
  );

  if (newHeight < 2) return data;

  const newTopY = stumpTopY - transitionH - newHeight;
  const newRand = seededRandom(newConfig.promiseId);
  const stress = newConfig.stressLevel;

  // New trunk: thinner than normal (growing from stump)
  const newTrunkW = 1; // Always thin (young growth)
  const newTrunkColors = newPalette.trunk.map((c) => desaturateForStress(c, stress));
  const lean = Math.round((newRand() - 0.5) * 2); // Slight lean
  drawTrunk(data.data, cx, stumpTopY - transitionH, newHeight, newTrunkW, lean, newTrunkColors, newRand, size);

  // New leaves and branches
  const newLeafColors = newPalette.leaf.map((c) => desaturateForStress(c, stress));
  const density = Math.max(0.2, newConfig.growthProgress * 0.8 - stress * 0.4);
  const glow = newConfig.consecutiveKept >= 3 ? Math.min((newConfig.consecutiveKept - 2) * 0.05, 0.2) : 0;

  // Branches only if enough height
  const branchCount = newHeight >= 6 ? Math.round(newConfig.growthProgress * 3) : 0;
  const newBranchTopY = stumpTopY - transitionH;

  for (let i = 0; i < branchCount; i++) {
    const dir = i % 2 === 0 ? -1 : 1;
    const branchY = Math.round(newBranchTopY - newHeight * (0.3 + i * 0.3));
    const trunkXAtBranch = cx + Math.round(((newBranchTopY - branchY) / newHeight) * lean);
    const branchLen = Math.max(2, Math.round(size * 0.06 + newRand() * size * 0.08));
    const branchColor = newTrunkColors[0];
    const { tipX, tipY } = drawBranch(data.data, trunkXAtBranch, branchY, dir, branchLen, 0.4, branchColor, size);
    drawLeafCluster(data.data, tipX, tipY, Math.round(1 + newRand()), newLeafColors, newRand, density, glow, size);
  }

  // Top canopy
  const topCx = cx + lean;
  const canopyR = Math.max(1, Math.round(1 + newHeight * 0.18));
  drawLeafCluster(data.data, topCx, newTopY, canopyR, newLeafColors, newRand, density * 1.1, glow, size);

  return data;
}
