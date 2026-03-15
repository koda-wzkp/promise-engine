/**
 * Asset Registry — maps (domain, durationTier, stakesTier) → plant definition key.
 *
 * This registry pattern is designed for the v2 artist marketplace.
 * Adding a new plant species means adding a new entry here.
 * The renderer picks it up automatically.
 *
 * In v1, all plants are procedurally generated from the definitions
 * in lib/garden/plants.ts. This registry provides the mapping layer
 * that the marketplace will use to swap in artist-created assets.
 */

export interface AssetEntry {
  key: string;
  name: string;
  domain: string;
  durationTier: string;
  stakesTier: string;
  artist?: string; // v2: artist attribution
  source: "procedural" | "sprite"; // v1 = all procedural
}

export const plantAssets: AssetEntry[] = [
  // Health (Fruit-bearing)
  { key: "health-short-low", name: "Herb sprout", domain: "health", durationTier: "short", stakesTier: "low", source: "procedural" },
  { key: "health-short-medium", name: "Berry bush", domain: "health", durationTier: "short", stakesTier: "medium", source: "procedural" },
  { key: "health-short-high", name: "Strawberry patch", domain: "health", durationTier: "short", stakesTier: "high", source: "procedural" },
  { key: "health-medium-low", name: "Blueberry shrub", domain: "health", durationTier: "medium", stakesTier: "low", source: "procedural" },
  { key: "health-medium-medium", name: "Apple sapling", domain: "health", durationTier: "medium", stakesTier: "medium", source: "procedural" },
  { key: "health-medium-high", name: "Cherry tree", domain: "health", durationTier: "medium", stakesTier: "high", source: "procedural" },
  { key: "health-long-low", name: "Grape vine", domain: "health", durationTier: "long", stakesTier: "low", source: "procedural" },
  { key: "health-long-medium", name: "Pear tree", domain: "health", durationTier: "long", stakesTier: "medium", source: "procedural" },
  { key: "health-long-high", name: "Ancient apple tree", domain: "health", durationTier: "long", stakesTier: "high", source: "procedural" },

  // Work (Hardwoods)
  { key: "work-short-low", name: "Grass tuft", domain: "work", durationTier: "short", stakesTier: "low", source: "procedural" },
  { key: "work-short-medium", name: "Young birch", domain: "work", durationTier: "short", stakesTier: "medium", source: "procedural" },
  { key: "work-short-high", name: "Ash sapling", domain: "work", durationTier: "short", stakesTier: "high", source: "procedural" },
  { key: "work-medium-low", name: "Oak seedling", domain: "work", durationTier: "medium", stakesTier: "low", source: "procedural" },
  { key: "work-medium-medium", name: "Young oak", domain: "work", durationTier: "medium", stakesTier: "medium", source: "procedural" },
  { key: "work-medium-high", name: "Mature oak", domain: "work", durationTier: "medium", stakesTier: "high", source: "procedural" },
  { key: "work-long-low", name: "Hickory sapling", domain: "work", durationTier: "long", stakesTier: "low", source: "procedural" },
  { key: "work-long-medium", name: "Walnut tree", domain: "work", durationTier: "long", stakesTier: "medium", source: "procedural" },
  { key: "work-long-high", name: "Ancient oak", domain: "work", durationTier: "long", stakesTier: "high", source: "procedural" },

  // Relationships (Flowering)
  { key: "relationships-short-low", name: "Wildflower", domain: "relationships", durationTier: "short", stakesTier: "low", source: "procedural" },
  { key: "relationships-short-medium", name: "Lavender bush", domain: "relationships", durationTier: "short", stakesTier: "medium", source: "procedural" },
  { key: "relationships-short-high", name: "Rose bush", domain: "relationships", durationTier: "short", stakesTier: "high", source: "procedural" },
  { key: "relationships-medium-low", name: "Hydrangea", domain: "relationships", durationTier: "medium", stakesTier: "low", source: "procedural" },
  { key: "relationships-medium-medium", name: "Dogwood", domain: "relationships", durationTier: "medium", stakesTier: "medium", source: "procedural" },
  { key: "relationships-medium-high", name: "Magnolia", domain: "relationships", durationTier: "medium", stakesTier: "high", source: "procedural" },
  { key: "relationships-long-low", name: "Jasmine vine", domain: "relationships", durationTier: "long", stakesTier: "low", source: "procedural" },
  { key: "relationships-long-medium", name: "Wisteria", domain: "relationships", durationTier: "long", stakesTier: "medium", source: "procedural" },
  { key: "relationships-long-high", name: "Empress tree", domain: "relationships", durationTier: "long", stakesTier: "high", source: "procedural" },

  // Creative (Unusual/wild)
  { key: "creative-short-low", name: "Mushroom cluster", domain: "creative", durationTier: "short", stakesTier: "low", source: "procedural" },
  { key: "creative-short-medium", name: "Fern patch", domain: "creative", durationTier: "short", stakesTier: "medium", source: "procedural" },
  { key: "creative-short-high", name: "Wild orchid", domain: "creative", durationTier: "short", stakesTier: "high", source: "procedural" },
  { key: "creative-medium-low", name: "Moss carpet", domain: "creative", durationTier: "medium", stakesTier: "low", source: "procedural" },
  { key: "creative-medium-medium", name: "Climbing vine", domain: "creative", durationTier: "medium", stakesTier: "medium", source: "procedural" },
  { key: "creative-medium-high", name: "Birch tree", domain: "creative", durationTier: "medium", stakesTier: "high", source: "procedural" },
  { key: "creative-long-low", name: "Shelf fungus", domain: "creative", durationTier: "long", stakesTier: "low", source: "procedural" },
  { key: "creative-long-medium", name: "Weeping willow", domain: "creative", durationTier: "long", stakesTier: "medium", source: "procedural" },
  { key: "creative-long-high", name: "Ancient banyan", domain: "creative", durationTier: "long", stakesTier: "high", source: "procedural" },

  // Financial (Evergreens)
  { key: "financial-short-low", name: "Pine seedling", domain: "financial", durationTier: "short", stakesTier: "low", source: "procedural" },
  { key: "financial-short-medium", name: "Juniper bush", domain: "financial", durationTier: "short", stakesTier: "medium", source: "procedural" },
  { key: "financial-short-high", name: "Holly bush", domain: "financial", durationTier: "short", stakesTier: "high", source: "procedural" },
  { key: "financial-medium-low", name: "Spruce sapling", domain: "financial", durationTier: "medium", stakesTier: "low", source: "procedural" },
  { key: "financial-medium-medium", name: "Young pine", domain: "financial", durationTier: "medium", stakesTier: "medium", source: "procedural" },
  { key: "financial-medium-high", name: "Cedar", domain: "financial", durationTier: "medium", stakesTier: "high", source: "procedural" },
  { key: "financial-long-low", name: "Yew", domain: "financial", durationTier: "long", stakesTier: "low", source: "procedural" },
  { key: "financial-long-medium", name: "Sequoia", domain: "financial", durationTier: "long", stakesTier: "medium", source: "procedural" },
  { key: "financial-long-high", name: "Ancient redwood", domain: "financial", durationTier: "long", stakesTier: "high", source: "procedural" },
];

