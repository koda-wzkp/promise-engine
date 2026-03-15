/**
 * Cryptographic verification commitments for Promise Pipeline.
 *
 * When a promise's status is verified, the verification source (a DEQ report URL,
 * a PUC order number, a sensor reading) is cryptographically committed via SHA-256.
 * This transforms the platform from "trust us, we checked" to "here's proof of
 * what we checked and when."
 */

async function sha256(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a SHA-256 hash of verification source content.
 * Uses the Web Crypto API (available in all modern browsers and Node 18+).
 *
 * The hash commits to a specific document at a specific time.
 * Anyone with access to the original document can verify the hash matches.
 * The document itself is not stored — only the commitment.
 */
export async function generateVerificationHash(
  sourceContent: string,
): Promise<{
  hash: string;
  timestamp: string;
}> {
  return {
    hash: await sha256(sourceContent),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Verify a commitment against source content.
 * Returns true if the hash matches.
 */
export async function verifyCommitment(
  sourceContent: string,
  expectedHash: string,
): Promise<boolean> {
  const actualHash = await sha256(sourceContent);
  return actualHash === expectedHash;
}
