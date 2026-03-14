import { PromiseStatus } from "./promise";

// ─── MARS PROMISE ───
export interface MarsPromise {
  id: string;                           // P1–P8
  body: string;                         // The commitment
  domain: MarsDomain;
  promisee: "colonists" | "shareholders" | "both";
  costPerQuarter: number;               // In billions. 0 = depends on other promises
  isOneTime: boolean;                   // true = pay once to build, false = ongoing maintenance
  progress: number;                     // 0–100, current fulfillment
  status: PromiseStatus;
  target: number;                       // Progress threshold for "verified" (usually 100)
  degradeThreshold: number;             // Below this → "degraded"
  violateThreshold: number;             // Below this → "violated"
  decayRate: number;                    // Progress lost per quarter if $0 allocated (0–30)
  dependsOn: string[];                  // Promise IDs this requires
  cascadeThreshold: number;             // Upstream promise must be above this % or cascade fires
  fundingEfficiency: number;            // Progress gained per $1B allocated (diminishing returns modeled separately)
  oneTimeFunded: boolean;               // For one-time promises: has the full cost been paid?
  description: string;                  // Flavor text for briefing
  verificationNote: string;             // How this promise is verified (or why it can't be)
}

export type MarsDomain =
  | "Survival"
  | "Housing"
  | "Resources"
  | "Revenue"
  | "Finance"
  | "Community"
  | "Safety"
  | "Transparency";

// ─── GAME STATE ───
export interface MarsGameState {
  phase: "briefing" | "quarter" | "quarter-close" | "verdict" | "cta";
  quarter: 1 | 2 | 3 | 4;
  budget: number;                       // Current available funds (billions)
  allocations: Record<string, number>;  // Promise ID → amount allocated this quarter
  promises: MarsPromise[];
  events: MarsEvent[];                  // Events that have fired
  currentEvents: MarsEvent[];           // Events for this quarter
  colonyIntegrity: number;              // 0–100 overall score
  colonistTrust: number;                // 0–100 sub-score
  shareholderConfidence: number;        // 0–100 sub-score
  miningRevenueActive: boolean;         // P4 has reached 60%+ progress
  quarterHistory: QuarterSummary[];     // Record of each completed quarter
  cascadeLog: CascadeEvent[];           // All cascades that have fired this quarter
  gameOver: boolean;
  gameOverReason: "mutiny" | "defunded" | null;
  structuralConflictTriggered: boolean;
  structuralConflictExplanation: string;
  teachingMomentsSeen: Set<string>;     // Track which teaching moments have been shown
}

// ─── EVENTS ───
export interface MarsEvent {
  id: string;
  name: string;
  flavorText: string;                   // Retro institutional voice
  budgetImpact: number;                 // Positive or negative, in billions
  promiseEffects: { promiseId: string; progressDelta: number }[];
  quarter: number;                      // Which quarter this fires (pre-assigned, not random)
  statusOverride?: { promiseId: string; note: string }; // e.g., force P7 to highlight unverifiable
}

// ─── CASCADE ───
export interface CascadeEvent {
  sourcePromiseId: string;
  affectedPromiseId: string;
  previousStatus: PromiseStatus;
  newStatus: PromiseStatus;
  depth: number;
  explanation: string;                  // Human-readable: "Water reclamation at 38% → life support degraded"
}

// ─── QUARTER SUMMARY ───
export interface QuarterSummary {
  quarter: number;
  budgetStart: number;
  budgetEnd: number;
  allocations: Record<string, number>;
  events: MarsEvent[];
  cascades: CascadeEvent[];
  colonyIntegrity: number;
  colonistTrust: number;
  shareholderConfidence: number;
  miningRevenue: number;               // Revenue generated this quarter (0 or 1.5)
  promiseSnapshots: { id: string; progress: number; status: PromiseStatus }[];
}

// ─── ACTIONS ───
export type MarsGameAction =
  | { type: "START_GAME" }
  | { type: "SET_ALLOCATION"; promiseId: string; amount: number }
  | { type: "CONFIRM_ALLOCATIONS" }     // Triggers: apply funding → apply event → check cascades → compute scores → advance
  | { type: "ADVANCE_TO_QUARTER" }       // From quarter-close → next quarter (or verdict)
  | { type: "VIEW_CTA" }                // From verdict → CTA screen
  | { type: "RESTART" };

// ─── DOMAIN COLORS ───
export const marsDomainColors: Record<MarsDomain, string> = {
  Survival: "#ef4444",      // Red — existential
  Housing: "#f59e0b",       // Amber — basic needs
  Resources: "#3b82f6",     // Blue — operational
  Revenue: "#10b981",       // Green — financial
  Finance: "#06b6d4",       // Cyan — financial outcomes
  Community: "#8b5cf6",     // Purple — social
  Safety: "#f97316",        // Orange — physical safety
  Transparency: "#64748b",  // Slate — governance
};
