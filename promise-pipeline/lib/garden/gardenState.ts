"use client";

import { useReducer, useEffect, useCallback, useRef } from "react";
import type {
  GardenState,
  GardenAction,
  GardenPromise,
  PersonalStats,
  KRegime,
  CheckInEvent,
} from "@/lib/types/personal";
import { computeAdaptiveFrequency } from "./adaptiveCheckin";

// ─── DEFAULTS ───

const EMPTY_STATS: PersonalStats = {
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
};

const INITIAL_STATE: GardenState = {
  promises: {},
  domains: [],
  stats: EMPTY_STATS,
  onboardingComplete: false,
  tourComplete: false,
};

const STORAGE_KEY = "promise-garden-v2";

// ─── STATS COMPUTATION ───

function computeStats(promises: Record<string, GardenPromise>): PersonalStats {
  const all = Object.values(promises);
  const active = all.filter(
    (p) =>
      !p.fossilized &&
      p.status !== "violated" &&
      p.completedAt === null
  );
  const kept = all.filter((p) => p.completedAt !== null && p.status === "verified");
  const broken = all.filter((p) => p.status === "violated");
  const renegotiated = all.filter((p) => p.graftHistory.length > 0);

  const kDistribution: Record<KRegime, number> = {
    composting: 0,
    ecological: 0,
    physics: 0,
  };
  for (const p of all) {
    kDistribution[p.kRegime]++;
  }

  // g_obs: average check-in rate across active promises
  const now = Date.now();
  let gObsSum = 0;
  let gObsCount = 0;
  for (const p of active) {
    if (p.lastCheckIn) {
      const daysSince = Math.max(
        1,
        (now - new Date(p.lastCheckIn).getTime()) / (1000 * 60 * 60 * 24)
      );
      gObsSum += 1 / daysSince;
      gObsCount++;
    }
  }
  const gObsRate = gObsCount > 0 ? gObsSum / gObsCount : 0;

  const byDomain: PersonalStats["byDomain"] = {};
  const domains = new Set(all.map((p) => p.domain));
  for (const domain of domains) {
    const dp = all.filter((p) => p.domain === domain);
    const dActive = dp.filter(
      (p) => !p.fossilized && p.status !== "violated" && p.completedAt === null
    );
    const dKept = dp.filter((p) => p.completedAt !== null && p.status === "verified");
    const dBroken = dp.filter((p) => p.status === "violated");
    const avgK =
      dp.length > 0 ? dp.reduce((s, p) => s + p.expectedK, 0) / dp.length : 0;

    byDomain[domain] = {
      total: dp.length,
      active: dActive.length,
      kept: dKept.length,
      broken: dBroken.length,
      keptRate: dp.length > 0 ? dKept.length / dp.length : 0,
      averageK: avgK,
    };
  }

  const total = all.length;
  return {
    totalPromises: total,
    activePromises: active.length,
    keptCount: kept.length,
    brokenCount: broken.length,
    renegotiatedCount: renegotiated.length,
    keptRate: total > 0 ? kept.length / total : 0,
    byDomain,
    kDistribution,
    gObsRate,
    gDecRate: 0.25,
  };
}

// ─── REDUCER ───

