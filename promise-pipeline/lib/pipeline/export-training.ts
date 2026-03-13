// ─── TRAINING DATA EXPORT ───
// Converts DashboardData into ML-ready TrainingDataExport format.

import type { DashboardData, Agent, Promise, Insight } from "../types/promise";
import type {
  TrainingDataExport,
  BillMetadata,
  DependencyEdge,
  DependencyType,
  VerificationCitation,
  ExtractionMetadata,
  JurisdictionLevel,
} from "../types/training";

// ─── BILL CONFIGS ───
// Static metadata not derivable from DashboardData alone.

export interface BillConfig {
  id: string;
  jurisdiction: string;
  level: JurisdictionLevel;
  year_enacted: number;
  year_effective?: number;
  domain_primary: string;
  text_url?: string;
  text_hash?: string;
  source_urls?: string[];
}

// ─── DEPENDENCY INFERENCE ───
// Infer dependency type from promise context.

function inferDependencyType(
  from: Promise,
  to: Promise,
): DependencyType {
  // Legal/modifier nodes
  if (from.nodeType === "modifier") return "legal";

  // Sequential: same agent, same domain, later target
  if (from.promiser === to.promiser && from.domain === to.domain) {
    if (from.target && to.target && from.target < to.target) return "sequential";
  }

  // Verification: regulator/auditor upstream of operational promise
  if (from.domain === "Verification" || from.verification.method === "audit") {
    return "verification";
  }

  // Planning/filing upstream of operational
  if (from.domain === "Planning") return "prerequisite";

  // Default
  return "enabling";
}

// Build dependency rationale from promise context
function buildDependencyRationale(
  from: Promise,
  to: Promise,
  type: DependencyType,
): string {
  const fromDesc = `${from.id} (${from.body.substring(0, 60)}...)`;
  const toDesc = `${to.id} (${to.body.substring(0, 60)}...)`;

  switch (type) {
    case "sequential":
      return `${toDesc} is a later phase target that depends on ${fromDesc} being achieved first.`;
    case "prerequisite":
      return `${toDesc} requires ${fromDesc} to be completed before implementation can begin.`;
    case "verification":
      return `${toDesc} depends on ${fromDesc} providing the verification infrastructure to assess compliance.`;
    case "legal":
      return `${fromDesc} is a legal ruling that modifies the scope or enforceability of ${toDesc}.`;
    case "resource":
      return `${toDesc} competes with ${fromDesc} for the same agent capacity or resources.`;
    case "enabling":
      return `${fromDesc} creates conditions that enable ${toDesc} to succeed.`;
  }
}

// ─── EXPORT FUNCTION ───

export function exportTrainingData(
  dashboard: DashboardData,
  config: BillConfig,
  extractionMeta?: Partial<ExtractionMetadata>,
): TrainingDataExport {
  const promiseMap = new Map(dashboard.promises.map((p) => [p.id, p]));

  // Build dependency edges from depends_on arrays
  const dependencies: DependencyEdge[] = [];
  for (const promise of dashboard.promises) {
    for (const depId of promise.depends_on) {
      const upstream = promiseMap.get(depId);
      if (!upstream) continue;

      const type = inferDependencyType(upstream, promise);
      dependencies.push({
        from: depId,
        to: promise.id,
        type,
        rationale: buildDependencyRationale(upstream, promise, type),
      });
    }
  }

  // Build bill metadata
  const bill: BillMetadata = {
    id: config.id,
    title: dashboard.title,
    jurisdiction: config.jurisdiction,
    level: config.level,
    year_enacted: config.year_enacted,
    year_effective: config.year_effective,
    domain_primary: config.domain_primary,
    domains: dashboard.domains.map((d) => d.name),
    agent_count: dashboard.agents.length,
    promise_count: dashboard.promises.length,
    text_url: config.text_url,
    text_hash: config.text_hash,
    source_urls: config.source_urls,
  };

  // Build verification citations from promise verification sources
  const verification_sources: VerificationCitation[] = dashboard.promises
    .filter((p) => p.verification.source)
    .map((p) => ({
      promise_id: p.id,
      source_name: p.verification.source!,
      access_date: new Date().toISOString().split("T")[0],
      data_type: mapVerificationMethodToDataType(p.verification.method),
      url: p.verification.endpoint,
    }));

  // Extraction metadata
  const metadata: ExtractionMetadata = {
    extracted_by: extractionMeta?.extracted_by ?? "agent-v1",
    reviewed_by: extractionMeta?.reviewed_by ?? null,
    extraction_date: extractionMeta?.extraction_date ?? new Date().toISOString().split("T")[0],
    review_date: extractionMeta?.review_date ?? null,
    confidence: extractionMeta?.confidence ?? "draft",
    pipeline_version: "0.1.0",
    notes: extractionMeta?.notes,
  };

  return {
    bill,
    agents: dashboard.agents,
    promises: dashboard.promises,
    dependencies,
    insights: dashboard.insights,
    verification_sources,
    extraction_metadata: metadata,
  };
}

