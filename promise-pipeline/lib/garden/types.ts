/**
 * Garden-specific types for the procedural plant renderer.
 * Mirrors the subset of promise-garden types needed by the renderer.
 */

export type PersonalDomain =
  | "health"
  | "work"
  | "relationships"
  | "creative"
  | "financial";

export type DurationTier = "short" | "medium" | "long";
export type StakesTier = "low" | "medium" | "high";

export type GrowthStage =
  | "seed"
  | "sprout"
  | "growing"
  | "mature"
  | "stressed"
  | "dead"
  | "reclaimed";

export interface PlantState {
  promiseId: string;
  domain: PersonalDomain;
  durationTier: DurationTier;
  stakesTier: StakesTier;
  growthStage: GrowthStage;
  growthProgress: number;
  stressLevel: number;
  consecutiveKept: number;
  consecutivePartials: number;
  missedDays: number;
  position: { x: number; y: number };
  reclaimsStumpOf?: string;
  previousStage?: GrowthStage;
}
