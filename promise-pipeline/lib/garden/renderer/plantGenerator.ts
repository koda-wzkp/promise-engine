/**
 * Core procedural pixel plant renderer.
 *
 * generatePlantPixels() produces a 32×32 ImageData that can be put directly
 * onto a <canvas> element. Every visual property is derived deterministically
 * from the PlantConfig — same config always produces the same plant.
 *
 * Visual properties derived from config:
 *   - Trunk height    = growthProgress × duration max height
 *   - Branch count    = growthProgress mapped to domain max
 *   - Leaf density    = growthProgress with stress dropout
 *   - Color saturation = inverse of stressLevel
 *   - Flowers/fruit   = domain-specific, appear above 70% progress
 *   - Trunk lean      = seeded by promiseId (unique per plant)
 *   - Leaf sway       = time-based sinusoidal, phase seeded by promiseId
 *   - Streak glow     = subtle bright pixels when consecutiveKept ≥ 3
 */

import type { PlantState, GrowthStage } from "../types";
import type { PersonalDomain, DurationTier, StakesTier } from "../types";
import { seededRandom } from "./seededRandom";
import {
  DOMAIN_PALETTES,
  desaturateForStress,
  hexToRGB,
  type RGB,
} from "./colors";
import {
  setPixel,
  drawTrunk,
  drawBranch,
  drawLeafCluster,
  drawPineLayer,
  drawAccentDots,
  drawSeedMound,
  drawDeadStump,
} from "./plantShapes";

// ─── PLANT CONFIG ───

/**
 * Everything the renderer needs to draw a plant.
 * Extends PlantState with display-only fields.
 */
export interface PlantConfig extends PlantState {
  body: string;
  stumpConfig?: PlantConfig;
}

// ─── HEIGHT TABLES ───

// Max height in pixels at native 32×32 canvas resolution.
// Scales proportionally for larger canvas sizes.
const MAX_HEIGHT: Record<DurationTier, Record<StakesTier, number>> = {
  short:  { low: 8,  medium: 10, high: 12 },
  medium: { low: 16, medium: 19, high: 22 },
  long:   { low: 24, medium: 27, high: 30 },
};

// Trunk width in pixels (base, scales slightly with stakes)
const TRUNK_WIDTH: Record<StakesTier, number> = {
  low: 1, medium: 2, high: 3,
};

// ─── HELPERS ───

/** Compute the rendered height for a plant given its current growth stage. */
function getPlantHeight(config: PlantConfig, canvasSize: number): number {
  const baseH = Math.round(MAX_HEIGHT[config.durationTier][config.stakesTier] * canvasSize / 32);

  switch (config.growthStage) {
    case "seed":
      return 0;
    case "sprout":
      return Math.max(3, Math.round(baseH * 0.2));
    case "growing":
      return Math.round(baseH * (0.35 + config.growthProgress * 0.45));
    case "mature":
      return Math.round(baseH * (0.8 + config.growthProgress * 0.2));
    case "stressed": {
      // Stressed plants keep their height but lose leaves
      const baseProgress = config.previousStage === "mature" ? 1.0 : 0.65;
      return Math.round(baseH * baseProgress);
    }
    case "reclaimed":
      return Math.round(baseH * (0.15 + config.growthProgress * 0.3));
    case "dead":
      return Math.round(baseH * 0.4);
    default:
      return 0;
  }
}

/** Number of branches to draw based on domain, stage, and progress. */
function getBranchCount(
  domain: PersonalDomain,
  stage: GrowthStage,
  progress: number
): number {
  if (stage === "seed" || stage === "sprout") return 0;
  const maxBranches: Record<PersonalDomain, number> = {
    health: 5,
    work: 4,
    relationships: 4,
    creative: 7,
    financial: 0, // Pine uses layered needles instead
  };
  const max = maxBranches[domain];
  if (stage === "growing") return Math.max(1, Math.round(max * (0.3 + progress * 0.5)));
  if (stage === "mature") return max;
  if (stage === "stressed") return Math.max(1, Math.round(max * 0.5));
  if (stage === "reclaimed") return Math.max(1, Math.round(max * progress * 0.4));
  return max;
}

