// ─── DATASET INVENTORY & GAP ANALYSIS ───
// Tracks what we've extracted and identifies gaps for prioritizing next bills.

import type {
  DatasetInventory,
  DatasetBillEntry,
  TrainingDataExport,
} from "../types/training";
import type { SelectionScore } from "./bill-candidates";
import { scoreBillCandidate, PRIORITY_BILL_QUEUE } from "./bill-candidates";

// ─── BUILD INVENTORY FROM EXPORTS ───

export function buildInventory(exports: TrainingDataExport[]): DatasetInventory {
  const bills: DatasetBillEntry[] = exports.map((e) => ({
    bill_id: e.bill.id,
    title: e.bill.title,
    jurisdiction: e.bill.jurisdiction,
    level: e.bill.level,
    domains: e.bill.domains,
    promise_count: e.promises.length,
    edge_count: e.dependencies.length,
    confidence: e.extraction_metadata.confidence,
    extraction_date: e.extraction_metadata.extraction_date,
  }));

  const allDomains = new Set<string>();
  const allJurisdictions = new Set<string>();
  const allAgentTypes = new Set<string>();
  let totalPromises = 0;
  let totalEdges = 0;

  for (const e of exports) {
    totalPromises += e.promises.length;
    totalEdges += e.dependencies.length;
    for (const d of e.bill.domains) allDomains.add(d);
    allJurisdictions.add(e.bill.jurisdiction);
    for (const a of e.agents) allAgentTypes.add(a.type);
  }

  return {
    bills,
    total_promises: totalPromises,
    total_edges: totalEdges,
    domains_covered: Array.from(allDomains).sort(),
    jurisdictions_covered: Array.from(allJurisdictions).sort(),
    agent_types_covered: Array.from(allAgentTypes).sort(),
    last_updated: new Date().toISOString().split("T")[0],
  };
}

// ─── GAP ANALYSIS ───

export interface GapAnalysis {
  inventory: DatasetInventory;
  training_viability: TrainingViability;
  domain_gaps: string[];
  jurisdiction_gaps: string[];
  agent_type_gaps: string[];
  recommended_next: SelectionScore[];
}

export interface TrainingViability {
  tier: "too_small" | "basic_patterns" | "xgboost_viable" | "nlp_viable" | "gnn_viable";
  description: string;
  promise_count: number;
  edge_count: number;
  bills_needed_for_next_tier: number;
}

function assessViability(totalPromises: number, totalEdges: number, billCount: number): TrainingViability {
  if (totalPromises < 150) {
    return {
      tier: "too_small",
      description: "Too small for ML. Need more labeled bills.",
      promise_count: totalPromises,
      edge_count: totalEdges,
      bills_needed_for_next_tier: Math.max(1, 5 - billCount),
    };
  }
  if (totalPromises < 300) {
    return {
      tier: "basic_patterns",
      description: "Sufficient for basic pattern analysis.",
      promise_count: totalPromises,
      edge_count: totalEdges,
      bills_needed_for_next_tier: Math.max(1, 10 - billCount),
    };
  }
  if (totalPromises < 600) {
    return {
      tier: "xgboost_viable",
      description: "XGBoost on tabular features becomes viable.",
      promise_count: totalPromises,
      edge_count: totalEdges,
      bills_needed_for_next_tier: Math.max(1, 20 - billCount),
    };
  }
  if (totalPromises < 1500) {
    return {
      tier: "nlp_viable",
      description: "NLP extraction model fine-tuning viable.",
      promise_count: totalPromises,
      edge_count: totalEdges,
      bills_needed_for_next_tier: Math.max(1, 50 - billCount),
    };
  }
  return {
    tier: "gnn_viable",
    description: "GNN training viable, cross-domain transfer testable.",
    promise_count: totalPromises,
    edge_count: totalEdges,
    bills_needed_for_next_tier: 0,
  };
}

// All policy domains we want to eventually cover
const TARGET_DOMAINS = [
  "Emissions", "Clean Energy", "Air Quality", "Environmental Review",
  "Coverage Expansion", "Insurance Reform", "Medicare & Medicaid",
  "Education", "Accountability",
  "Financial Regulation", "Corporate Governance",
  "Civil Rights", "Employment", "Public Accommodations",
  "Infrastructure", "Transportation",
  "Criminal Justice", "Sentencing",
  "Housing", "Affordability",
  "Labor/Workforce",
];

// All jurisdiction types we want
const TARGET_JURISDICTIONS = [
  "United States", "Oregon", "California", "Washington",
  "Colorado", "Massachusetts", "New York", "Texas",
];

// All agent types defined in the system
const TARGET_AGENT_TYPES = [
  "legislator", "utility", "regulator", "community",
  "auditor", "provider", "stakeholder", "certifier",
  "executive", "insurer", "judiciary", "federal",
];

export function analyzeGaps(inventory: DatasetInventory): GapAnalysis {
  const coveredDomains = new Set(inventory.domains_covered);
  const coveredJurisdictions = new Set(inventory.jurisdictions_covered);
  const coveredAgentTypes = new Set(inventory.agent_types_covered);

  const domainGaps = TARGET_DOMAINS.filter((d) => !coveredDomains.has(d));
  const jurisdictionGaps = TARGET_JURISDICTIONS.filter((j) => !coveredJurisdictions.has(j));
  const agentTypeGaps = TARGET_AGENT_TYPES.filter((t) => !coveredAgentTypes.has(t));

  // Score candidates based on gap-filling potential
  const scored = PRIORITY_BILL_QUEUE
    .filter((c) => c.selection_status === "candidate")
    .map((c) => scoreBillCandidate(c, coveredDomains, coveredJurisdictions, coveredAgentTypes))
    .filter((s) => !s.disqualified)
    .sort((a, b) => b.score - a.score);

  return {
    inventory,
    training_viability: assessViability(
      inventory.total_promises,
      inventory.total_edges,
      inventory.bills.length,
    ),
    domain_gaps: domainGaps,
    jurisdiction_gaps: jurisdictionGaps,
    agent_type_gaps: agentTypeGaps,
    recommended_next: scored.slice(0, 3),
  };
}
