import { Promise, Agent, PromiseStatus, PromiseOrigin, PromiseFactory } from "./promise";
import { NetworkHealthScore } from "./simulation";

export interface TeamMember extends Agent {
  type: "team-member";
  role?: string;
  activePromiseCount: number;
  keptRate: number;
  mtkp: number;
  loadScore: number;
}

export interface TeamPromise extends Promise {
  isTeam: true;
  origin: PromiseOrigin;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  priority?: "critical" | "high" | "normal" | "low";
}

export interface TeamDashboardData {
  teamName: string;
  members: TeamMember[];
  promises: TeamPromise[];
  health: NetworkHealthScore;
  domains: string[];
  recentActivity: {
    promiseId: string;
    action: "created" | "kept" | "broken" | "renegotiated" | "degraded";
    timestamp: string;
    memberId: string;
  }[];
}

/**
 * A team objective — a promise factory at the team scale.
 * OKRs: the objective is the factory, key results are children.
 * Status computed from weighted KRs, not assigned directly.
 *
 * Examples:
 *   "Improve customer retention" → reduce churn to 3%, launch onboarding, weekly check-ins
 *   "Ship v2.0" → complete auth, migrate DB, update docs, pass load test
 */
export interface TeamObjective extends PromiseFactory {
  isTeam: true;
  isFactory: true;
  /** The team member or leader who owns this objective */
  owner: string; // TeamMember ID
  /** Quarter/period this objective covers */
  period?: string; // e.g., "2026-Q2"
  /** Key Results are the child promises */
  // childPromises inherited from PromiseFactory
  completionCondition: {
    type: "weighted"; // OKRs typically use weighted KRs
    weights: Record<string, number>; // Per-KR importance
  };
}

export interface CapacityQuery {
  newPromise: Partial<TeamPromise>;
  assignee: string;
}

export interface CapacityResult {
  canAbsorb: boolean;
  newMemberLoad: number;
  atRiskPromises: string[];
  healthImpact: number;
  recommendation: string;

  // Utilization impact from queueing theory
  utilizationImpact?: {
    before: number;       // team utilization before the new promise
    after: number;        // projected utilization after
    memberBefore: number; // assignee utilization before
    memberAfter: number;  // assignee utilization after
  };
}
