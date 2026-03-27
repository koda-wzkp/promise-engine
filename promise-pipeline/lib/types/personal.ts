import { Promise, PromiseStatus, PromiseFactory, VerificationSource } from "./promise";

// ─── EXISTING TYPES (preserved for backward compat) ───

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

export interface PersonalGoal extends PromiseFactory {
  isPersonal: true;
  isFactory: true;
  domain: PersonalDomain;
  durationTier: "long";
  completionCondition: {
    type: "threshold";
    threshold: number;
  };
}

// ─── K REGIME (v2) ───

export type KRegime = "composting" | "ecological" | "physics";

export function classifyKRegime(method: VerificationSource["method"]): KRegime {
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

export function expectedK(regime: KRegime): number {
  switch (regime) {
    case "physics":
      return 1.1;
    case "ecological":
      return 0.67;
    case "composting":
      return 0.37;
  }
}

// ─── GARDEN PROMISE (v2) ───

export interface CheckInEvent {
  timestamp: string; // ISO date
  statusBefore: PromiseStatus;
  statusAfter: PromiseStatus;
  note: string | null;
}

export interface GraftPoint {
  timestamp: string;
  previousBody: string;
  reason: string;
}

export interface Artifact {
  id: string;
  promiseId: string;
  generatedFrom: {
    kRegime: KRegime;
    verificationMethod: string;
    dwellTime: number; // days from declared to verified
    domain: string;
  };
  visual: {
    growthPattern: string;
    material: string;
    uniqueSeed: number;
  };
  giftedTo: string | null; // Phase 1: always null
  giftable: boolean; // Phase 1: always false
}

export interface GardenPromise extends Promise {
  // Personal extensions
  isPersonal: true;
  createdAt: string;
  visibility: "private"; // Phase 1: always private
  kRegime: KRegime;
  expectedK: number;

  // Check-in
  checkInFrequency: {
    userMin: number; // min days between check-ins (user-set)
    userMax: number; // max days between check-ins (user-set)
    adaptive: number; // computed optimal (days)
  };
  lastCheckIn: string | null; // ISO date
  checkInHistory: CheckInEvent[];

  // Garden rendering
  gardenPlot: string; // domain name
  plantSeed: number; // deterministic from ID hash
  graftHistory: GraftPoint[];
  fossilized: boolean;

  // Collection
  artifact: Artifact | null;
  completedAt: string | null;
  reflection: string | null;
}

// ─── GARDEN STATE (v2) ───

export interface PersonalStats {
  totalPromises: number;
  activePromises: number;
  keptCount: number;
  brokenCount: number;
  renegotiatedCount: number;
  keptRate: number;
  byDomain: Record<
    string,
    {
      total: number;
      active: number;
      kept: number;
      broken: number;
      keptRate: number;
      averageK: number;
    }
  >;
  kDistribution: {
    composting: number;
    ecological: number;
    physics: number;
  };
  gObsRate: number; // average check-ins per day across all promises
  gDecRate: number; // estimated decay rate (from domain baselines)
  // Legacy compat
  mtkp?: number;
  mtkpByDomain?: Record<string, number>;
  trend?: { month: string; keptRate: number }[];
}

export interface GardenState {
  promises: Record<string, GardenPromise>;
  domains: string[];
  stats: PersonalStats;
  onboardingComplete: boolean;
  tourComplete: boolean;
}

export type GardenAction =
  | { type: "CREATE_PROMISE"; promise: GardenPromise }
  | {
      type: "CHECK_IN";
      promiseId: string;
      newStatus: PromiseStatus;
      note?: string;
    }
  | { type: "RENEGOTIATE"; promiseId: string; newBody: string; reason?: string }
  | { type: "FOSSILIZE"; promiseId: string }
  | { type: "REVIVE"; promiseId: string }
  | { type: "COMPLETE"; promiseId: string; reflection?: string }
  | { type: "UPDATE_FREQUENCY"; promiseId: string; min: number; max: number }
  | { type: "COMPLETE_ONBOARDING" }
  | { type: "COMPLETE_TOUR" }
  | { type: "LOAD_STATE"; state: GardenState };

// ─── HELPERS ───

export function hashToSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function createGardenPromise(opts: {
  body: string;
  domain: string;
  verificationMethod: VerificationSource["method"];
  promisee?: string;
  checkInMin?: number;
  checkInMax?: number;
}): GardenPromise {
  const id = `PG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const kRegime = classifyKRegime(opts.verificationMethod);
  const k = expectedK(kRegime);

  return {
    id,
    isPersonal: true,
    promiser: "self",
    promisee: opts.promisee ?? "self",
    body: opts.body,
    domain: opts.domain.toLowerCase(),
    status: "declared",
    note: "",
    verification: { method: opts.verificationMethod },
    depends_on: [],
    polarity: "give",
    origin: "voluntary",
    createdAt: new Date().toISOString(),
    visibility: "private",
    kRegime,
    expectedK: k,
    checkInFrequency: {
      userMin: opts.checkInMin ?? 1,
      userMax: opts.checkInMax ?? 14,
      adaptive: 4, // default ~4 days
    },
    lastCheckIn: null,
    checkInHistory: [],
    gardenPlot: opts.domain.toLowerCase(),
    plantSeed: hashToSeed(id),
    graftHistory: [],
    fossilized: false,
    artifact: null,
    completedAt: null,
    reflection: null,
  };
}
