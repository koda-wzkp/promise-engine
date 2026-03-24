import { createHash } from "crypto";

// ─── STATUS (3 bits, 5 values) ───
const STATUS_ENCODE: Record<string, number> = {
  verified: 0,
  declared: 1,
  degraded: 2,
  violated: 3,
  unverifiable: 4,
};

// ─── VERIFICATION METHOD (3 bits, 6 values) ───
const VERIFICATION_ENCODE: Record<string, number> = {
  filing: 0,
  audit: 1,
  "self-report": 2,
  sensor: 3,
  benchmark: 4,
  none: 5,
};

// ─── POLARITY (1 bit, 2 values) — v2.1 ───
const POLARITY_ENCODE: Record<string, number> = {
  give: 0,
  accept: 1,
};

// ─── ORIGIN (2 bits, 3 values) — v2.1 ───
const ORIGIN_ENCODE: Record<string, number> = {
  voluntary: 0,
  imposed: 1,
  negotiated: 2,
};

// ─── VIOLATION TYPE (3 bits, 5 values) — v2.1 ───
// 0 = not violated (n/a), 1-4 = violation types
const VIOLATION_TYPE_ENCODE: Record<string, number> = {
  none: 0,
  fault: 1,
  flaw: 2,
  abandoned: 3,
  expired: 4,
};

// ─── AGENT TYPE (4 bits, 16 slots) ───
const AGENT_TYPE_ENCODE: Record<string, number> = {
  legislator: 0,
  utility: 1,
  regulator: 2,
  community: 3,
  auditor: 4,
  provider: 5,
  stakeholder: 6,
  certifier: 7,
  brand: 8,
  monitor: 9,
  "team-member": 10,
  // 11-15 reserved for future agent types
};

// ─── DOMAIN (5 bits, 32 slots) ───
// Domains vary by vertical but we assign a global registry
// to keep hex encoding unambiguous across networks.
const DOMAIN_ENCODE: Record<string, number> = {
  Emissions: 0,
  Planning: 1,
  Verification: 2,
  Equity: 3,
  Affordability: 4,
  Tribal: 5,
  Workforce: 6,
  Safety: 7,
  Transparency: 8,
  Compliance: 9,
  Accuracy: 10,
  Performance: 11,
  Privacy: 12,
  Openness: 13,
  Uptime: 14,
  Sovereignty: 15,
  Health: 16,
  Education: 17,
  Nuclear: 18,
  Sanctions: 19,
  Work: 20,
  Relationships: 21,
  Creative: 22,
  Financial: 23,
  // 24-30 reserved
  Other: 31,
};

/**
 * Promise Header Bit Layout — 128 bits total
 *
 * Bits   Width  Field                Range / Notes
 * ─────────────────────────────────────────────────────
 * 0-15    16    promise_index        0-65535 (network-local index)
 * 16-31   16    promiser_index       0-65535 (agent index in network)
 * 32-47   16    promisee_index       0-65535 (agent index in network)
 * 48-50    3    status               0-4 (STATUS_ENCODE)
 * 51-53    3    verification_method  0-5 (VERIFICATION_ENCODE)
 * 54       1    polarity             0-1 (POLARITY_ENCODE)
 * 55-56    2    origin               0-2 (ORIGIN_ENCODE)
 * 57-59    3    violation_type       0-4 (VIOLATION_TYPE_ENCODE)
 * 60-64    5    domain               0-31 (DOMAIN_ENCODE)
 * 65-68    4    agent_type           0-15 (AGENT_TYPE_ENCODE, promiser's type)
 * 69-75    7    progress             0-100 (or 127 = null)
 * 76-82    7    required             0-100 (or 127 = null)
 * 83-89    7    confidence           0-100 (or 127 = null)
 * 90-105  16    target_days          days since 2000-01-01 (0 = null, max ~2179)
 * 106-113  8    dependency_count     0-255
 * 114-127 14    reserved             0 (future: MTKP, scope flags, etc.)
 * ─────────────────────────────────────────────────────
 * Total: 128 bits = 16 bytes = 32 hex chars
 */

