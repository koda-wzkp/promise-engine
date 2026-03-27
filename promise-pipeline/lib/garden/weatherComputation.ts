import type { GardenPromise } from "../types/personal";

export type WeatherState = "sunny" | "partly" | "overcast" | "frozen" | "dormant";

function daysBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000;
}

export function computeWeather(promises: GardenPromise[]): WeatherState {
  const active = promises.filter(
    (p) => !p.fossilized && p.status !== "violated"
  );
  if (active.length === 0) return "dormant";

  const now = new Date().toISOString();
  let totalRate = 0;
  let counted = 0;

  for (const p of active) {
    if (!p.lastCheckIn) continue;
    const days = Math.max(daysBetween(p.lastCheckIn, now), 0.1);
    totalRate += 1 / days;
    counted++;
  }

  if (counted === 0) return "frozen";

  const g_obs = totalRate / active.length;
  const g_dec = 0.25;
  const ratio = g_obs / g_dec;

  if (ratio > 1.5) return "sunny";
  if (ratio > 0.7) return "partly";
  return "overcast";
}

export function weatherToGradient(weather: WeatherState): string {
  switch (weather) {
    case "sunny":
      return "linear-gradient(180deg, #87CEEB 0%, #B3E5FC 40%, #E0F6FF 100%)";
    case "partly":
      return "linear-gradient(180deg, #bfdbfe 0%, #eff6ff 100%)";
    case "overcast":
      return "linear-gradient(180deg, #6b7280 0%, #9ca3af 100%)";
    case "frozen":
      return "linear-gradient(180deg, #1f2937 0%, #111827 100%)";
    case "dormant":
      return "linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)";
  }
}

export function weatherLabel(weather: WeatherState): string {
  switch (weather) {
    case "sunny":   return "Sunny — checking in regularly";
    case "partly":  return "Partly cloudy — on pace";
    case "overcast": return "Overcast — check-ins falling behind";
    case "frozen":  return "Frozen — no check-ins yet";
    case "dormant": return "Dormant — garden is resting";
  }
}
