// ─── TRAINING DATA SCHEMA ───
// JSON format optimized for ML ingestion.
// Each bill extraction produces one TrainingDataExport file.

import type { Agent, Promise, Insight, VerificationSource } from "./promise";

// ─── BILL METADATA ───
export type JurisdictionLevel = "federal" | "state" | "local" | "tribal";

export interface BillMetadata {
  id: string;                    // e.g. "OR-HB2021-2021", "US-ACA-2010"
  title: string;
  jurisdiction: string;          // e.g. "Oregon", "United States"
  level: JurisdictionLevel;
  year_enacted: number;
  year_effective?: number;       // If different from enacted
  domain_primary: string;        // Primary policy domain
  domains: string[];             // All domains touched
  agent_count: number;
  promise_count: number;
  text_url?: string;             // URL to enrolled text
  text_hash?: string;            // sha256 of source text
  source_urls?: string[];        // Legislative database URLs
}

// ─── DEPENDENCY EDGE ───
export interface DependencyEdge {
  from: string;                  // Promise ID (upstream)
  to: string;                    // Promise ID (dependent)
  type: DependencyType;
  rationale: string;             // Why this dependency exists
}

export type DependencyType =
  | "prerequisite"   // Must complete before downstream can start
  | "enabling"       // Creates conditions for downstream success
  | "verification"   // Monitoring mechanism for downstream compliance
  | "sequential"     // Phase N → Phase N+1
  | "resource"       // Competes for same agent/resource capacity
  | "legal";         // Legal ruling modifies downstream promise

// ─── VERIFICATION SOURCE CITATION ───
export interface VerificationCitation {
  promise_id: string;
  url?: string;
  source_name: string;
  access_date: string;           // ISO date
  data_type: "regulatory_filing" | "agency_report" | "audit" | "academic" | "journalism" | "court_record" | "statistics" | "self_report";
  excerpt?: string;              // Key data point or quote
}

// ─── EXTRACTION METADATA ───
export type ConfidenceLevel = "draft" | "reviewed" | "published";

export interface ExtractionMetadata {
  extracted_by: string;          // "agent-v1", "human", etc.
  reviewed_by: string | null;
  extraction_date: string;       // ISO date
  review_date: string | null;
  confidence: ConfidenceLevel;
  pipeline_version: string;      // Semver of extraction pipeline
  notes?: string;                // Free-form extraction notes
}

// ─── TRAINING DATA EXPORT ───
export interface TrainingDataExport {
  bill: BillMetadata;
  agents: Agent[];
  promises: Promise[];
  dependencies: DependencyEdge[];
  insights: Insight[];
  verification_sources: VerificationCitation[];
  extraction_metadata: ExtractionMetadata;
}

// ─── BILL SELECTION CRITERIA ───
export interface BillCandidate {
  title: string;
  jurisdiction: string;
  level: JurisdictionLevel;
  year_enacted: number;
  section_count?: number;
  estimated_promise_count: number;
  known_controversies: string[];
  verification_sources: string[];
  domains: string[];
  agent_types: string[];
  training_value_notes: string;  // Why this bill is good for training
  selection_status: "candidate" | "selected" | "extracted" | "reviewed" | "published";
}

// ─── DATASET INVENTORY ───
export interface DatasetInventory {
  bills: DatasetBillEntry[];
  total_promises: number;
  total_edges: number;
  domains_covered: string[];
  jurisdictions_covered: string[];
  agent_types_covered: string[];
  last_updated: string;          // ISO date
}

export interface DatasetBillEntry {
  bill_id: string;
  title: string;
  jurisdiction: string;
  level: JurisdictionLevel;
  domains: string[];
  promise_count: number;
  edge_count: number;
  confidence: ConfidenceLevel;
  extraction_date: string;
}

// ─── PIPELINE STEP TYPES ───
export type PipelineStepName =
  | "bill_selection"
  | "text_acquisition"
  | "promise_extraction"
  | "dependency_mapping"
  | "status_assessment"
  | "insight_generation"
  | "output_packaging";

export interface PipelineCheckpoint {
  step: PipelineStepName;
  status: "pending" | "in_progress" | "awaiting_review" | "approved" | "completed";
  started_at?: string;
  completed_at?: string;
  reviewer_notes?: string;
}

export interface PipelineRun {
  run_id: string;
  bill_id: string;
  started_at: string;
  completed_at?: string;
  checkpoints: PipelineCheckpoint[];
  current_step: PipelineStepName;
}
