// ─── STATUS ───
export type PromiseStatus =
  | "verified"      // On track, evidence confirms
  | "declared"      // Announced/committed, not yet verifiable
  | "degraded"      // Behind schedule or partially failing
  | "violated"      // Off track, commitment broken
  | "unverifiable"; // No verification mechanism exists

// ─── AGENT ───
export type AgentType =
  | "legislator" | "utility" | "regulator" | "community"
  | "auditor" | "provider" | "stakeholder" | "certifier"
  | "brand" | "monitor";

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
  | "none";        // No verification mechanism

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
}

// ─── INSIGHT ───
export type InsightSeverity = "critical" | "warning" | "positive";
export type InsightType = "Cascade" | "Gap" | "Conflict" | "Working" | "Drift";

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
  trajectories: Trajectory[];
  grade: string;
  gradeExplanation: string;
}