// Use BigInt for bit manipulation — JS Numbers lose precision above 53 bits
export type PromiseHexInput = {
  promiseIndex: number;
  promiserIndex: number;
  promiseeIndex: number;
  status: string;
  verificationMethod: string;
  polarity?: string;
  origin?: string;
  violationType?: string;
  domain: string;
  agentType: string;
  progress?: number | null;
  required?: number | null;
  confidence?: number | null;
  targetDate?: string | null; // ISO date string or null
  dependencyCount: number;
};

/**
 * Encode promise structural metadata to a 32-character hex string.
 *
 * The hex string contains NO human-readable text — only typed,
 * enumerated, and bounded numeric fields. Text fields (body, note,
 * ref) are handled separately via SHA-256 hashes.
 */
export function encodePromiseHeader(input: PromiseHexInput): string {
  let bits = 0n;

  // Promise index (16 bits)
  bits = (bits << 16n) | BigInt(input.promiseIndex & 0xffff);

  // Promiser index (16 bits)
  bits = (bits << 16n) | BigInt(input.promiserIndex & 0xffff);

  // Promisee index (16 bits)
  bits = (bits << 16n) | BigInt(input.promiseeIndex & 0xffff);

  // Status (3 bits)
  bits = (bits << 3n) | BigInt(STATUS_ENCODE[input.status] ?? 1);

  // Verification method (3 bits)
  bits = (bits << 3n) | BigInt(VERIFICATION_ENCODE[input.verificationMethod] ?? 5);

  // Polarity (1 bit)
  bits = (bits << 1n) | BigInt(POLARITY_ENCODE[input.polarity ?? "give"] ?? 0);

  // Origin (2 bits)
  bits = (bits << 2n) | BigInt(ORIGIN_ENCODE[input.origin ?? "voluntary"] ?? 0);

  // Violation type (3 bits)
  bits = (bits << 3n) | BigInt(VIOLATION_TYPE_ENCODE[input.violationType ?? "none"] ?? 0);

  // Domain (5 bits)
  bits = (bits << 5n) | BigInt(DOMAIN_ENCODE[input.domain] ?? DOMAIN_ENCODE["Other"]);

  // Agent type (4 bits)
  bits = (bits << 4n) | BigInt(AGENT_TYPE_ENCODE[input.agentType] ?? 6);

  // Progress (7 bits, 127 = null)
  const progress = input.progress != null ? Math.min(input.progress, 100) : 127;
  bits = (bits << 7n) | BigInt(progress);

  // Required (7 bits, 127 = null)
  const required = input.required != null ? Math.min(input.required, 100) : 127;
  bits = (bits << 7n) | BigInt(required);

  // Confidence (7 bits, 127 = null)
  const confidence = input.confidence != null ? Math.min(input.confidence, 100) : 127;
  bits = (bits << 7n) | BigInt(confidence);

  // Target date (16 bits, days since 2000-01-01, 0 = null)
  let targetDays = 0;
  if (input.targetDate) {
    const epoch = new Date("2000-01-01T00:00:00Z").getTime();
    const target = new Date(input.targetDate).getTime();
    targetDays = Math.max(1, Math.floor((target - epoch) / (86400 * 1000)));
    targetDays = Math.min(targetDays, 0xffff);
  }
  bits = (bits << 16n) | BigInt(targetDays);

  // Dependency count (8 bits)
  bits = (bits << 8n) | BigInt(Math.min(input.dependencyCount, 255));

  // Reserved (14 bits)
  bits = (bits << 14n) | 0n;

  // Convert to 32-char hex string
  return bits.toString(16).toUpperCase().padStart(32, "0");
}

/**
 * Decode a 32-character hex string back to promise structural metadata.
 */
