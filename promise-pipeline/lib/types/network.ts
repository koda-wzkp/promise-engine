import { PromiseStatus, VerificationMethod, VerificationSource } from "./promise";
import { PromiseQualityEvaluation } from "./quality";

// ─── THE COMPOSABLE PRIMITIVE ───

export type NetworkScope =
  | "personal"     // Single agent, self-directed promises
  | "team"         // Small group, mutual promises
  | "org"          // Multi-team organization
  | "civic"        // Legislative/regulatory/institutional
  | "treaty"       // International/inter-sovereign
  | "custom";      // User-defined scope

export interface PromiseNetwork {
  id: string;                        // Globally unique: "net-" + nanoid(10)
  name: string;
  scope: NetworkScope;
  description?: string;

  // ─── AGENTS ───
  agents: NetworkAgent[];

  // ─── PROMISES ───
  promises: NetworkPromise[];

  // ─── DOMAINS ───
  domains: NetworkDomain[];

  // ─── CONFIGURATION ───
  config: NetworkConfig;

  // ─── METADATA ───
  createdAt: string;                 // ISO date
  updatedAt: string;                 // ISO date
  createdBy?: string;                // Agent ID of the network creator

  // ─── COMPOSITION ───
  parentNetworks?: string[];         // Network IDs
  childNetworks?: string[];          // Network IDs

  // ─── SCHEMA VERSION ───
  _schemaVersion: number;
}

// ─── NETWORK AGENT ───
// Extends the concept of Agent for network use, adding role and status

export type NetworkAgentType =
  | "individual"   // Personal scope: the user themselves
  | "member"       // Team/org scope: a team member
  | "external"     // External party (client, vendor, etc.)
  | "institution"  // Civic scope: government agency, utility, etc.
  | "legislator" | "utility" | "regulator" | "community"
  | "auditor" | "provider" | "stakeholder" | "certifier";

export interface NetworkAgent {
  id: string;
  name: string;
  type: NetworkAgentType;
  short: string;                     // Abbreviated label
  role?: string;                     // "Lead", "Developer", "Regulator", etc.
  active: boolean;                   // Can be deactivated without deletion
}

// ─── NETWORK PROMISE ───

export interface NetworkPromise {
  // ─── CORE FIELDS (from base Promise type) ───
  id: string;                        // Globally unique within network
  body: string;
  promiser: string;                  // Agent ID
  promisee: string;                  // Agent ID | "network" | "self" | external ref
  domain: string;                    // Domain ID
  status: PromiseStatus;
  ref?: string;                      // Statutory/document reference
  target?: string;                   // Deadline (ISO date)
  progress?: number;                 // 0-100
  required?: number;                 // Target threshold
  note?: string;                     // Evidence/explanation
  verification: VerificationSource;
  depends_on: string[];              // Promise IDs — can reference other networks

  // ─── LIFECYCLE ───
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  statusHistory: StatusChange[];

  // ─── NETWORK-AWARE FIELDS ───
  networkId: string;
  priority?: "critical" | "high" | "normal" | "low";
  tags?: string[];

  // ─── PERSONAL SCOPE EXTENSIONS ───
  reflection?: string;
  renegotiatedFrom?: string;
  renegotiatedAt?: string;
  recurring?: {
    frequency: "daily" | "weekly" | "biweekly" | "monthly";
    nextDue?: string;
  };

  // ─── QUALITY EVALUATION ───
  quality_evaluation?: PromiseQualityEvaluation;

  // ─── TEAM/ORG SCOPE EXTENSIONS ───
  estimatedHours?: number;
  actualHours?: number;
  assignedTo?: string;               // Agent ID (may differ from promiser)
}

export interface StatusChange {
  from: PromiseStatus;
  to: PromiseStatus;
  at: string;                        // ISO date
  by?: string;                       // Agent ID
  reason?: string;
}

// ─── NETWORK DOMAIN ───

export interface NetworkDomain {
  id: string;
  name: string;
  color: string;
  description?: string;
}

// ─── NETWORK CONFIGURATION ───

export interface NetworkConfig {
  // ─── HEALTH SCORING ───
  statusWeights: Record<string, number>;
  healthThresholds: {
    good: number;
    warning: number;
  };

  // ─── CAPACITY (team/org scopes) ───
  capacityThreshold?: number;
  capacityUrgencyMultiplier?: number;
  capacityDependencyMultiplier?: number;

  // ─── VERIFICATION DEFAULTS ───
  defaultVerificationMethod: VerificationMethod;

  // ─── STATUS LABELS ───
  statusLabels: Record<string, string>;

  // ─── VALID TRANSITIONS ───
  validTransitions: Record<string, string[]>;

  // ─── DATA CONTRIBUTION ───
  dataContribution: {
    enabled: boolean;
    domains: string[];
    since?: string;
  };

