import { Promise, PromiseStatus, PromiseFactory } from "./promise";

export interface PersonalPromise extends Promise {
  isPersonal: true;
  origin: "voluntary";
  promisee: string;
  reflection?: string;
  renegotiatedFrom?: string;
  completedAt?: string;
  createdAt: string;
}

export type PersonalDomain =
  | "health"
  | "work"
  | "relationships"
  | "creative"
  | "financial";

/**
 * A personal goal — a promise factory at the individual scale.
 * Goals generate sub-promises (habits, milestones) and their status is
 * computed from children, not directly assigned.
 *
 * Examples:
 *   "Lose 30 pounds" → gym 3x/week, meal prep, sleep by 11pm
 *   "Write a novel" → write 500 words/day, outline chapters, join workshop
 */
export interface PersonalGoal extends PromiseFactory {
  isPersonal: true;
  isFactory: true;
  /** User-defined category for the goal */
  domain: PersonalDomain;
  /** Goals are always long-duration by definition */
  durationTier: "long";
  /** Goals use threshold completion by default — you don't need 100% of habits */
  completionCondition: {
    type: "threshold";
    threshold: number; // Default 0.7
  };
}

export interface PersonalStats {
  totalPromises: number;
  activePromises: number;
  keptRate: number;
  mtkp: number;
  mtkpByDomain: Record<string, number>;
  byDomain: Record<string, {
    total: number;
    kept: number;
    broken: number;
    active: number;
    keptRate: number;
    mtkp: number;
  }>;
  trend: { month: string; keptRate: number }[];
}

// ─── V2: K-REGIME ────────────────────────────────────────────────────────────

export type KRegime = "composting" | "ecological" | "physics";

export function classifyKRegime(
  method: import("./promise").VerificationMethod
): KRegime {
  switch (method) {
    case "sensor":
    case "audit":
    case "benchmark":
      return "physics";
    case "self-report":
    case "filing":
      return "ecological";
    case "none":
    default:
      return "composting";
  }
}

export function expectedKValue(regime: KRegime): number {
  switch (regime) {
    case "physics":    return 1.1;
    case "ecological": return 0.67;
    case "composting": return 0.37;
  }
}

// ─── V2: CHECK-IN / GRAFT HISTORY ────────────────────────────────────────────

export interface CheckInEvent {
  timestamp: string;
  statusBefore: import("./promise").PromiseStatus;
  statusAfter:  import("./promise").PromiseStatus;
  note: string | null;
}

export interface GraftPoint {
  timestamp: string;
  previousBody: string;
  reason: string;
}

// ─── V2: ARTIFACT ────────────────────────────────────────────────────────────

export interface Artifact {
  id: string;
  promiseId: string;
  generatedFrom: {
    kRegime: KRegime;
    verificationMethod: string;
    dwellTime: number;    // days from declared to kept/fossilized
    domain: string;
  };
  visual: {
    growthPattern: string;
    material: string;
    uniqueSeed: number;
  };
  giftedTo: string | null;  // Phase 1: always null
  giftable: boolean;         // Phase 1: always false
  createdAt: string;
}

// ─── V2: GARDEN PROMISE ──────────────────────────────────────────────────────

// GardenPromise extends PersonalPromise so it is structurally compatible with
// all v1 components (GardenView, ProceduralPlant, etc.) without casting.
export interface GardenPromise extends PersonalPromise {
  visibility: "private";     // Phase 1: always private
  kRegime: KRegime;
  expectedK: number;

  checkInFrequency: {
    userMin: number;    // min days between check-ins (user-set)
    userMax: number;    // max days between check-ins (user-set)
    adaptive: number;   // computed optimal (days)
  };
  lastCheckIn: string | null;    // ISO date
  checkInHistory: CheckInEvent[];

  gardenPlot: string;   // domain name
  plantSeed: number;    // deterministic from ID hash
  graftHistory: GraftPoint[];
  fossilized: boolean;

  artifact: Artifact | null;
  completedAt: string | null;
  reflection?: string | null;  // undefined | null | string all mean "no reflection yet"
}

// ─── V2: GARDEN STATS ────────────────────────────────────────────────────────

export interface GardenStatsV2 {
  totalPromises: number;
  activePromises: number;
  keptCount: number;
  brokenCount: number;
  renegotiatedCount: number;
  keptRate: number;
  byDomain: Record<string, {
    total: number;
    active: number;
    kept: number;
    broken: number;
    keptRate: number;
    averageK: number;
  }>;
  kDistribution: {
    composting: number;
    ecological: number;
    physics: number;
  };
  gObsRate: number;   // average check-ins/day across active promises
  gDecRate: number;   // baseline decay rate (0.25 from WGI/FH calibration)
}
