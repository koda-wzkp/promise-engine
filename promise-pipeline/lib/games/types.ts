import { PromiseStatus } from "../types/promise";

// ═══════════════════════════════════════════════════════════════
// SCENARIO CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export interface ScenarioConfig {
  id: string;
  title: string;
  tagline: string;
  description: string;
  primaryLesson: PrimaryLesson;
  difficulty: "standard" | "hard" | "brutal";
  estimatedMinutes: number;
  setting: ScenarioSetting;
  promises: ScenarioPromise[];
  dependencies: DependencyEdge[];
  structuralConflicts: StructuralConflict[];
  budget: BudgetConfig;
  revenueTriggers: RevenueTrigger[];
  computedPromises: ComputedPromiseRule[];
  accountability: DualAccountabilityConfig;
  events: ScenarioEvent[];
  totalRounds: number;
  roundLabel: string;
  teachingMoments: TeachingMomentConfig[];
  briefing: BriefingConfig;
  verdict: VerdictConfig;
  cta: CTAConfig;
  theme: ScenarioTheme;
  metadata: { title: string; description: string; ogImage?: string };
}

export type PrimaryLesson =
  | "structural-conflict"
  | "upstream-dependency"
  | "cascade-depth"
  | "verification-gap"
  | "renegotiation";

// ── SETTING ──

export interface ScenarioSetting {
  location: string;
  role: string;
  organization: string;
  timeContext: string;
  populationLabel: string;
  populationCount: number;
  flavorIntro: string;
  unitLabel: string;
  unitScale: string;
}

// ── PROMISES ──

export interface ScenarioPromise {
  id: string;
  body: string;
  domain: string;
  promiseeGroup: string;
  costPerRound: number;
  isOneTime: boolean;
  startingProgress: number;
  target: number;
  degradeThreshold: number;
  violateThreshold: number;
  decayRate: number;
  fundingEfficiency: number;
  description: string;
  verificationNote: string;
  forceStatus?: PromiseStatus;
  isFundable: boolean;
}

// ── DEPENDENCIES ──

export interface DependencyEdge {
  upstream: string;
  downstream: string;
  cascadeThreshold: number;
  cascadePenaltyFactor: number;
  explanation: string;
}

// ── STRUCTURAL CONFLICTS ──

export interface StructuralConflict {
  triggerPromiseId: string;
  affectedPromiseId: string;
  fundingThreshold: number;
  penaltyPerUnit: number;
  explanation: string;
  realWorldParallel: string;
}

// ── BUDGET ──

export interface BudgetConfig {
  startingCapital: number;
  allocationPerRound: number;
  totalAvailableNoRevenue: number;
  totalCostFullFunding: number;
  carryOver: boolean;
}

// ── REVENUE TRIGGERS ──

export interface RevenueTrigger {
  sourcePromiseId: string;
  progressThreshold: number;
  revenuePerRound: number;
  label: string;
}

// ── COMPUTED PROMISES ──

export interface ComputedPromiseRule {
  promiseId: string;
  formula: ComputedFormula;
}

export interface ComputedFormula {
  inputs: { promiseId: string; weight: number }[];
  bonuses: { condition: string; promiseId: string; threshold: number; bonus: number }[];
}

// ── DUAL ACCOUNTABILITY ──

export interface DualAccountabilityConfig {
  overallLabel: string;
  overallBlend: { groupAWeight: number; groupBWeight: number };
  groupA: AccountabilityGroup;
  groupB: AccountabilityGroup;
  gameOverThreshold: number;
}

export interface AccountabilityGroup {
  id: string;
  label: string;
  gameOverLabel: string;
  weights: Record<string, number>;
}

// ── UPSTREAM SUPPLIER EVENTS (Supply Station mechanic) ──

export interface UpstreamSupplierEvent {
  supplierId: string;
  supplierName: string;
  promiseToPlayer: string;
  outcome: "delivered" | "delayed" | "partial" | "cancelled";
  impactOnPromises: { promiseId: string; progressDelta: number }[];
  flavorText: string;
  playerCanMitigate: boolean;
  mitigationCost?: number;
}

// ── EVENTS ──

export interface ScenarioEvent {
  id: string;
  name: string;
  flavorText: string;
  budgetImpact: number;
  promiseEffects: { promiseId: string; progressDelta: number }[];
  round: number;
  statusOverride?: { promiseId: string; note: string };
  decayModifiers?: { promiseId: string; multiplier: number; duration: number }[];
  upstreamSupplierEvents?: UpstreamSupplierEvent[];
}

// ── TEACHING MOMENTS ──

export interface TeachingMomentConfig {
  id: string;
  type: PrimaryLesson | "cascade-failure" | "network-health";
  title: string;
  trigger: TeachingTrigger;
  headline: string;
  bodyTemplate: string;
  downstreamEffects: string[];
  realWorldParallel: string;
  severity: "info" | "warning" | "critical";
  showOnce: boolean;
}