function gardenReducer(state: GardenState, action: GardenAction): GardenState {
  switch (action.type) {
    case "LOAD_STATE":
      return action.state;

    case "CREATE_PROMISE": {
      const p = action.promise;
      const promises = { ...state.promises, [p.id]: p };
      const domains = state.domains.includes(p.domain)
        ? state.domains
        : [...state.domains, p.domain];
      return {
        ...state,
        promises,
        domains,
        stats: computeStats(promises),
      };
    }

    case "CHECK_IN": {
      const existing = state.promises[action.promiseId];
      if (!existing) return state;

      const event: CheckInEvent = {
        timestamp: new Date().toISOString(),
        statusBefore: existing.status,
        statusAfter: action.newStatus,
        note: action.note ?? null,
      };

      const updated: GardenPromise = {
        ...existing,
        status: action.newStatus,
        lastCheckIn: new Date().toISOString(),
        checkInHistory: [...existing.checkInHistory, event],
      };

      // Recompute adaptive frequency
      updated.checkInFrequency = {
        ...updated.checkInFrequency,
        adaptive: computeAdaptiveFrequency(updated),
      };

      const promises = { ...state.promises, [action.promiseId]: updated };
      return { ...state, promises, stats: computeStats(promises) };
    }

    case "RENEGOTIATE": {
      const existing = state.promises[action.promiseId];
      if (!existing) return state;

      const graft = {
        timestamp: new Date().toISOString(),
        previousBody: existing.body,
        reason: action.reason ?? "",
      };

      const updated: GardenPromise = {
        ...existing,
        body: action.newBody,
        graftHistory: [...existing.graftHistory, graft],
      };

      const promises = { ...state.promises, [action.promiseId]: updated };
      return { ...state, promises, stats: computeStats(promises) };
    }

    case "FOSSILIZE": {
      const existing = state.promises[action.promiseId];
      if (!existing) return state;

      const updated: GardenPromise = { ...existing, fossilized: true };
      const promises = { ...state.promises, [action.promiseId]: updated };
      return { ...state, promises, stats: computeStats(promises) };
    }

    case "REVIVE": {
      const existing = state.promises[action.promiseId];
      if (!existing) return state;

      const updated: GardenPromise = {
        ...existing,
        fossilized: false,
        status: "declared",
      };
      const promises = { ...state.promises, [action.promiseId]: updated };
      return { ...state, promises, stats: computeStats(promises) };
    }

    case "COMPLETE": {
      const existing = state.promises[action.promiseId];
      if (!existing) return state;

      const dwellTime = Math.max(
        1,
        (Date.now() - new Date(existing.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const artifact = {
        id: `ART-${Date.now()}`,
        promiseId: existing.id,
        generatedFrom: {
          kRegime: existing.kRegime,
          verificationMethod: existing.verification.method,
          dwellTime: Math.round(dwellTime),
          domain: existing.domain,
        },
        visual: {
          growthPattern:
            existing.kRegime === "physics"
              ? "crystalline"
              : existing.kRegime === "ecological"
              ? "organic"
              : "ethereal",
          material:
            existing.verification.method === "sensor"
              ? "metallic"
              : existing.verification.method === "self-report"
              ? "wood"
              : "smoke",
          uniqueSeed: existing.plantSeed,
        },
        giftedTo: null,
        giftable: false,
      };

      const updated: GardenPromise = {
        ...existing,
        status: "verified",
        completedAt: new Date().toISOString(),
        reflection: action.reflection ?? existing.reflection,
        artifact,
      };

      const promises = { ...state.promises, [action.promiseId]: updated };
      return { ...state, promises, stats: computeStats(promises) };
    }

    case "UPDATE_FREQUENCY": {
      const existing = state.promises[action.promiseId];
      if (!existing) return state;

      const updated: GardenPromise = {
        ...existing,
        checkInFrequency: {
          userMin: action.min,
          userMax: action.max,
          adaptive: computeAdaptiveFrequency({
            ...existing,
            checkInFrequency: {
              userMin: action.min,
              userMax: action.max,
              adaptive: existing.checkInFrequency.adaptive,
            },
          }),
        },
      };

      const promises = { ...state.promises, [action.promiseId]: updated };
      return { ...state, promises, stats: computeStats(promises) };
    }

    case "COMPLETE_ONBOARDING":
      return { ...state, onboardingComplete: true };

    case "COMPLETE_TOUR":
      return { ...state, tourComplete: true };

    default:
      return state;
  }
}

// ─── PERSISTENCE ───

function loadState(): GardenState {
  if (typeof window === "undefined") return INITIAL_STATE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_STATE;
    const parsed = JSON.parse(stored);
    if (parsed.version !== 2) return INITIAL_STATE;
    return {
      promises: parsed.promises ?? {},
      domains: parsed.domains ?? [],
      stats: computeStats(parsed.promises ?? {}),
      onboardingComplete: parsed.onboardingComplete ?? false,
      tourComplete: parsed.tourComplete ?? false,
    };
  } catch {
    return INITIAL_STATE;
  }
}

function saveState(state: GardenState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 2,
        promises: state.promises,
        domains: state.domains,
        onboardingComplete: state.onboardingComplete,
        tourComplete: state.tourComplete,
        createdAt:
          localStorage.getItem(STORAGE_KEY)
            ? JSON.parse(localStorage.getItem(STORAGE_KEY)!).createdAt
            : new Date().toISOString(),
        lastOpenedAt: new Date().toISOString(),
      })
    );
  } catch {
    // Ignore storage quota errors
  }
}

// ─── HOOK ───

export function useGardenState() {
  const [state, dispatch] = useReducer(gardenReducer, INITIAL_STATE);
  const initialized = useRef(false);

  // Load persisted state on mount
  useEffect(() => {
    const loaded = loadState();
    dispatch({ type: "LOAD_STATE", state: loaded });
    initialized.current = true;
  }, []);

  // Persist on every change after initialization
  useEffect(() => {
    if (initialized.current) {
      saveState(state);
    }
  }, [state]);

  const promiseList = useCallback((): GardenPromise[] => {
    const vals: GardenPromise[] = Object.values(state.promises);
    return vals;
  }, [state.promises]);

  const activePromises = useCallback((): GardenPromise[] => {
    const vals: GardenPromise[] = Object.values(state.promises);
    return vals.filter(
      (p) => !p.fossilized && p.status !== "violated" && p.completedAt === null
    );
  }, [state.promises]);

  const dueCheckIns = useCallback((): GardenPromise[] => {
    const now = Date.now();
    const vals: GardenPromise[] = Object.values(state.promises);
    return vals.filter((p) => {
      if (p.fossilized || p.status === "violated" || p.completedAt !== null)
        return false;
      if (!p.lastCheckIn) return true; // never checked in
      const daysSince =
        (now - new Date(p.lastCheckIn).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince >= p.checkInFrequency.adaptive;
    });
  }, [state.promises]);

  const artifacts = useCallback((): GardenPromise[] => {
    const vals: GardenPromise[] = Object.values(state.promises);
    return vals.filter((p) => p.artifact !== null);
  }, [state.promises]);

  const fossils = useCallback((): GardenPromise[] => {
    const vals: GardenPromise[] = Object.values(state.promises);
    return vals.filter((p) => p.fossilized);
  }, [state.promises]);

  return {
    state,
    dispatch,
    promiseList,
    activePromises,
    dueCheckIns,
    artifacts,
    fossils,
    initialized: initialized.current,
  };
}
