// ─── PROMISE QUALITY ───

export interface QualityCriterion {
  pass: boolean;
  reason: string;
}

export interface PromiseQualityEvaluation {
  autonomous: QualityCriterion;
  observable: QualityCriterion;
  specific: QualityCriterion;
  affirmative: QualityCriterion;
  passes_all: boolean;
  reframes: string[];
  encouragement: string;
  evaluated_by: "rules" | "llm" | "both";
  evaluated_at: string;
  was_overridden: boolean;
  reframe_selected: string | null;
}

export type QualityTier = "personal" | "organizational" | "civic";
