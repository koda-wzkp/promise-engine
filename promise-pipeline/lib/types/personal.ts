import { Promise, PromiseStatus, PromiseFactory } from "./promise";

export interface PersonalPromise extends Promise {
  isPersonal: true;
  origin: "voluntary";
  promisee: string;
  reflection?: string | null;
  renegotiatedFrom?: string;
  completedAt?: string | null;
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
    case "physics":    return 0.90;  // post-verification computing regime (MONA Not met k=0.90, N=1,510)
    case "ecological": return 0.67;  // active-verification cluster mean (MONA overall k=0.667, N=69,847)
    case "composting": return 0.39;  // low-verification cluster mean (ECHO k=0.393, N=63; OSHA k=0.395, N=13)
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

  // ─── Phase 2: Nesting + Dependencies ─────────────────────────────────────
  /** IDs of sub-promises created under this promise */
  children: string[];
  /** Parent promise ID, or null if this is a root promise */
  parent: string | null;
  // Note: depends_on is inherited from Promise base type (string[])

  // ─── Phase 2: Sensor Integration ─────────────────────────────────────────
  sensor: SensorConnection | null;

  // ─── Phase 2: Accountability Partner ─────────────────────────────────────
  partner: AccountabilityPartner | null;
}

// ─── V2: SENSOR INTEGRATION ──────────────────────────────────────────────────

export type SensorType = "apple-health" | "google-fit" | "screen-time" | "calendar";

export interface SensorThresholdConfig {
  operator: "<=" | ">=" | "==" | "<" | ">";
  value: number;
  /** Human-readable unit: "sessions/week", "hour", "minutes/day" */
  unit: string;
}

export interface SensorConnection {
  type: SensorType;
  /** What is being measured: "workout_sessions", "sleep_start_hour", etc. */
  metric: string;
  threshold: SensorThresholdConfig;
  connectedAt: string;
  lastSync: string | null;
  /**
   * Web fallback: user-provided simulation value.
   * Real HealthKit / Google Fit reads require a native app layer.
   * When set, SENSOR_UPDATE uses this to determine verified/degraded.
   */
  simulatedValue: number | null;
}

// ─── V2: ACCOUNTABILITY PARTNER ──────────────────────────────────────────────

export interface PartnerVisibility {
  /** Partner can read the promise body text */
  showBody: boolean;
  /** Partner can see sub-promises (root system) */
  showSubPromises: boolean;
}

export interface AccountabilityPartner {
  /** Local UUID until real Supabase auth is wired */
  partnerId: string;
  partnerEmail: string;
  partnerName: string;
  inviteStatus: "pending" | "accepted" | "declined";
  /** Token embedded in the shareable invite URL */
  inviteToken: string;
  visibility: PartnerVisibility;
  invitedAt: string;
  acceptedAt: string | null;
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