/** Leaf density: 0–1. Reduced by stress, boosted by growth progress. */
function getLeafDensity(stage: GrowthStage, progress: number, stressLevel: number): number {
  const baseByStage: Record<GrowthStage, number> = {
    seed: 0,
    sprout: 0.3,
    growing: 0.5 + progress * 0.3,
    mature: 0.8 + progress * 0.15,
    stressed: 0.4,
    dead: 0,
    reclaimed: 0.3 + progress * 0.3,
  };
  const base = baseByStage[stage] ?? 0.5;
  return Math.max(0.05, base - stressLevel * 0.7);
}

/** Streak glow intensity: 0 if no streak, up to 0.25 for long streaks. */
function getStreakGlow(consecutiveKept: number): number {
  if (consecutiveKept < 3) return 0;
  return Math.min((consecutiveKept - 2) * 0.05, 0.25);
}

// ─── DOMAIN-SPECIFIC RENDERERS ───

/** Health: fruit-bearing, smooth curved trunk, open spreading canopy. */
function drawHealthPlant(
  pixels: Uint8ClampedArray,
  config: PlantConfig,
  swayX: number,
  size: number
): void {
  const rand = seededRandom(config.promiseId);
  const palette = DOMAIN_PALETTES.health;
  const stress = config.stressLevel;
  const stage = config.growthStage;
  const groundY = size - 1;
  const cx = (size >> 1) + swayX;

  const height = getPlantHeight(config, size);
  if (height < 1) return;

  // Slight trunk lean unique to each plant (–2 to +2 pixels at top)
  const lean = Math.round((rand() - 0.5) * 4);
  const trunkW = TRUNK_WIDTH[config.stakesTier];

  // Trunk colors with stress desaturation
  const trunkRGBs = palette.trunk.map((c) => desaturateForStress(c, stress));
  drawTrunk(pixels, cx, groundY, height, trunkW, lean, trunkRGBs, rand, size);

  // Leaf colors
  const leafRGBs = palette.leaf.map((c) => desaturateForStress(c, stress));
  const density = getLeafDensity(stage, config.growthProgress, stress);
  const glow = getStreakGlow(config.consecutiveKept);
  const branchCount = getBranchCount("health", stage, config.growthProgress);

  // Trunk top position (where lean places it)
  const topX = cx + lean;
  const topY = groundY - height;

  // Spreading branches (health: outward/horizontal tendency)
  for (let i = 0; i < branchCount; i++) {
    const dir = i % 2 === 0 ? -1 : 1;
    const branchY = Math.round(groundY - height * (0.3 + i * (0.5 / Math.max(branchCount, 1))));
    const trunkXAtBranch = cx + Math.round(((groundY - branchY) / height) * lean);
    const branchLen = Math.round(size * 0.1 + rand() * size * 0.08);
    // Health branches spread outward more horizontally (angle ~0.3)
    const angle = 0.2 + rand() * 0.3;
    const branchColor = trunkRGBs[Math.floor(rand() * trunkRGBs.length)];

    const { tipX, tipY } = drawBranch(
      pixels, trunkXAtBranch, branchY, dir, branchLen, angle, branchColor, size
    );

    // Leaf cluster at branch tip
    const leafR = Math.round(2 + rand() * 2);
    drawLeafCluster(pixels, tipX + swayX, tipY, leafR, leafRGBs, rand, density, glow, size);
  }

  // Main canopy at top
  const canopyR = Math.round(2 + height * 0.2);
  if (height >= 4) {
    drawLeafCluster(pixels, topX + swayX, topY, canopyR, leafRGBs, rand, density * 1.1, glow, size);
    // Secondary canopy layer
    if (height >= 8) {
      drawLeafCluster(pixels, topX + swayX, topY + 2, Math.round(canopyR * 0.7), leafRGBs, rand, density, glow, size);
    }
  }

  // Fruit (appears when mature + progress > 0.7)
  if ((stage === "mature" && config.growthProgress > 0.7) ||
      (stage === "growing" && config.growthProgress > 0.9)) {
    const fruitColor = hexToRGB(palette.accent);
    const fruitCount = 2 + Math.floor(rand() * 3);
    drawAccentDots(pixels, topX + swayX, topY + 2, canopyR, fruitCount, fruitColor, rand, size);
  }
}

