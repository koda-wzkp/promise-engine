import { PromiseStatus } from "../types/promise";
import {
  MarsPromise,
  MarsGameState,
  MarsGameAction,
  CascadeEvent,
  QuarterSummary,
} from "../types/mars-game";
import { createInitialPromises, marsEvents, budgetConfig } from "../data/mars-colony";

// ─── STATUS COMPUTATION ───
export function computeStatus(promise: MarsPromise): PromiseStatus {
  // P7 (radiation) is always "unverifiable" — verification gap teaching moment
  if (promise.id === "P7") return "unverifiable";

  if (promise.progress >= promise.target) return "verified";
  if (promise.progress < promise.violateThreshold) return "violated";
  if (promise.progress < promise.degradeThreshold) return "degraded";
  return "declared";
}

// ─── P5 COMPUTED PROGRESS ───
export function computeP5Progress(
  promises: MarsPromise[],
  miningRevenueActive: boolean
): number {
  const p4 = promises.find((p) => p.id === "P4")!;
  const p8 = promises.find((p) => p.id === "P8")!;

  const miningFactor = p4.progress * 0.7;
  const commsFactor = p8.progress * 0.3;
  let base = miningFactor + commsFactor;

  if (miningRevenueActive) base += 10;

  return Math.min(100, Math.max(0, base));
}

// ─── PROGRESS UPDATE ───
export function updatePromiseProgress(
  promise: MarsPromise,
  allocated: number,
  eventEffects: number
): number {
  let newProgress = promise.progress;

  // 1. Apply decay (unfunded promises deteriorate)
  if (allocated === 0 && !promise.oneTimeFunded) {
    newProgress -= promise.decayRate;
  }

  // 2. Apply funding (diminishing returns above 70% progress)
  if (allocated > 0) {
    let efficiency = promise.fundingEfficiency;
    if (promise.progress > 70) {
      efficiency *= 0.6; // Last 30% is harder
    }

    if (promise.isOneTime) {
      if (allocated >= promise.costPerQuarter) {
        newProgress += 35; // Big jump on full funding
      } else {
        newProgress += allocated * efficiency * 0.5;
      }
    } else {
      const fundingRatio = allocated / promise.costPerQuarter;
      newProgress += efficiency * allocated * Math.min(fundingRatio, 1.2);
    }
  }

  // 3. Apply event effects
  newProgress += eventEffects;

  // 4. Clamp
  return Math.max(0, Math.min(100, newProgress));
}

// ─── CASCADE EXPLANATION ───
export function generateCascadeExplanation(
  upstream: MarsPromise,
  downstream: MarsPromise,
  penalty: number
): string {
  return `${upstream.body} at ${Math.round(upstream.progress)}% — below cascade threshold of ${downstream.cascadeThreshold}%. ${downstream.body} lost ${penalty}% progress.`;
}

// ─── CASCADE CHECK ───
export function checkCascades(promises: MarsPromise[]): CascadeEvent[] {
  const cascades: CascadeEvent[] = [];

  // First pass: direct dependencies
  for (const promise of promises) {
    if (promise.dependsOn.length === 0) continue;

    for (const depId of promise.dependsOn) {
      const upstream = promises.find((p) => p.id === depId)!;

      if (upstream.progress < promise.cascadeThreshold) {
        const previousStatus = computeStatus(promise);
        const shortfall = promise.cascadeThreshold - upstream.progress;
        const penalty = Math.floor(shortfall * 0.4);
        promise.progress = Math.max(0, promise.progress - penalty);
        const newStatus = computeStatus(promise);

        if (newStatus !== previousStatus) {
          cascades.push({
            sourcePromiseId: depId,
            affectedPromiseId: promise.id,
            previousStatus,
            newStatus,
            depth: 1,
            explanation: generateCascadeExplanation(upstream, promise, penalty),
          });
        }
      }
    }
  }

  // Second pass: transitive cascades (depth 2)
  const affectedIds = new Set(cascades.map((c) => c.affectedPromiseId));
  for (const promise of promises) {
    if (promise.dependsOn.length === 0) continue;
    if (affectedIds.has(promise.id)) continue;

    for (const depId of promise.dependsOn) {
      if (!affectedIds.has(depId)) continue;

      const upstream = promises.find((p) => p.id === depId)!;
      if (upstream.progress < promise.cascadeThreshold) {
        const previousStatus = computeStatus(promise);
        const shortfall = promise.cascadeThreshold - upstream.progress;
        const penalty = Math.floor(shortfall * 0.25);
        promise.progress = Math.max(0, promise.progress - penalty);
        const newStatus = computeStatus(promise);

        if (newStatus !== previousStatus) {
          cascades.push({
            sourcePromiseId: depId,
            affectedPromiseId: promise.id,
            previousStatus,
            newStatus,
            depth: 2,
            explanation: generateCascadeExplanation(upstream, promise, penalty),
          });
        }
      }
    }
  }

  return cascades;
}

