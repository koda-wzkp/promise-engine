"use client";

import type { GardenPromise } from "@/lib/types/garden";
import type { Artifact } from "@/lib/types/phase3";

interface GiftButtonProps {
  promise: GardenPromise;
  artifacts: Artifact[];
  onMint: (promiseId: string) => void;
  onGift: (artifactId: string) => void;
}

/**
 * Button to mint an artifact from a verified promise, or gift an existing one.
 * Only shows for verified promises.
 */
export function GiftButton({ promise, artifacts, onMint, onGift }: GiftButtonProps) {
  if (promise.status !== "verified") return null;

  const artifact = artifacts.find((a) => a.generatedFrom.promiseId === promise.id);

  if (!artifact) {
    return (
      <button
        onClick={() => onMint(promise.id)}
        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors"
        aria-label="Mint artifact from this promise"
      >
        <span className="text-sm">&#9830;</span>
        Mint
      </button>
    );
  }

  if (artifact.gifted) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-gray-50 border text-gray-400">
        <span className="text-sm">&#9830;</span>
        Gifted
      </span>
    );
  }

  return (
    <button
      onClick={() => onGift(artifact.id)}
      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100 transition-colors"
      aria-label="Gift this artifact"
    >
      <span className="text-sm">&#9830;</span>
      Gift
    </button>
  );
}
