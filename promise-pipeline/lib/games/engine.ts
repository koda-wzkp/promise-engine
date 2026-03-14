import { PromiseStatus } from "../types/promise";
import {
  GameState,
  ScenarioConfig,
  RuntimePromise,
  CascadeEvent,
  ConflictResult,
  RoundSummary,
  TeachingMomentConfig,
} from "./types";

// ── STATUS COMPUTATION ──

export function computeStatus(promise: RuntimePromise): PromiseStatus {
  if (promise.forceStatus) return promise.forceStatus;
  if (promise.currentProgress >= promise.target) return "verified";
  if (promise.currentProgress < promise.violateThreshold) return "violated";
  if (promise.currentProgress < promise.degradeThreshold) return "degraded";
  return "declared";
}

// ── PROGRESS UPDATE ──

export function updateProgress(
  promise: RuntimePromise,
  allocated: number,
  eventEffects: number
): number {
  let progress = promise.currentProgress;

  // 1. Decay
  if (allocated === 0 && !promise.oneTimeFunded) {
    let decay = promise.decayRate;
    for (const mod of promise.activeDecayModifiers) {
      decay *= mod.multiplier;
    }
    progress -= decay;
  }

  // 2. Funding
  if (allocated > 0 && promise.isFundable) {
    let efficiency = promise.fundingEfficiency;
    if (promise.currentProgress > 70) efficiency *= 0.6;

    if (promise.isOneTime) {
      if (allocated >= promise.costPerRound) {
        promise.oneTimeFunded = true;
        progress += 35;
      } else {
        progress += allocated * efficiency * 0.5;
      }
    } else {
      const fundingRatio = allocated / promise.costPerRound;
      progress += efficiency * allocated * Math.min(fundingRatio, 1.2);
    }
  }

  // 3. Event effects
  progress += eventEffects;

  return Math.max(0, Math.min(100, progress));
}

// ── COMPUTED PROMISES ──

export function updateComputedPromises(
  state: GameState,
  config: ScenarioConfig
): void {
  for (const rule of config.computedPromises) {
    const promise = state.promises.find((p) => p.id === rule.promiseId);
    if (!promise) continue;

    let total = 0;
    for (const input of rule.formula.inputs) {
      const source = state.promises.find((p) => p.id === input.promiseId);
      if (source) total += source.currentProgress * input.weight;
    }

    for (const bonus of rule.formula.bonuses) {
      const source = state.promises.find((p) => p.id === bonus.promiseId);
      if (source && source.currentProgress >= bonus.threshold) {
        total += bonus.bonus;
      }
    }

    promise.currentProgress = Math.max(0, Math.min(100, total));
  }
}

// ── CASCADE PROPAGATION ──

export function propagateCascades(
  state: GameState,
  config: ScenarioConfig
): CascadeEvent[] {
  const cascades: CascadeEvent[] = [];
  const affectedIds = new Set<string>();
  const MAX_DEPTH = 5;

  // Pass 1: direct dependencies
  for (const edge of config.dependencies) {
    const upstream = state.promises.find((p) => p.id === edge.upstream);
    const downstream = state.promises.find((p) => p.id === edge.downstream);
    if (!upstream || !downstream) continue;

    if (upstream.currentProgress < edge.cascadeThreshold) {
      const previousStatus = computeStatus(downstream);
      const shortfall = edge.cascadeThreshold - upstream.currentProgress;
      const penalty = Math.floor(shortfall * edge.cascadePenaltyFactor);
      downstream.currentProgress = Math.max(0, downstream.currentProgress - penalty);
      const newStatus = computeStatus(downstream);

      if (newStatus !== previousStatus) {
        affectedIds.add(downstream.id);
        cascades.push({
          sourcePromiseId: upstream.id,
          affectedPromiseId: downstream.id,
          previousStatus,
          newStatus,
          depth: 1,
          explanation: `${upstream.body} at ${Math.round(upstream.currentProgress)}% — below cascade threshold of ${edge.cascadeThreshold}%. ${downstream.body} lost ${penalty}%.`,
          penalty,
        });
      }
    }
  }

  // Passes 2–5: transitive cascades
  let currentDepth = 1;
  while (currentDepth < MAX_DEPTH) {
    currentDepth++;
    let foundNew = false;

    for (const edge of config.dependencies) {
      const upstream = state.promises.find((p) => p.id === edge.upstream);
      const downstream = state.promises.find((p) => p.id === edge.downstream);
      if (!upstream || !downstream) continue;
      if (affectedIds.has(downstream.id)) continue;
      if (!affectedIds.has(upstream.id)) continue;

      if (upstream.currentProgress < edge.cascadeThreshold) {
        const previousStatus = computeStatus(downstream);
        const shortfall = edge.cascadeThreshold - upstream.currentProgress;
        const depthFactor = edge.cascadePenaltyFactor * 0.7 ** (currentDepth - 1);
        const penalty = Math.floor(shortfall * depthFactor);
        downstream.currentProgress = Math.max(0, downstream.currentProgress - penalty);
        const newStatus = computeStatus(downstream);

        if (newStatus !== previousStatus) {
          affectedIds.add(downstream.id);
          foundNew = true;
          cascades.push({
            sourcePromiseId: upstream.id,
            affectedPromiseId: downstream.id,
            previousStatus,
            newStatus,
            depth: currentDepth,
            explanation: `${upstream.body} at ${Math.round(upstream.currentProgress)}% → ${downstream.body} ${newStatus} (depth ${currentDepth})`,
            penalty,
          });
        }
      }
    }

    if (!foundNew) break;
  }

  return cascades;
}