/**
 * Look up an asset entry.
 */
export function getAsset(domain: string, durationTier: string, stakesTier: string): AssetEntry | undefined {
  return plantAssets.find(
    (a) => a.domain === domain && a.durationTier === durationTier && a.stakesTier === stakesTier
  );
}

// Wildlife assets (v1: procedural shapes, v2: artist sprites)
export const wildlifeAssets = [
  { key: "bees", name: "Honeybees", domain: "health", tier: "early", source: "procedural" as const },
  { key: "butterflies", name: "Butterflies", domain: "health", tier: "early", source: "procedural" as const },
  { key: "songbirds", name: "Songbirds", domain: "health", tier: "mid", source: "procedural" as const },
  { key: "fox", name: "Red Fox", domain: "health", tier: "thriving", source: "procedural" as const },
  { key: "woodpecker", name: "Woodpecker", domain: "work", tier: "early", source: "procedural" as const },
  { key: "squirrels", name: "Squirrels", domain: "work", tier: "mid", source: "procedural" as const },
  { key: "owl", name: "Great Horned Owl", domain: "work", tier: "thriving", source: "procedural" as const },
  { key: "hummingbirds", name: "Hummingbirds", domain: "relationships", tier: "early", source: "procedural" as const },
  { key: "paired-birds", name: "Paired Birds", domain: "relationships", tier: "mid", source: "procedural" as const },
  { key: "deer", name: "Family of Deer", domain: "relationships", tier: "thriving", source: "procedural" as const },
  { key: "frogs", name: "Tree Frogs", domain: "creative", tier: "early", source: "procedural" as const },
  { key: "fireflies", name: "Fireflies", domain: "creative", tier: "mid", source: "procedural" as const },
  { key: "heron", name: "Blue Heron", domain: "creative", tier: "thriving", source: "procedural" as const },
  { key: "chickadees", name: "Chickadees", domain: "financial", tier: "early", source: "procedural" as const },
  { key: "hawk", name: "Red-tailed Hawk", domain: "financial", tier: "mid", source: "procedural" as const },
  { key: "cougar", name: "Mountain Lion", domain: "financial", tier: "thriving", source: "procedural" as const },
];
