import { NextResponse } from "next/server";
import { generateTrainingExports } from "@/lib/pipeline/generate-exports";

export async function GET() {
  const result = generateTrainingExports();

  return NextResponse.json({
    exports: result.exports.map((e) => ({
      bill_id: e.bill_id,
      promise_count: e.data.promises.length,
      edge_count: e.data.dependencies.length,
      agent_count: e.data.agents.length,
      quality_gates: {
        all_passed: e.all_passed,
        results: e.quality,
      },
    })),
    gap_analysis: {
      training_viability: result.gap_analysis.training_viability,
      domain_gaps: result.gap_analysis.domain_gaps,
      jurisdiction_gaps: result.gap_analysis.jurisdiction_gaps,
      agent_type_gaps: result.gap_analysis.agent_type_gaps,
      recommended_next: result.gap_analysis.recommended_next.map((s) => ({
        title: s.candidate.title,
        jurisdiction: s.candidate.jurisdiction,
        score: s.score,
        breakdown: s.breakdown,
      })),
    },
    inventory: {
      total_promises: result.gap_analysis.inventory.total_promises,
      total_edges: result.gap_analysis.inventory.total_edges,
      bills_completed: result.gap_analysis.inventory.bills.length,
      domains_covered: result.gap_analysis.inventory.domains_covered,
      jurisdictions_covered: result.gap_analysis.inventory.jurisdictions_covered,
    },
  });
}
