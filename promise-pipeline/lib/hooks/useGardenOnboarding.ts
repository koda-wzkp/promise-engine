"use client";

import { useState, useCallback } from "react";

export type GardenOnboardingPhase = "clearcut" | "first-plant" | "garden-live";

export interface GardenOnboardingState {
  /** Which onboarding phase the user is in */
  phase: GardenOnboardingPhase;
  /** How many promises have been planted (mirrors promise array length) */
  promisesPlanted: number;
  /** True after the user completes their first check-in */
  firstCheckInComplete: boolean;
  /** How many calendar days the user has been active */
  daysActive: number;
  /** True once a notification time is set or explicitly declined */
  notificationTimeSet: boolean;
  /** True once account is created or the prompt is permanently dismissed */
  accountCreated: boolean;
  /** True once the seed tray is dismissed */
  seedTrayDismissed: boolean;
  /** True once the dependency linking tooltip has been shown */
  dependencyTutorialSeen: boolean;
  /** How many times the account creation prompt has been dismissed */
  accountPromptDismissCount: number;
}

const STORAGE_KEY = "promise-garden-onboarding";

const DEFAULT_STATE: GardenOnboardingState = {
  phase: "clearcut",
  promisesPlanted: 0,
  firstCheckInComplete: false,
  daysActive: 0,
  notificationTimeSet: false,
  accountCreated: false,
  seedTrayDismissed: false,
  dependencyTutorialSeen: false,
  accountPromptDismissCount: 0,
};

function loadState(): GardenOnboardingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATE;
    // Merge with defaults so new fields are always present
    return { ...DEFAULT_STATE, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_STATE;
  }
}

export function useGardenOnboarding() {
  const [state, setState] = useState<GardenOnboardingState>(loadState);

  const persist = useCallback((next: GardenOnboardingState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const updateState = useCallback(
    (updates: Partial<GardenOnboardingState>) => {
      setState((prev) => {
        const next = { ...prev, ...updates };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  /** Transition clearcut → first-plant: the seed was tapped */
  const openSeedForFirstTime = useCallback(() => {
    updateState({ phase: "first-plant" });
  }, [updateState]);

  /**
   * Called whenever a promise is successfully planted.
   * Always advances phase to garden-live and records the new total count.
   */
  const plantPromise = useCallback(
    (newTotalCount: number) => {
      updateState({ phase: "garden-live", promisesPlanted: newTotalCount });
    },
    [updateState]
  );

  /** Called when the user completes their first daily check-in */
  const completeFirstCheckIn = useCallback(() => {
    updateState({ firstCheckInComplete: true });
  }, [updateState]);

  /**
   * Call once per calendar day to advance the engagement counter.
   * Recommended: call on app load if today's date differs from last increment date.
   */
  const incrementDaysActive = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, daysActive: prev.daysActive + 1 };
      persist(next);
      return next;
    });
  }, [persist]);

  const dismissSeedTray = useCallback(() => {
    updateState({ seedTrayDismissed: true });
  }, [updateState]);

  /**
   * Called when notification time is set or "No thanks" is tapped.
   * Pass null for "no thanks".
   */
  const setNotificationTime = useCallback(
    (_time: string | null) => {
      // Actual notification scheduling is out of scope — persist the decision
      updateState({ notificationTimeSet: true });
    },
    [updateState]
  );

  /**
   * Dismiss the account creation prompt.
   * After 2 dismissals it never shows again.
   */
  const dismissAccountPrompt = useCallback(() => {
    setState((prev) => {
      const count = prev.accountPromptDismissCount + 1;
      const next: GardenOnboardingState = {
        ...prev,
        accountPromptDismissCount: count,
        // 2nd dismissal → suppress forever by marking as "created"
        accountCreated: count >= 2 ? true : prev.accountCreated,
      };
      persist(next);
      return next;
    });
  }, [persist]);

  /** Stub for "Save my garden" — auth not yet implemented */
  const saveGarden = useCallback(() => {
    console.log("[PromiseGarden] Save garden → auth not yet implemented");
    updateState({ accountCreated: true });
  }, [updateState]);

  const dismissDependencyTooltip = useCallback(() => {
    updateState({ dependencyTutorialSeen: true });
  }, [updateState]);

  // Threshold: 3 days on first show, 10 days on second
  const accountPromptThreshold =
    state.accountPromptDismissCount === 0 ? 3 : 10;
  const showAccountPrompt =
    !state.accountCreated &&
    state.daysActive >= accountPromptThreshold &&
    state.accountPromptDismissCount < 2;

  return {
    state,
    openSeedForFirstTime,
    plantPromise,
    completeFirstCheckIn,
    incrementDaysActive,
    dismissSeedTray,
    setNotificationTime,
    dismissAccountPrompt,
    saveGarden,
    dismissDependencyTooltip,
    showAccountPrompt,
    updateState,
  };
}
