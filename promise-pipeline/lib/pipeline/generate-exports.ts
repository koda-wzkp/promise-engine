// ─── GENERATE TRAINING EXPORTS ───
// Converts existing dashboard data into training JSON format and runs quality gates.

import { HB2021_DASHBOARD } from "../data/hb2021";
import { ACA_DASHBOARD } from "../data/aca";
import { exportTrainingData, runQualityGates } from "./export-training";
import { buildInventory, analyzeGaps } from "./dataset-inventory";
import { HB2021_CONFIG, ACA_CONFIG } from "./configs";
import type { TrainingDataExport } from "../types/training";
import type { GapAnalysis } from "./dataset-inventory";
import type { QualityGateResult } from "./export-training";

export interface GenerateResult {
  exports: {
    bill_id: string;
    data: TrainingDataExport;
    quality: QualityGateResult[];
    all_passed: boolean;
  }[];
  gap_analysis: GapAnalysis;
}

export function generateTrainingExports(): GenerateResult {
  // Export HB 2021
  const hb2021Export = exportTrainingData(HB2021_DASHBOARD, HB2021_CONFIG, {
    extracted_by: "agent-v1",
    extraction_date: "2025-03-12",
    confidence: "reviewed",
    notes: "First extraction. Hand-verified against enrolled bill text and PUC filings.",
  });
  const hb2021Quality = runQualityGates(hb2021Export);

  // Export ACA
  const acaExport = exportTrainingData(ACA_DASHBOARD, ACA_CONFIG, {
    extracted_by: "agent-v1",
    extraction_date: "2025-03-13",
    confidence: "reviewed",
    notes: "Second extraction. Cross-referenced with CRS summaries, KFF analysis, and SCOTUS opinions.",
  });
  const acaQuality = runQualityGates(acaExport);

  // Build inventory and analyze gaps
  const allExports = [hb2021Export, acaExport];
  const inventory = buildInventory(allExports);
  const gapAnalysis = analyzeGaps(inventory);

  return {
    exports: [
      {
        bill_id: HB2021_CONFIG.id,
        data: hb2021Export,
        quality: hb2021Quality,
        all_passed: hb2021Quality.every((g) => g.passed),
      },
      {
        bill_id: ACA_CONFIG.id,
        data: acaExport,
        quality: acaQuality,
        all_passed: acaQuality.every((g) => g.passed),
      },
    ],
    gap_analysis: gapAnalysis,
  };
}
