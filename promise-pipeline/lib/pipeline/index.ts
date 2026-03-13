// ─── CIVIC PROMISE EXTRACTION PIPELINE ───
// Repeatable workflow: Bill → Promise Graph → Labeled Training Data

export { exportTrainingData, runQualityGates } from "./export-training";
export type { BillConfig, QualityGateResult } from "./export-training";

export { scoreBillCandidate, PRIORITY_BILL_QUEUE, BILL_SOURCES } from "./bill-candidates";
export type { SelectionScore } from "./bill-candidates";

export { buildInventory, analyzeGaps } from "./dataset-inventory";
export type { GapAnalysis, TrainingViability } from "./dataset-inventory";

export { HB2021_CONFIG, ACA_CONFIG } from "./configs";

export { generateTrainingExports } from "./generate-exports";
