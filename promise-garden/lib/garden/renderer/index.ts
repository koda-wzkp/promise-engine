/**
 * Barrel export for the procedural plant renderer.
 *
 * Import from here in components:
 *   import { generatePlantPixels, PlantConfig, getSkyGradient } from "@/lib/garden/renderer"
 */

export type { PlantConfig } from "./plantGenerator";
export { generatePlantPixels, generateGrowthTimeline } from "./plantGenerator";
export { generateGroundCover } from "./groundCover";
export { generateReclaimedPlant } from "./reclaimedGrowth";

export type { RootConnection, RootParticle } from "./rootSystem";
export {
  drawRootSystem,
  spawnRootParticles,
  updateRootParticles,
} from "./rootSystem";

export type { FallingLeaf } from "./fallingLeaves";
export { spawnFallingLeaves, updateFallingLeaves } from "./fallingLeaves";

export type { AmbientParticle, AmbientParticleType } from "./skyWeather";
export {
  getSkyGradient,
  updateAmbientParticles,
  spawnAmbientParticles,
} from "./skyWeather";

export type { DomainPalette, RGB } from "./colors";
export {
  DOMAIN_PALETTES,
  hexToRGB,
  rgbToHex,
  desaturateForStress,
  getLeafFallColor,
} from "./colors";

export { seededRandom } from "./seededRandom";