// ── STRUCTURAL CONFLICTS ──

export function applyStructuralConflicts(
  state: GameState,
  config: ScenarioConfig
): ConflictResult[] {
  const results: ConflictResult[] = [];

  for (let i = 0; i < config.structuralConflicts.length; i++) {
    const conflict = config.structuralConflicts[i];
    const allocated = state.allocations[conflict.triggerPromiseId] || 0;

    if (allocated > conflict.fundingThreshold) {
      const excess = allocated - conflict.fundingThreshold;
      const penalty = Math.floor(excess * conflict.penaltyPerUnit);
      const affected = state.promises.find((p) => p.id === conflict.affectedPromiseId);
      if (affected) {
        affected.currentProgress = Math.max(0, affected.currentProgress - penalty);
      }
      results.push({
        triggered: true,
        conflictIndex: i,
        penalty,
        explanation: conflict.explanation
          .replace("$[X]", `$${allocated.toFixed(1)}`)
          .replace("[Y]", String(penalty)),
      });
    } else {
      results.push({ triggered: false, conflictIndex: i, penalty: 0, explanation: "" });
    }
  }

  return results;
}

// ── SCORING ──

export function computeScores(
  state: GameState,
  config: ScenarioConfig
): { overall: number; groupA: number; groupB: number } {
  const statusWeight: Record<PromiseStatus, number> = {
    verified: 100,
    declared: 60,
    degraded: 30,
    violated: 0,
    unverifiable: 20,
    kept: 100,
    broken: 0,
    partial: 50,
    delayed: 40,
    modified: 55,
    legally_challenged: 25,
    repealed: 0,
  };

  function weightedScore(weights: Record<string, number>): number {
    let totalWeight = 0;
    let weightedSum = 0;
    for (const [id, weight] of Object.entries(weights)) {
      const promise = state.promises.find((p) => p.id === id);
      if (!promise) continue;
      const status = computeStatus(promise);
      const score = statusWeight[status] * 0.4 + promise.currentProgress * 0.6;
      weightedSum += score * weight;
      totalWeight += weight;
    }
    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  }

  const groupA = weightedScore(config.accountability.groupA.weights);
  const groupB = weightedScore(config.accountability.groupB.weights);
  const { groupAWeight, groupBWeight } = config.accountability.overallBlend;
  const overall = Math.round(groupA * groupAWeight + groupB * groupBWeight);

  return { overall, groupA, groupB };
}

// ── GAME OVER CHECK ──

export function checkGameOver(
  scores: { overall: number; groupA: number; groupB: number },
  config: ScenarioConfig
): { gameOver: boolean; reason: string | null } {
  const threshold = config.accountability.gameOverThreshold;
  if (scores.groupA <= threshold) {
    return { gameOver: true, reason: config.accountability.groupA.gameOverLabel };
  }
  if (scores.groupB <= threshold) {
    return { gameOver: true, reason: config.accountability.groupB.gameOverLabel };
  }
  return { gameOver: false, reason: null };
}

// ── TEACHING MOMENT EVALUATION ──

