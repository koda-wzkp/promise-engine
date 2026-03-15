import type { PersonalDomain, DurationTier, StakesTier } from "../types/personal";
import type { GrowthStage, PlantState } from "../types/garden";
import { domainPlantColors, stageColors } from "../utils/colors";
import { plantVariation, seededRange, hashSeed } from "../utils/noise";

// ─── PLANT REGISTRY ───
// Maps (domain, durationTier, stakesTier) -> plant definition.
// This registry pattern is designed for the v2 artist marketplace.

export interface PlantDefinition {
  name: string;
  family: string;
  trunkWidth: { seed: number; sprout: number; growing: number; mature: number };
  canopyRadius: { seed: number; sprout: number; growing: number; mature: number };
  height: { seed: number; sprout: number; growing: number; mature: number };
  hasFruit: boolean;
  hasFlowers: boolean;
  leafShape: "round" | "pointed" | "needle" | "fern" | "broad";
}

const registry: Record<string, PlantDefinition> = {
  // ─── HEALTH (Fruit-bearing) ───
  "health-short-low": {
    name: "Herb sprout",
    family: "fruit-bearing",
    trunkWidth: { seed: 0, sprout: 1, growing: 2, mature: 3 },
    canopyRadius: { seed: 3, sprout: 6, growing: 10, mature: 14 },
    height: { seed: 4, sprout: 10, growing: 18, mature: 24 },
    hasFruit: false,
    hasFlowers: true,
    leafShape: "round",
  },
  "health-short-medium": {
    name: "Berry bush",
    family: "fruit-bearing",
    trunkWidth: { seed: 0, sprout: 2, growing: 3, mature: 5 },
    canopyRadius: { seed: 4, sprout: 8, growing: 14, mature: 20 },
    height: { seed: 5, sprout: 14, growing: 24, mature: 34 },
    hasFruit: true,
    hasFlowers: true,
    leafShape: "round",
  },
  "health-short-high": {
    name: "Strawberry patch",
    family: "fruit-bearing",
    trunkWidth: { seed: 0, sprout: 2, growing: 4, mature: 6 },
    canopyRadius: { seed: 6, sprout: 12, growing: 20, mature: 28 },
    height: { seed: 5, sprout: 12, growing: 20, mature: 28 },
    hasFruit: true,
    hasFlowers: true,
    leafShape: "broad",
  },
  "health-medium-low": {
    name: "Blueberry shrub",
    family: "fruit-bearing",
    trunkWidth: { seed: 0, sprout: 2, growing: 4, mature: 6 },
    canopyRadius: { seed: 4, sprout: 10, growing: 18, mature: 26 },
    height: { seed: 6, sprout: 18, growing: 32, mature: 44 },
    hasFruit: true,
    hasFlowers: true,
    leafShape: "round",
  },
  "health-medium-medium": {
    name: "Apple sapling",
    family: "fruit-bearing",
    trunkWidth: { seed: 0, sprout: 3, growing: 5, mature: 8 },
    canopyRadius: { seed: 5, sprout: 12, growing: 22, mature: 34 },
    height: { seed: 8, sprout: 24, growing: 44, mature: 60 },
    hasFruit: true,
    hasFlowers: true,
    leafShape: "round",
  },
  "health-medium-high": {
    name: "Cherry tree",
    family: "fruit-bearing",
    trunkWidth: { seed: 0, sprout: 3, growing: 6, mature: 10 },
    canopyRadius: { seed: 6, sprout: 14, growing: 28, mature: 42 },
    height: { seed: 8, sprout: 28, growing: 52, mature: 72 },
    hasFruit: true,
    hasFlowers: true,
    leafShape: "round",
  },
  "health-long-low": {
    name: "Grape vine",
    family: "fruit-bearing",
    trunkWidth: { seed: 0, sprout: 2, growing: 4, mature: 6 },
    canopyRadius: { seed: 5, sprout: 14, growing: 26, mature: 38 },
    height: { seed: 6, sprout: 16, growing: 28, mature: 38 },
    hasFruit: true,
    hasFlowers: false,
    leafShape: "broad",
  },
  "health-long-medium": {
    name: "Pear tree",
    family: "fruit-bearing",
    trunkWidth: { seed: 0, sprout: 3, growing: 7, mature: 12 },
    canopyRadius: { seed: 6, sprout: 16, growing: 30, mature: 46 },
    height: { seed: 10, sprout: 30, growing: 58, mature: 80 },
    hasFruit: true,
    hasFlowers: true,
    leafShape: "round",
  },
  "health-long-high": {
    name: "Ancient apple tree",
    family: "fruit-bearing",
    trunkWidth: { seed: 0, sprout: 4, growing: 8, mature: 16 },
    canopyRadius: { seed: 8, sprout: 20, growing: 38, mature: 56 },
    height: { seed: 12, sprout: 36, growing: 68, mature: 100 },
    hasFruit: true,
    hasFlowers: true,
    leafShape: "round",
  },

  // ─── WORK (Hardwoods) ───
  "work-short-low": {
    name: "Grass tuft",
    family: "hardwoods",
    trunkWidth: { seed: 0, sprout: 1, growing: 2, mature: 2 },
    canopyRadius: { seed: 3, sprout: 6, growing: 10, mature: 14 },
    height: { seed: 3, sprout: 8, growing: 14, mature: 18 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "pointed",
  },
  "work-short-medium": {
    name: "Young birch",
    family: "hardwoods",
    trunkWidth: { seed: 0, sprout: 2, growing: 3, mature: 5 },
    canopyRadius: { seed: 4, sprout: 8, growing: 14, mature: 22 },
    height: { seed: 6, sprout: 16, growing: 28, mature: 40 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "pointed",
  },
  "work-short-high": {
    name: "Ash sapling",
    family: "hardwoods",
    trunkWidth: { seed: 0, sprout: 3, growing: 5, mature: 8 },
    canopyRadius: { seed: 5, sprout: 12, growing: 20, mature: 30 },
    height: { seed: 8, sprout: 22, growing: 38, mature: 52 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "pointed",
  },
  "work-medium-low": {
    name: "Oak seedling",
    family: "hardwoods",
    trunkWidth: { seed: 0, sprout: 2, growing: 5, mature: 8 },
    canopyRadius: { seed: 4, sprout: 10, growing: 20, mature: 30 },
    height: { seed: 6, sprout: 20, growing: 36, mature: 50 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "broad",
  },
  "work-medium-medium": {
    name: "Young oak",
    family: "hardwoods",
    trunkWidth: { seed: 0, sprout: 3, growing: 6, mature: 10 },
    canopyRadius: { seed: 5, sprout: 14, growing: 26, mature: 40 },
    height: { seed: 8, sprout: 26, growing: 50, mature: 68 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "broad",
  },
  "work-medium-high": {
    name: "Mature oak",
    family: "hardwoods",
    trunkWidth: { seed: 0, sprout: 4, growing: 8, mature: 14 },
    canopyRadius: { seed: 6, sprout: 16, growing: 32, mature: 48 },
    height: { seed: 10, sprout: 30, growing: 58, mature: 82 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "broad",
  },
  "work-long-low": {
    name: "Hickory sapling",
    family: "hardwoods",
    trunkWidth: { seed: 0, sprout: 3, growing: 6, mature: 10 },
    canopyRadius: { seed: 5, sprout: 14, growing: 28, mature: 42 },
    height: { seed: 8, sprout: 24, growing: 46, mature: 66 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "pointed",
  },
  "work-long-medium": {
    name: "Walnut tree",
    family: "hardwoods",
    trunkWidth: { seed: 0, sprout: 4, growing: 8, mature: 14 },
    canopyRadius: { seed: 6, sprout: 18, growing: 34, mature: 52 },
    height: { seed: 10, sprout: 32, growing: 62, mature: 88 },
    hasFruit: true,
    hasFlowers: false,
    leafShape: "broad",
  },
  "work-long-high": {
    name: "Ancient oak",
    family: "hardwoods",
    trunkWidth: { seed: 0, sprout: 5, growing: 10, mature: 18 },
    canopyRadius: { seed: 8, sprout: 22, growing: 42, mature: 62 },
    height: { seed: 12, sprout: 40, growing: 76, mature: 110 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "broad",
  },

  // ─── RELATIONSHIPS (Flowering) ───
  "relationships-short-low": {
    name: "Wildflower",
    family: "flowering",
    trunkWidth: { seed: 0, sprout: 1, growing: 1, mature: 2 },
    canopyRadius: { seed: 3, sprout: 6, growing: 10, mature: 14 },
    height: { seed: 3, sprout: 8, growing: 16, mature: 22 },
    hasFruit: false,
    hasFlowers: true,
    leafShape: "round",
  },
  "relationships-short-medium": {
    name: "Lavender bush",
    family: "flowering",
    trunkWidth: { seed: 0, sprout: 2, growing: 3, mature: 4 },
    canopyRadius: { seed: 4, sprout: 8, growing: 14, mature: 20 },
    height: { seed: 5, sprout: 14, growing: 24, mature: 34 },
    hasFruit: false,
    hasFlowers: true,
    leafShape: "pointed",
  },
  "relationships-short-high": {
    name: "Rose bush",
    family: "flowering",
    trunkWidth: { seed: 0, sprout: 2, growing: 4, mature: 6 },
    canopyRadius: { seed: 5, sprout: 12, growing: 20, mature: 30 },
    height: { seed: 6, sprout: 16, growing: 28, mature: 40 },
    hasFruit: false,
    hasFlowers: true,
    leafShape: "round",
  },
  "relationships-medium-low": {
    name: "Hydrangea",
    family: "flowering",
    trunkWidth: { seed: 0, sprout: 2, growing: 4, mature: 6 },
    canopyRadius: { seed: 4, sprout: 10, growing: 20, mature: 30 },
    height: { seed: 6, sprout: 18, growing: 32, mature: 46 },
    hasFruit: false,
    hasFlowers: true,
    leafShape: "broad",
  },
  "relationships-medium-medium": {
    name: "Dogwood",
    family: "flowering",
    trunkWidth: { seed: 0, sprout: 3, growing: 6, mature: 10 },
    canopyRadius: { seed: 5, sprout: 14, growing: 26, mature: 38 },
    height: { seed: 8, sprout: 24, growing: 44, mature: 64 },
    hasFruit: false,
    hasFlowers: true,
    leafShape: "broad",
  },
  "relationships-medium-high": {
    name: "Magnolia",
    family: "flowering",
    trunkWidth: { seed: 0, sprout: 4, growing: 7, mature: 12 },
    canopyRadius: { seed: 6, sprout: 16, growing: 30, mature: 46 },
    height: { seed: 10, sprout: 28, growing: 54, mature: 76 },
    hasFruit: false,
    hasFlowers: true,
    leafShape: "broad",
  },
  "relationships-long-low": {
    name: "Jasmine vine",
    family: "flowering",
    trunkWidth: { seed: 0, sprout: 2, growing: 4, mature: 6 },
    canopyRadius: { seed: 5, sprout: 14, growing: 26, mature: 38 },
    height: { seed: 6, sprout: 18, growing: 32, mature: 44 },
    hasFruit: false,
    hasFlowers: true,
    leafShape: "round",
  },
  "relationships-long-medium": {
    name: "Wisteria",
    family: "flowering",
    trunkWidth: { seed: 0, sprout: 3, growing: 7, mature: 12 },
    canopyRadius: { seed: 6, sprout: 18, growing: 34, mature: 50 },
    height: { seed: 10, sprout: 30, growing: 60, mature: 84 },
    hasFruit: false,
    hasFlowers: true,
    leafShape: "round",
  },
  "relationships-long-high": {
    name: "Empress tree",
    family: "flowering",
    trunkWidth: { seed: 0, sprout: 5, growing: 10, mature: 16 },
    canopyRadius: { seed: 8, sprout: 22, growing: 40, mature: 58 },
    height: { seed: 12, sprout: 36, growing: 70, mature: 100 },
    hasFruit: false,
    hasFlowers: true,
    leafShape: "broad",
  },

  // ─── CREATIVE (Unusual/wild) ───
  "creative-short-low": {
    name: "Mushroom cluster",
    family: "wild",
    trunkWidth: { seed: 0, sprout: 2, growing: 3, mature: 4 },
    canopyRadius: { seed: 3, sprout: 6, growing: 10, mature: 14 },
    height: { seed: 3, sprout: 8, growing: 14, mature: 20 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "round",
  },
  "creative-short-medium": {
    name: "Fern patch",
    family: "wild",
    trunkWidth: { seed: 0, sprout: 1, growing: 2, mature: 3 },
    canopyRadius: { seed: 4, sprout: 10, growing: 16, mature: 24 },
    height: { seed: 4, sprout: 12, growing: 22, mature: 32 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "fern",
  },
  "creative-short-high": {
    name: "Wild orchid",
    family: "wild",
    trunkWidth: { seed: 0, sprout: 2, growing: 3, mature: 5 },
    canopyRadius: { seed: 5, sprout: 10, growing: 18, mature: 26 },
    height: { seed: 6, sprout: 14, growing: 26, mature: 38 },
    hasFruit: false,
    hasFlowers: true,
    leafShape: "broad",
  },
  "creative-medium-low": {
    name: "Moss carpet",
    family: "wild",
    trunkWidth: { seed: 0, sprout: 0, growing: 0, mature: 0 },
    canopyRadius: { seed: 5, sprout: 12, growing: 22, mature: 34 },
    height: { seed: 2, sprout: 4, growing: 6, mature: 8 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "round",
  },
  "creative-medium-medium": {
    name: "Climbing vine",
    family: "wild",
    trunkWidth: { seed: 0, sprout: 2, growing: 4, mature: 6 },
    canopyRadius: { seed: 5, sprout: 12, growing: 24, mature: 36 },
    height: { seed: 6, sprout: 20, growing: 40, mature: 58 },
    hasFruit: false,
    hasFlowers: true,
    leafShape: "fern",
  },
  "creative-medium-high": {
    name: "Birch tree",
    family: "wild",
    trunkWidth: { seed: 0, sprout: 3, growing: 5, mature: 8 },
    canopyRadius: { seed: 5, sprout: 14, growing: 26, mature: 40 },
    height: { seed: 8, sprout: 26, growing: 50, mature: 72 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "pointed",
  },
  "creative-long-low": {
    name: "Shelf fungus",
    family: "wild",
    trunkWidth: { seed: 0, sprout: 2, growing: 4, mature: 6 },
    canopyRadius: { seed: 4, sprout: 12, growing: 22, mature: 32 },
    height: { seed: 4, sprout: 10, growing: 18, mature: 26 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "round",
  },
  "creative-long-medium": {
    name: "Weeping willow",
    family: "wild",
    trunkWidth: { seed: 0, sprout: 4, growing: 8, mature: 14 },
    canopyRadius: { seed: 8, sprout: 20, growing: 38, mature: 56 },
    height: { seed: 10, sprout: 32, growing: 62, mature: 90 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "pointed",
  },
  "creative-long-high": {
    name: "Ancient banyan",
    family: "wild",
    trunkWidth: { seed: 0, sprout: 5, growing: 12, mature: 20 },
    canopyRadius: { seed: 10, sprout: 24, growing: 44, mature: 66 },
    height: { seed: 12, sprout: 38, growing: 72, mature: 105 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "broad",
  },

  // ─── FINANCIAL (Evergreens) ───
  "financial-short-low": {
    name: "Pine seedling",
    family: "evergreens",
    trunkWidth: { seed: 0, sprout: 1, growing: 2, mature: 3 },
    canopyRadius: { seed: 3, sprout: 6, growing: 10, mature: 14 },
    height: { seed: 4, sprout: 10, growing: 18, mature: 26 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "needle",
  },
  "financial-short-medium": {
    name: "Juniper bush",
    family: "evergreens",
    trunkWidth: { seed: 0, sprout: 2, growing: 3, mature: 5 },
    canopyRadius: { seed: 4, sprout: 10, growing: 16, mature: 24 },
    height: { seed: 5, sprout: 14, growing: 26, mature: 36 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "needle",
  },
  "financial-short-high": {
    name: "Holly bush",
    family: "evergreens",
    trunkWidth: { seed: 0, sprout: 2, growing: 4, mature: 6 },
    canopyRadius: { seed: 5, sprout: 12, growing: 20, mature: 30 },
    height: { seed: 6, sprout: 18, growing: 32, mature: 44 },
    hasFruit: true,
    hasFlowers: false,
    leafShape: "pointed",
  },
  "financial-medium-low": {
    name: "Spruce sapling",
    family: "evergreens",
    trunkWidth: { seed: 0, sprout: 2, growing: 4, mature: 7 },
    canopyRadius: { seed: 4, sprout: 10, growing: 20, mature: 30 },
    height: { seed: 6, sprout: 20, growing: 38, mature: 54 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "needle",
  },
  "financial-medium-medium": {
    name: "Young pine",
    family: "evergreens",
    trunkWidth: { seed: 0, sprout: 3, growing: 6, mature: 10 },
    canopyRadius: { seed: 5, sprout: 12, growing: 24, mature: 36 },
    height: { seed: 8, sprout: 26, growing: 50, mature: 70 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "needle",
  },
  "financial-medium-high": {
    name: "Cedar",
    family: "evergreens",
    trunkWidth: { seed: 0, sprout: 4, growing: 7, mature: 12 },
    canopyRadius: { seed: 6, sprout: 16, growing: 30, mature: 44 },
    height: { seed: 10, sprout: 30, growing: 56, mature: 80 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "needle",
  },
  "financial-long-low": {
    name: "Yew",
    family: "evergreens",
    trunkWidth: { seed: 0, sprout: 3, growing: 6, mature: 10 },
    canopyRadius: { seed: 5, sprout: 14, growing: 28, mature: 42 },
    height: { seed: 8, sprout: 22, growing: 42, mature: 60 },
    hasFruit: true,
    hasFlowers: false,
    leafShape: "needle",
  },
  "financial-long-medium": {
    name: "Sequoia",
    family: "evergreens",
    trunkWidth: { seed: 0, sprout: 4, growing: 10, mature: 16 },
    canopyRadius: { seed: 6, sprout: 18, growing: 34, mature: 52 },
    height: { seed: 12, sprout: 36, growing: 68, mature: 96 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "needle",
  },
  "financial-long-high": {
    name: "Ancient redwood",
    family: "evergreens",
    trunkWidth: { seed: 0, sprout: 6, growing: 12, mature: 20 },
    canopyRadius: { seed: 8, sprout: 22, growing: 42, mature: 60 },
    height: { seed: 14, sprout: 42, growing: 80, mature: 120 },
    hasFruit: false,
    hasFlowers: false,
    leafShape: "needle",
  },
};

/**
 * Look up a plant definition from the registry.
 */
export function getPlantDefinition(
  domain: PersonalDomain,
  durationTier: DurationTier,
  stakesTier: StakesTier
): PlantDefinition {
  const key = `${domain}-${durationTier}-${stakesTier}`;
  return registry[key] ?? registry["health-short-low"];
}

/**
 * Get current rendering dimensions for a plant at its current growth stage.
 */
export function getPlantDimensions(plant: PlantState): {
  trunkWidth: number;
  canopyRadius: number;
  height: number;
  def: PlantDefinition;
} {
  const def = getPlantDefinition(plant.domain, plant.durationTier, plant.stakesTier);
  const variation = plantVariation(plant.promiseId);

  const stage = plant.growthStage === "stressed" ? (plant.previousStage ?? "growing") :
    plant.growthStage === "dead" ? "mature" :
    plant.growthStage === "reclaimed" ? "sprout" :
    plant.growthStage;

  const sizeKey = (stage === "seed" || stage === "sprout" || stage === "growing" || stage === "mature")
    ? stage : "growing";

  // Interpolate between current stage and next stage based on growth progress
  const tw = def.trunkWidth[sizeKey];
  const cr = def.canopyRadius[sizeKey] * variation.canopyScale;
  const h = def.height[sizeKey];

  return { trunkWidth: tw, canopyRadius: cr, height: h, def };
}
