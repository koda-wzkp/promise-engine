import { Promise, PromiseStatus, PromiseFactory } from "./promise";

export interface PersonalPromise extends Promise {
  isPersonal: true;
  origin: "voluntary";
  promisee: string;
  reflection?: string;
  renegotiatedFrom?: string;
  completedAt?: string;
  createdAt: string;
}

export type PersonalDomain =
  | "health"
  | "work"
  | "relationships"
  | "creative"
  | "financial";

/**
 * A personal goal — a promise factory at the individual scale.
 * Goals generate sub-promises (habits, milestones) and their status is
 * computed from children, not directly assigned.
 *
 * Examples:
 *   "Lose 30 pounds" → gym 3x/week, meal prep, sleep by 11pm
 *   "Write a novel" → write 500 words/day, outline chapters, join workshop
 */
export interface PersonalGoal extends PromiseFactory {
  isPersonal: true;
  isFactory: true;
  /** User-defined category for the goal */
  domain: PersonalDomain;
  /** Goals are always long-duration by definition */
  durationTier: "long";
  /** Goals use threshold completion by default — you don't need 100% of habits */
  completionCondition: {
    type: "threshold";
    threshold: number; // Default 0.7
  };
}

export interface PersonalStats {
  totalPromises: number;
  activePromises: number;
  keptRate: number;
  mtkp: number;
  mtkpByDomain: Record<string, number>;
  byDomain: Record<string, {
    total: number;
    kept: number;
    broken: number;
    active: number;
    keptRate: number;
    mtkp: number;
  }>;
  trend: { month: string; keptRate: number }[];
}
