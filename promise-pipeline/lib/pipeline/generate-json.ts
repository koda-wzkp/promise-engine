// ─── GENERATE STATIC TRAINING JSON FILES ───
// Run with: npx tsx lib/pipeline/generate-json.ts
// Outputs to /data/training/*.json

import { writeFileSync } from "fs";
import { join } from "path";
import { generateTrainingExports } from "./generate-exports";

const OUTPUT_DIR = join(__dirname, "..", "..", "..", "data", "training");

function main() {
  const result = generateTrainingExports();

  for (const exportResult of result.exports) {
    const slug = exportResult.bill_id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const outputPath = join(OUTPUT_DIR, `${slug}.json`);

    writeFileSync(outputPath, JSON.stringify(exportResult.data, null, 2));
    console.log(`Wrote ${outputPath}`);

    // Log quality gates
    console.log(`  Quality gates for ${exportResult.bill_id}:`);
    for (const gate of exportResult.quality) {
      const icon = gate.passed ? "  PASS" : "  FAIL";
      console.log(`    ${icon} ${gate.gate}: ${gate.message}`);
    }
    console.log();
  }

  // Write inventory summary
  const inventoryPath = join(OUTPUT_DIR, "inventory.json");
  writeFileSync(inventoryPath, JSON.stringify({
    ...result.gap_analysis.inventory,
    training_viability: result.gap_analysis.training_viability,
    domain_gaps: result.gap_analysis.domain_gaps,
    jurisdiction_gaps: result.gap_analysis.jurisdiction_gaps,
    agent_type_gaps: result.gap_analysis.agent_type_gaps,
    recommended_next: result.gap_analysis.recommended_next.map((s) => ({
      title: s.candidate.title,
      jurisdiction: s.candidate.jurisdiction,
      year_enacted: s.candidate.year_enacted,
      score: s.score,
      breakdown: s.breakdown,
    })),
  }, null, 2));
  console.log(`Wrote ${inventoryPath}`);

  // Summary
  console.log("\n── Dataset Summary ──");
  console.log(`Bills: ${result.gap_analysis.inventory.bills.length}`);
  console.log(`Promises: ${result.gap_analysis.inventory.total_promises}`);
  console.log(`Edges: ${result.gap_analysis.inventory.total_edges}`);
  console.log(`Viability: ${result.gap_analysis.training_viability.tier} — ${result.gap_analysis.training_viability.description}`);
  console.log(`Bills needed for next tier: ${result.gap_analysis.training_viability.bills_needed_for_next_tier}`);
}

main();
