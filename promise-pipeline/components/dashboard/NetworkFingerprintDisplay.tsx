"use client";

import { useMemo } from "react";
import type { Promise as PPPromise, Agent, NetworkFingerprint } from "@/lib/types/promise";
import { computeNetworkFingerprints } from "@/lib/encoding/computeFingerprints";

interface NetworkFingerprintDisplayProps {
  promises: PPPromise[];
  agents: Agent[];
}

export function NetworkFingerprintDisplay({
  promises,
  agents,
}: NetworkFingerprintDisplayProps) {
  const fingerprint: NetworkFingerprint = useMemo(
    () => computeNetworkFingerprints(promises, agents),
    [promises, agents],
  );

  return (
    <details className="mt-4 text-xs font-mono text-gray-500">
      <summary className="cursor-pointer hover:text-gray-700">
        Network fingerprint
      </summary>
      <div className="mt-2 space-y-1 bg-violet-50 p-3 rounded">
        <p className="break-all">SHA-256: {fingerprint.sha256}</p>
        <p className="break-all">Poseidon: {fingerprint.poseidonRoot}</p>
        <p>
          {fingerprint.promiseCount} promises
        </p>
      </div>
    </details>
  );
}
