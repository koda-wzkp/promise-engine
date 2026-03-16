/**
 * Ground cover plant generators for low-stakes short-duration promises.
 *
 * These are NOT trees — they're small, ground-level plants that fill the
 * bottom 8–10 pixels of the 32×32 canvas. They add biodiversity and visual
 * texture between the taller promise plants.
 *
 * Domain → Ground Cover Type:
 *   health     → herb sprigs (small upright stems with tiny leaf pairs)
 *   work       → grass tufts (3–5 vertical lines of varying height)
 *   relationships → tiny wildflowers (short stems with 1px color dots)
 *   creative   → mushroom cluster (short stems with rounded caps)
 *   financial  → moss patch (low, spreading, textured horizontal fill)
 */

import type { PersonalDomain } from "../../types/personal";
import type { PlantConfig } from "./plantGenerator";
import { seededRandom } from "./seededRandom";
import { DOMAIN_PALETTES, desaturateForStress, hexToRGB } from "./colors";
import { setPixel, fillRect } from "./plantShapes";

/** Generate a ground-cover plant (low stakes, short duration). */
export function generateGroundCover(
  config: PlantConfig,
  time: number,
  canvasSize: number
): ImageData {
  const data = new ImageData(canvasSize, canvasSize);
  // Zero-initialized (transparent)

  const { domain, growthProgress, stressLevel, growthStage } = config;
  if (growthStage === "dead") {
    drawDeadGroundCover(data.data, config, canvasSize);
    return data;
  }

  switch (domain) {
    case "health":
      drawHerbSprigs(data.data, config, time, canvasSize);
      break;
    case "work":
      drawGrassTufts(data.data, config, time, canvasSize);
      break;
    case "relationships":
      drawWildflowers(data.data, config, time, canvasSize);
      break;
    case "creative":
      drawMushroomCluster(data.data, config, time, canvasSize);
      break;
    case "financial":
      drawMossPatch(data.data, config, canvasSize);
      break;
  }

  return data;
}

// ─── DOMAIN-SPECIFIC GROUND COVERS ───

/** Health: herb sprigs — small upright stems with tiny leaf pairs. */
function drawHerbSprigs(
  pixels: Uint8ClampedArray,
  config: PlantConfig,
  time: number,
  size: number
): void {
  const rand = seededRandom(config.promiseId);
  const palette = DOMAIN_PALETTES.health;
  const groundY = size - 1;
  const stress = config.stressLevel;
  const progress = config.growthProgress;

  const stemColor = desaturateForStress(palette.trunk[0], stress);
  const leafColors = palette.leaf.map((c) => desaturateForStress(c, stress));

  // 3–5 sprigs spread across the base
  const sprigCount = Math.max(2, Math.round(3 + rand() * 2));
  const spreadWidth = Math.round(size * 0.6);
  const startX = Math.round((size - spreadWidth) / 2);

  for (let i = 0; i < sprigCount; i++) {
    const sprigX = startX + Math.round(rand() * spreadWidth);
    const sprigH = Math.max(2, Math.round((3 + rand() * 4) * progress));

    // Stem
    for (let py = groundY; py > groundY - sprigH; py--) {
      setPixel(pixels, sprigX, py, stemColor.r, stemColor.g, stemColor.b, 255, size);
    }

    // Leaf pairs along the stem
    if (sprigH >= 3) {
      const leafColor = leafColors[Math.floor(rand() * leafColors.length)];
      const midY = groundY - Math.round(sprigH * 0.6);
      setPixel(pixels, sprigX - 1, midY, leafColor.r, leafColor.g, leafColor.b, 255, size);
      setPixel(pixels, sprigX + 1, midY, leafColor.r, leafColor.g, leafColor.b, 255, size);

      if (sprigH >= 5) {
        const topLeafColor = leafColors[Math.floor(rand() * leafColors.length)];
        const topY = groundY - sprigH + 1;
        setPixel(pixels, sprigX - 1, topY, topLeafColor.r, topLeafColor.g, topLeafColor.b, 255, size);
        setPixel(pixels, sprigX + 1, topY, topLeafColor.r, topLeafColor.g, topLeafColor.b, 255, size);
      }
    }
  }
}

