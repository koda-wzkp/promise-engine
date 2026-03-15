import { PersonalDomain, DurationTier, StakesTier } from "./personal";

// ─── PLANT LIFECYCLE ───

export type GrowthStage =
  | "seed" // Promise created. Small mound of dirt with seed visible.
  | "sprout" // First check-in completed. Green shoot breaking soil.
  | "growing" // Sustained check-ins, on track. Young plant, species identifiable.
  | "mature" // Promise kept / completed. Full-size for its duration tier.
  | "stressed" // Missed check-ins, falling behind. Yellowing, drooping, wilting.
  | "dead" // Promise broken. Bare trunk/stump, grey. Stays in garden.
  | "reclaimed"; // New promise growing from old stump. Dead wood with new green growth.

export interface PlantState {
  promiseId: string;
  domain: PersonalDomain;
  durationTier: DurationTier;
  stakesTier: StakesTier;
  growthStage: GrowthStage;
  growthProgress: number; // 0.0–1.0 progress toward next stage
  stressLevel: number; // 0.0–1.0 (0 = healthy, 1 = about to die)
  consecutiveKept: number; // Current streak (for subtle growth bonus)
  consecutivePartials: number; // Partial streak (3+ triggers mild stress)
  missedDays: number; // Days since last non-missed check-in (for stress timer)
  position: { x: number; y: number }; // Isometric grid position
  reclaimsStumpOf?: string; // Promise ID of the dead plant this grows from
  previousStage?: GrowthStage; // Stage before entering stressed (for recovery)
}

// ─── GROWTH CONFIG ───

export interface GrowthConfig {
  stageThresholds: Record<
    DurationTier,
    {
      seedToSprout: number;
      sproutToGrowing: number;
      growingToMature: number;
    }
  >;
  keptValue: number;
  partialValue: number;
  missedValue: number;
  stressGracePeriod: Record<DurationTier, number>;
  stressRatePerDay: Record<DurationTier, number>;
  streakBonusPerConsecutive: number;
  streakBonusCap: number;
  consecutivePartialsBeforeStress: number;
  stressRecoveryKept: number;
  stressRecoveryPartial: number;
}

export const DEFAULT_GROWTH_CONFIG: GrowthConfig = {
  stageThresholds: {
    short: { seedToSprout: 1, sproutToGrowing: 3, growingToMature: 5 },
    medium: { seedToSprout: 1, sproutToGrowing: 7, growingToMature: 14 },
    long: { seedToSprout: 1, sproutToGrowing: 14, growingToMature: 30 },
  },
  keptValue: 1.0,
  partialValue: 0.5,
  missedValue: 0.0,
  stressGracePeriod: { short: 1, medium: 3, long: 7 },
  stressRatePerDay: { short: 0.15, medium: 0.08, long: 0.04 },
  streakBonusPerConsecutive: 0.02,
  streakBonusCap: 0.2,
  consecutivePartialsBeforeStress: 3,
  stressRecoveryKept: 0.3,
  stressRecoveryPartial: 0.1,
};

// ─── WILDLIFE ───

export type WildlifeTier = "early" | "mid" | "thriving";

export interface WildlifeSpecies {
  id: string;
  name: string;
  domain: PersonalDomain;
  healthThreshold: number; // Domain reliability needed to appear (0.0–1.0)
  tier: WildlifeTier;
  departureThreshold: number; // Domain reliability below which they leave
  assetKey: string;
}

// ─── LANDSCAPE MILESTONES ───

export type LandscapeMilestone =
  | "clearing" // Starting state: bare dirt, stumps, grey sky
  | "first_green" // First plant reaches "growing"
  | "stream" // Overall reliability >= 70%
  | "clear_sky" // Overall reliability >= 85%
  | "golden_hour"; // Overall reliability >= 95% sustained 30 days

export type SkyState =
  | "stormy"
  | "overcast"
  | "clearing"
  | "clear"
  | "golden";

export interface GardenLandscapeState {
  currentMilestones: LandscapeMilestone[];
  overallReliability: number; // 0.0–1.0
  skyState: SkyState;
  hasStream: boolean;
  streamFlow: number; // 0.0–1.0 (visual intensity)
}

// ─── FULL GARDEN STATE ───

export interface GardenState {
  userId: string;
  plants: PlantState[];
  wildlife: string[]; // Currently present wildlife IDs
  landscape: GardenLandscapeState;
  lastComputedAt: string; // ISO timestamp
}

// ─── SUMMARY ───

export type SummaryType = "weekly" | "monthly";

export interface Summary {
  id: string;
  userId: string;
  type: SummaryType;
  periodStart: string;
  periodEnd: string;
  reliabilityByDomain: Record<string, number>;
  overallReliability: number;
  wildlifeChanges?: {
    gained: string[];
    lost: string[];
  };
  landscapeChanges?: string[];
  dependencyInsights?: string[];
  narrative?: string;
  userReflection?: string;
  createdAt: string;
}
