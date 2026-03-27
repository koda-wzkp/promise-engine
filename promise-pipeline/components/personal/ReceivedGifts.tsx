"use client";

/**
 * ReceivedGifts — section in the Collection tab showing artifacts gifted to
 * the current user by their accountability partners.
 */

import type { ReceivedGift } from "@/lib/types/gift";
import { GiftBadge } from "./GiftBadge";
import { artifactColor, artifactDescription } from "@/lib/garden/artifactGeneration";

interface ReceivedGiftsProps {
  gifts: ReceivedGift[];
}

const MATERIAL_EMOJI: Record<string, string> = {
  crystal: "💎",
  bronze:  "🥉",
  amber:   "🍯",
  wood:    "🌿",
  stone:   "🪨",
  smoke:   "🌫️",
};

export function ReceivedGifts({ gifts }: ReceivedGiftsProps) {
  if (gifts.length === 0) return null;

  return (
    <section aria-label="Gifts received">
      <h2 className="font-serif text-lg font-bold text-gray-900 mb-1">
        Gifts received
      </h2>
      <p className="text-xs text-gray-400 mb-3">
        Artifacts gifted to you by accountability partners — tokens of kept
        promises.
      </p>
      <div className="space-y-3">
        {gifts.map((gift) => (
          <ReceivedGiftCard key={gift.id} gift={gift} />
        ))}
      </div>
    </section>
  );
}

function ReceivedGiftCard({ gift }: { gift: ReceivedGift }) {
  // Build a minimal artifact-like object for color/description computation
  const minimalArtifact = {
    id: gift.artifact.id,
    promiseId: "",
    generatedFrom: gift.artifact.generatedFrom,
    visual: gift.artifact.visual,
    giftedTo: null,
    giftable: false,
    createdAt: gift.receivedAt,
  };

  const color = artifactColor(minimalArtifact);
  const desc = artifactDescription(minimalArtifact);
  const matEmoji = MATERIAL_EMOJI[gift.artifact.visual.material] ?? "✦";

  return (
    <div className="rounded-xl border overflow-hidden">
      <div
        className="px-4 py-4 flex items-center gap-3"
        style={{ background: color + "12" }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: color + "22", border: `2px solid ${color}44` }}
          aria-hidden="true"
        >
          {matEmoji}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          {gift.promiseBody && (
            <p className="font-medium text-gray-900 text-sm leading-snug">
              {gift.promiseBody}
            </p>
          )}
          <p className="text-xs text-gray-400">{desc}</p>
          <GiftBadge fromName={gift.fromName} receivedAt={gift.receivedAt} />
        </div>
      </div>

      <div className="px-4 py-2 bg-white border-t">
        <p className="text-xs text-gray-400">
          Domain: {gift.artifact.generatedFrom.domain}
          &nbsp;·&nbsp;
          Regime: {gift.artifact.generatedFrom.kRegime}
          &nbsp;·&nbsp;
          Received {new Date(gift.receivedAt).toLocaleDateString()}
        </p>
        <p className="text-xs text-purple-500 mt-1">
          This artifact is yours to keep. It cannot be re-gifted.
        </p>
      </div>
    </div>
  );
}
