import type { GardenState, PlantState, GrowthStage, SkyState } from "../types/garden";
import type { PersonalDomain } from "../types/personal";
import { getPlantDefinition, getPlantDimensions } from "./plants";
import { worldToIso, getGardenBounds } from "./layout";
import { plantVariation, hashSeed, seededRandom } from "../utils/noise";
import { domainPlantColors, skyColors, groundColors, stageColors } from "../utils/colors";
import { wildlifeRegistry } from "./wildlife";

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  camera: { x: number; y: number; zoom: number };
  time: number; // For animations
  reducedMotion: boolean;
}

/**
 * Main render function — draws the entire garden scene.
 */
export function renderGarden(rc: RenderContext, state: GardenState): void {
  const { ctx, width, height, camera } = rc;

  ctx.clearRect(0, 0, width, height);
  ctx.save();

  // Apply camera transform
  ctx.translate(width / 2, height / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  // Draw layers back to front
  renderSky(rc, state.landscape.skyState);
  renderGround(rc, state);
  renderStream(rc, state);
  renderDependencyRoots(rc, state);

  // Sort plants by y-position for depth ordering (back to front in isometric)
  const sorted = [...state.plants].sort((a, b) => {
    const aIso = worldToIso(a.position.x, a.position.y);
    const bIso = worldToIso(b.position.x, b.position.y);
    return aIso.sy - bIso.sy;
  });

  for (const plant of sorted) {
    renderPlant(rc, plant);
  }

  renderWildlife(rc, state);

  ctx.restore();
}

// ─── SKY ───

function renderSky(rc: RenderContext, skyState: SkyState): void {
  const { ctx, width, height, camera } = rc;
  const colors = skyColors[skyState];

  // Sky fills the viewport, not affected by camera
  ctx.save();
  ctx.resetTransform();

  const gradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
  gradient.addColorStop(0, colors.top);
  gradient.addColorStop(1, colors.bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height * 0.6);

  ctx.restore();

  // Re-apply camera transform
  ctx.save();
}

// ─── GROUND ───

function renderGround(rc: RenderContext, state: GardenState): void {
  const { ctx } = rc;
  const bounds = getGardenBounds(state.plants);
  const reliability = state.landscape.overallReliability;

  // Interpolate ground color based on reliability
  let groundColor: string;
  if (reliability < 0.3) {
    groundColor = groundColors.barren;
  } else if (reliability < 0.6) {
    groundColor = groundColors.warming;
  } else if (reliability < 0.85) {
    groundColor = groundColors.grassy;
  } else {
    groundColor = groundColors.lush;
  }

  // Draw isometric ground plane
  const isoTL = worldToIso(bounds.minX, bounds.minY);
  const isoTR = worldToIso(bounds.maxX, bounds.minY);
  const isoBR = worldToIso(bounds.maxX, bounds.maxY);
  const isoBL = worldToIso(bounds.minX, bounds.maxY);

  ctx.fillStyle = groundColor;
  ctx.beginPath();
  ctx.moveTo(isoTL.sx, isoTL.sy);
  ctx.lineTo(isoTR.sx, isoTR.sy);
  ctx.lineTo(isoBR.sx, isoBR.sy);
  ctx.lineTo(isoBL.sx, isoBL.sy);
  ctx.closePath();
  ctx.fill();

  // Ground texture: subtle darker patches
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 20; i++) {
    const seed = hashSeed(`ground-${i}`);
    const wx = bounds.minX + seededRandom(seed) * bounds.width;
    const wy = bounds.minY + seededRandom(seed + 1) * bounds.height;
    const iso = worldToIso(wx, wy);
    const size = 10 + seededRandom(seed + 2) * 30;

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(iso.sx, iso.sy, size, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── STREAM ───

function renderStream(rc: RenderContext, state: GardenState): void {
  if (!state.landscape.hasStream) return;

  const { ctx, time, reducedMotion } = rc;
  const flow = state.landscape.streamFlow;
  const bounds = getGardenBounds(state.plants);

  ctx.save();
  ctx.globalAlpha = 0.4 + flow * 0.4;
  ctx.strokeStyle = "#4A90D9";
  ctx.lineWidth = 3 + flow * 4;
  ctx.lineCap = "round";

  // Bezier stream path across the garden
  const startIso = worldToIso(bounds.minX + bounds.width * 0.2, bounds.minY);
  const endIso = worldToIso(bounds.maxX - bounds.width * 0.2, bounds.maxY);
  const midX = (startIso.sx + endIso.sx) / 2;
  const midY = (startIso.sy + endIso.sy) / 2;

  const waveOffset = reducedMotion ? 0 : Math.sin(time * 0.001) * 10;

  ctx.beginPath();
  ctx.moveTo(startIso.sx, startIso.sy);
  ctx.quadraticCurveTo(midX + waveOffset, midY - 30, endIso.sx, endIso.sy);
  ctx.stroke();

  // Shimmer highlight
  ctx.strokeStyle = "#87CEEB";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(startIso.sx + 2, startIso.sy - 1);
  ctx.quadraticCurveTo(midX + waveOffset + 2, midY - 31, endIso.sx + 2, endIso.sy - 1);
  ctx.stroke();

  ctx.restore();
}

// ─── DEPENDENCY ROOTS ───

function renderDependencyRoots(rc: RenderContext, state: GardenState): void {
  const { ctx, time, reducedMotion } = rc;
  const plantMap = new Map(state.plants.map((p) => [p.promiseId, p]));

  // We need promise data for depends_on — roots are drawn between plant positions
  // The garden state stores plants with positions; dependencies come from promises
  // For now, draw roots between plants that share domain and are close together
  // Full dependency rendering requires promise data to be passed in

  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = "#8B7355";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);

  ctx.restore();
}

// ─── PLANT RENDERING ───

function renderPlant(rc: RenderContext, plant: PlantState): void {
  const { ctx, time, reducedMotion } = rc;
  const iso = worldToIso(plant.position.x, plant.position.y);
  const dims = getPlantDimensions(plant);
  const variation = plantVariation(plant.promiseId);
  const colors = domainPlantColors[plant.domain];

  ctx.save();
  ctx.translate(iso.sx, iso.sy);

  // Apply sway animation (disabled for reduced motion)
  if (!reducedMotion && plant.growthStage !== "dead" && plant.growthStage !== "seed") {
    const swayAmount = plant.growthStage === "stressed" ? 0.5 : 1.5;
    const seed = hashSeed(plant.promiseId);
    const sway = Math.sin(time * 0.002 + seed) * swayAmount;
    ctx.rotate((sway * Math.PI) / 180);
  }

  // Apply trunk lean
  ctx.rotate((variation.trunkLean * Math.PI) / 180);

  switch (plant.growthStage) {
    case "seed":
      renderSeed(ctx, dims, colors);
      break;
    case "sprout":
      renderSprout(ctx, dims, colors, variation);
      break;
    case "growing":
      renderGrowingPlant(ctx, plant, dims, colors, variation);
      break;
    case "mature":
      renderMaturePlant(ctx, plant, dims, colors, variation);
      break;
    case "stressed":
      renderStressedPlant(ctx, plant, dims, colors, variation);
      break;
    case "dead":
      renderDeadPlant(ctx, dims);
      break;
    case "reclaimed":
      renderReclaimedPlant(ctx, plant, dims, colors, variation);
      break;
  }

  ctx.restore();
}

function renderSeed(
  ctx: CanvasRenderingContext2D,
  dims: ReturnType<typeof getPlantDimensions>,
  colors: typeof domainPlantColors.health
): void {
  // Small mound of dirt
  ctx.fillStyle = "#8B7355";
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Seed dot
  ctx.fillStyle = "#5C4A32";
  ctx.beginPath();
  ctx.arc(0, -2, 2, 0, Math.PI * 2);
  ctx.fill();
}

function renderSprout(
  ctx: CanvasRenderingContext2D,
  dims: ReturnType<typeof getPlantDimensions>,
  colors: typeof domainPlantColors.health,
  variation: ReturnType<typeof plantVariation>
): void {
  // Soil mound
  ctx.fillStyle = "#8B7355";
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Thin stem
  ctx.strokeStyle = "#4ADE80";
  ctx.lineWidth = dims.trunkWidth || 1;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -dims.height);
  ctx.stroke();

  // Single small leaf
  ctx.fillStyle = colors.canopy[0];
  ctx.beginPath();
  ctx.ellipse(
    dims.canopyRadius * 0.3,
    -dims.height,
    dims.canopyRadius,
    dims.canopyRadius * 0.6,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function renderGrowingPlant(
  ctx: CanvasRenderingContext2D,
  plant: PlantState,
  dims: ReturnType<typeof getPlantDimensions>,
  colors: typeof domainPlantColors.health,
  variation: ReturnType<typeof plantVariation>
): void {
  // Trunk
  ctx.fillStyle = colors.trunk;
  ctx.beginPath();
  ctx.moveTo(-dims.trunkWidth / 2, 0);
  ctx.lineTo(-dims.trunkWidth / 3, -dims.height * 0.6);
  ctx.lineTo(dims.trunkWidth / 3, -dims.height * 0.6);
  ctx.lineTo(dims.trunkWidth / 2, 0);
  ctx.closePath();
  ctx.fill();

  // Canopy — species-dependent shape
  const cr = dims.canopyRadius;
  const canopyY = -dims.height;

  // Streak saturation bonus
  const satBoost = Math.min(plant.consecutiveKept * 0.05, 0.15);

  renderCanopy(ctx, dims.def.leafShape, cr, canopyY, colors, variation, satBoost);

  // Flowers if applicable
  if (dims.def.hasFlowers) {
    renderFlowers(ctx, cr, canopyY, colors.flower, variation, 3);
  }
}

function renderMaturePlant(
  ctx: CanvasRenderingContext2D,
  plant: PlantState,
  dims: ReturnType<typeof getPlantDimensions>,
  colors: typeof domainPlantColors.health,
  variation: ReturnType<typeof plantVariation>
): void {
  // Full trunk with bark texture
  const tw = dims.trunkWidth;
  ctx.fillStyle = colors.trunk;
  ctx.beginPath();
  ctx.moveTo(-tw / 2, 0);
  ctx.quadraticCurveTo(-tw / 2.5, -dims.height * 0.3, -tw / 3, -dims.height * 0.6);
  ctx.lineTo(tw / 3, -dims.height * 0.6);
  ctx.quadraticCurveTo(tw / 2.5, -dims.height * 0.3, tw / 2, 0);
  ctx.closePath();
  ctx.fill();

  // Bark texture lines
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 4; i++) {
    const seed = hashSeed(plant.promiseId + `-bark-${i}`);
    const x = (-tw / 3) + seededRandom(seed) * (tw * 0.66);
    ctx.beginPath();
    ctx.moveTo(x, -dims.height * 0.1 * (i + 1));
    ctx.lineTo(x + seededRandom(seed + 1) * 3, -dims.height * 0.1 * (i + 2));
    ctx.stroke();
  }

  // Full canopy
  const cr = dims.canopyRadius;
  const canopyY = -dims.height;
  const satBoost = Math.min(plant.consecutiveKept * 0.05, 0.15);

  renderCanopy(ctx, dims.def.leafShape, cr, canopyY, colors, variation, satBoost);

  // Flowers
  if (dims.def.hasFlowers) {
    renderFlowers(ctx, cr, canopyY, colors.flower, variation, 6);
  }

  // Fruit
  if (dims.def.hasFruit) {
    renderFruit(ctx, cr, canopyY, colors.fruit, variation);
  }
}

function renderStressedPlant(
  ctx: CanvasRenderingContext2D,
  plant: PlantState,
  dims: ReturnType<typeof getPlantDimensions>,
  colors: typeof domainPlantColors.health,
  variation: ReturnType<typeof plantVariation>
): void {
  // Draw like growing/mature but desaturated + yellowing
  ctx.save();

  // Desaturation effect
  ctx.globalAlpha = 0.7;

  // Trunk
  ctx.fillStyle = colors.trunk;
  ctx.beginPath();
  ctx.moveTo(-dims.trunkWidth / 2, 0);
  ctx.lineTo(-dims.trunkWidth / 3, -dims.height * 0.6);
  ctx.lineTo(dims.trunkWidth / 3, -dims.height * 0.6);
  ctx.lineTo(dims.trunkWidth / 2, 0);
  ctx.closePath();
  ctx.fill();

  // Stressed canopy — amber shifted
  const cr = dims.canopyRadius * (1 - plant.stressLevel * 0.3); // Shrinking
  const canopyY = -dims.height;

  // Use stressed colors
  ctx.fillStyle = stageColors.stressed.primary;
  ctx.beginPath();
  ctx.ellipse(0, canopyY, cr, cr * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Drooping effect — lower the canopy slightly
  ctx.fillStyle = stageColors.stressed.secondary;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.ellipse(0, canopyY + cr * 0.2, cr * 0.8, cr * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function renderDeadPlant(
  ctx: CanvasRenderingContext2D,
  dims: ReturnType<typeof getPlantDimensions>
): void {
  // Grey bare trunk/stump
  ctx.fillStyle = stageColors.dead.primary;
  ctx.beginPath();
  ctx.moveTo(-dims.trunkWidth / 2, 0);
  ctx.lineTo(-dims.trunkWidth / 4, -dims.height * 0.4);
  ctx.lineTo(dims.trunkWidth / 4, -dims.height * 0.4);
  ctx.lineTo(dims.trunkWidth / 2, 0);
  ctx.closePath();
  ctx.fill();

  // Bare branches
  ctx.strokeStyle = stageColors.dead.secondary;
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, -dims.height * 0.4);
  ctx.lineTo(-dims.canopyRadius * 0.4, -dims.height * 0.6);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -dims.height * 0.35);
  ctx.lineTo(dims.canopyRadius * 0.3, -dims.height * 0.55);
  ctx.stroke();

  // Stump top
  ctx.fillStyle = stageColors.dead.secondary;
  ctx.beginPath();
  ctx.ellipse(0, -dims.height * 0.4, dims.trunkWidth / 3, dims.trunkWidth / 6, 0, 0, Math.PI * 2);
  ctx.fill();
}

function renderReclaimedPlant(
  ctx: CanvasRenderingContext2D,
  plant: PlantState,
  dims: ReturnType<typeof getPlantDimensions>,
  colors: typeof domainPlantColors.health,
  variation: ReturnType<typeof plantVariation>
): void {
  // Dead stump base (nurse log)
  ctx.fillStyle = stageColors.dead.primary;
  ctx.beginPath();
  ctx.moveTo(-dims.trunkWidth * 0.8, 0);
  ctx.lineTo(-dims.trunkWidth * 0.5, -dims.height * 0.25);
  ctx.lineTo(dims.trunkWidth * 0.5, -dims.height * 0.25);
  ctx.lineTo(dims.trunkWidth * 0.8, 0);
  ctx.closePath();
  ctx.fill();

  // New green growth emerging from stump
  ctx.fillStyle = colors.canopy[0];
  ctx.beginPath();
  ctx.moveTo(0, -dims.height * 0.25);
  ctx.lineTo(0, -dims.height * 0.6);
  ctx.stroke();

  // New sprout on stump
  ctx.strokeStyle = "#4ADE80";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -dims.height * 0.25);
  ctx.lineTo(0, -dims.height * 0.6);
  ctx.stroke();

  // Small leaf cluster at top
  ctx.fillStyle = colors.canopy[0];
  ctx.beginPath();
  ctx.ellipse(0, -dims.height * 0.6, dims.canopyRadius * 0.5, dims.canopyRadius * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── SHARED RENDERING HELPERS ───

function renderCanopy(
  ctx: CanvasRenderingContext2D,
  leafShape: string,
  radius: number,
  y: number,
  colors: typeof domainPlantColors.health,
  variation: ReturnType<typeof plantVariation>,
  satBoost: number
): void {
  // Main canopy body
  ctx.fillStyle = colors.canopy[0];

  switch (leafShape) {
    case "needle":
      // Conical (evergreen)
      ctx.beginPath();
      ctx.moveTo(0, y - radius * 0.8);
      ctx.lineTo(-radius, y + radius * 0.3);
      ctx.lineTo(radius, y + radius * 0.3);
      ctx.closePath();
      ctx.fill();
      // Second layer
      ctx.fillStyle = colors.canopy[1] ?? colors.canopy[0];
      ctx.beginPath();
      ctx.moveTo(0, y - radius * 0.5);
      ctx.lineTo(-radius * 0.75, y + radius * 0.5);
      ctx.lineTo(radius * 0.75, y + radius * 0.5);
      ctx.closePath();
      ctx.fill();
      break;

    case "fern":
      // Feathery, spreading
      for (let i = 0; i < 5; i++) {
        const angle = ((i - 2) / 2) * 0.6;
        ctx.save();
        ctx.translate(0, y);
        ctx.rotate(angle);
        ctx.fillStyle = colors.canopy[i % colors.canopy.length];
        ctx.beginPath();
        ctx.ellipse(0, -radius * 0.3, radius * 0.25, radius * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      break;

    case "pointed":
      // Elongated oval
      ctx.beginPath();
      ctx.ellipse(0, y, radius * 0.7, radius, 0, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = colors.canopy[1] ?? colors.canopy[0];
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.ellipse(-radius * 0.1, y - radius * 0.2, radius * 0.4, radius * 0.6, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;

    case "broad":
    case "round":
    default:
      // Round canopy (most common)
      ctx.beginPath();
      ctx.ellipse(0, y, radius, radius * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      // Depth — darker inner shadow
      ctx.fillStyle = colors.canopy[1] ?? colors.canopy[0];
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.ellipse(radius * 0.1, y + radius * 0.1, radius * 0.7, radius * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // Light highlight
      ctx.fillStyle = colors.canopy[2] ?? colors.canopy[0];
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.ellipse(-radius * 0.2, y - radius * 0.2, radius * 0.3, radius * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
  }
}

function renderFlowers(
  ctx: CanvasRenderingContext2D,
  canopyRadius: number,
  canopyY: number,
  flowerColor: string,
  variation: ReturnType<typeof plantVariation>,
  count: number
): void {
  ctx.fillStyle = flowerColor;
  const seed = Math.round(variation.canopyScale * 1000);

  for (let i = 0; i < count; i++) {
    const angle = seededRandom(seed + i) * Math.PI * 2;
    const dist = seededRandom(seed + i + 100) * canopyRadius * 0.7;
    const x = Math.cos(angle) * dist;
    const y = canopyY + Math.sin(angle) * dist * 0.6;
    const size = 2 + seededRandom(seed + i + 200) * 2;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderFruit(
  ctx: CanvasRenderingContext2D,
  canopyRadius: number,
  canopyY: number,
  fruitColor: string,
  variation: ReturnType<typeof plantVariation>
): void {
  ctx.fillStyle = fruitColor;
  const seed = Math.round(variation.branchAngle * 100);

  // 3-5 fruit hanging near bottom of canopy
  const count = 3 + Math.round(seededRandom(seed) * 2);
  for (let i = 0; i < count; i++) {
    const x = (seededRandom(seed + i + 50) - 0.5) * canopyRadius * 1.2;
    const y = canopyY + canopyRadius * 0.3 + seededRandom(seed + i + 150) * canopyRadius * 0.4;
    const size = 3 + seededRandom(seed + i + 250) * 2;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── WILDLIFE ───

function renderWildlife(rc: RenderContext, state: GardenState): void {
  const { ctx, time, reducedMotion } = rc;

  for (const wildlifeId of state.wildlife) {
    const species = wildlifeRegistry.find((s) => s.id === wildlifeId);
    if (!species) continue;

    // Position wildlife near their domain cluster
    const domainPlants = state.plants.filter((p) => p.domain === species.domain);
    if (domainPlants.length === 0) continue;

    // Pick a plant to position near
    const targetPlant = domainPlants[0];
    const iso = worldToIso(targetPlant.position.x, targetPlant.position.y);
    const seed = hashSeed(wildlifeId);

    // Offset from plant
    const ox = seededRandom(seed) * 60 - 30;
    const oy = seededRandom(seed + 1) * 30 - 15;

    // Simple animated offset (small movement loop)
    const animOffset = reducedMotion
      ? 0
      : Math.sin(time * 0.001 + seed) * 5;

    ctx.save();
    ctx.translate(iso.sx + ox + animOffset, iso.sy + oy - 10);

    // Simple wildlife representation (colored dot/shape)
    renderWildlifeSprite(ctx, species.assetKey, species.tier, time, reducedMotion);

    ctx.restore();
  }
}

function renderWildlifeSprite(
  ctx: CanvasRenderingContext2D,
  assetKey: string,
  tier: string,
  time: number,
  reducedMotion: boolean
): void {
  const size = tier === "thriving" ? 8 : tier === "mid" ? 5 : 3;

  // Simple shapes representing wildlife (to be replaced with sprites in v2)
  switch (assetKey) {
    case "bees":
    case "butterflies":
    case "hummingbirds":
    case "fireflies":
    case "chickadees":
      // Flying creatures — small dots with wing-like shapes
      ctx.fillStyle = assetKey === "fireflies" ? "#FDE68A" : "#4B5563";
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();
      // Wings
      if (!reducedMotion) {
        const wingFlap = Math.sin(time * 0.01) * 0.5;
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.ellipse(-size, -size * 0.5, size, size * 0.5 * (1 + wingFlap), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(size, -size * 0.5, size, size * 0.5 * (1 - wingFlap), 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case "songbirds":
    case "paired-birds":
    case "woodpecker":
    case "owl":
    case "hawk":
      // Birds — teardrop body with triangle beak
      ctx.fillStyle = "#374151";
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 1.5, size, 0, 0, Math.PI * 2);
      ctx.fill();
      // Beak
      ctx.fillStyle = "#F59E0B";
      ctx.beginPath();
      ctx.moveTo(size * 1.5, 0);
      ctx.lineTo(size * 2.5, -1);
      ctx.lineTo(size * 2.5, 1);
      ctx.closePath();
      ctx.fill();
      break;

    case "squirrels":
      ctx.fillStyle = "#92400E";
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 1.2, size, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tail
      ctx.beginPath();
      ctx.arc(-size * 1.5, -size, size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "fox":
    case "deer":
    case "cougar":
      // Larger animals — body + head
      ctx.fillStyle = assetKey === "fox" ? "#DC2626" : assetKey === "cougar" ? "#A16207" : "#92400E";
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 2, size * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.arc(size * 2, -size * 0.5, size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "frogs":
      ctx.fillStyle = "#16A34A";
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 1.2, size, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = "#FDE68A";
      ctx.beginPath();
      ctx.arc(-size * 0.4, -size, 2, 0, Math.PI * 2);
      ctx.arc(size * 0.4, -size, 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "heron":
      // Tall wading bird
      ctx.fillStyle = "#6B7280";
      ctx.beginPath();
      ctx.ellipse(0, 0, size, size * 2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Long neck
      ctx.strokeStyle = "#6B7280";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -size * 2);
      ctx.lineTo(size, -size * 3.5);
      ctx.stroke();
      break;

    default:
      ctx.fillStyle = "#6B7280";
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();
  }
}

/**
 * Hit test — find which plant was tapped at screen coordinates.
 */
export function hitTestPlant(
  state: GardenState,
  screenX: number,
  screenY: number,
  camera: { x: number; y: number; zoom: number },
  canvasWidth: number,
  canvasHeight: number
): PlantState | null {
  // Convert screen to world coordinates
  const wx = (screenX - canvasWidth / 2) / camera.zoom + camera.x;
  const wy = (screenY - canvasHeight / 2) / camera.zoom + camera.y;

  let closest: PlantState | null = null;
  let closestDist = Infinity;

  for (const plant of state.plants) {
    const iso = worldToIso(plant.position.x, plant.position.y);
    const dims = getPlantDimensions(plant);
    const hitRadius = Math.max(dims.canopyRadius, 15);

    const dx = wx - iso.sx;
    const dy = wy - (iso.sy - dims.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < hitRadius && dist < closestDist) {
      closest = plant;
      closestDist = dist;
    }
  }

  return closest;
}
