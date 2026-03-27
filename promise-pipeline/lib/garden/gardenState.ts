import { useReducer, useEffect } from "react";
import type {
  GardenPromise,
  GardenStatsV2,
  CheckInEvent,
  KRegime,
  PersonalPromise,
} from "../types/personal";
import {
  classifyKRegime,
  expectedKValue,
} from "../types/personal";
import type { PromiseStatus } from "../types/promise";
import { computeAdaptiveFrequency, detectZeno } from "./adaptiveCheckin";
import { generateArtifact } from "./artifactGeneration";

// ─── STORAGE ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "promise-garden-v2";
const STORAGE_VERSION = 2;

interface StoredState {
  version: number;
  promises: Record<string, GardenPromise>;
  domains: string[];
  onboardingComplete: boolean;
  tourComplete: boolean;
  createdAt: string;
  lastOpenedAt: string;
}

// ─── STATE ───────────────────────────────────────────────────────────────────

export interface GardenState {
  promises: Record<string, GardenPromise>;
  domains: string[];
  stats: GardenStatsV2;
  onboardingComplete: boolean;
  tourComplete: boolean;
}

// ─── ACTIONS ─────────────────────────────────────────────────────────────────

export type GardenAction =
  | { type: "CREATE_PROMISE"; promise: GardenPromise }
  | { type: "CHECK_IN"; promiseId: string; newStatus: PromiseStatus; note?: string }
  | { type: "RENEGOTIATE"; promiseId: string; newBody: string; reason?: string }
  | { type: "FOSSILIZE"; promiseId: string }
  | { type: "REVIVE"; promiseId: string }
  | { type: "COMPLETE"; promiseId: string; reflection?: string }
  | { type: "UPDATE_FREQUENCY"; promiseId: string; min: number; max: number }
  | { type: "COMPLETE_ONBOARDING" }
  | { type: "COMPLETE_TOUR" }
  | { type: "LOAD_STATE"; state: GardenState };

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** djb2 hash — converts promise ID string to a stable plant seed. */
function hashSeed(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return Math.abs(h >>> 0);
}

function daysBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000;
}

/** Convert a v1 PersonalPromise to a GardenPromise by adding v2 fields. */
export function toGardenPromise(p: PersonalPromise): GardenPromise {
  const kRegime = classifyKRegime(p.verification.method);
  const ek = expectedKValue(kRegime);
  const adaptive = computeAdaptiveFrequency({
    expectedK: ek,
    checkInFrequency: { userMin: 1, userMax: 14, adaptive: 4 },
  } as GardenPromise);

  return {
    ...p,
    visibility: "private",
    kRegime,
    expectedK: ek,
    checkInFrequency: { userMin: 1, userMax: 14, adaptive },
    lastCheckIn: null,
    checkInHistory: [],
    gardenPlot: p.domain,
    plantSeed: hashSeed(p.id),
    graftHistory: [],
    fossilized: false,
    artifact: null,
    completedAt: p.completedAt ?? null,
    reflection: p.reflection ?? null,
  };
}

