// ─── STATUS ───
// Base statuses (HB 2021 and general use)
// Extended statuses (ACA: historical legislation with 15+ year track records)
export type PromiseStatus =
  | "verified"            // On track, evidence confirms
  | "declared"            // Announced/committed, not yet verifiable
  | "degraded"            // Behind schedule or partially failing
  | "violated"            // Off track, commitment broken
  | "unverifiable"        // No verification mechanism exists
  | "kept"                // Promise fulfilled with measurable evidence
  | "broken"              // Promise clearly not met
  | "partial"             // Partially fulfilled
  | "delayed"             // Implemented late or still pending
  | "modified"            // Changed from original commitment
  | "legally_challenged"  // Subject to legal challenge affecting implementation
  | "repealed";           // Legislatively or administratively reversed

// ─── AGENT ───
export type AgentType =
  | "legislator" | "utility" | "regulator" | "community"
  | "auditor" | "provider" | "stakeholder" | "certifier"
  | "brand" | "monitor"
  | "executive" | "insurer" | "judiciary" | "federal";

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  short: string;
}

// ─── VERIFICATION ───
export type VerificationMethod =
  | "filing"       // Regulatory filing
  | "audit"        // Third-party audit
  | "self-report"  // Self-assessed
  | "sensor"       // Automated sensor/API (future)
  | "benchmark"    // Standardized benchmark
  | "none"         // No verification mechanism
  | "data"         // Public data/statistics
  | "legal";       // Court ruling / legal record

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
}

// ─── ACA-SPECIFIC EXTENSIONS ───
export interface OutcomeData {
  metric: string;
  target: string | number;
  actual: string | number;
  source: string;
}

export interface LegalChallenge {
  case: string;
  year: number;
  outcome: string;
  impact: string;
}

export interface StateVariance {
  description: string;
  statesAffected: number;
  details: string;
}

// ─── PROMISE ───
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
  // ACA extensions (optional — backward compatible)
  effectiveDate?: string;
  nodeType?: "promise" | "modifier";
  outcomeData?: OutcomeData[];
  legalChallenges?: LegalChallenge[];
  stateVariance?: StateVariance;
}

// ─── INSIGHT ───
export type InsightSeverity = "critical" | "warning" | "positive";
export type InsightType = "Cascade" | "Gap" | "Conflict" | "Working" | "Drift" | "Legal" | "Paradox";

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

export interface TrajectoryMilestone {
  value: number;
  label: string;
  color?: string;
}

export interface Trajectory {
  agentId: string;
  label: string;
  subtitle?: string;
  yAxisLabel?: string;
  yDomain?: [number, number];
  milestones?: TrajectoryMilestone[];
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
  trajectories: Trajectory[];
  grade: string;
  gradeExplanation: string;
}