  // ─── DISPLAY ───
  theme?: {
    bg: string;
    accent: string;
  };
}

// ─── ACTIVITY ───

export type ActivityAction =
  | "created"
  | "status_changed"
  | "renegotiated"
  | "deleted"
  | "agent_added"
  | "agent_deactivated"
  | "domain_added"
  | "domain_removed"
  | "config_updated"
  | "imported";

export interface ActivityEntry {
  id: string;
  networkId: string;
  action: ActivityAction;
  timestamp: string;
  agentId?: string;
  promiseId?: string;
  details?: string;
}

// ─── APP SETTINGS ───

export interface AppSettings {
  activeNetworkId?: string;
  recentNetworks: string[];
  theme: "light" | "system";
  reducedMotion: boolean;
}

// ─── EXPORT FORMAT ───

export interface PromiseNetworkExport {
  format: "promise-network-export";
  version: 1;
  exportedAt: string;
  network: PromiseNetwork;
  activity: ActivityEntry[];
}

// ─── INPUT TYPES ───

export interface PromiseCreateInput {
  body: string;
  promiser: string;
  promisee: string;
  domain: string;
  target?: string;
  depends_on?: string[];
  priority?: "critical" | "high" | "normal" | "low";
  estimatedHours?: number;
  tags?: string[];
  recurring?: { frequency: "daily" | "weekly" | "biweekly" | "monthly" };
  verification?: Partial<VerificationSource>;
  quality_evaluation?: PromiseQualityEvaluation;
}

export interface StatusChangeContext {
  reflection?: string;
  confirmedBy?: string;
  reason?: string;
  evidence?: string;
}

// ─── COMPUTED TYPES ───

export interface AgentStats {
  agentId: string;
  activePromiseCount: number;
  totalPromiseCount: number;
  keptRate: number;                  // 0-1
  loadScore: number;                 // 0-100
  trend: "improving" | "stable" | "declining";
  overloaded: boolean;
  promisesByDomain: Record<string, number>;
  averageDaysToComplete: number;
  currentStreak: number;
}

// ─── SIMULATION TYPES ───

export interface CapacityQuery {
  hypotheticalPromise: PromiseCreateInput;
}

export interface CapacityResult {
  canAbsorb: boolean;
  assigneeCurrentLoad: number;
  assigneeProjectedLoad: number;
  atRiskPromises: {
    promiseId: string;
    reason: string;
  }[];
  networkHealthBefore: number;
  networkHealthAfter: number;
  recommendation: string;
}

export interface AbsenceQuery {
  agentId: string;
  startDate: string;
  endDate: string;
}

export interface AbsenceResult {
  affectedPromises: {
    promiseId: string;
    body: string;
    risk: "high" | "medium" | "low";
    reason: string;
  }[];
  cascadeEffects: import("./simulation").CascadeResult;
  reassignmentSuggestions: {
    promiseId: string;
    suggestedAgent: string;
    reason: string;
    projectedLoad: number;
  }[];
  summary: string;
}

// ─── VIEW TYPES ───

export interface TabConfig {
  id: string;
  label: string;
  component: string;
}

export interface NetworkView {
  scope: NetworkScope;
  tabs: TabConfig[];
  headerStyle: "journal" | "dashboard" | "simulation";
  createPromiseForm: "simple" | "detailed" | "none";
  showGraph: boolean;
  showCapacity: boolean;
  showAbsence: boolean;
  showKanban: boolean;
  showTimeline: boolean;
  showCascade: boolean;
}

// ─── DATA CLASSES ───
// Class 1: Private — device-local only, never transmitted
// Class 2: Projected — visible commitment shared with target network
// Class 3: Contributed — anonymized structural patterns for the cooperative

export type DataClass = "private" | "projected" | "contributed";

// ─── PROMISE PROJECTION (type definition only — not operational until v3) ───

export interface PromiseProjection {
  personalPromiseId: string;         // ID in the personal network
  personalNetworkId: string;

  projectedPromiseId: string;        // ID in the target network
  targetNetworkId: string;

  syncStatus: boolean;
  syncDirection: "personal→target" | "target→personal" | "bidirectional";

  visibleFields: string[];           // Fields visible in the target network
}

// ─── ANONYMIZED PATTERN (type definition only — pipeline not built) ───

export interface AnonymizedPromisePattern {
  networkScope: NetworkScope;
  networkSize: number;
  agentCount: number;
  domain: string;
  promiseeType: string;
  hadDeadline: boolean;
  daysToDeadline?: number;
  daysToCompletion?: number;
  outcome: "kept" | "broken" | "renegotiated" | "active";
  dependencyCount: number;
  dependentCount: number;
  wasRenegotiated: boolean;
  priority?: string;
  estimatedVsActualRatio?: number;
  verificationMethod: string;
  cascadeDepthIfFailed?: number;
}
