import { Promise, PromiseStatus } from "./promise";

export type PersonalDomain =
  | "health"
  | "work"
  | "relationships"
  | "creative"
  | "financial";

export type DurationTier = "short" | "medium" | "long";
// short = this week (fast-growing annuals, wildflowers)
// medium = this month/quarter (shrubs, small trees)
// long = this year+ (hardwood trees, slow growth, massive at maturity)

export type StakesTier = "low" | "medium" | "high";
// low = ground cover, grasses
// medium = shrubs, flowering trees
// high = canopy trees that tower over everything

export type CheckInFrequency =
  | { type: "daily" }
  | { type: "specific_days"; days: number[] } // 0=Sun, 1=Mon, ..., 6=Sat
  | { type: "weekly"; day: number }
  | { type: "monthly"; day: number }; // Day of month (1-28)

export interface PersonalPromise extends Promise {
  isPersonal: true;
  promisee: string; // "self" | person's name | group name
  domain: PersonalDomain;
  durationTier: DurationTier;
  stakesTier: StakesTier;
  checkInFrequency: CheckInFrequency;
  reflection?: string;
  renegotiatedFrom?: string;
  renegotiatedAt?: string;
  completedAt?: string;
  abandonedAt?: string;
  reclaimedBy?: string; // Promise ID of the promise that reclaimed this stump
  reclaims?: string; // Promise ID of the stump this promise grew from
  notes?: string;
  targetDate?: string; // ISO date
  createdAt: string;
  updatedAt: string;
}

// Status mapping for personal use
export const personalStatusLabels: Record<string, string> = {
  verified: "Kept",
  declared: "Active",
  degraded: "At Risk",
  violated: "Broken",
  unverifiable: "Unknown",
};

// Domain display metadata
export const domainMeta: Record<
  PersonalDomain,
  { label: string; icon: string; plantFamily: string; description: string }
> = {
  health: {
    label: "Health",
    icon: "heart",
    plantFamily: "Fruit-bearing",
    description: "Berry bushes, fruit shrubs, apple/cherry trees",
  },
  work: {
    label: "Work",
    icon: "briefcase",
    plantFamily: "Hardwoods",
    description: "Oak seedlings, young oaks, mature oaks",
  },
  relationships: {
    label: "Relationships",
    icon: "users",
    plantFamily: "Flowering",
    description: "Wildflowers, flowering shrubs, magnolia/dogwood",
  },
  creative: {
    label: "Creative",
    icon: "palette",
    plantFamily: "Unusual/wild",
    description: "Mushrooms, ferns, vines, weeping willows, birch",
  },
  financial: {
    label: "Financial",
    icon: "coins",
    plantFamily: "Evergreens",
    description: "Pine seedlings, young pines, mature conifers",
  },
};

// Duration tier metadata
export const durationMeta: Record<
  DurationTier,
  { label: string; description: string; defaultFrequency: CheckInFrequency }
> = {
  short: {
    label: "This week",
    description: "Fast-growing annuals, wildflowers",
    defaultFrequency: { type: "daily" },
  },
  medium: {
    label: "This month/quarter",
    description: "Shrubs, small trees",
    defaultFrequency: { type: "weekly", day: 0 },
  },
  long: {
    label: "This year+",
    description: "Full canopy trees",
    defaultFrequency: { type: "weekly", day: 0 },
  },
};

// Stakes tier metadata
export const stakesMeta: Record<
  StakesTier,
  { label: string; description: string }
> = {
  low: { label: "Low", description: "Ground cover, grasses, small plants" },
  medium: { label: "Medium", description: "Shrubs, flowering trees" },
  high: { label: "High", description: "Canopy trees that tower over everything" },
};
