import { NetworkConfig, NetworkDomain, NetworkView } from "./network";

// ─── SCOPE CONFIG PRESETS ───

export function createPersonalConfig(): NetworkConfig {
  return {
    statusWeights: { verified: 100, declared: 70, degraded: 30, violated: 0, unverifiable: 20 },
    healthThresholds: { good: 75, warning: 55 },
    defaultVerificationMethod: "self-report",
    statusLabels: {
      verified: "Kept",
      declared: "Active",
      degraded: "At Risk",
      violated: "Broken",
      unverifiable: "Unclear",
    },
    validTransitions: {
      declared: ["verified", "degraded", "violated"],
      degraded: ["verified", "violated", "declared"],
      verified: [],
      violated: [],
      unverifiable: [],
    },
    dataContribution: { enabled: false, domains: [] },
  };
}

export function createTeamConfig(): NetworkConfig {
  return {
    statusWeights: { verified: 100, declared: 60, degraded: 30, violated: 0, unverifiable: 20 },
    healthThresholds: { good: 80, warning: 60 },
    capacityThreshold: 8,
    capacityUrgencyMultiplier: 1.5,
    capacityDependencyMultiplier: 1.3,
    defaultVerificationMethod: "self-report",
    statusLabels: {
      verified: "Delivered",
      declared: "Committed",
      degraded: "At Risk",
      violated: "Failed",
      unverifiable: "Unverifiable",
    },
    validTransitions: {
      declared: ["verified", "degraded", "violated"],
      degraded: ["verified", "violated", "declared"],
      verified: [],
      violated: [],
      unverifiable: [],
    },
    dataContribution: { enabled: false, domains: [] },
  };
}

export function createCivicConfig(): NetworkConfig {
  return {
    statusWeights: { verified: 100, declared: 60, degraded: 30, violated: 0, unverifiable: 20 },
    healthThresholds: { good: 80, warning: 60 },
    defaultVerificationMethod: "filing",
    statusLabels: {
      verified: "Verified",
      declared: "Declared",
      degraded: "Degraded",
      violated: "Violated",
      unverifiable: "Unverifiable",
    },
    validTransitions: {
      declared: ["verified", "degraded", "violated", "unverifiable"],
      degraded: ["verified", "violated", "unverifiable"],
      verified: ["degraded", "violated"],
      violated: ["degraded", "verified"],
      unverifiable: ["declared", "verified", "degraded", "violated"],
    },
    dataContribution: { enabled: false, domains: [] },
  };
}

// ─── SCOPE DOMAIN PRESETS ───

export const PERSONAL_DOMAINS: NetworkDomain[] = [
  { id: "dom-work",    name: "Work",          color: "#1e40af" },
  { id: "dom-health",  name: "Health",        color: "#1a5f4a" },
  { id: "dom-relate",  name: "Relationships", color: "#9333ea" },
  { id: "dom-create",  name: "Creative",      color: "#d97706" },
  { id: "dom-finance", name: "Financial",     color: "#059669" },
  { id: "dom-learn",   name: "Learning",      color: "#0891b2" },
];

export const TEAM_DOMAINS: NetworkDomain[] = [
  { id: "dom-ops",      name: "Operations",    color: "#1e40af" },
  { id: "dom-client",   name: "Client Work",   color: "#059669" },
  { id: "dom-internal", name: "Internal",      color: "#9333ea" },
  { id: "dom-comms",    name: "Communication", color: "#d97706" },
];

// ─── VIEW PRESETS ───

export const PERSONAL_VIEW: NetworkView = {
  scope: "personal",
  tabs: [
    { id: "active", label: "Active", component: "ActivePromises" },
    { id: "timeline", label: "Timeline", component: "PromiseTimeline" },
    { id: "insights", label: "Insights", component: "PersonalInsights" },
    { id: "settings", label: "Settings", component: "NetworkSettings" },
  ],
  headerStyle: "journal",
  createPromiseForm: "simple",
  showGraph: false,
  showCapacity: false,
  showAbsence: false,
  showKanban: false,
  showTimeline: true,
  showCascade: false,
};

export const TEAM_VIEW: NetworkView = {
  scope: "team",
  tabs: [
    { id: "board", label: "Board", component: "KanbanBoard" },
    { id: "network", label: "Network", component: "PromiseGraphView" },
    { id: "members", label: "Members", component: "MemberLoadView" },
    { id: "settings", label: "Settings", component: "NetworkSettings" },
  ],
  headerStyle: "dashboard",
  createPromiseForm: "detailed",
  showGraph: true,
  showCapacity: true,
  showAbsence: true,
  showKanban: true,
  showTimeline: false,
  showCascade: true,
};

export const CIVIC_VIEW: NetworkView = {
  scope: "civic",
  tabs: [
    { id: "summary", label: "Summary", component: "SummaryTab" },
    { id: "network", label: "Network", component: "PromiseGraphView" },
    { id: "trajectory", label: "Trajectory", component: "TrajectoryTab" },
    { id: "promises", label: "Promises", component: "PromisesTab" },
    { id: "insights", label: "Insights", component: "InsightsTab" },
  ],
  headerStyle: "simulation",
  createPromiseForm: "none",
  showGraph: true,
  showCapacity: false,
  showAbsence: false,
  showKanban: false,
  showTimeline: false,
  showCascade: true,
};

export function getViewForScope(scope: string): NetworkView {
  switch (scope) {
    case "personal": return PERSONAL_VIEW;
    case "team": return TEAM_VIEW;
    case "civic": return CIVIC_VIEW;
    default: return TEAM_VIEW;
  }
}

export function getConfigForScope(scope: string): NetworkConfig {
  switch (scope) {
    case "personal": return createPersonalConfig();
    case "team": return createTeamConfig();
    case "civic": return createCivicConfig();
    default: return createTeamConfig();
  }
}

export function getDomainsForScope(scope: string): NetworkDomain[] {
  switch (scope) {
    case "personal": return [...PERSONAL_DOMAINS];
    case "team": return [...TEAM_DOMAINS];
    default: return [];
  }
}