/** Work: hardwood, straight thick trunk, regular upward-angled branches, dense canopy. */
function drawWorkPlant(
  pixels: Uint8ClampedArray,
  config: PlantConfig,
  swayX: number,
  size: number
): void {
  const rand = seededRandom(config.promiseId);
  const palette = DOMAIN_PALETTES.work;
  const stress = config.stressLevel;
  const stage = config.growthStage;
  const groundY = size - 1;
  const cx = size >> 1; // Work trunk is always perfectly straight

  const height = getPlantHeight(config, size);
  if (height < 1) return;

  const trunkW = TRUNK_WIDTH[config.stakesTier];
  const trunkRGBs = palette.trunk.map((c) => desaturateForStress(c, stress));
  // Work trunk: no lean (reliable, structured)
  drawTrunk(pixels, cx, groundY, height, trunkW, 0, trunkRGBs, rand, size);

  const leafRGBs = palette.leaf.map((c) => desaturateForStress(c, stress));
  const density = getLeafDensity(stage, config.growthProgress, stress);
  const glow = getStreakGlow(config.consecutiveKept);
  const branchCount = getBranchCount("work", stage, config.growthProgress);

  // Regular alternating branches at precise intervals (upward angle = 0.5)
  for (let i = 0; i < branchCount; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const branchY = Math.round(groundY - height * (0.3 + i * (0.55 / Math.max(branchCount, 1))));
    const branchLen = Math.round(size * 0.1 + rand() * size * 0.05);
    const branchColor = trunkRGBs[0]; // Work uses consistent trunk color
    const { tipX, tipY } = drawBranch(pixels, cx, branchY, dir, branchLen, 0.5, branchColor, size);

    // Dense leaf clusters (no flowers — work domain)
    const leafR = Math.round(2 + rand() * 1.5);
    drawLeafCluster(pixels, tipX + swayX, tipY, leafR, leafRGBs, rand, density, glow, size);
  }

  // Dense top canopy — rectangular feel (bigger than other domains)
  if (height >= 4) {
    const canopyR = Math.round(2 + height * 0.22);
    // Dense rectangular-ish canopy from multiple overlapping clusters
    drawLeafCluster(pixels, cx + swayX, groundY - height, canopyR, leafRGBs, rand, density * 1.2, glow, size);
    if (height >= 8) {
      drawLeafCluster(pixels, cx - 1 + swayX, groundY - height + 2, Math.round(canopyR * 0.8), leafRGBs, rand, density * 1.1, glow, size);
      drawLeafCluster(pixels, cx + 2 + swayX, groundY - height + 1, Math.round(canopyR * 0.7), leafRGBs, rand, density, glow, size);
    }
  }
}