function mapVerificationMethodToDataType(
  method: string,
): VerificationCitation["data_type"] {
  switch (method) {
    case "filing": return "regulatory_filing";
    case "audit": return "audit";
    case "self-report": return "self_report";
    case "data": return "statistics";
    case "legal": return "court_record";
    case "sensor":
    case "benchmark": return "agency_report";
    case "none": return "self_report";
    default: return "agency_report";
  }
}

// ─── QUALITY GATES ───
// Self-checks the agent should run before finalizing export.

export interface QualityGateResult {
  passed: boolean;
  gate: string;
  message: string;
}

export function runQualityGates(data: TrainingDataExport): QualityGateResult[] {
  const results: QualityGateResult[] = [];
  const promiseIds = new Set(data.promises.map((p) => p.id));
  const agentIds = new Set(data.agents.map((a) => a.id));

  // Gate 1: Every promise has a statutory reference
  const missingRefs = data.promises.filter((p) => !p.ref);
  results.push({
    passed: missingRefs.length === 0,
    gate: "statutory_references",
    message: missingRefs.length === 0
      ? "All promises have statutory references"
      : `${missingRefs.length} promises missing refs: ${missingRefs.map((p) => p.id).join(", ")}`,
  });

  // Gate 2: Every dependency edge has a rationale
  const missingRationales = data.dependencies.filter((d) => !d.rationale);
  results.push({
    passed: missingRationales.length === 0,
    gate: "dependency_rationales",
    message: missingRationales.length === 0
      ? "All dependency edges have rationales"
      : `${missingRationales.length} edges missing rationales`,
  });

  // Gate 3: Every status has a cited source (note is non-empty)
  const missingNotes = data.promises.filter((p) => !p.note || p.note.trim() === "");
  results.push({
    passed: missingNotes.length === 0,
    gate: "status_citations",
    message: missingNotes.length === 0
      ? "All promises have status notes/citations"
      : `${missingNotes.length} promises missing notes: ${missingNotes.map((p) => p.id).join(", ")}`,
  });

  // Gate 4: No depends_on pointing to nonexistent IDs
  const brokenDeps: string[] = [];
  for (const p of data.promises) {
    for (const dep of p.depends_on) {
      if (!promiseIds.has(dep)) brokenDeps.push(`${p.id} → ${dep}`);
    }
  }
  results.push({
    passed: brokenDeps.length === 0,
    gate: "dependency_integrity",
    message: brokenDeps.length === 0
      ? "All dependency references are valid"
      : `Broken dependencies: ${brokenDeps.join(", ")}`,
  });

  // Gate 5: Agent IDs are consistent across promises
  const unknownAgents: string[] = [];
  for (const p of data.promises) {
    if (!agentIds.has(p.promiser)) unknownAgents.push(`${p.id}.promiser=${p.promiser}`);
    if (!agentIds.has(p.promisee)) unknownAgents.push(`${p.id}.promisee=${p.promisee}`);
  }
  results.push({
    passed: unknownAgents.length === 0,
    gate: "agent_consistency",
    message: unknownAgents.length === 0
      ? "All agent IDs are consistent"
      : `Unknown agents: ${unknownAgents.join(", ")}`,
  });

  // Gate 6: Domain names are consistent (no case mismatches)
  const domainNames = data.promises.map((p) => p.domain);
  const domainLower = new Map<string, string[]>();
  for (const d of domainNames) {
    const key = d.toLowerCase();
    if (!domainLower.has(key)) domainLower.set(key, []);
    domainLower.get(key)!.push(d);
  }
  const inconsistentDomains = Array.from(domainLower.values()).filter((v) => v.length > 1);
  results.push({
    passed: inconsistentDomains.length === 0,
    gate: "domain_consistency",
    message: inconsistentDomains.length === 0
      ? "All domain names are consistent"
      : `Inconsistent domains: ${inconsistentDomains.map((v) => v.join(" vs ")).join("; ")}`,
  });

  // Gate 7: Promise count matches
  results.push({
    passed: data.bill.promise_count === data.promises.length,
    gate: "promise_count",
    message: data.bill.promise_count === data.promises.length
      ? `Promise count matches: ${data.promises.length}`
      : `Metadata says ${data.bill.promise_count}, actual is ${data.promises.length}`,
  });

  return results;
}
