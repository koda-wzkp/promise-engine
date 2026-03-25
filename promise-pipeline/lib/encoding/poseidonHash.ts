/**
 * Poseidon hashing for ZK circuit compatibility.
 *
 * Poseidon operates on field elements (BigInt values in the BN254 scalar field).
 * Promise data must be converted to field elements before hashing.
 *
 * Why Poseidon: ~250 constraints per hash inside a ZK circuit vs ~25,000 for SHA-256.
 * That's 100x cheaper proof generation. SHA-256 stays for external interoperability;
 * Poseidon is for internal circuit operations.
 */

import { createHash } from "crypto";
import { poseidon2, poseidon12 } from "poseidon-lite";
import type { Promise as PPPromise } from "../types/promise";

// BN254 scalar field order
const FIELD_ORDER =
  21888242871839275222246405745257275088548364400416034343698204186575808495617n;

// Status enum mapping (matches Noir circuit)
export const STATUS_TO_FIELD: Record<string, bigint> = {
  verified: 1n,
  declared: 2n,
  degraded: 3n,
  violated: 4n,
  unverifiable: 5n,
};

// Verification method enum mapping
export const VERIFICATION_METHOD_TO_FIELD: Record<string, bigint> = {
  filing: 1n,
  audit: 2n,
  "self-report": 3n,
  sensor: 4n,
  benchmark: 5n,
  none: 6n,
};

/**
 * Convert a string to a field element by hashing with SHA-256
 * and taking modulo field order.
 *
 * One-way mapping: the field element commits to the string without revealing it.
 */
export function stringToField(s: string): bigint {
  const hash = createHash("sha256").update(s, "utf-8").digest("hex");
  return BigInt("0x" + hash) % FIELD_ORDER;
}

/**
 * Convert an ISO date string to a field element (Unix timestamp).
 * Returns 0n for null/undefined dates.
 */
export function dateToField(isoDate: string | undefined): bigint {
  if (!isoDate) return 0n;
  return BigInt(Math.floor(new Date(isoDate).getTime() / 1000));
}

/**
 * Encode a Promise into an array of 12 field elements for Poseidon hashing.
 *
 * Field layout (12 elements):
 * [0]  promiser_hash         — stringToField(promiser)
 * [1]  promisee_hash         — stringToField(promisee)
 * [2]  body_hash             — stringToField(body)
 * [3]  domain_hash           — stringToField(domain)
 * [4]  status                — STATUS_TO_FIELD[status]
 * [5]  target_date           — dateToField(target)
 * [6]  progress              — BigInt(progress ?? 0)
 * [7]  required              — BigInt(required ?? 0)
 * [8]  verification_method   — VERIFICATION_METHOD_TO_FIELD[verification.method]
 * [9]  ref_hash              — stringToField(ref ?? '')
 * [10] id_hash               — stringToField(id)
 * [11] depends_on_hash       — stringToField(depends_on.sort().join(','))
 */
export function promiseToFieldElements(promise: PPPromise): bigint[] {
  return [
    stringToField(promise.promiser),
    stringToField(promise.promisee),
    stringToField(promise.body),
    stringToField(promise.domain),
    STATUS_TO_FIELD[promise.status] ?? 0n,
    dateToField(promise.target),
    BigInt(promise.progress ?? 0),
    BigInt(promise.required ?? 0),
    VERIFICATION_METHOD_TO_FIELD[promise.verification?.method ?? "none"] ?? 0n,
    stringToField(promise.ref ?? ""),
    stringToField(promise.id),
    stringToField((promise.depends_on ?? []).sort().join(",")),
  ];
}

/**
 * Compute Poseidon hash of a promise's 12 field elements.
 * Returns a single field element (BigInt).
 *
 * Uses poseidon-lite's native Poseidon implementation over BN254.
 */
export function poseidonHashPromise(promise: PPPromise): bigint {
  const fields = promiseToFieldElements(promise);
  return poseidon12(fields);
}

/**
 * Compute Poseidon Merkle root of a promise network.
 *
 * Builds a binary Merkle tree from sorted promise hashes.
 * Pads to next power of 2 with zero leaves.
 * Returns the root field element.
 */
export function poseidonMerkleRoot(promises: PPPromise[]): bigint {
  if (promises.length === 0) return 0n;

  let leaves = promises
    .map((p) => poseidonHashPromise(p))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  // Pad to next power of 2
  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(leaves.length)));
  while (leaves.length < nextPow2) {
    leaves.push(0n);
  }

  // Build tree bottom-up using Poseidon2 for pair hashing
  while (leaves.length > 1) {
    const next: bigint[] = [];
    for (let i = 0; i < leaves.length; i += 2) {
      next.push(poseidon2([leaves[i], leaves[i + 1]]));
    }
    leaves = next;
  }

  return leaves[0];
}

/**
 * Generate a Merkle proof (path + indices) for a specific promise.
 * This is the witness data needed by the Noir circuit.
 */
export function generateMerkleProof(
  promises: PPPromise[],
  targetPromiseId: string,
): { leaf: bigint; path: bigint[]; indices: number[] } | null {
  if (promises.length === 0) return null;

  const tagged = promises
    .map((p) => ({ id: p.id, hash: poseidonHashPromise(p) }))
    .sort((a, b) => (a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : 0));

  const targetIndex = tagged.findIndex((l) => l.id === targetPromiseId);
  if (targetIndex === -1) return null;

  const leaf = tagged[targetIndex].hash;

  // Pad to next power of 2
  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(tagged.length)));
  let hashes = tagged.map((l) => l.hash);
  while (hashes.length < nextPow2) {
    hashes.push(0n);
  }

  const path: bigint[] = [];
  const indices: number[] = [];
  let idx = targetIndex;

  while (hashes.length > 1) {
    const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
    path.push(hashes[siblingIdx]);
    indices.push(idx % 2); // 0 = left child, 1 = right child

    // Compute next level
    const next: bigint[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      next.push(poseidon2([hashes[i], hashes[i + 1]]));
    }
    hashes = next;
    idx = Math.floor(idx / 2);
  }

  return { leaf, path, indices };
}