/** Relationships: flowering, slender graceful trunk, organic asymmetric branches, flower clusters. */
function drawRelationshipsPlant(
  pixels: Uint8ClampedArray,
  config: PlantConfig,
  swayX: number,
  size: number
): void {
  const rand = seededRandom(config.promiseId);
  const palette = DOMAIN_PALETTES.relationships;
  const stress = config.stressLevel;
  const stage = config.growthStage;
  const groundY = size - 1;
  const cx = (size >> 1) + swayX;

  const height = getPlantHeight(config, size);
  if (height < 1) return;

  // Graceful, slender trunk with organic lean
  const lean = Math.round((rand() - 0.5) * 3);
  // Relationships trunk is always 1px (slender)
  const trunkW = Math.min(2, TRUNK_WIDTH[config.stakesTier]);
  const trunkRGBs = palette.trunk.map((c) => desaturateForStress(c, stress));
  drawTrunk(pixels, cx, groundY, height, trunkW, lean, trunkRGBs, rand, size);

  const leafRGBs = palette.leaf.map((c) => desaturateForStress(c, stress));
  const flowerRGBs = palette.flower.map((c) => desaturateForStress(c, stress));
  const density = getLeafDensity(stage, config.growthProgress, stress);
  const glow = getStreakGlow(config.consecutiveKept);
  const branchCount = getBranchCount("relationships", stage, config.growthProgress);
  const topX = cx + lean;
  const topY = groundY - height;

  // Organic asymmetric branches (varying angles and lengths)
  for (let i = 0; i < branchCount; i++) {
    const dir = i % 2 === 0 ? -1 : 1;
    const branchY = Math.round(groundY - height * (0.25 + i * (0.6 / Math.max(branchCount, 1))));
    const trunkXAtBranch = cx + Math.round(((groundY - branchY) / height) * lean);
    // Organic variation: branches vary significantly in length and angle
    const branchLen = Math.round(size * 0.08 + rand() * size * 0.12);
    const angle = 0.3 + rand() * 0.6; // Varies 0.3–0.9 (more organic)
    const branchColor = trunkRGBs[Math.floor(rand() * trunkRGBs.length)];
    const { tipX, tipY } = drawBranch(pixels, trunkXAtBranch, branchY, dir, branchLen, angle, branchColor, size);

    // Leaf cluster
    const leafR = Math.round(2 + rand() * 2);
    drawLeafCluster(pixels, tipX + swayX, tipY, leafR, leafRGBs, rand, density, glow, size);

    // Flowers at branch tips (above 70% progress or mature)
    const showFlowers = (stage === "mature" && config.growthProgress > 0.3) ||
      (stage === "growing" && config.growthProgress > 0.7);
    if (showFlowers && flowerRGBs.length > 0 && rand() < 0.7) {
      const flowerColor = flowerRGBs[Math.floor(rand() * flowerRGBs.length)];
      drawAccentDots(pixels, tipX + swayX, tipY, leafR, 1 + Math.round(rand() * 2), flowerColor, rand, size);
    }
  }

  // Open top canopy
  if (height >= 4) {
    const canopyR = Math.round(2 + height * 0.18);
    drawLeafCluster(pixels, topX + swayX, topY, canopyR, leafRGBs, rand, density, glow, size);

    // Flower cluster in canopy
    if (stage === "mature" || (stage === "growing" && config.growthProgress > 0.7)) {
      if (flowerRGBs.length > 0) {
        const flowerColor = flowerRGBs[Math.floor(rand() * flowerRGBs.length)];
        drawAccentDots(pixels, topX + swayX, topY, canopyR, 3 + Math.round(rand() * 4), flowerColor, rand, size);
      }
    }
  }
}

/** Creative: wild/unusual, curved or multi-trunk, irregular branches, teal/purple accents. */
function drawCreativePlant(
  pixels: Uint8ClampedArray,
  config: PlantConfig,
  swayX: number,
  size: number
): void {
  const rand = seededRandom(config.promiseId);
  const palette = DOMAIN_PALETTES.creative;
  const stress = config.stressLevel;
  const stage = config.growthStage;
  const groundY = size - 1;
  const cx = (size >> 1) + swayX;

  const height = getPlantHeight(config, size);
  if (height < 1) return;

  // Creative plants have significant lean and sometimes dual trunks
  const lean = Math.round((rand() - 0.5) * 6);
  const trunkW = TRUNK_WIDTH[config.stakesTier];
  const trunkRGBs = palette.trunk.map((c) => desaturateForStress(c, stress));

  // Possibly a second trunk (seeded: ~30% of creative plants have dual trunks)
  const hasDualTrunk = rand() < 0.3 && height > 10;
  if (hasDualTrunk) {
    const offset = Math.round(size * 0.08);
    drawTrunk(pixels, cx - offset, groundY, Math.round(height * 0.7), 1, lean - 1, trunkRGBs, rand, size);
  }
  drawTrunk(pixels, cx, groundY, height, trunkW, lean, trunkRGBs, rand, size);

  const leafRGBs = palette.leaf.map((c) => desaturateForStress(c, stress));
  const flowerRGBs = palette.flower.map((c) => desaturateForStress(c, stress));
  const density = getLeafDensity(stage, config.growthProgress, stress);
  const glow = getStreakGlow(config.consecutiveKept);
  const branchCount = getBranchCount("creative", stage, config.growthProgress);
  const topX = cx + lean;
  const topY = groundY - height;

  // Irregular branches — creative has the most variation in angle and direction
  for (let i = 0; i < branchCount; i++) {
    // Sometimes consecutive branches go the same direction (creative = unpredictable)
    const dir = rand() < 0.55 ? (i % 2 === 0 ? -1 : 1) : (i % 2 === 0 ? 1 : -1);
    const branchY = Math.round(groundY - height * (0.2 + rand() * 0.65));
    const trunkXAtBranch = cx + Math.round(((groundY - branchY) / height) * lean);
    const branchLen = Math.round(size * 0.06 + rand() * size * 0.15);
    const angle = 0.1 + rand() * 0.9; // Full range — wild
    const branchColor = trunkRGBs[Math.floor(rand() * trunkRGBs.length)];
    const { tipX, tipY } = drawBranch(pixels, trunkXAtBranch, branchY, dir, branchLen, angle, branchColor, size);

    const leafR = Math.round(2 + rand() * 3);
    drawLeafCluster(pixels, tipX + swayX, tipY, leafR, leafRGBs, rand, density, glow, size);

    // Purple/teal accent flowers
    if (flowerRGBs.length > 0 && stage !== "seed" && rand() < 0.5) {
      const flowerColor = flowerRGBs[Math.floor(rand() * flowerRGBs.length)];
      drawAccentDots(pixels, tipX + swayX, tipY, leafR, 1 + Math.round(rand() * 2), flowerColor, rand, size);
    }
  }

  // Unusual top — creative can have a drooping or irregular canopy
  if (height >= 4) {
    const canopyR = Math.round(2 + height * 0.2);
    drawLeafCluster(pixels, topX + swayX, topY, canopyR, leafRGBs, rand, density, glow, size);
    // Additional offset cluster for asymmetry
    if (height >= 8) {
      const offX = Math.round((rand() - 0.5) * 4);
      const offY = Math.round(rand() * 3);
      drawLeafCluster(pixels, topX + offX + swayX, topY + offY, Math.round(canopyR * 0.65), leafRGBs, rand, density * 0.9, glow, size);
    }
  }
}

