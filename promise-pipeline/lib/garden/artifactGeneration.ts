import type { GardenPromise, Artifact, KRegime } from "../types/personal";

const GROWTH_PATTERNS: Record<KRegime, string[]> = {
  composting: ["spreading", "mycelial", "diffuse"],
  ecological: ["branching", "vine", "spiral"],
  physics:    ["crystalline", "geometric", "fractal"],
};

const MATERIALS: Record<string, string> = {
  sensor:      "crystal",
  audit:       "bronze",
  benchmark:   "amber",
  "self-report": "wood",
  filing:      "stone",
  none:        "smoke",
};

const DOMAIN_GROWTH: Record<string, number> = {
  health:        0,
  work:          1,
  relationships: 2,
  creative:      0,
  financial:     1,
};

/** Simple deterministic hash (djb2). */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return Math.abs(h >>> 0);
}

function daysBetween(a: string, b: string): number {
  return Math.max(
    0,
    (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000
  );
}

export function generateArtifact(promise: GardenPromise): Artifact {
  const seed = hashString(promise.id + promise.completedAt);
  const rngIndex = seed % 3;

  const patterns = GROWTH_PATTERNS[promise.kRegime];
  const growthPattern = patterns[DOMAIN_GROWTH[promise.domain] ?? 0];
  const material = MATERIALS[promise.verification.method] ?? "wood";

  const dwellTime = promise.completedAt
    ? daysBetween(promise.createdAt, promise.completedAt)
    : 0;

  return {
    id: `artifact-${promise.id}-${Date.now()}`,
    promiseId: promise.id,
    generatedFrom: {
      kRegime: promise.kRegime,
      verificationMethod: promise.verification.method,
      dwellTime,
      domain: promise.domain,
    },
    visual: {
      growthPattern,
      material,
      uniqueSeed: seed + rngIndex,
    },
    giftedTo: null,
    giftable: false,
    createdAt: new Date().toISOString(),
  };
}

/** Visual accent color for an artifact based on domain + k-regime. */
export function artifactColor(artifact: Artifact): string {
  const domainColors: Record<string, string> = {
    health:        "#059669",
    work:          "#1e40af",
    relationships: "#db2777",
    creative:      "#7c3aed",
    financial:     "#0891b2",
  };
  return domainColors[artifact.generatedFrom.domain] ?? "#6b7280";
}

/** Human-readable description for Collection display. */
export function artifactDescription(artifact: Artifact): string {
  const kLabels: Record<KRegime, string> = {
    composting: "Composting",
    ecological: "Ecological",
    physics:    "Physics",
  };
  const days = Math.round(artifact.generatedFrom.dwellTime);
  return `${kLabels[artifact.generatedFrom.kRegime]} regime · ${days} day${days !== 1 ? "s" : ""} · ${artifact.visual.material} ${artifact.visual.growthPattern}`;
}