// ─── STRUCTURAL CONFLICT ───
export function applyStructuralConflict(
  allocations: Record<string, number>,
  promises: MarsPromise[]
): { conflictTriggered: boolean; p1Penalty: number; explanation: string } {
  const p4Allocation = allocations["P4"] || 0;

  if (p4Allocation > 2.0) {
    const excessMining = p4Allocation - 2.0;
    const penalty = Math.floor(excessMining * 8);

    return {
      conflictTriggered: true,
      p1Penalty: penalty,
      explanation: `Structural conflict detected. Mining operations funded at $${p4Allocation.toFixed(1)}B draw ${penalty}% from colony power reserves — the same capacity maintained for life support surge protection. Maximizing shareholder return puts the colony's survival margin at risk. This conflict was present in your mandate before you took office.`,
    };
  }

  return { conflictTriggered: false, p1Penalty: 0, explanation: "" };
}

// ─── SCORING ───
export function computeScores(promises: MarsPromise[]): {
  colonyIntegrity: number;
  colonistTrust: number;
  shareholderConfidence: number;
} {
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

  const colonistWeights: Record<string, number> = {
    P1: 3.0,
    P2: 1.5,
    P3: 2.5,
    P6: 1.5,
    P7: 2.0,
    P8: 0.5,
  };

  const shareholderWeights: Record<string, number> = {
    P4: 3.0,
    P5: 3.0,
    P8: 2.0,
    P3: 1.0,
    P1: 1.0,
  };

  function weightedScore(weights: Record<string, number>): number {
    let totalWeight = 0;
    let weightedSum = 0;
    for (const [id, weight] of Object.entries(weights)) {
      const promise = promises.find((p) => p.id === id);
      if (!promise) continue;
      const status = computeStatus(promise);
      const score =
        statusWeight[status] * 0.4 + promise.progress * 0.6;
      weightedSum += score * weight;
      totalWeight += weight;
    }
    return Math.round(weightedSum / totalWeight);
  }

  const colonistTrust = weightedScore(colonistWeights);
  const shareholderConfidence = weightedScore(shareholderWeights);
  const colonyIntegrity = Math.round(
    colonistTrust * 0.55 + shareholderConfidence * 0.45
  );

  return { colonyIntegrity, colonistTrust, shareholderConfidence };
}

// ─── GAME OVER CHECK ───
export function checkGameOver(
  colonistTrust: number,
  shareholderConfidence: number
): { gameOver: boolean; reason: "mutiny" | "defunded" | null } {
  if (colonistTrust <= 10) {
    return { gameOver: true, reason: "mutiny" };
  }
  if (shareholderConfidence <= 10) {
    return { gameOver: true, reason: "defunded" };
  }
  return { gameOver: false, reason: null };
}

// ─── INITIAL STATE ───
export function createInitialState(): MarsGameState {
  const promises = createInitialPromises();
  const { colonyIntegrity, colonistTrust, shareholderConfidence } =
    computeScores(promises);

  return {
    phase: "briefing",
    quarter: 1,
    budget: budgetConfig.startingCapital + budgetConfig.quarterlyAllocation,
    allocations: {},
    promises,
    events: [],
    currentEvents: [],
    colonyIntegrity,
    colonistTrust,
    shareholderConfidence,
    miningRevenueActive: false,
    quarterHistory: [],
    cascadeLog: [],
    gameOver: false,
    gameOverReason: null,
    structuralConflictTriggered: false,
    structuralConflictExplanation: "",
    teachingMomentsSeen: new Set(),
  };
}

