// ─── GENERATE TRAINING EXPORTS ───
// Converts existing dashboard data into training JSON format and runs quality gates.

import { HB2021_DASHBOARD } from "../data/hb2021";
import { ACA_DASHBOARD } from "../data/aca";
import { CAA_DASHBOARD } from "../data/caa-1990";
import { DF_DASHBOARD } from "../data/dodd-frank-2010";
import { NCLB_DASHBOARD } from "../data/nclb-essa";
import { exportTrainingData, runQualityGates } from "./export-training";
import { buildInventory, analyzeGaps } from "./dataset-inventory";
import { HB2021_CONFIG, ACA_CONFIG, CAA_CONFIG, DF_CONFIG, NCLB_CONFIG } from "./configs";
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

interface BillExportConfig {
  dashboard: typeof HB2021_DASHBOARD;
  config: typeof HB2021_CONFIG;
  meta: {
    extracted_by: string;
    extraction_date: string;
    confidence: "draft" | "reviewed" | "published";
    notes: string;
  };
}

export function generateTrainingExports(): GenerateResult {
  const bills: BillExportConfig[] = [
    {
      dashboard: HB2021_DASHBOARD,
      config: HB2021_CONFIG,
      meta: {
        extracted_by: "agent-v1",
        extraction_date: "2025-03-12",
        confidence: "reviewed",
        notes: "First extraction. Hand-verified against enrolled bill text and PUC filings.",
      },
    },
    {
      dashboard: ACA_DASHBOARD,
      config: ACA_CONFIG,
      meta: {
        extracted_by: "agent-v1",
        extraction_date: "2025-03-13",
        confidence: "reviewed",
        notes: "Second extraction. Cross-referenced with CRS summaries, KFF analysis, and SCOTUS opinions.",
      },
    },
    {
      dashboard: CAA_DASHBOARD,
      config: CAA_CONFIG,
      meta: {
        extracted_by: "agent-v1",
        extraction_date: "2026-03-13",
        confidence: "draft",
        notes: "Third extraction. 35-year track record with extensive EPA data. Acid rain, mobile sources, HAPs, ozone protection.",
      },
    },
    {
      dashboard: DF_DASHBOARD,
      config: DF_CONFIG,
      meta: {
        extracted_by: "agent-v1",
        extraction_date: "2026-03-13",
        confidence: "draft",
        notes: "Fourth extraction. Financial regulation with 15 years of implementation. Includes 2018 rollbacks and 2023 bank failures.",
      },
    },
    {
      dashboard: NCLB_DASHBOARD,
      config: NCLB_CONFIG,
      meta: {
        extracted_by: "agent-v1",
        extraction_date: "2026-03-13",
        confidence: "draft",
        notes: "Fifth extraction. Combined NCLB (2001) and ESSA (2015) as a single promise network evolution. 25 years of outcome data.",
      },
    },
  ];

  const results = bills.map((bill) => {
    const data = exportTrainingData(bill.dashboard, bill.config, bill.meta);
    const quality = runQualityGates(data);
    return {
      bill_id: bill.config.id,
      data,
      quality,
      all_passed: quality.every((g) => g.passed),
    };
  });

  const allExports = results.map((r) => r.data);
  const inventory = buildInventory(allExports);
  const gapAnalysis = analyzeGaps(inventory);

  return { exports: results, gap_analysis: gapAnalysis };
}
