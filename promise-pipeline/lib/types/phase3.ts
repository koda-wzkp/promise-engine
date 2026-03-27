/**
 * Phase 3 Types — Teams + Contribution + Gifting
 *
 * Extends Phase 2 garden types with:
 * - Team garden integration (team-linked promises, projection)
 * - Anonymous data contribution (aggregate + schema tiers)
 * - Artifact gifting system
 */

import { PromiseStatus } from "./promise";
import { PersonalDomain } from "./personal";
import { GardenPromise, GardenNotification, GardenNotificationType } from "./garden";
import { TeamPromise, TeamMember } from "./team";

// ─── TEAM GARDEN ─────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  members: TeamGardenMember[];
  promises: TeamGardenPromise[];
  domains: string[];
  createdAt: string;
  createdBy: string;
  /** Stripe subscription ID (required for team features) */
  subscriptionId?: string;
  subscriptionStatus?: "active" | "past_due" | "canceled";
}

export interface TeamGardenMember extends TeamMember {
  /** User ID for linking to personal garden */
  userId?: string;
  joinedAt: string;
}

export interface TeamGardenPromise extends TeamPromise {
  /** Member user ID this is assigned to */
  assignee: string;
  /** Visibility mode for team garden */
  visibility: "team-linked";
  /** IDs of personal sub-promises created by the assignee */
  personalSlots: string[];
}

/** A team-linked promise in the personal garden (auto-created from team assignment) */
export interface TeamLinkedPromise extends GardenPromise {
  /** ID of the source team promise */
  teamPromiseId: string;
  /** Team ID */
  teamId: string;
  /** Body is read-only, synced from team */
  teamSynced: true;
}

// ─── CONTRIBUTION ────────────────────────────────────────────────────────────

export type ContributionLevel = "C" | "A";

export interface ContributionState {
  enabled: boolean;
  level: ContributionLevel;
  enabledAt?: string;
  lastSentAt?: string;
  batchesSent: number;
  /** When Level A was unlocked (after 3+ months of Level C) */
  levelAUnlockedAt?: string;
}

/** Level C: Aggregate contribution — computed locally, shipped monthly */
export interface AggregateContribution {
  batch_id: string;
  period_month: string;
  promise_count: number;
  k_distribution: number[];
  fulfillment_rate: number;
  mean_dwell_days: number;
  verification_mix: Record<string, number>;
  domain_mix: Record<string, number>;
}

/** Level A: Schema-only contribution — per-promise transitions, batched in 50+ */
export interface SchemaContribution {
  batch_id: string;
  transitions: TransitionRecord[];
}

export interface TransitionRecord {
  domain: string;
  verification_method: string;
  dwell_time_days: number;
  status_transition: string;
  k_regime: string;
}

/** Prediction data received by contributors */
export interface Prediction {
  domain: string;
  verificationMethod: string;
  fulfillmentRate: number;
  sampleSize: number;
  medianDwellDays: number;
}

/** Benchmark data received by contributors */
export interface Benchmark {
  domain: string;
  metric: string;
  userValue: number;
  communityAverage: number;
  percentile: number;
}

// ─── ARTIFACTS & GIFTING ─────────────────────────────────────────────────────

export interface Artifact {
  id: string;
  /** The promise that generated this artifact */
  generatedFrom: {
    promiseId: string;
    domain: PersonalDomain;
    body: string;
    durationTier: string;
    stakesTier: string;
    verificationMethod: string;
    kRegime: string;
  };
  /** Procedural form parameters (deterministic from promise) */
  formSeed: string;
  /** Material based on k regime */
  material: "organic" | "crystalline" | "metallic";
  /** Days the promise was kept */
  dwellDays: number;
  /** When the artifact was minted */
  mintedAt: string;
  /** Whether this artifact has been gifted (original stays) */
  gifted?: boolean;
}

export interface GiftOptions {
  includeBody: boolean;
  includeDwellTime: boolean;
  customMessage?: string;
}

export interface Gift {
  id: string;
  artifactId: string;
  fromUserId: string;
  fromUserName?: string;
  toUserId: string;
  promiseDomain: PersonalDomain;
  includeBody: boolean;
  includeDwellTime: boolean;
  customMessage?: string;
  giftedAt: string;
}

export interface ReceivedGift extends Gift {
  artifact: Artifact;
  /** The body text (only if giver opted to include it) */
  body?: string;
  /** Dwell time (only if giver opted to include it) */
  dwellDays?: number;
}

// ─── PHASE 3 GARDEN STATE EXTENSIONS ─────────────────────────────────────────

export interface Phase3State {
  /** Team the user belongs to (if any) */
  team?: Team;
  /** Contribution settings */
  contribution: ContributionState;
  /** Personal artifact collection */
  artifacts: Artifact[];
  /** Received gifts */
  receivedGifts: ReceivedGift[];
  /** Predictions (only for contributors) */
  predictions: Prediction[];
  /** Benchmarks (only for contributors) */
  benchmarks: Benchmark[];
}

export const DEFAULT_CONTRIBUTION_STATE: ContributionState = {
  enabled: false,
  level: "C",
  batchesSent: 0,
};

// ─── PHASE 3 GARDEN ACTIONS ─────────────────────────────────────────────────

export type Phase3Action =
  // Team
  | { type: "TEAM_PROMISE_RECEIVED"; teamPromise: TeamGardenPromise; teamId: string }
  | { type: "CREATE_TEAM_SUB_PROMISE"; teamPromiseId: string; subPromise: GardenPromise }
  | { type: "TEAM_STATUS_UPDATE"; promiseId: string; newStatus: PromiseStatus }
  | { type: "SET_TEAM"; team: Team }
  | { type: "LEAVE_TEAM" }

  // Contribution
  | { type: "ENABLE_CONTRIBUTION"; level: ContributionLevel }
  | { type: "DISABLE_CONTRIBUTION" }
  | { type: "CONTRIBUTION_SENT"; batchId: string }
  | { type: "UPGRADE_CONTRIBUTION_LEVEL"; level: ContributionLevel }
  | { type: "SYNC_PREDICTIONS"; predictions: Prediction[] }
  | { type: "SYNC_BENCHMARKS"; benchmarks: Benchmark[] }

  // Gifting
  | { type: "MINT_ARTIFACT"; promiseId: string }
  | { type: "GIFT_ARTIFACT"; artifactId: string; toUserId: string; options: GiftOptions }
  | { type: "RECEIVE_GIFT"; gift: ReceivedGift };

// ─── PHASE 3 NOTIFICATION TYPES ─────────────────────────────────────────────

export type Phase3NotificationType =
  | GardenNotificationType
  | "team-promise-assigned"
  | "team-status-changed"
  | "gift-received"
  | "contribution-sent"
  | "prediction-available";