/** Work: grass tufts — 3–5 vertical lines of varying heights. */
function drawGrassTufts(
  pixels: Uint8ClampedArray,
  config: PlantConfig,
  time: number,
  size: number
): void {
  const rand = seededRandom(config.promiseId);
  const palette = DOMAIN_PALETTES.work;
  const groundY = size - 1;
  const stress = config.stressLevel;
  const progress = config.growthProgress;

  const bladeColors = palette.leaf.map((c) => desaturateForStress(c, stress));

  // 3–5 grass blades
  const bladeCount = Math.max(2, Math.round(3 + rand() * 2));
  const spreadWidth = Math.round(size * 0.5);
  const startX = Math.round((size - spreadWidth) / 2);

  // Subtle sway (work grass sways less than other ground cover)
  const phase = seededRandom(config.promiseId + "sway")();
  const sway = Math.round(Math.sin(time * 0.0015 + phase * Math.PI * 2) * 0.6);

  for (let i = 0; i < bladeCount; i++) {
    const bladeX = startX + Math.round((i / (bladeCount - 1 || 1)) * spreadWidth);
    const bladeH = Math.max(1, Math.round((2 + rand() * 5) * progress));
    const color = bladeColors[Math.floor(rand() * bladeColors.length)];

    for (let py = groundY; py > groundY - bladeH; py--) {
      // Top of blade sways slightly
      const swayAt = py < groundY - bladeH + 2 ? sway : 0;
      setPixel(pixels, bladeX + swayAt, py, color.r, color.g, color.b, 255, size);
    }
  }
}

/** Relationships: tiny wildflowers — short stems with 1px color dots. */
function drawWildflowers(
  pixels: Uint8ClampedArray,
  config: PlantConfig,
  time: number,
  size: number
): void {
  const rand = seededRandom(config.promiseId);
  const palette = DOMAIN_PALETTES.relationships;
  const groundY = size - 1;
  const stress = config.stressLevel;
  const progress = config.growthProgress;

  const stemColor = desaturateForStress(palette.trunk[0], stress);
  const leafColors = palette.leaf.map((c) => desaturateForStress(c, stress));
  const flowerColors = palette.flower.map((c) => desaturateForStress(c, stress));

  const flowerCount = Math.max(1, Math.round(2 + rand() * 3));
  const spreadWidth = Math.round(size * 0.65);
  const startX = Math.round((size - spreadWidth) / 2);

  for (let i = 0; i < flowerCount; i++) {
    const flowerX = startX + Math.round(rand() * spreadWidth);
    const stemH = Math.max(2, Math.round((3 + rand() * 4) * progress));

    // Stem
    for (let py = groundY; py > groundY - stemH; py--) {
      setPixel(pixels, flowerX, py, stemColor.r, stemColor.g, stemColor.b, 255, size);
    }

    // Small leaf on side
    if (stemH >= 3 && leafColors.length > 0) {
      const leafColor = leafColors[Math.floor(rand() * leafColors.length)];
      const leafY = groundY - Math.round(stemH * 0.5);
      setPixel(pixels, flowerX + (rand() < 0.5 ? -1 : 1), leafY, leafColor.r, leafColor.g, leafColor.b, 255, size);
    }

    // Flower dot at top (appears when progress > 0.5 or mature)
    if (progress > 0.4 && flowerColors.length > 0) {
      const flowerColor = flowerColors[Math.floor(rand() * flowerColors.length)];
      const topY = groundY - stemH;
      setPixel(pixels, flowerX, topY, flowerColor.r, flowerColor.g, flowerColor.b, 255, size);
      // Tiny cross for a flower shape
      if (size >= 16) {
        setPixel(pixels, flowerX - 1, topY, flowerColor.r, flowerColor.g, flowerColor.b, 255, size);
        setPixel(pixels, flowerX + 1, topY, flowerColor.r, flowerColor.g, flowerColor.b, 255, size);
      }
    }
  }
}

