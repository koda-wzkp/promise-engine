/**
 * Scoped ID utilities for cross-network promise references.
 *
 * Format: <network-id>:<promise-id>
 *
 * Within a network, promises reference each other by short ID.
 * Cross-network references use the full scoped ID.
 *
 * For v2, cross-network references are stored but not resolved at runtime.
 */

export function createScopedId(networkId: string, promiseId: string): string {
  return `${networkId}:${promiseId}`;
}

export function parseScopedId(scopedId: string): { networkId: string; promiseId: string } | null {
  const colonIndex = scopedId.indexOf(":");
  if (colonIndex === -1) return null;
  return {
    networkId: scopedId.slice(0, colonIndex),
    promiseId: scopedId.slice(colonIndex + 1),
  };
}

export function isScopedId(id: string): boolean {
  return id.includes(":");
}

export function getLocalId(scopedOrLocalId: string): string {
  const parsed = parseScopedId(scopedOrLocalId);
  return parsed ? parsed.promiseId : scopedOrLocalId;
}

export function getNetworkId(scopedId: string): string | null {
  const parsed = parseScopedId(scopedId);
  return parsed ? parsed.networkId : null;
}

/**
 * Validate a scoped ID format.
 * Returns true if the ID follows the net-<id>:<prefix>-<id> pattern.
 */
export function isValidScopedId(id: string): boolean {
  const parsed = parseScopedId(id);
  if (!parsed) return false;
  return parsed.networkId.startsWith("net-") && parsed.promiseId.length > 0;
}
