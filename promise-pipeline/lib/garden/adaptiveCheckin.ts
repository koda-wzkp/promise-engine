import type { GardenPromise } from "../types/personal";

const G_DEC = 0.25; // baseline decay rate (WGI/FH calibration)

function daysBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000;
}

/** Compute the optimal check-in interval in days for a promise. */
export function computeAdaptiveFrequency(promise: GardenPromise): number {
  const k = promise.expectedK;
  const { userMin, userMax } = promise.checkInFrequency;

  let targetDays: number;
  if (k < 0.5) {
    // Composting regime — push toward more frequent (user's min)
    targetDays = userMin;
  } else if (k > 1.3) {
    // Physics regime — back off, already working well
    targetDays = userMax;
  } else {
    // Ecological — ENAQT sweet spot: g_obs ≈ g_dec → ~4 days
    targetDays = 1 / G_DEC;
  }

  return Math.max(userMin, Math.min(userMax, targetDays));
}

/**
 * Zeno trap detection: user is checking in too frequently with no state change.
 * Returns true when the system should recommend reducing frequency.
 */
export function detectZeno(promise: GardenPromise): boolean {
  const recent = promise.checkInHistory.slice(-3);
  if (recent.length < 3) return false;

  const noChange = recent.every((e) => e.statusBefore === e.statusAfter);
  if (!noChange) return false;

  const timestamps = recent.map((e) => new Date(e.timestamp).getTime());
  const intervals = [
    (timestamps[1] - timestamps[0]) / 86_400_000,
    (timestamps[2] - timestamps[1]) / 86_400_000,
  ];
  const avgInterval = (intervals[0] + intervals[1]) / 2;
  const g_obs = avgInterval > 0 ? 1 / avgInterval : 0;

  return g_obs > 2 * G_DEC;
}

/** Returns true if a check-in is due for this promise. */
export function isDue(promise: GardenPromise): boolean {
  if (promise.fossilized || promise.status === "violated") return false;
  if (!promise.lastCheckIn) return true;
  const days = daysBetween(promise.lastCheckIn, new Date().toISOString());
  return days >= promise.checkInFrequency.adaptive;
}

/** Recompute adaptive frequency and return updated checkInFrequency object. */
export function refreshFrequency(
  promise: GardenPromise
): GardenPromise["checkInFrequency"] {
  const adaptive = computeAdaptiveFrequency(promise);
  return { ...promise.checkInFrequency, adaptive };
}