/** Financial: evergreen/coniferous, straight tapered trunk, triangular pine layers. */
function drawFinancialPlant(
  pixels: Uint8ClampedArray,
  config: PlantConfig,
  swayX: number,
  size: number
): void {
  const rand = seededRandom(config.promiseId);
  const palette = DOMAIN_PALETTES.financial;
  const stress = config.stressLevel;
  const stage = config.growthStage;
  const groundY = size - 1;
  const cx = (size >> 1) + swayX;

  const height = getPlantHeight(config, size);
  if (height < 1) return;

  // Straight trunk, no lean (reliable evergreens)
  const trunkW = TRUNK_WIDTH[config.stakesTier];
  const trunkRGBs = palette.trunk.map((c) => desaturateForStress(c, stress));
  drawTrunk(pixels, cx, groundY, height, trunkW, 0, trunkRGBs, rand, size);

  // Leaf colors
  const leafRGBs = palette.leaf.map((c) => desaturateForStress(c, stress));
  const density = getLeafDensity(stage, config.growthProgress, stress);

  // Triangular canopy from the tip — number of layers scales with height
  const numLayers = Math.max(1, Math.round(height * 0.35));
  const maxLayerWidth = Math.min(size - 2, Math.round(height * 0.75));

  for (let i = 0; i < numLayers; i++) {
    const layerProgress = i / Math.max(numLayers - 1, 1);
    // Bottom layer is widest, top layer is narrowest
    const layerW = Math.max(3, Math.round(maxLayerWidth * (1 - layerProgress * 0.7)));
    const layerH = Math.max(2, Math.round(height / numLayers));
    // Layers overlap going from top of trunk upward
    const layerBase = (groundY - Math.round(height * 0.2)) - i * Math.round(height / numLayers * 0.75);

    const layerColor = leafRGBs[i % leafRGBs.length];
    // Apply density: skip some pixels for stress
    if (rand() > density * 0.3) { // Pine layers mostly solid but thin at high stress
      drawPineLayer(pixels, cx + swayX, layerBase, layerW, layerH, layerColor, rand, size);
    }
  }
}

// ─── STAGE RENDERERS ───

function drawSeedStage(
  pixels: Uint8ClampedArray,
  config: PlantConfig,
  size: number
): void {
  const groundY = size - 1;
  const cx = size >> 1;
  const palette = DOMAIN_PALETTES[config.domain];
  const soilColor = hexToRGB("#8B7355");
  const seedColor = hexToRGB(palette.trunk[0]);
  drawSeedMound(pixels, cx, groundY, soilColor, seedColor, size);
}

