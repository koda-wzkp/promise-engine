import type { GardenPromise, CheckInEvent } from "@/lib/types/personal";

/**
 * Compute adaptive check-in frequency based on k regime.
 * Returns the optimal number of days between check-ins.
 */
export function computeAdaptiveFrequency(promise: GardenPromise): number {
  const k = promise.expectedK;
  const g_dec = 0.25; // baseline from WGI/FH

  let targetDays: number;

  if (k < 0.5) {
    // Composting — push toward more frequent (user's min)
    targetDays = promise.checkInFrequency.userMin;
  } else if (k > 1.5) {
    // Physics — back off (user's max, already working)
    targetDays = promise.checkInFrequency.userMax;
  } else {
    // Ecological — ENAQT sweet spot: g_obs ~ g_dec
    targetDays = 1 / g_dec; // ~4 days
  }

  // If Zeno detected, push toward max
  if (detectZeno(promise)) {
    targetDays = promise.checkInFrequency.userMax;
  }

  // Clamp to user bounds
  return Math.max(
    promise.checkInFrequency.userMin,
    Math.min(promise.checkInFrequency.userMax, targetDays)
  );
}

/**
 * Detect Zeno monitoring: over-checking with no state change.
 */
export function detectZeno(promise: GardenPromise): boolean {
  const recent = promise.checkInHistory.slice(-3);
  if (recent.length < 3) return false;

  // All 3 recent check-ins had no state change
  const noChange = recent.every((e) => e.statusBefore === e.statusAfter);

  // Check-in frequency is above 2x baseline
  const avgInterval = averageInterval(recent);
  if (avgInterval === 0) return false;
  const g_obs = 1 / avgInterval;
  const g_dec = 0.25;

  return noChange && g_obs > 2 * g_dec;
}

function averageInterval(events: CheckInEvent[]): number {
  if (events.length < 2) return 0;
  let totalDays = 0;
  for (let i = 1; i < events.length; i++) {
    const prev = new Date(events[i - 1].timestamp).getTime();
    const curr = new Date(events[i].timestamp).getTime();
    totalDays += (curr - prev) / (1000 * 60 * 60 * 24);
  }
  return totalDays / (events.length - 1);
}

/**
 * Check if a promise has a check-in due.
 */
export function isCheckInDue(promise: GardenPromise): boolean {
  if (promise.fossilized || promise.status === "violated" || promise.completedAt !== null)
    return false;
  if (!promise.lastCheckIn) return true;
  const daysSince =
    (Date.now() - new Date(promise.lastCheckIn).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= promise.checkInFrequency.adaptive;
}

/**
 * Get the Zeno message if monitoring is too frequent.
 */
export function getZenoMessage(promise: GardenPromise): string | null {
  if (!detectZeno(promise)) return null;
  return "This promise seems stable. Checking less often so you can focus elsewhere.";
}