// ─── PROCESS QUARTER ───
export function processQuarter(
  state: MarsGameState
): MarsGameState {
  const promises = state.promises.map((p) => ({ ...p }));
  const allocations = state.allocations;

  // Apply structural conflict check
  const conflict = applyStructuralConflict(allocations, promises);
  if (conflict.conflictTriggered) {
    const p1 = promises.find((p) => p.id === "P1")!;
    p1.progress = Math.max(0, p1.progress - conflict.p1Penalty);
  }

  // Apply funding to each promise
  for (const promise of promises) {
    if (promise.id === "P5") continue; // P5 is computed

    const allocated = allocations[promise.id] || 0;
    const eventEffects = state.currentEvents.reduce((sum, evt) => {
      const effect = evt.promiseEffects.find(
        (e) => e.promiseId === promise.id
      );
      return sum + (effect ? effect.progressDelta : 0);
    }, 0);

    const newProgress = updatePromiseProgress(promise, allocated, eventEffects);
    promise.progress = newProgress;

    // Handle one-time promises
    if (promise.isOneTime && allocated >= promise.costPerQuarter) {
      promise.oneTimeFunded = true;
    }
  }

  // Determine mining revenue active
  const p4 = promises.find((p) => p.id === "P4")!;
  const miningRevenueActive = p4.progress >= 60;

  // Update P5 (computed)
  const p5 = promises.find((p) => p.id === "P5")!;
  p5.progress = computeP5Progress(promises, miningRevenueActive);

  // Update all statuses
  for (const promise of promises) {
    promise.status = computeStatus(promise);
  }

  // Check cascades
  const cascadeLog = checkCascades(promises);

  // Re-update statuses after cascades
  for (const promise of promises) {
    promise.status = computeStatus(promise);
  }

  // Compute scores
  const { colonyIntegrity, colonistTrust, shareholderConfidence } =
    computeScores(promises);

  // Check game over
  const { gameOver, reason } = checkGameOver(colonistTrust, shareholderConfidence);

  // Calculate budget for next quarter
  const eventBudgetImpact = state.currentEvents.reduce(
    (sum, evt) => sum + evt.budgetImpact,
    0
  );
  const totalAllocated = Object.values(allocations).reduce(
    (sum, v) => sum + v,
    0
  );
  const miningRevenue = miningRevenueActive ? budgetConfig.miningRevenueBonus : 0;
  const remainingBudget =
    state.budget + eventBudgetImpact - totalAllocated + miningRevenue;

  // Build quarter summary
  const summary: QuarterSummary = {
    quarter: state.quarter,
    budgetStart: state.budget,
    budgetEnd: remainingBudget,
    allocations: { ...allocations },
    events: state.currentEvents,
    cascades: cascadeLog,
    colonyIntegrity,
    colonistTrust,
    shareholderConfidence,
    miningRevenue,
    promiseSnapshots: promises.map((p) => ({
      id: p.id,
      progress: p.progress,
      status: p.status,
    })),
  };

  // Determine next phase
  const nextPhase = gameOver ? "quarter-close" : "quarter-close";

  return {
    ...state,
    phase: nextPhase,
    promises,
    cascadeLog,
    colonyIntegrity,
    colonistTrust,
    shareholderConfidence,
    miningRevenueActive,
    quarterHistory: [...state.quarterHistory, summary],
    budget: Math.max(0, remainingBudget),
    gameOver,
    gameOverReason: reason,
    structuralConflictTriggered: conflict.conflictTriggered,
    structuralConflictExplanation: conflict.explanation,
  };
}

