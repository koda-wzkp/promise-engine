/**
 * Visual Encoding Utilities — Five-Field Metrics → Visual Properties
 *
 * Maps data from the five-field diagnostic (epidemiology, reliability,
 * information, strategy, probabilistic) to visual properties on graph
 * nodes and edges. Every visual property encodes a distinct metric.
 *
 * Visual encoding table:
 *   Node size       → FMEA severity (reliability)
 *   Node saturation → Channel capacity (information)
 *   Node pulse rate → RPN (reliability)
 *   Node glow       → Superspreader score (epidemiology)
 *   Edge thickness  → Cascade probability (probabilistic)
 *   Edge style      → Incentive compatibility (strategy)
 */

import type {
  FiveFieldDiagnostic,
  FMEAEntry,
  HeuristicCPTEntry,
  AgencyCostEntry,
  SuperspreaderScore,
} from "@/lib/types/analysis";

// ── Node Encoding ──

/**
 * Map FMEA severity (1–10) to node radius.
 * Severity 1 → baseRadius × 0.7 (leaf node, small)
 * Severity 10 → baseRadius × 2.0 (critical hub, large)
 */
export function getNodeRadius(severity: number, baseRadius: number = 20): number {
  const clamped = Math.max(1, Math.min(10, severity));
  const scale = 0.7 + (clamped / 10) * 1.3;
  return baseRadius * scale;
}

/**
 * Map verification channel capacity (0–2.1 bits) to CSS saturation percent.
 * sensor (2.1) → 100% saturation
 * none (0.0) → 25% saturation (ghostly, but still visible)
 */
export function getNodeSaturation(channelCapacity: number): number {
  const minSat = 25;
  const maxSat = 100;
  return minSat + (Math.min(channelCapacity, 2.1) / 2.1) * (maxSat - minSat);
}

/**
 * Map RPN to pulse animation parameters.
 * Low RPN → no pulse. Critical RPN → fast visible throb.
 */
export function getPulseRate(rpn: number): { period: number; amplitude: number } {
  if (rpn <= 50) return { period: 0, amplitude: 0 };
  if (rpn <= 100) return { period: 4000, amplitude: 1.5 };
  if (rpn <= 200) return { period: 2000, amplitude: 2.5 };
  return { period: 1000, amplitude: 3.5 };
}

/**
 * RPN priority classification, matching the FMEA module.
 */
export function getRpnPriority(rpn: number): "critical" | "high" | "medium" | "low" {
  if (rpn > 200) return "critical";
  if (rpn > 100) return "high";
  if (rpn > 50) return "medium";
  return "low";
}

/**
 * Map superspreader score to glow CSS filter.
 * Only the top 20% of nodes (normalized score >= 0.8) get a glow.
 */
export function getNodeGlow(
  superspreaderScore: number,
  maxScore: number,
  statusColorRgb: string
): { radius: number; opacity: number; filter: string } | null {
  const normalized = superspreaderScore / Math.max(maxScore, 1);
  if (normalized < 0.8) return null;

  const radius = 4 + normalized * 8;
  const opacity = 0.15 + normalized * 0.25;

  return {
    radius,
    opacity,
    filter: `drop-shadow(0 0 ${radius}px rgba(${statusColorRgb}, ${opacity}))`,
  };
}

// ── Edge Encoding ──

/**
 * Map cascade probability from heuristic CPTs to edge thickness.
 * High P(downstream degrades | upstream fails) → thick edge.
 */
export function getEdgeThickness(
  downstreamId: string,
  cpts: Record<string, HeuristicCPTEntry>,
  baseThickness: number = 1.5
): number {
  const cpt = cpts[downstreamId];
  if (!cpt) return baseThickness;

  const failProb = (cpt.posterior.degraded ?? 0) + (cpt.posterior.violated ?? 0);
  return baseThickness + failProb * 3.5;
}

/**
 * Map incentive compatibility to edge dash style.
 * Compatible → solid. Partial → long dash. Incompatible → short dash/dotted.
 */
export function getEdgeStyle(
  incentiveCompat: "yes" | "partial" | "no"
): { dashArray: string; opacity: number } {
  switch (incentiveCompat) {
    case "yes":
      return { dashArray: "none", opacity: 0.8 };
    case "partial":
      return { dashArray: "8 4", opacity: 0.6 };
    case "no":
      return { dashArray: "3 3", opacity: 0.4 };
  }
}

// ── Cascade Ripple ──

/**
 * Compute ripple ring properties for cascade animation at a given time.
 */
export function getCascadeRippleRings(
  maxDepth: number,
  elapsedMs: number
): Array<{ depth: number; radius: number; opacity: number; hue: number }> {
  const rings: Array<{ depth: number; radius: number; opacity: number; hue: number }> = [];

  for (let depth = 1; depth <= maxDepth; depth++) {
    const delay = depth * 300;
    const elapsed = elapsedMs - delay;
    if (elapsed < 0) continue;

    const progress = Math.min(elapsed / 800, 1);
    const radius = progress * (depth * 80);
    const opacity = (1 - progress) * (0.6 / depth);
    const hue = Math.max(0, 40 - depth * 15);

    rings.push({ depth, radius, opacity, hue });
  }

  return rings;
}