/** Creative: mushroom cluster — short stems with rounded caps. */
function drawMushroomCluster(
  pixels: Uint8ClampedArray,
  config: PlantConfig,
  time: number,
  size: number
): void {
  const rand = seededRandom(config.promiseId);
  const palette = DOMAIN_PALETTES.creative;
  const groundY = size - 1;
  const stress = config.stressLevel;
  const progress = config.growthProgress;

  const stemColor = desaturateForStress("#C8B8A0", stress); // Pale cream stem
  const capColors = [
    desaturateForStress("#CE93D8", stress), // Light purple
    desaturateForStress("#7E57C2", stress), // Deep purple
    desaturateForStress("#26A69A", stress), // Teal
    desaturateForStress("#4DB6AC", stress), // Light teal
  ];

  const mushCount = Math.max(1, Math.round(2 + rand() * 2));
  const spreadWidth = Math.round(size * 0.55);
  const startX = Math.round((size - spreadWidth) / 2);

  for (let i = 0; i < mushCount; i++) {
    const mushX = startX + Math.round((i / (mushCount - 1 || 1)) * spreadWidth) + Math.round((rand() - 0.5) * 4);
    const stemH = Math.max(1, Math.round((2 + rand() * 3) * progress));
    const capW = Math.max(2, Math.round((2 + rand() * 3) * progress));
    const capColor = capColors[Math.floor(rand() * capColors.length)];

    // Stem
    for (let py = groundY; py > groundY - stemH; py--) {
      setPixel(pixels, mushX, py, stemColor.r, stemColor.g, stemColor.b, 255, size);
    }

    // Cap (wider than stem, slightly rounded)
    if (progress > 0.3) {
      const capY = groundY - stemH - 1;
      for (let dx = -capW; dx <= capW; dx++) {
        setPixel(pixels, mushX + dx, capY, capColor.r, capColor.g, capColor.b, 255, size);
        // Rounded cap underside
        if (Math.abs(dx) <= capW - 1) {
          setPixel(pixels, mushX + dx, capY - 1, capColor.r, capColor.g, capColor.b, 255, size);
        }
      }

      // White spots on cap
      if (progress > 0.6 && rand() < 0.6) {
        const spotY = capY - 1;
        setPixel(pixels, mushX, spotY, 230, 220, 210, 255, size);
        if (capW > 2) {
          setPixel(pixels, mushX + Math.round(capW * 0.5), capY, 230, 220, 210, 255, size);
        }
      }
    }
  }
}

/** Financial: moss patch — low, spreading, textured horizontal fill. */
function drawMossPatch(
  pixels: Uint8ClampedArray,
  config: PlantConfig,
  size: number
): void {
  const rand = seededRandom(config.promiseId);
  const palette = DOMAIN_PALETTES.financial;
  const groundY = size - 1;
  const stress = config.stressLevel;
  const progress = config.growthProgress;

  const mossColors = [
    desaturateForStress("#1B5E20", stress),
    desaturateForStress("#2E7D32", stress),
    desaturateForStress("#33691E", stress),
    desaturateForStress("#4CAF50", stress),
  ];

  // Moss grows from center outward as progress increases
  const spreadW = Math.round((4 + progress * 12) * (size / 32));
  const startX = Math.round((size - spreadW) / 2);
  const patchH = Math.max(1, Math.round((1 + progress * 3) * (size / 32)));

  for (let py = groundY; py >= groundY - patchH; py--) {
    for (let px = startX; px < startX + spreadW; px++) {
      // Textured: not every pixel filled — creates moss texture
      if (rand() > 0.35 + stress * 0.3) {
        const color = mossColors[Math.floor(rand() * mossColors.length)];
        setPixel(pixels, px, py, color.r, color.g, color.b, 255, size);
      }
    }
  }

  // Small bumps on top of the moss for 3D texture
  if (progress > 0.5) {
    for (let i = 0; i < 3; i++) {
      const bumpX = startX + Math.round(rand() * spreadW);
      const color = mossColors[1]; // Mid green
      setPixel(pixels, bumpX, groundY - patchH - 1, color.r, color.g, color.b, 255, size);
    }
  }
}

/** Dead ground cover: sparse, desaturated. */
function drawDeadGroundCover(
  pixels: Uint8ClampedArray,
  config: PlantConfig,
  size: number
): void {
  const rand = seededRandom(config.promiseId);
  const groundY = size - 1;
  const deadColor = hexToRGB("#9E9E9E");
  const spreadW = Math.round(size * 0.4);
  const startX = Math.round((size - spreadW) / 2);

  // Just a few grey stumps/stems
  for (let i = 0; i < 3; i++) {
    const sx = startX + Math.round(rand() * spreadW);
    const sh = Math.max(1, Math.round(1 + rand() * 3));
    for (let py = groundY; py > groundY - sh; py--) {
      setPixel(pixels, sx, py, deadColor.r, deadColor.g, deadColor.b, 255, size);
    }
  }
}