function drawDeadStage(
  pixels: Uint8ClampedArray,
  config: PlantConfig,
  size: number
): void {
  const groundY = size - 1;
  const cx = size >> 1;
  const palette = DOMAIN_PALETTES[config.domain];
  const stumpColor = hexToRGB(palette.deadTrunk);
  const branchColor = hexToRGB(palette.deadBranch);
  const rand = seededRandom(config.promiseId);
  const height = getPlantHeight(config, size);
  const trunkW = TRUNK_WIDTH[config.stakesTier];
  drawDeadStump(pixels, cx, groundY, height, trunkW + 1, stumpColor, branchColor, rand, size);
}

function drawSproutStage(
  pixels: Uint8ClampedArray,
  config: PlantConfig,
  swayX: number,
  size: number
): void {
  const rand = seededRandom(config.promiseId);
  const palette = DOMAIN_PALETTES[config.domain];
  const groundY = size - 1;
  const cx = (size >> 1) + swayX;
  const height = getPlantHeight(config, size);

  // Small soil mound
  const soilColor = hexToRGB("#8B7355");
  const seedColor = hexToRGB(palette.trunk[0]);
  drawSeedMound(pixels, cx, groundY, soilColor, seedColor, size);

  // Thin stem
  const stemColor = hexToRGB("#4ADE80");
  for (let py = groundY - 1; py > groundY - height; py--) {
    setPixel(pixels, cx, py, stemColor.r, stemColor.g, stemColor.b, 255, size);
  }

  // One small leaf at top
  if (height >= 2) {
    const leafRGBs = palette.leaf.map((c) => hexToRGB(c));
    const topY = groundY - height;
    drawLeafCluster(pixels, cx + 1, topY, 1, leafRGBs, rand, 0.7, 0, size);
  }
}

// ─── MAIN EXPORT ───

/**
 * Generate a pixel art plant from promise data.
 *
 * Returns an ImageData object that can be put directly onto a <canvas>:
 *   ctx.putImageData(generatePlantPixels(config, time), 0, 0)
 */
export function generatePlantPixels(
  config: PlantConfig,
  time: number,
  canvasSize = 32
): ImageData {
  const data = new ImageData(canvasSize, canvasSize);
  // ImageData is zero-initialized (transparent black background)

  const { growthStage, domain } = config;

  // Sway: ±1 pixel at native 32px, only on canopy (applied as offset in draw calls)
  // Phase is seeded so each plant sways at a different moment
  const phaseRand = seededRandom(config.promiseId + "sway");
  const phase = phaseRand() * Math.PI * 2;
  const swayAmplitude = growthStage === "stressed" ? 0.7 : 1.0;
  const swayX = Math.round(Math.sin(time * 0.002 + phase) * swayAmplitude);

  switch (growthStage) {
    case "seed":
      drawSeedStage(data.data, config, canvasSize);
      break;
    case "sprout":
      drawSproutStage(data.data, config, swayX, canvasSize);
      break;
    case "dead":
      drawDeadStage(data.data, config, canvasSize);
      break;
    default: {
      // growing, mature, stressed, reclaimed → domain-specific renderer
      const effectiveDomain = domain;
      switch (effectiveDomain) {
        case "health":
          drawHealthPlant(data.data, config, swayX, canvasSize);
          break;
        case "work":
          drawWorkPlant(data.data, config, swayX, canvasSize);
          break;
        case "relationships":
          drawRelationshipsPlant(data.data, config, swayX, canvasSize);
          break;
        case "creative":
          drawCreativePlant(data.data, config, swayX, canvasSize);
          break;
        case "financial":
          drawFinancialPlant(data.data, config, swayX, canvasSize);
          break;
      }
    }
  }

  return data;
}

/**
 * Generate a row of 7 growth-stage snapshots for the plant timeline.
 * Returns ImageData[] at reduced size (16×16 each).
 */
export function generateGrowthTimeline(
  config: PlantConfig,
  time: number
): ImageData[] {
  const progressSteps = [0, 0.15, 0.3, 0.5, 0.7, 0.9, 1.0];
  const stages: GrowthStage[] = ["seed", "sprout", "growing", "growing", "growing", "mature", "mature"];

  return progressSteps.map((progress, i) => {
    const snapshotConfig: PlantConfig = {
      ...config,
      growthProgress: progress,
      growthStage: stages[i],
      stressLevel: 0,
      consecutiveKept: 0,
    };
    return generatePlantPixels(snapshotConfig, time, 16);
  });
}
