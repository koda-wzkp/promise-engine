import type { PlantState, GrowthStage, GrowthConfig } from "../types/garden";
import type { DurationTier } from "../types/personal";
import type { CheckInResponse } from "../types/check-in";
import { DEFAULT_GROWTH_CONFIG } from "../types/garden";

/**
 * Process a check-in response and update plant state.
 * Returns a new PlantState (immutable).
 */
export function processCheckIn(
  plant: PlantState,
  response: CheckInResponse,
  config: GrowthConfig = DEFAULT_GROWTH_CONFIG
): PlantState {
  const next = { ...plant };

  // Dead plants don't respond to check-ins
  if (plant.growthStage === "dead") return next;

  // Handle stress recovery first
  if (plant.growthStage === "stressed") {
    if (response === "kept") {
      next.stressLevel = Math.max(0, plant.stressLevel - config.stressRecoveryKept);
      next.consecutiveKept = plant.consecutiveKept + 1;
      next.consecutivePartials = 0;
      next.missedDays = 0;

      // Recover from stress if level drops enough
      if (next.stressLevel <= 0) {
        next.growthStage = plant.previousStage ?? "growing";
        next.stressLevel = 0;
      }
      return next;
    } else if (response === "partial") {
      next.stressLevel = Math.max(0, plant.stressLevel - config.stressRecoveryPartial);
      next.consecutiveKept = 0;
      next.consecutivePartials = plant.consecutivePartials + 1;
      next.missedDays = 0;

      if (next.stressLevel <= 0) {
        next.growthStage = plant.previousStage ?? "growing";
        next.stressLevel = 0;
      }
      return next;
    } else {
      // Missed while stressed
      next.missedDays = plant.missedDays + 1;
      next.consecutiveKept = 0;
      next.consecutivePartials = 0;

      const stressRate = config.stressRatePerDay[plant.durationTier];
      next.stressLevel = Math.min(1, plant.stressLevel + stressRate);

      if (next.stressLevel >= 1.0) {
        next.growthStage = "dead";
      }
      return next;
    }
  }

  // Normal growth processing
  if (response === "kept") {
    next.consecutiveKept = plant.consecutiveKept + 1;
    next.consecutivePartials = 0;
    next.missedDays = 0;

    const streakBonus = Math.min(
      next.consecutiveKept * config.streakBonusPerConsecutive,
      config.streakBonusCap
    );
    const value = config.keptValue * (1 + streakBonus);
    next.growthProgress = plant.growthProgress + value / getThreshold(plant);

    // Check stage advancement
    if (next.growthProgress >= 1.0) {
      const advanced = advanceStage(next.growthStage, plant.reclaimsStumpOf !== undefined);
      if (advanced) {
        next.growthStage = advanced;
        next.growthProgress = 0;
      } else {
        // At mature — cap at 1.0
        next.growthProgress = 1.0;
      }
    }
  } else if (response === "partial") {
    next.consecutiveKept = 0;
    next.consecutivePartials = plant.consecutivePartials + 1;
    next.missedDays = 0;

    const value = config.partialValue;
    next.growthProgress = plant.growthProgress + value / getThreshold(plant);

    if (next.growthProgress >= 1.0) {
      const advanced = advanceStage(next.growthStage, plant.reclaimsStumpOf !== undefined);
      if (advanced) {
        next.growthStage = advanced;
        next.growthProgress = 0;
      } else {
        next.growthProgress = 1.0;
      }
    }

    // 3 consecutive partials triggers mild stress
    if (next.consecutivePartials >= config.consecutivePartialsBeforeStress) {
      next.stressLevel = Math.min(1, plant.stressLevel + 0.1);
    }
  } else {
    // Missed
    next.consecutiveKept = 0;
    next.consecutivePartials = 0;
    next.missedDays = plant.missedDays + 1;

    const grace = config.stressGracePeriod[plant.durationTier];
    if (next.missedDays > grace) {
      const stressRate = config.stressRatePerDay[plant.durationTier];
      const daysOverGrace = next.missedDays - grace;
      next.stressLevel = Math.min(1, daysOverGrace * stressRate);

      if (next.stressLevel > 0 && plant.growthStage !== "seed") {
        next.previousStage = plant.growthStage;
        next.growthStage = "stressed";
      }

      if (next.stressLevel >= 1.0) {
        next.growthStage = "dead";
      }
    }
  }

  return next;
}

/**
 * Apply missed-day stress for days with no check-in.
 * Called during garden state recomputation for days the user didn't check in.
 */
export function applyMissedDay(
  plant: PlantState,
  config: GrowthConfig = DEFAULT_GROWTH_CONFIG
): PlantState {
  return processCheckIn(plant, "missed", config);
}

/**
 * Mark a plant as dead (abandoned by user).
 */
export function abandonPlant(plant: PlantState): PlantState {
  return {
    ...plant,
    growthStage: "dead",
    stressLevel: 1.0,
  };
}

/**
 * Create a reclaimed plant from a dead stump.
 */
export function reclaimPlant(
  deadPlant: PlantState,
  newPromiseId: string,
  newDomain: PlantState["domain"],
  newDurationTier: PlantState["durationTier"],
  newStakesTier: PlantState["stakesTier"]
): PlantState {
  return {
    promiseId: newPromiseId,
    domain: newDomain,
    durationTier: newDurationTier,
    stakesTier: newStakesTier,
    growthStage: "reclaimed",
    growthProgress: 0,
    stressLevel: 0,
    consecutiveKept: 0,
    consecutivePartials: 0,
    missedDays: 0,
    position: deadPlant.position, // Grow from same position
    reclaimsStumpOf: deadPlant.promiseId,
  };
}

// ─── HELPERS ───

function getThreshold(plant: PlantState, config: GrowthConfig = DEFAULT_GROWTH_CONFIG): number {
  const thresholds = config.stageThresholds[plant.durationTier];
  switch (plant.growthStage) {
    case "seed":
      return thresholds.seedToSprout;
    case "sprout":
      return thresholds.sproutToGrowing;
    case "growing":
    case "reclaimed":
      return thresholds.growingToMature;
    default:
      return thresholds.growingToMature;
  }
}

function advanceStage(current: GrowthStage, isReclaimed: boolean): GrowthStage | null {
  switch (current) {
    case "seed":
      return "sprout";
    case "sprout":
      return "growing";
    case "growing":
      return "mature";
    case "reclaimed":
      // Reclaimed follows: reclaimed -> growing -> mature
      return "growing";
    case "mature":
      return null; // Terminal state
    default:
      return null;
  }
}

/**
 * Create initial plant state for a new promise.
 */
export function createPlantState(
  promiseId: string,
  domain: PlantState["domain"],
  durationTier: PlantState["durationTier"],
  stakesTier: PlantState["stakesTier"],
  position: { x: number; y: number },
  reclaimsStumpOf?: string
): PlantState {
  return {
    promiseId,
    domain,
    durationTier,
    stakesTier,
    growthStage: reclaimsStumpOf ? "reclaimed" : "seed",
    growthProgress: 0,
    stressLevel: 0,
    consecutiveKept: 0,
    consecutivePartials: 0,
    missedDays: 0,
    position,
    reclaimsStumpOf,
  };
}