function computeStats(promises: Record<string, GardenPromise>): GardenStatsV2 {
  const all = Object.values(promises);
  const active = all.filter(
    (p) => !p.fossilized && p.status !== "violated" && p.status !== "verified"
  );
  const kept = all.filter((p) => p.status === "verified" || (p.artifact !== null && !p.fossilized));
  const broken = all.filter((p) => p.status === "violated" || p.fossilized);
  const renegotiated = all.filter((p) => p.graftHistory.length > 0);

  const kDistribution: GardenStatsV2["kDistribution"] = {
    composting: 0,
    ecological: 0,
    physics: 0,
  };
  all.forEach((p) => kDistribution[p.kRegime]++);

  const now = new Date().toISOString();
  let totalObs = 0;
  let activeCount = 0;
  active.forEach((p) => {
    if (p.lastCheckIn) {
      const days = Math.max(daysBetween(p.lastCheckIn, now), 0.1);
      totalObs += 1 / days;
      activeCount++;
    }
  });
  const gObsRate = activeCount > 0 ? totalObs / active.length : 0;

  const byDomain: GardenStatsV2["byDomain"] = {};
  const domains = Array.from(new Set(all.map((p) => p.domain)));
  for (const domain of domains) {
    const dp = all.filter((p) => p.domain === domain);
    const dk = dp.filter((p) => p.status === "verified" || p.artifact !== null);
    const db = dp.filter((p) => p.status === "violated" || p.fossilized);
    const da = dp.filter((p) => !p.fossilized && p.status !== "violated" && p.status !== "verified");
    const avgK = dp.reduce((s, p) => s + p.expectedK, 0) / Math.max(dp.length, 1);
    const completed = dk.length + db.length;
    byDomain[domain] = {
      total: dp.length,
      active: da.length,
      kept: dk.length,
      broken: db.length,
      keptRate: completed > 0 ? dk.length / completed : 0,
      averageK: avgK,
    };
  }

  const total = all.length;
  const completed = kept.length + broken.length;

  return {
    totalPromises: total,
    activePromises: active.length,
    keptCount: kept.length,
    brokenCount: broken.length,
    renegotiatedCount: renegotiated.length,
    keptRate: completed > 0 ? kept.length / completed : 0,
    byDomain,
    kDistribution,
    gObsRate,
    gDecRate: 0.25,
  };
}

function refreshAllFrequencies(
  promises: Record<string, GardenPromise>
): Record<string, GardenPromise> {
  const out: Record<string, GardenPromise> = {};
  for (const [id, p] of Object.entries(promises)) {
    if (!p.fossilized && p.status !== "violated") {
      const adaptive = computeAdaptiveFrequency(p);
      out[id] = { ...p, checkInFrequency: { ...p.checkInFrequency, adaptive } };
    } else {
      out[id] = p;
    }
  }
  return out;
}

// ─── REDUCER ─────────────────────────────────────────────────────────────────

function gardenReducer(state: GardenState, action: GardenAction): GardenState {
  switch (action.type) {
    case "LOAD_STATE":
      return action.state;

    case "COMPLETE_ONBOARDING":
      return { ...state, onboardingComplete: true };

    case "COMPLETE_TOUR":
      return { ...state, tourComplete: true };

    case "CREATE_PROMISE": {
      const promises = { ...state.promises, [action.promise.id]: action.promise };
      const refreshed = refreshAllFrequencies(promises);
      const domains = Array.from(new Set([...state.domains, action.promise.domain]));
      return { ...state, promises: refreshed, domains, stats: computeStats(refreshed) };
    }

    case "CHECK_IN": {
      const p = state.promises[action.promiseId];
      if (!p) return state;

      const now = new Date().toISOString();
      const event: CheckInEvent = {
        timestamp: now,
        statusBefore: p.status,
        statusAfter: action.newStatus,
        note: action.note ?? null,
      };
      const history = [...p.checkInHistory, event];

      let updated: GardenPromise = {
        ...p,
        status: action.newStatus,
        lastCheckIn: now,
        checkInHistory: history,
      };

      // Zeno trap: recommend backing off
      if (detectZeno(updated)) {
        const newMax = Math.min(updated.checkInFrequency.userMax + 2, 30);
        updated = { ...updated, checkInFrequency: { ...updated.checkInFrequency, userMax: newMax } };
      }
      updated.checkInFrequency = { ...updated.checkInFrequency, adaptive: computeAdaptiveFrequency(updated) };

      const promises = { ...state.promises, [action.promiseId]: updated };
      return { ...state, promises, stats: computeStats(promises) };
    }

    case "RENEGOTIATE": {
      const p = state.promises[action.promiseId];
      if (!p) return state;

      const now = new Date().toISOString();
      const graftPoint = {
        timestamp: now,
        previousBody: p.body,
        reason: action.reason ?? "",
      };
      const updated: GardenPromise = {
        ...p,
        body: action.newBody,
        status: "declared",
        graftHistory: [...p.graftHistory, graftPoint],
        lastCheckIn: now,
      };
      const promises = { ...state.promises, [action.promiseId]: updated };
      return { ...state, promises, stats: computeStats(promises) };
    }

    case "FOSSILIZE": {
      const p = state.promises[action.promiseId];
      if (!p) return state;

      const artifact = generateArtifact({ ...p, completedAt: new Date().toISOString() });
      const updated: GardenPromise = {
        ...p,
        fossilized: true,
        artifact,
        completedAt: new Date().toISOString(),
      };
      const promises = { ...state.promises, [action.promiseId]: updated };
      return { ...state, promises, stats: computeStats(promises) };
    }

    case "REVIVE": {
      const p = state.promises[action.promiseId];
      if (!p) return state;

      const updated: GardenPromise = {
        ...p,
        fossilized: false,
        status: "declared",
        lastCheckIn: new Date().toISOString(),
      };
      const promises = { ...state.promises, [action.promiseId]: updated };
      return { ...state, promises, stats: computeStats(promises) };
    }

    case "COMPLETE": {
      const p = state.promises[action.promiseId];
      if (!p) return state;

      const now = new Date().toISOString();
      const withDate: GardenPromise = { ...p, status: "verified", completedAt: now, reflection: action.reflection ?? null };
      const artifact = generateArtifact(withDate);
      const updated: GardenPromise = { ...withDate, artifact };
      const promises = { ...state.promises, [action.promiseId]: updated };
      return { ...state, promises, stats: computeStats(promises) };
    }

    case "UPDATE_FREQUENCY": {
      const p = state.promises[action.promiseId];
      if (!p) return state;

      const min = Math.max(1, action.min);
      const max = Math.max(min, action.max);
      const updated: GardenPromise = {
        ...p,
        checkInFrequency: { userMin: min, userMax: max, adaptive: computeAdaptiveFrequency({ ...p, checkInFrequency: { userMin: min, userMax: max, adaptive: 4 } }) },
      };
      const promises = { ...state.promises, [action.promiseId]: updated };
      return { ...state, promises, stats: computeStats(promises) };
    }

    default:
      return state;
  }
}

