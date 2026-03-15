"use client";

import type { GardenState, PlantState } from "@/lib/types/garden";
import type { PersonalPromise } from "@/lib/types/personal";
import { getPlantDefinition } from "@/lib/garden/plants";
import { domainMeta } from "@/lib/types/personal";

interface AccessibleGardenDOMProps {
  gardenState: GardenState;
  promises: PersonalPromise[];
  onPlantFocus?: (plant: PlantState) => void;
}

/**
 * Hidden DOM layer for screen readers.
 * Each plant is a focusable element with descriptive aria-label.
 */
export default function AccessibleGardenDOM({
  gardenState,
  promises,
  onPlantFocus,
}: AccessibleGardenDOMProps) {
  // Group plants by domain for logical navigation order
  const domains = ["health", "work", "relationships", "creative", "financial"] as const;

  return (
    <div className="sr-only" role="list" aria-label="Garden plants">
      {domains.map((domain) => {
        const domainPlants = gardenState.plants.filter((p) => p.domain === domain);
        if (domainPlants.length === 0) return null;

        return (
          <div key={domain} role="group" aria-label={`${domainMeta[domain].label} promises`}>
            {domainPlants.map((plant) => {
              const promise = promises.find((p) => p.id === plant.promiseId);
              if (!promise) return null;

              const def = getPlantDefinition(plant.domain, plant.durationTier, plant.stakesTier);
              const progress = Math.round(plant.growthProgress * 100);

              const label = [
                `${domainMeta[plant.domain].label} promise:`,
                promise.body,
                `Status: ${plant.growthStage}.`,
                `${def.name},`,
                plant.growthStage === "mature"
                  ? "fully grown."
                  : `${progress}% to ${plant.growthStage === "growing" ? "maturity" : "next stage"}.`,
                plant.stressLevel > 0
                  ? `Stress level: ${Math.round(plant.stressLevel * 100)}%.`
                  : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={plant.promiseId}
                  role="listitem"
                  aria-label={label}
                  tabIndex={0}
                  onFocus={() => onPlantFocus?.(plant)}
                  className="block w-full text-left"
                >
                  {label}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
