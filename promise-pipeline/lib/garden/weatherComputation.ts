import type { GardenPromise } from "@/lib/types/personal";

export type WeatherState = "sunny" | "partly" | "overcast" | "frozen" | "dormant";

function daysBetween(a: string, b: Date): number {
  return (b.getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24);
}

export function computeWeather(promises: GardenPromise[]): WeatherState {
  const activePromises = promises.filter(
    (p) => !p.fossilized && p.status !== "violated" && p.completedAt === null
  );

  if (activePromises.length === 0) return "dormant";

  const now = new Date();

  // g_obs: average check-in rate across active promises
  const g_obs =
    activePromises.reduce((sum, p) => {
      if (!p.lastCheckIn) return sum;
      const daysSince = daysBetween(p.lastCheckIn, now);
      return sum + 1 / Math.max(daysSince, 1);
    }, 0) / activePromises.length;

  // g_dec: baseline decay rate (0.25 from WGI/FH calibration)
  const g_dec = 0.25;

  const ratio = g_obs / g_dec;

  if (g_obs === 0) return "frozen"; // Zeno freeze
  if (ratio > 1.5) return "sunny"; // checking more than decay
  if (ratio > 0.7) return "partly"; // balanced
  return "overcast"; // decaying faster than checking
}

export interface WeatherVisuals {
  skyGradient: string;
  lightColor: string;
  lightIntensity: number;
  particles: "pollen" | "mist" | "none";
  frost: boolean;
}

export function getWeatherVisuals(weather: WeatherState): WeatherVisuals {
  switch (weather) {
    case "sunny":
      return {
        skyGradient: "linear-gradient(180deg, #E0F6FF 0%, #87CEEB 100%)",
        lightColor: "#FFF8E1",
        lightIntensity: 1.0,
        particles: "pollen",
        frost: false,
      };
    case "partly":
      return {
        skyGradient: "linear-gradient(180deg, #d1d5db 0%, #9ca3af 100%)",
        lightColor: "#E5E7EB",
        lightIntensity: 0.6,
        particles: "none",
        frost: false,
      };
    case "overcast":
      return {
        skyGradient: "linear-gradient(180deg, #6b7280 0%, #4b5563 100%)",
        lightColor: "#9CA3AF",
        lightIntensity: 0.3,
        particles: "mist",
        frost: false,
      };
    case "frozen":
      return {
        skyGradient: "linear-gradient(180deg, #1f2937 0%, #111827 100%)",
        lightColor: "#374151",
        lightIntensity: 0.1,
        particles: "none",
        frost: true,
      };
    case "dormant":
      return {
        skyGradient: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        lightColor: "#1E293B",
        lightIntensity: 0.05,
        particles: "none",
        frost: false,
      };
  }
}
