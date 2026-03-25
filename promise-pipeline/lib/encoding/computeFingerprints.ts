/**
 * Dual-hash fingerprint computation for promise networks.
 *
 * Computes both SHA-256 (external interoperability) and Poseidon (ZK circuit)
 * fingerprints for each promise network. Neither replaces the other — they
 * serve different purposes permanently.
 */

import type { Promise as PPPromise, NetworkFingerprint } from "../types/promise";
import type { Agent } from "../types/promise";
import {
  encodePromiseHeader,
  fingerprintPromise,
  fingerprintNetwork,
  PromiseHexInput,
} from "./promiseHex";
import { poseidonMerkleRoot } from "./poseidonHash";

/**
 * Convert a Promise + agent context into the PromiseHexInput needed
 * for SHA-256 fingerprinting.
 */
function promiseToHexInput(
  promise: PPPromise,
  promiseIndex: number,
  agentIndex: Map<string, number>,
  agentTypeMap: Map<string, string>,
): PromiseHexInput {
  return {
    promiseIndex,
    promiserIndex: agentIndex.get(promise.promiser) ?? 0,
    promiseeIndex: agentIndex.get(promise.promisee) ?? 0,
    status: promise.status,
    verificationMethod: promise.verification.method,
    polarity: promise.polarity ?? "give",
    origin: promise.origin ?? "voluntary",
    violationType: promise.violationType ?? "none",
    domain: promise.domain,
    agentType: agentTypeMap.get(promise.promiser) ?? "stakeholder",
    progress: promise.progress ?? null,
    required: promise.required ?? null,
    confidence: null,
    targetDate: promise.target ?? null,
    dependencyCount: promise.depends_on.length,
  };
}

/**
 * Compute dual (SHA-256 + Poseidon) fingerprints for a promise network.
 */
export function computeNetworkFingerprints(
  promises: PPPromise[],
  agents: Agent[],
): NetworkFingerprint {
  // Build index maps
  const agentIndex = new Map(agents.map((a, i) => [a.id, i]));
  const agentTypeMap = new Map(agents.map((a) => [a.id, a.type]));

  // SHA-256 path: encode each promise → 96-char fingerprint → network hash
  const sha256Fingerprints = promises.map((p, i) => {
    const input = promiseToHexInput(p, i, agentIndex, agentTypeMap);
    return fingerprintPromise(input, p.body, p.note, p.ref);
  });
  const sha256Network = fingerprintNetwork(sha256Fingerprints);

  // Poseidon path: hash each promise → Merkle root
  const poseidonRoot = poseidonMerkleRoot(promises);

  return {
    sha256: sha256Network,
    poseidonRoot: poseidonRoot.toString(16).padStart(64, "0"),
    promiseCount: promises.length,
    computedAt: new Date().toISOString(),
  };
}
