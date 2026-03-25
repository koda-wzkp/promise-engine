// ─── STATUS ───
export type PromiseStatus =
  | "verified"
  | "declared"
  | "degraded"
  | "violated"
  | "unverifiable";

// ─── POLARITY (v2.1) ───
export type PromisePolarity = "give" | "accept";

// ─── ORIGIN (v2.1) ───
export type PromiseOrigin =
  | "voluntary"
  | "imposed"
  | "negotiated";

// ─── VIOLATION TYPE (v2.1) ───
export type ViolationType =
  | "fault"
  | "flaw"
  | "abandoned"
  | "expired";

// ─── AGENT ───
export type AgentType =
  | "legislator" | "utility" | "regulator" | "community"
  | "auditor" | "provider" | "stakeholder" | "certifier"
  | "brand" | "monitor" | "team-member";

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  short: string;
}

// ─── VERIFICATION ───
export type VerificationMethod =
  | "filing"
  | "audit"
  | "self-report"
  | "sensor"
  | "benchmark"
  | "none";

export interface VerificationSource {
  method: VerificationMethod;
  source?: string;
  endpoint?: string;
  metric?: string;
  threshold?: {
    operator: "<=" | ">=" | "==" | "<" | ">";
    value: number;
  };
  frequency?: string;

  // Cryptographic verification commitment
  commitment?: {
    hash: string;           // SHA-256 hash of the source document or API response
    timestamp: string;      // ISO timestamp of when verification was performed
    sourceDigest: string;   // Human-readable description: "Oregon DEQ Filing Q3 2025"
  };

  // Verification dependency chain
  // The ID of a promise that must be kept for this verification to function.
  // If that promise degrades or is violated, this verification mechanism
  // is compromised — and the promise it verifies becomes less certain
  // even if its compliance status hasn't changed.
  dependsOnPromise?: string;
}

// ─── PROMISE (v2.1) ───
export interface Promise {
  id: string;
  ref?: string;
  promiser: string;
  promisee: string;
  body: string;
  domain: string;
  status: PromiseStatus;
  target?: string;
  progress?: number;
  required?: number;
  note: string;
  verification: VerificationSource;
  depends_on: string[];

  // v2.1 additions
  polarity?: PromisePolarity;
  scope?: string[];
  origin?: PromiseOrigin;
  violationType?: ViolationType;

  // Cryptographic layer (computed, not user-entered)
  _crypto?: {
    sha256Fingerprint?: string;    // 96 hex chars (header + content hash)
    poseidonHash?: string;         // Field element as hex string
  };
}

// ─── NETWORK FINGERPRINT ───
export interface NetworkFingerprint {
  sha256: string;        // SHA-256 of sorted SHA-256 fingerprints (64 hex)
  poseidonRoot: string;  // Poseidon Merkle root as hex string
  promiseCount: number;
  computedAt: string;    // ISO timestamp
}

// ─── PROMISE FACTORY ───
// A promise whose primary function is to generate and track child promises.
// First identified: Paris Agreement analysis (treaty as meta-promise architecture).
// Also applies at personal scale (goals) and team scale (OKRs/objectives).
//
// The factory's status is COMPUTED from its children's statuses,
// not assigned directly. The factory has no check-in of its own.
//
// Examples:
//   Civic:    Paris Agreement → NDCs → state legislation → utility plans
//   Personal: "Lose 30 pounds" → gym 3x/week, meal prep, sleep by 11pm
//   Team:     "Improve retention" → reduce churn to 3%, launch onboarding, weekly check-ins

export type FactoryCompletionType =
  | "all"        // All children must be verified for factory to be verified
  | "threshold"  // A percentage of children must be verified
  | "weighted";  // Children have different weights; weighted average determines status

export interface PromiseFactory extends Promise {
  /** Discriminant flag */
  isFactory: true;

  /** IDs of promises this factory has generated */
  childPromises: string[];

  /** How the factory's status is computed from its children */
  completionCondition: {
    type: FactoryCompletionType;
    /** For "threshold": fraction of children that must be verified (0–1). e.g., 0.7 = 70% */
    threshold?: number;
    /** For "weighted": per-child importance weights. Keys are child promise IDs. */
    weights?: Record<string, number>;
  };
}

/**
 * Type guard: is this promise a factory?
 */
export function isPromiseFactory(promise: Promise): promise is PromiseFactory {
  return "isFactory" in promise && (promise as PromiseFactory).isFactory === true;
}

// ─── THREAT (v2.1) ───
export interface Threat {
  id: string;
  triggerPromiseId: string;
  triggerCondition: PromiseStatus;
  affectedPromiseIds: string[];
  body: string;
  severity: InsightSeverity;
}

// ─── INSIGHT ───
export type InsightSeverity = "critical" | "warning" | "positive";
export type InsightType =
  | "Cascade"
  | "Gap"
  | "Conflict"
  | "Working"
  | "Drift"
  | "Threat"
  | "IncompleteBinding"
  | "ScopeGap"
  | "DesignFlaw";

export interface Insight {
  severity: InsightSeverity;
  type: InsightType;
  title: string;
  body: string;
  promises: string[];
}

// ─── TRAJECTORY ───
export interface TrajectoryPoint {
  year: number;
  actual?: number;
  projected?: number;
  target?: number;
}

export interface Trajectory {
  agentId: string;
  label: string;
  data: TrajectoryPoint[];
}

// ─── DOMAIN ───
export interface Domain {
  name: string;
  color: string;
  promiseCount: number;
  healthScore: number;
}

// ─── DASHBOARD ───
export interface DashboardData {
  title: string;
  subtitle: string;
  agents: Agent[];
  promises: Promise[];
  domains: Domain[];
  insights: Insight[];
  threats?: Threat[];
  trajectories: Trajectory[];
  grade: string;
  gradeExplanation: string;
}
