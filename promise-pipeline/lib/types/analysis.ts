import { PromiseStatus } from "./promise";

// ── EPIDEMIOLOGY ──

export interface SuperspreaderScore {
  promiseId: string;
  directDependents: number;
  domainsSpanned: number;
  communitiesBridged: number;
  /** directDependents × domainsSpanned × communitiesBridged */
  score: number;
}

export interface EpidemiologyMetrics {
  /** Mean direct dependents per promise. >1 = cascades propagate on average. */
  R0: number;
  /** R₀ computed only for non-leaf promises (those with ≥1 dependent). */
  R0_hubs: number;
  /** R₀ adjusted for current verification state. Dynamic cascade risk. */
  Re: number;
  /** Fraction of promises that must be verified to contain cascades (1 - 1/R₀). 0 if R₀ ≤ 1. */
  herdImmunityThreshold: number;
  /** Number of currently verified promises. */
  verifiedCount: number;
  /** Number of additional promises needing verification to reach herd immunity. */
  verificationsNeeded: number;
  /** Per-promise superspreader potential scores, sorted by score descending. */
  superspreaderScores: SuperspreaderScore[];
  /** Is the network in a cascade-prone state? (Rₑ > 1) */
  cascadeProne: boolean;
}

// ── RELIABILITY / FMEA ──

export interface FMEAEntry {
  promiseId: string;
  promiseBody: string;
  domain: string;
  /** 1–10: cascade depth × domain health impact */
  severity: number;
  /** 1–10: inverse of actor reliability (or status-based heuristic) */
  occurrence: number;
  /** 1–10: verification method quality (sensor=1, none=10) */
  detection: number;
  /** Severity × Occurrence × Detection */
  RPN: number;
  priority: "critical" | "high" | "medium" | "low";
  /** Human-readable explanation of why this RPN is what it is */
  explanation: string;
}

export interface ReliabilityMetrics {
  /** FMEA table sorted by RPN descending */
  fmea: FMEAEntry[];
  /** Top 5 highest-RPN promises */
  criticalPromises: FMEAEntry[];
  /** Probabilistic network reliability estimate (0–1). Geometric mean of per-promise reliabilities. */
  networkReliability: number;
  /** Per-promise reliability estimate based on status + verification */
  promiseReliabilities: Record<string, number>;
}

// ── INFORMATION THEORY ──

export interface InformationMetrics {
  /** Sum of per-promise channel capacities (bits) */
  actualChannelCapacity: number;
  /** Maximum possible if every promise had sensor verification (bits) */
  maxChannelCapacity: number;
  /** actualChannelCapacity / maxChannelCapacity (0–1) */
  capacityRatio: number;
  /** Max capacity minus actual capacity (bits). The information that can't be observed. */
  verificationGapBits: number;
  /** Percentage of network state that is unobservable (0–100) */
  unobservablePercent: number;
  /** Per-verification-method capacity breakdown */
  capacityByMethod: Record<
    string,
    { count: number; capacityPerPromise: number; totalCapacity: number }
  >;
  /** Conditional entropy H(status | domain) — how much domain predicts status */
  conditionalEntropyByDomain: Record<string, number>;
  /** Information gained by knowing domain: H(status) - H(status|domain) */
  domainInformationGain: number;
  /** Overall Shannon entropy H(status) */
  statusEntropy: number;
}

// ── GAME THEORY / STRATEGY ──

export interface AgencyCostEntry {
  promiseId: string;
  promiseBody: string;
  promiser: string;
  /** 0–1: probability of promiser behaving differently under imperfect monitoring */
  moralHazard: number;
  /** Verification method quality score (0–1, where 1 = perfect monitoring) */
  verificationQuality: number;
  /** Number of downstream dependents */
  downstreamCount: number;
  /** moralHazard × (1 + downstreamCount × 0.2) */
  agencyCost: number;
  /** Is the verification mechanism incentive-compatible? */
  incentiveCompatible: "yes" | "partial" | "no";
  /** Human-readable explanation */
  explanation: string;
}

export interface StrategyMetrics {
  /** Per-promise agency cost, sorted by cost descending */
  agencyCosts: AgencyCostEntry[];
  /** Top 5 highest agency cost promises */
  highestAgencyCost: AgencyCostEntry[];
  /** Incentive compatibility summary */
  incentiveCompatibility: {
    compatible: number;
    partial: number;
    incompatible: number;
    total: number;
  };
  /** Per-agent average moral hazard across their promises */
  agentMoralHazard: Record<string, number>;
}

// ── BAYESIAN / PROBABILISTIC ──

export type StatusDistribution = Record<PromiseStatus, number>;

export interface HeuristicCPTEntry {
  promiseId: string;
  /** Probability distribution over statuses given current parent states */
  posterior: StatusDistribution;
  /** The parent promise IDs and their current statuses that produced this posterior */
  parentStates: Record<string, PromiseStatus>;
  /** Most likely status */
  mostLikelyStatus: PromiseStatus;
  /** Confidence in the most likely status (0–1) */
  confidence: number;
}

export interface ProbabilisticCascadeResult {
  query: { promiseId: string; newStatus: PromiseStatus };
  /** Per-promise posterior status distributions after the hypothetical change */
  posteriors: Record<string, StatusDistribution>;
  /** Promises where the most likely status changed from the actual */
  affectedPromises: Array<{
    promiseId: string;
    originalStatus: PromiseStatus;
    mostLikelyNewStatus: PromiseStatus;
    confidence: number;
    cascadeDepth: number;
  }>;
  /** Network health as expected value over posterior distributions */
  expectedNetworkHealth: number;
  /** Original network health for comparison */
  originalNetworkHealth: number;
}

// ── COMBINED DIAGNOSTIC ──

export interface FiveFieldDiagnostic {
  epidemiology: EpidemiologyMetrics;
  reliability: ReliabilityMetrics;
  information: InformationMetrics;
  strategy: StrategyMetrics;
  /** Only populated when a What If query is provided */
  probabilistic?: ProbabilisticCascadeResult;
}