export function decodePromiseHeader(hex: string): PromiseHexInput {
  if (hex.length !== 32) {
    throw new Error(`Invalid promise hex length: ${hex.length}, expected 32`);
  }

  let bits = BigInt("0x" + hex);

  // Read fields right-to-left (reverse of encoding order)
  // Reserved (14 bits)
  bits >>= 14n;

  // Dependency count (8 bits)
  const dependencyCount = Number(bits & 0xffn);
  bits >>= 8n;

  // Target date (16 bits)
  const targetDays = Number(bits & 0xffffn);
  bits >>= 16n;
  let targetDate: string | null = null;
  if (targetDays > 0) {
    const epoch = new Date("2000-01-01T00:00:00Z").getTime();
    targetDate = new Date(epoch + targetDays * 86400 * 1000)
      .toISOString()
      .split("T")[0];
  }

  // Confidence (7 bits)
  const confidenceRaw = Number(bits & 0x7fn);
  bits >>= 7n;
  const confidence = confidenceRaw === 127 ? null : confidenceRaw;

  // Required (7 bits)
  const requiredRaw = Number(bits & 0x7fn);
  bits >>= 7n;
  const requiredVal = requiredRaw === 127 ? null : requiredRaw;

  // Progress (7 bits)
  const progressRaw = Number(bits & 0x7fn);
  bits >>= 7n;
  const progress = progressRaw === 127 ? null : progressRaw;

  // Agent type (4 bits)
  const agentTypeIdx = Number(bits & 0xfn);
  bits >>= 4n;

  // Domain (5 bits)
  const domainIdx = Number(bits & 0x1fn);
  bits >>= 5n;

  // Violation type (3 bits)
  const violationIdx = Number(bits & 0x7n);
  bits >>= 3n;

  // Origin (2 bits)
  const originIdx = Number(bits & 0x3n);
  bits >>= 2n;

  // Polarity (1 bit)
  const polarityIdx = Number(bits & 0x1n);
  bits >>= 1n;

  // Verification method (3 bits)
  const verifIdx = Number(bits & 0x7n);
  bits >>= 3n;

  // Status (3 bits)
  const statusIdx = Number(bits & 0x7n);
  bits >>= 3n;

  // Promisee index (16 bits)
  const promiseeIndex = Number(bits & 0xffffn);
  bits >>= 16n;

  // Promiser index (16 bits)
  const promiserIndex = Number(bits & 0xffffn);
  bits >>= 16n;

  // Promise index (16 bits)
  const promiseIndex = Number(bits & 0xffffn);

  // Reverse lookups
  const reverseMap = <T extends Record<string, number>>(
    map: T,
  ): Record<number, string> =>
    Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));

  return {
    promiseIndex,
    promiserIndex,
    promiseeIndex,
    status: reverseMap(STATUS_ENCODE)[statusIdx] ?? "declared",
    verificationMethod: reverseMap(VERIFICATION_ENCODE)[verifIdx] ?? "none",
    polarity: reverseMap(POLARITY_ENCODE)[polarityIdx] ?? "give",
    origin: reverseMap(ORIGIN_ENCODE)[originIdx] ?? "voluntary",
    violationType: reverseMap(VIOLATION_TYPE_ENCODE)[violationIdx] ?? "none",
    domain: reverseMap(DOMAIN_ENCODE)[domainIdx] ?? "Other",
    agentType: reverseMap(AGENT_TYPE_ENCODE)[agentTypeIdx] ?? "stakeholder",
    progress,
    required: requiredVal,
    confidence,
    targetDate,
    dependencyCount,
  };
}

/**
 * Hash the text content of a promise (body + note + ref).
 * Returns a 64-character hex SHA-256 digest.
 *
 * This is the integrity hash — if someone modifies the body text,
 * the hash won't match the header.
 */
export function hashPromiseContent(
  body: string,
  note: string,
  ref?: string,
): string {
  const content = [body, note, ref ?? ""].join("\x00"); // null-byte separator
  return createHash("sha256").update(content, "utf-8").digest("hex").toUpperCase();
}

/**
 * Full promise fingerprint: header (32 hex) + content hash (64 hex) = 96 hex chars.
 * This is the complete, verifiable identity of a promise.
 */
export function fingerprintPromise(
  header: PromiseHexInput,
  body: string,
  note: string,
  ref?: string,
): string {
  return encodePromiseHeader(header) + hashPromiseContent(body, note, ref);
}

/**
 * Network fingerprint: SHA-256 of the sorted concatenation of all promise fingerprints.
 * Two networks with identical promises (same fields, same text) produce the same hash.
 * Changing one status in one promise produces a different hash.
 */
export function fingerprintNetwork(fingerprints: string[]): string {
  const sorted = [...fingerprints].sort();
  const concat = sorted.join("");
  return createHash("sha256").update(concat, "utf-8").digest("hex").toUpperCase();
}