export function evaluateTeachingMoments(
  state: GameState,
  config: ScenarioConfig,
  conflictResults: ConflictResult[]
): TeachingMomentConfig[] {
  const triggered: TeachingMomentConfig[] = [];

  for (const tm of config.teachingMoments) {
    if (tm.showOnce && state.teachingMomentsFired.has(tm.id)) continue;

    let shouldFire = false;
    const trigger = tm.trigger;

    switch (trigger.type) {
      case "promise-below": {
        const p = state.promises.find((p) => p.id === trigger.promiseId);
        shouldFire = p ? p.currentProgress < trigger.threshold : false;
        break;
      }
      case "promise-status": {
        const p = state.promises.find((p) => p.id === trigger.promiseId);
        shouldFire = p ? computeStatus(p) === trigger.status : false;
        break;
      }
      case "conflict-triggered": {
        shouldFire = conflictResults.some(
          (r) => r.triggered && r.conflictIndex === trigger.conflictIndex
        );
        break;
      }
      case "round": {
        shouldFire = state.currentRound === trigger.round;
        break;
      }
      case "score-below": {
        const scoreKey = trigger.score === "groupA" ? "groupA" : trigger.score === "groupB" ? "groupB" : "overall";
        shouldFire = state.scores[scoreKey] < trigger.threshold;
        break;
      }
    }

    if (shouldFire) {
      triggered.push(tm);
    }
  }

  return triggered;
}

// ── REVENUE CHECK ──

export function checkRevenueTriggers(
  state: GameState,
  config: ScenarioConfig
): Record<string, number> {
  const revenue: Record<string, number> = {};

  for (const trigger of config.revenueTriggers) {
    const promise = state.promises.find((p) => p.id === trigger.sourcePromiseId);
    if (promise && promise.currentProgress >= trigger.progressThreshold) {
      state.revenueActive[trigger.sourcePromiseId] = true;
      revenue[trigger.sourcePromiseId] = trigger.revenuePerRound;
    }
  }

  return revenue;
}

// ── INTERPOLATE TEACHING MOMENT BODY ──

export function interpolateBody(
  template: string,
  state: GameState
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const promise = state.promises.find((p) => p.id === key);
    if (!promise) return key;
    return `${Math.round(promise.currentProgress)}%`;
  });
}

// ── FULL ROUND RESOLUTION ──

export function resolveRound(
  state: GameState,
  config: ScenarioConfig
): {
  newState: GameState;
  cascades: CascadeEvent[];
  conflicts: ConflictResult[];
  teachingMoments: TeachingMomentConfig[];
  revenueGenerated: Record<string, number>;
  scores: { overall: number; groupA: number; groupB: number };
  gameOver: boolean;
  gameOverReason: string | null;
} {
  // Deep clone promises to avoid mutation issues
  const promises = state.promises.map((p) => ({ ...p, activeDecayModifiers: [...p.activeDecayModifiers] }));
  const workingState = { ...state, promises };

  // 1. Gather event effects
  const eventEffects: Record<string, number> = {};
  for (const event of workingState.currentEvents) {
    for (const effect of event.promiseEffects) {
      eventEffects[effect.promiseId] = (eventEffects[effect.promiseId] || 0) + effect.progressDelta;
    }
    if (event.decayModifiers) {
      for (const mod of event.decayModifiers) {
        const promise = workingState.promises.find((p) => p.id === mod.promiseId);
        if (promise) {
          promise.activeDecayModifiers.push({ multiplier: mod.multiplier, roundsRemaining: mod.duration });
        }
      }
    }
  }

  // 2. Update fundable promises
  for (const promise of workingState.promises) {
    if (!promise.isFundable) continue;
    const allocated = workingState.allocations[promise.id] || 0;
    const eventDelta = eventEffects[promise.id] || 0;
    promise.currentProgress = updateProgress(promise, allocated, eventDelta);
  }

  // 3. Structural conflicts
  const conflicts = applyStructuralConflicts(workingState, config);

  // 4. Computed promises
  updateComputedPromises(workingState, config);

  // 5. Cascades
  const cascades = propagateCascades(workingState, config);

  // 6. Update statuses
  for (const promise of workingState.promises) {
    promise.currentStatus = computeStatus(promise);
  }

  // 7. Revenue
  const revenueGenerated = checkRevenueTriggers(workingState, config);
  const totalRevenue = Object.values(revenueGenerated).reduce((s, v) => s + v, 0);

  // 8. Scores
  const scores = computeScores(workingState, config);
  workingState.scores = scores;

  // 9. Game over
  const { gameOver, reason } = checkGameOver(scores, config);

  // 10. Teaching moments
  const teachingMoments = evaluateTeachingMoments(workingState, config, conflicts);
  for (const tm of teachingMoments) {
    workingState.teachingMomentsFired.add(tm.id);
  }

  // 11. Budget
  const totalAllocated = Object.values(workingState.allocations).reduce((s, v) => s + v, 0);
  const eventBudgetImpact = workingState.currentEvents.reduce((s, e) => s + e.budgetImpact, 0);
  const newBudget = Math.max(0, state.budget + eventBudgetImpact - totalAllocated + totalRevenue);

  // 12. Round summary
  const summary: RoundSummary = {
    round: workingState.currentRound,
    budgetStart: state.budget,
    budgetEnd: newBudget,
    allocations: { ...workingState.allocations },
    events: workingState.currentEvents,
    cascades,
    scores,
    revenueGenerated,
    teachingMomentsTriggered: teachingMoments.map((tm) => tm.id),
    promiseSnapshots: workingState.promises.map((p) => ({
      id: p.id,
      progress: p.currentProgress,
      status: p.currentStatus,
    })),
  };

  // 13. Tick decay modifiers
  for (const promise of workingState.promises) {
    promise.activeDecayModifiers = promise.activeDecayModifiers
      .map((m) => ({ ...m, roundsRemaining: m.roundsRemaining - 1 }))
      .filter((m) => m.roundsRemaining > 0);
  }

  const newState: GameState = {
    ...workingState,
    phase: "round-close",
    budget: newBudget,
    cascadeLog: cascades,
    roundHistory: [...workingState.roundHistory, summary],
    pendingTeachingMoments: teachingMoments,
    conflictResults: conflicts,
    gameOver,
    gameOverReason: reason,
  };

  return { newState, cascades, conflicts, teachingMoments, revenueGenerated, scores, gameOver, gameOverReason: reason };
}

