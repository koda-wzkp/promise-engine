import type {
  GardenLandscapeState,
  LandscapeMilestone,
  SkyState,
  PlantState,
} from "../types/garden";

/**
 * Compute landscape state from overall garden reliability and plant states.
 */
export function computeLandscape(
  overallReliability: number,
  plants: PlantState[],
  currentLandscape?: GardenLandscapeState
): GardenLandscapeState {
  const milestones: LandscapeMilestone[] = ["clearing"];

  // First green: any plant has reached "growing" stage
  const hasGrowing = plants.some(
    (p) => p.growthStage === "growing" || p.growthStage === "mature" || p.growthStage === "reclaimed"
  );
  if (hasGrowing) milestones.push("first_green");

  // Stream: overall reliability >= 70%
  const streamThreshold = 0.7;
  const streamDepartThreshold = 0.55;
  const hadStream = currentLandscape?.hasStream ?? false;
  const hasStream = hadStream
    ? overallReliability >= streamDepartThreshold
    : overallReliability >= streamThreshold;
  if (hasStream) milestones.push("stream");

  // Clear sky: overall reliability >= 85%
  if (overallReliability >= 0.85) milestones.push("clear_sky");

  // Golden hour: overall reliability >= 95% (sustained 30 days check is done externally)
  if (overallReliability >= 0.95) milestones.push("golden_hour");

  // Compute sky state
  let skyState: SkyState;
  if (overallReliability >= 0.95) {
    skyState = "golden";
  } else if (overallReliability >= 0.85) {
    skyState = "clear";
  } else if (overallReliability >= 0.6) {
    skyState = "clearing";
  } else if (overallReliability >= 0.3) {
    skyState = "overcast";
  } else {
    skyState = "stormy";
  }

  // Stream flow intensity
  const streamFlow = hasStream
    ? Math.min(1, (overallReliability - streamDepartThreshold) / (1 - streamDepartThreshold))
    : 0;

  return {
    currentMilestones: milestones,
    overallReliability,
    skyState,
    hasStream,
    streamFlow,
  };
}

/**
 * Get landscape milestone descriptions for summary narratives.
 */
export function describeLandscapeChanges(
  previous: GardenLandscapeState | undefined,
  current: GardenLandscapeState
): string[] {
  if (!previous) return [];

  const changes: string[] = [];
  const prevMilestones = new Set(previous.currentMilestones);
  const curMilestones = new Set(current.currentMilestones);

  if (!prevMilestones.has("first_green") && curMilestones.has("first_green")) {
    changes.push("First green appeared in your garden.");
  }
  if (!prevMilestones.has("stream") && curMilestones.has("stream")) {
    changes.push("A stream emerged in your garden.");
  }
  if (prevMilestones.has("stream") && !curMilestones.has("stream")) {
    changes.push("The stream in your garden has dried up.");
  }
  if (!prevMilestones.has("clear_sky") && curMilestones.has("clear_sky")) {
    changes.push("The sky above your garden has cleared.");
  }
  if (prevMilestones.has("clear_sky") && !curMilestones.has("clear_sky")) {
    changes.push("Clouds have returned over your garden.");
  }
  if (!prevMilestones.has("golden_hour") && curMilestones.has("golden_hour")) {
    changes.push("Golden light bathes your garden — the ultimate state.");
  }

  return changes;
}
