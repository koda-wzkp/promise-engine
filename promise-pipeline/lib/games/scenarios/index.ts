import { ScenarioConfig } from "../types";
import { marsColonyScenario } from "./mars-colony";
import { deepSeaScenario } from "./deep-sea-station";
import { supplyStationScenario } from "./supply-station";

export const scenarios: Record<string, ScenarioConfig> = {
  "mars-colony": marsColonyScenario,
  "deep-sea": deepSeaScenario,
  "supply-station": supplyStationScenario,
};

export function getScenario(id: string): ScenarioConfig | null {
  return scenarios[id] ?? null;
}

export function getAllScenarios(): ScenarioConfig[] {
  return Object.values(scenarios);
}