export type TeachingTrigger =
  | { type: "promise-below"; promiseId: string; threshold: number }
  | { type: "promise-status"; promiseId: string; status: PromiseStatus }
  | { type: "conflict-triggered"; conflictIndex: number }
  | { type: "round"; round: number }
  | { type: "score-below"; score: "overall" | "groupA" | "groupB"; threshold: number };

// ── BRIEFING ──

export interface BriefingConfig {
  headerLine1: string;
  headerLine2: string;
  headerLine3: string;
  appointmentText: string;
  budgetExplanation: string;
  startButtonLabel: string;
}

// ── VERDICT ──

export interface VerdictConfig {
  groupAAssessment: {
    header: string;
    recommendations: {
      retain: { minOverall: number; minGroupScore: number; label: string };
      probation: { minOverall: number; minGroupScore: number; label: string };
      terminate: { label: string };
    };
  };
  groupBAssessment: {
    header: string;
    retainThreshold: number;
    retainLabel: string;
    recallLabel: string;
  };
  postMortemTemplates: {
    cascadeFired: string;
    verificationGap: string;
    structuralConflict: string;
    survived: string;
  };
}

// ── CTA ──

export interface CTAConfig {
  fictionalLine: string;
  realLine: string;
  bridgeText: string;
  primaryCTA: { label: string; href: string };
  secondaryCTAs: { label: string; href: string }[];
}

// ── THEME ──

export interface ScenarioTheme {
  bg: string;
  bgLight: string;
  bgCard: string;
  accent: string;
  accentMuted: string;
  terminal: string;
  terminalDim: string;
  text: string;
  textMuted: string;
  textBright: string;
  danger: string;
  border: string;
  scanline: string;
  statusColors: {
    verified: string;
    declared: string;
    degraded: string;
    violated: string;
    unverifiable: string;
  };
  statusBgColors: {
    verified: string;
    declared: string;
    degraded: string;
    violated: string;
    unverifiable: string;
  };
  domainColors: Record<string, string>;
  primaryFont: "mono" | "serif" | "sans";
  narrativeFont: "mono" | "serif" | "sans";
  nodeShape: "hexagon" | "circle" | "rectangle" | "diamond";
  edgeStyle: "tunnel" | "pipe" | "cable" | "chain";
  transitionStyle: "fade-black" | "static-burst" | "pressure-seal" | "signal-loss";
  hasScanlines: boolean;
  hasAmbientParticles: boolean;
  particleType?: "dust" | "bubbles" | "sparks" | "snow";
}

// ═══════════════════════════════════════════════════════════════
// GAME STATE
// ═══════════════════════════════════════════════════════════════

export interface GameState {
  scenarioId: string;
  phase: "briefing" | "round" | "round-close" | "verdict" | "cta";
  currentRound: number;
  budget: number;
  allocations: Record<string, number>;
  promises: RuntimePromise[];
  firedEvents: string[];
  currentEvents: ScenarioEvent[];
  scores: { overall: number; groupA: number; groupB: number };
  revenueActive: Record<string, boolean>;
  roundHistory: RoundSummary[];
  cascadeLog: CascadeEvent[];
  teachingMomentsFired: Set<string>;
  pendingTeachingMoments: TeachingMomentConfig[];
  conflictResults: ConflictResult[];
  gameOver: boolean;
  gameOverReason: string | null;
}

export interface RuntimePromise extends ScenarioPromise {
  currentProgress: number;
  currentStatus: PromiseStatus;
  oneTimeFunded: boolean;
  activeDecayModifiers: { multiplier: number; roundsRemaining: number }[];
}

export interface CascadeEvent {
  sourcePromiseId: string;
  affectedPromiseId: string;
  previousStatus: PromiseStatus;
  newStatus: PromiseStatus;
  depth: number;
  explanation: string;
  penalty: number;
}

export interface ConflictResult {
  triggered: boolean;
  conflictIndex: number;
  penalty: number;
  explanation: string;
}

export interface RoundSummary {
  round: number;
  budgetStart: number;
  budgetEnd: number;
  allocations: Record<string, number>;
  events: ScenarioEvent[];
  cascades: CascadeEvent[];
  scores: { overall: number; groupA: number; groupB: number };
  revenueGenerated: Record<string, number>;
  teachingMomentsTriggered: string[];
  promiseSnapshots: { id: string; progress: number; status: PromiseStatus }[];
}

// ═══════════════════════════════════════════════════════════════
// GAME ACTIONS
// ═══════════════════════════════════════════════════════════════

export type GameAction =
  | { type: "START_GAME" }
  | { type: "SET_ALLOCATION"; promiseId: string; amount: number }
  | { type: "CONFIRM_ALLOCATIONS" }
  | { type: "DISMISS_TEACHING_MOMENT" }
  | { type: "ADVANCE_TO_ROUND" }
  | { type: "VIEW_CTA" }
  | { type: "RESTART" };
