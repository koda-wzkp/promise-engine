import { Promise, Agent } from "./promise";
import { NetworkHealthScore } from "./simulation";

export interface TeamMember extends Agent {
  type: "stakeholder";
  role?: string;
  activePromiseCount: number;
  keptRate: number;
  loadScore: number;
}

export interface TeamPromise extends Promise {
  isTeam: true;
  estimatedHours?: number;
  actualHours?: number;
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
}
