import type { GardenPromise, Artifact, KRegime } from "@/lib/types/personal";
import { seededRandom } from "./renderer/seededRandom";

/**
 * Generate a visual artifact from a completed promise.
 * Each artifact is unique based on the promise's k regime,
 * verification method, dwell time, and domain.
 */
export function generateArtifact(promise: GardenPromise): Artifact {
  const dwellTime = promise.completedAt
    ? Math.max(
        1,
        (new Date(promise.completedAt).getTime() -
          new Date(promise.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 1;

  return {
    id: `ART-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    promiseId: promise.id,
    generatedFrom: {
      kRegime: promise.kRegime,
      verificationMethod: promise.verification.method,
      dwellTime: Math.round(dwellTime),
      domain: promise.domain,
    },
    visual: {
      growthPattern: getGrowthPattern(promise.kRegime),
      material: getMaterial(promise.verification.method),
      uniqueSeed: promise.plantSeed,
    },
    giftedTo: null,
    giftable: false,
  };
}

function getGrowthPattern(regime: KRegime): string {
  switch (regime) {
    case "physics":
      return "crystalline";
    case "ecological":
      return "organic";
    case "composting":
      return "ethereal";
  }
}

function getMaterial(method: string): string {
  switch (method) {
    case "sensor":
      return "metallic";
    case "audit":
    case "benchmark":
      return "crystalline";
    case "self-report":
    case "filing":
      return "wood";
    case "none":
    default:
      return "smoke";
  }
}

// ─── ARTIFACT VISUAL GENERATION ───

export interface ArtifactVisualData {
  shape: "gem" | "sphere" | "spire" | "bloom" | "shell";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  facets: number;
  size: number;
  glowIntensity: number;
}

const DOMAIN_ARTIFACT_COLORS: Record<string, { primary: string; secondary: string; accent: string }> = {
  health: { primary: "#2E7D32", secondary: "#81C784", accent: "#FFC107" },
  work: { primary: "#4E342E", secondary: "#8D6E63", accent: "#FFD54F" },
  relationships: { primary: "#AD1457", secondary: "#F48FB1", accent: "#CE93D8" },
  creative: { primary: "#4527A0", secondary: "#9575CD", accent: "#4DB6AC" },
  financial: { primary: "#1B5E20", secondary: "#558B2F", accent: "#827717" },
};

export function generateArtifactVisual(artifact: Artifact): ArtifactVisualData {
  const rand = seededRandom(artifact.id);

  const colors = DOMAIN_ARTIFACT_COLORS[artifact.generatedFrom.domain] ?? {
    primary: "#607D8B",
    secondary: "#90A4AE",
    accent: "#CFD8DC",
  };

  const shapes: ArtifactVisualData["shape"][] = ["gem", "sphere", "spire", "bloom", "shell"];
  const shapeIndex = Math.floor(rand() * shapes.length);

  // More facets for longer dwell time
  const facets = Math.min(12, 4 + Math.floor(artifact.generatedFrom.dwellTime / 7));

  // Size scales with dwell time
  const size = Math.min(1.0, 0.4 + artifact.generatedFrom.dwellTime / 60);

  // Glow from k regime
  const glowMap: Record<KRegime, number> = {
    physics: 0.8,
    ecological: 0.5,
    composting: 0.3,
  };

  return {
    shape: shapes[shapeIndex],
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    accentColor: colors.accent,
    facets,
    size,
    glowIntensity: glowMap[artifact.generatedFrom.kRegime],
  };
}