// ── CREATE INITIAL STATE ──

export function createInitialState(config: ScenarioConfig): GameState {
  const promises = config.promises.map((p) => ({
    ...p,
    currentProgress: p.startingProgress,
    currentStatus: (p.forceStatus ?? (p.startingProgress >= p.target ? "verified" : p.startingProgress < p.violateThreshold ? "violated" : p.startingProgress < p.degradeThreshold ? "degraded" : "declared")) as import("../types/promise").PromiseStatus,
    oneTimeFunded: false,
    activeDecayModifiers: [],
  }));

  // Compute initial statuses
  for (const p of promises) {
    if (p.forceStatus) {
      p.currentStatus = p.forceStatus;
    } else if (p.currentProgress >= p.target) {
      p.currentStatus = "verified";
    } else if (p.currentProgress < p.violateThreshold) {
      p.currentStatus = "violated";
    } else if (p.currentProgress < p.degradeThreshold) {
      p.currentStatus = "degraded";
    } else {
      p.currentStatus = "declared";
    }
  }

  const state: GameState = {
    scenarioId: config.id,
    phase: "briefing",
    currentRound: 1,
    budget: config.budget.startingCapital + config.budget.allocationPerRound,
    allocations: {},
    promises,
    firedEvents: [],
    currentEvents: [],
    scores: { overall: 0, groupA: 0, groupB: 0 },
    revenueActive: {},
    roundHistory: [],
    cascadeLog: [],
    teachingMomentsFired: new Set(),
    pendingTeachingMoments: [],
    conflictResults: [],
    gameOver: false,
    gameOverReason: null,
  };

  // Initial scores
  state.scores = computeScores(state, config);

  return state;
}

// ── ADVANCE TO NEXT ROUND ──

export function advanceToNextRound(
  state: GameState,
  config: ScenarioConfig
): GameState {
  if (state.gameOver || state.currentRound >= config.totalRounds) {
    return { ...state, phase: "verdict" };
  }

  const nextRound = state.currentRound + 1;
  const nextEvents = config.events.filter((e) => e.round === nextRound);

  // Apply event budget impacts (events fire before allocation)
  const eventBudgetImpact = nextEvents.reduce((s, e) => s + e.budgetImpact, 0);
  const newBudget = Math.max(
    0,
    state.budget + config.budget.allocationPerRound + eventBudgetImpact
  );

  // Apply upstream supplier event effects (if any) — before player sees the round
  const promises = state.promises.map((p) => ({ ...p }));
  for (const event of nextEvents) {
    if (event.upstreamSupplierEvents) {
      for (const supplierEvent of event.upstreamSupplierEvents) {
        for (const effect of supplierEvent.impactOnPromises) {
          const promise = promises.find((p) => p.id === effect.promiseId);
          if (promise) {
            promise.currentProgress = Math.max(0, Math.min(100, promise.currentProgress + effect.progressDelta));
          }
        }
      }
    }
  }

  return {
    ...state,
    phase: "round",
    currentRound: nextRound,
    budget: newBudget,
    allocations: {},
    currentEvents: nextEvents,
    firedEvents: [...state.firedEvents, ...nextEvents.map((e) => e.id)],
    cascadeLog: [],
    conflictResults: [],
    pendingTeachingMoments: [],
    promises,
  };
}