// ── Precomputation ──

/**
 * Precomputed visual encoding for a single node.
 * Computed once when diagnostic updates, not per frame.
 */
export interface NodeVisualEncoding {
  radius: number;
  saturation: number;
  pulse: { period: number; amplitude: number };
  rpnPriority: "critical" | "high" | "medium" | "low";
  rpn: number;
  glowFilter: string | null;
  glowRadius: number;
  severity: number;
  channelCapacity: number;
  superspreaderScore: number;
  agencyCost: number;
  moralHazard: number;
  incentiveCompatible: "yes" | "partial" | "no";
  directDependents: number;
  domainsSpanned: number;
}

/**
 * Precomputed visual encoding for a single edge.
 */
export interface EdgeVisualEncoding {
  thickness: number;
  dashArray: string;
  opacity: number;
  cascadeProb: number;
  incentiveCompat: "yes" | "partial" | "no";
}

/** Channel capacity by verification method (matches information.ts). */
const CHANNEL_CAPACITY: Record<string, number> = {
  sensor: 2.1,
  audit: 1.8,
  benchmark: 1.5,
  filing: 1.2,
  "self-report": 0.6,
  none: 0.0,
};

/**
 * Hex color → "r, g, b" string for use in rgba().
 */
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * Precompute visual encodings for all nodes given a five-field diagnostic.
 */
export function precomputeNodeEncodings(
  promises: Array<{
    id: string;
    status: string;
    verification: { method: string };
    depends_on: string[];
    promiser: string;
  }>,
  diagnostic: FiveFieldDiagnostic,
  statusColorFn: (status: string) => string
): Record<string, NodeVisualEncoding> {
  const { epidemiology, reliability, information, strategy } = diagnostic;

  // Build lookup maps
  const fmeaMap = new Map<string, FMEAEntry>();
  for (const entry of reliability.fmea) fmeaMap.set(entry.promiseId, entry);

  const superspreaderMap = new Map<string, SuperspreaderScore>();
  for (const entry of epidemiology.superspreaderScores) {
    superspreaderMap.set(entry.promiseId, entry);
  }
  const maxSuperspreader = epidemiology.superspreaderScores.length > 0
    ? epidemiology.superspreaderScores[0].score
    : 0;

  const agencyCostMap = new Map<string, AgencyCostEntry>();
  for (const entry of strategy.agencyCosts) agencyCostMap.set(entry.promiseId, entry);

  const result: Record<string, NodeVisualEncoding> = {};

  for (const p of promises) {
    const fmea = fmeaMap.get(p.id);
    const ss = superspreaderMap.get(p.id);
    const agency = agencyCostMap.get(p.id);

    const severity = fmea?.severity ?? 1;
    const rpn = fmea?.RPN ?? 0;
    const channelCapacity = CHANNEL_CAPACITY[p.verification.method] ?? 0;
    const ssScore = ss?.score ?? 0;

    const statusColor = statusColorFn(p.status);
    const statusRgb = hexToRgb(statusColor);

    const glow = getNodeGlow(ssScore, maxSuperspreader, statusRgb);

    result[p.id] = {
      radius: getNodeRadius(severity),
      saturation: getNodeSaturation(channelCapacity),
      pulse: getPulseRate(rpn),
      rpnPriority: getRpnPriority(rpn),
      rpn,
      glowFilter: glow?.filter ?? null,
      glowRadius: glow?.radius ?? 0,
      severity,
      channelCapacity,
      superspreaderScore: ssScore,
      agencyCost: agency?.agencyCost ?? 0,
      moralHazard: agency?.moralHazard ?? 0,
      incentiveCompatible: agency?.incentiveCompatible ?? "no",
      directDependents: ss?.directDependents ?? 0,
      domainsSpanned: ss?.domainsSpanned ?? 0,
    };
  }

  return result;
}

/**
 * Precompute visual encodings for all dependency edges.
 */
export function precomputeEdgeEncodings(
  promises: Array<{
    id: string;
    depends_on: string[];
  }>,
  diagnostic: FiveFieldDiagnostic,
  cpts: Record<string, HeuristicCPTEntry>
): Record<string, EdgeVisualEncoding> {
  const agencyCostMap = new Map<string, AgencyCostEntry>();
  for (const entry of diagnostic.strategy.agencyCosts) {
    agencyCostMap.set(entry.promiseId, entry);
  }

  const result: Record<string, EdgeVisualEncoding> = {};

  for (const p of promises) {
    for (const depId of p.depends_on) {
      const edgeKey = `${depId}->${p.id}`;
      const thickness = getEdgeThickness(p.id, cpts);
      const agency = agencyCostMap.get(p.id);
      const incentiveCompat = agency?.incentiveCompatible ?? "no";
      const style = getEdgeStyle(incentiveCompat);

      const cpt = cpts[p.id];
      const cascadeProb = cpt
        ? (cpt.posterior.degraded ?? 0) + (cpt.posterior.violated ?? 0)
        : 0;

      result[edgeKey] = {
        thickness,
        dashArray: style.dashArray,
        opacity: style.opacity,
        cascadeProb,
        incentiveCompat,
      };
    }
  }

  return result;
}