// ─── ADVANCE QUARTER ───
function advanceQuarter(state: MarsGameState): MarsGameState {
  if (state.gameOver || state.quarter === 4) {
    return { ...state, phase: "verdict" };
  }

  const nextQuarter = (state.quarter + 1) as 1 | 2 | 3 | 4;
  const nextEvents = marsEvents.filter((e) => e.quarter === nextQuarter);

  // Apply event budget impacts BEFORE player allocates
  const eventBudgetImpact = nextEvents.reduce(
    (sum, evt) => sum + evt.budgetImpact,
    0
  );

  const quarterlyBudget =
    state.budget + budgetConfig.quarterlyAllocation + eventBudgetImpact;

  return {
    ...state,
    phase: "quarter",
    quarter: nextQuarter,
    budget: Math.max(0, quarterlyBudget),
    allocations: {},
    currentEvents: nextEvents,
    events: [...state.events, ...nextEvents],
    cascadeLog: [],
    structuralConflictTriggered: false,
    structuralConflictExplanation: "",
  };
}

// ─── GAME REDUCER ───
export function marsGameReducer(
  state: MarsGameState,
  action: MarsGameAction
): MarsGameState {
  switch (action.type) {
    case "START_GAME": {
      const q1Events = marsEvents.filter((e) => e.quarter === 1);
      const eventBudgetImpact = q1Events.reduce(
        (sum, evt) => sum + evt.budgetImpact,
        0
      );
      return {
        ...state,
        phase: "quarter",
        quarter: 1,
        budget: Math.max(
          0,
          budgetConfig.startingCapital +
            budgetConfig.quarterlyAllocation +
            eventBudgetImpact
        ),
        currentEvents: q1Events,
        events: q1Events,
        allocations: {},
      };
    }

    case "SET_ALLOCATION": {
      const newAllocations = {
        ...state.allocations,
        [action.promiseId]: action.amount,
      };
      return { ...state, allocations: newAllocations };
    }

    case "CONFIRM_ALLOCATIONS": {
      return processQuarter(state);
    }

    case "ADVANCE_TO_QUARTER": {
      return advanceQuarter(state);
    }

    case "VIEW_CTA": {
      return { ...state, phase: "cta" };
    }

    case "RESTART": {
      return createInitialState();
    }

    default:
      return state;
  }
}

// ─── VERDICT LOGIC ───
export function computeVerdict(state: MarsGameState): {
  boardRecommendation: "Retain" | "Probation" | "Terminate";
  colonistResult: "RETAINED" | "RECALLED";
  colonistVotePercent: number;
} {
  const { shareholderConfidence, colonistTrust, colonyIntegrity } = state;

  let boardRecommendation: "Retain" | "Probation" | "Terminate";
  if (shareholderConfidence >= 60 && colonyIntegrity >= 50) {
    boardRecommendation = "Retain";
  } else if (shareholderConfidence >= 40 || colonyIntegrity >= 60) {
    boardRecommendation = "Probation";
  } else {
    boardRecommendation = "Terminate";
  }

  const colonistResult: "RETAINED" | "RECALLED" =
    colonistTrust >= 60 ? "RETAINED" : "RECALLED";
  const colonistVotePercent = Math.min(
    100,
    Math.max(0, colonistTrust + (Math.random() * 6 - 3))
  );

  return { boardRecommendation, colonistResult, colonistVotePercent };
}

// ─── TEACHING MOMENT TRIGGERS ───
export function getTeachingMoments(state: MarsGameState): string[] {
  const moments: string[] = [];

  const p3 = state.promises.find((p) => p.id === "P3")!;
  if (p3.progress < 50 && !state.teachingMomentsSeen.has("cascade")) {
    moments.push("cascade");
  }

  if (
    state.structuralConflictTriggered &&
    !state.teachingMomentsSeen.has("structural-conflict")
  ) {
    moments.push("structural-conflict");
  }

  const hasVerificationGapEvent = state.currentEvents.some(
    (e) => e.id === "E6"
  );
  if (
    hasVerificationGapEvent &&
    !state.teachingMomentsSeen.has("verification-gap")
  ) {
    moments.push("verification-gap");
  }

  if (
    state.quarter === 1 &&
    state.phase === "quarter" &&
    !state.teachingMomentsSeen.has("network-health")
  ) {
    moments.push("network-health");
  }

  return moments;
}
