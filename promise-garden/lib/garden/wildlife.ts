import type { PersonalDomain } from "../types/personal";
import type { WildlifeSpecies, WildlifeTier } from "../types/garden";

// ─── WILDLIFE REGISTRY ───

export const wildlifeRegistry: WildlifeSpecies[] = [
  // Health (fruit-bearing)
  { id: "health-bees", name: "Honeybees", domain: "health", healthThreshold: 0.3, tier: "early", departureThreshold: 0.1, assetKey: "bees" },
  { id: "health-butterflies", name: "Butterflies", domain: "health", healthThreshold: 0.3, tier: "early", departureThreshold: 0.1, assetKey: "butterflies" },
  { id: "health-songbirds", name: "Songbirds", domain: "health", healthThreshold: 0.55, tier: "mid", departureThreshold: 0.35, assetKey: "songbirds" },
  { id: "health-fox", name: "Red Fox", domain: "health", healthThreshold: 0.85, tier: "thriving", departureThreshold: 0.65, assetKey: "fox" },

  // Work (hardwoods)
  { id: "work-woodpecker", name: "Woodpecker", domain: "work", healthThreshold: 0.3, tier: "early", departureThreshold: 0.1, assetKey: "woodpecker" },
  { id: "work-squirrels", name: "Squirrels", domain: "work", healthThreshold: 0.55, tier: "mid", departureThreshold: 0.35, assetKey: "squirrels" },
  { id: "work-owl", name: "Great Horned Owl", domain: "work", healthThreshold: 0.85, tier: "thriving", departureThreshold: 0.65, assetKey: "owl" },

  // Relationships (flowering)
  { id: "rel-hummingbirds", name: "Hummingbirds", domain: "relationships", healthThreshold: 0.3, tier: "early", departureThreshold: 0.1, assetKey: "hummingbirds" },
  { id: "rel-paired-birds", name: "Paired Birds", domain: "relationships", healthThreshold: 0.55, tier: "mid", departureThreshold: 0.35, assetKey: "paired-birds" },
  { id: "rel-deer", name: "Family of Deer", domain: "relationships", healthThreshold: 0.85, tier: "thriving", departureThreshold: 0.65, assetKey: "deer" },

  // Creative (ferns/vines/wild)
  { id: "creative-frogs", name: "Tree Frogs", domain: "creative", healthThreshold: 0.3, tier: "early", departureThreshold: 0.1, assetKey: "frogs" },
  { id: "creative-fireflies", name: "Fireflies", domain: "creative", healthThreshold: 0.55, tier: "mid", departureThreshold: 0.35, assetKey: "fireflies" },
  { id: "creative-heron", name: "Blue Heron", domain: "creative", healthThreshold: 0.85, tier: "thriving", departureThreshold: 0.65, assetKey: "heron" },

  // Financial (evergreens)
  { id: "fin-chickadees", name: "Chickadees", domain: "financial", healthThreshold: 0.3, tier: "early", departureThreshold: 0.1, assetKey: "chickadees" },
  { id: "fin-hawk", name: "Red-tailed Hawk", domain: "financial", healthThreshold: 0.55, tier: "mid", departureThreshold: 0.35, assetKey: "hawk" },
  { id: "fin-cougar", name: "Mountain Lion", domain: "financial", healthThreshold: 0.85, tier: "thriving", departureThreshold: 0.65, assetKey: "cougar" },
];

/**
 * Compute which wildlife should be present based on domain health scores.
 */
export function computeWildlife(
  domainHealth: Record<PersonalDomain, number>,
  currentWildlife: string[]
): string[] {
  const result: string[] = [];

  for (const species of wildlifeRegistry) {
    const health = domainHealth[species.domain] ?? 0;
    const isPresent = currentWildlife.includes(species.id);

    if (isPresent) {
      // Already present — only depart if below departure threshold
      if (health >= species.departureThreshold) {
        result.push(species.id);
      }
    } else {
      // Not present — appear if above health threshold
      if (health >= species.healthThreshold) {
        result.push(species.id);
      }
    }
  }

  return result;
}

/**
 * Get wildlife diminished state (between departure and appearance thresholds).
 * Returns opacity multiplier: 1.0 = full, 0.5 = diminished.
 */
export function getWildlifeOpacity(
  speciesId: string,
  domainHealth: Record<PersonalDomain, number>
): number {
  const species = wildlifeRegistry.find((s) => s.id === speciesId);
  if (!species) return 0;

  const health = domainHealth[species.domain] ?? 0;
  if (health >= species.healthThreshold) return 1.0;
  if (health >= species.departureThreshold) return 0.5;
  return 0;
}

/**
 * Get wildlife for a specific domain.
 */
export function getWildlifeForDomain(domain: PersonalDomain): WildlifeSpecies[] {
  return wildlifeRegistry.filter((s) => s.domain === domain);
}