// ─── INITIAL STATE ────────────────────────────────────────────────────────────

const INITIAL_STATE: GardenState = {
  promises: {},
  domains: [],
  stats: {
    totalPromises: 0,
    activePromises: 0,
    keptCount: 0,
    brokenCount: 0,
    renegotiatedCount: 0,
    keptRate: 0,
    byDomain: {},
    kDistribution: { composting: 0, ecological: 0, physics: 0 },
    gObsRate: 0,
    gDecRate: 0.25,
  },
  onboardingComplete: false,
  tourComplete: false,
};

// ─── PERSISTENCE ─────────────────────────────────────────────────────────────

function loadFromStorage(): GardenState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const stored: StoredState = JSON.parse(raw);
    if (stored.version !== STORAGE_VERSION) return INITIAL_STATE;
    const state: GardenState = {
      promises: stored.promises ?? {},
      domains: stored.domains ?? [],
      onboardingComplete: stored.onboardingComplete ?? false,
      tourComplete: stored.tourComplete ?? false,
      stats: computeStats(stored.promises ?? {}),
    };
    return state;
  } catch {
    return INITIAL_STATE;
  }
}

function saveToStorage(state: GardenState): void {
  if (typeof window === "undefined") return;
  try {
    const stored: StoredState = {
      version: STORAGE_VERSION,
      promises: state.promises,
      domains: state.domains,
      onboardingComplete: state.onboardingComplete,
      tourComplete: state.tourComplete,
      createdAt: localStorage.getItem(STORAGE_KEY)
        ? JSON.parse(localStorage.getItem(STORAGE_KEY)!).createdAt
        : new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage quota exceeded — fail silently
  }
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useGardenState() {
  const [state, dispatch] = useReducer(gardenReducer, INITIAL_STATE, () => {
    // SSR-safe: return initial state on server, load from storage on client
    return loadFromStorage();
  });

  // Persist after every action
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  return { state, dispatch } as const;
}
