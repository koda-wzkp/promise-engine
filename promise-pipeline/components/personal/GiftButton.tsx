"use client";

/**
 * GiftButton — appears on kept-promise artifacts when:
 *   - The promise had an accepted accountability partner, OR
 *   - The promisee was not "self"
 *
 * Opens GiftOptions to let the user choose what to include.
 * The gift is a COPY — the original stays in the giver's Collection.
 */

import { useState } from "react";
import type { GardenPromise } from "@/lib/types/personal";
import type { GardenAction } from "@/lib/garden/gardenState";
import { GiftOptions } from "./GiftOptions";
import { supabase } from "@/lib/supabase";
import type { GiftRecord } from "@/lib/types/gift";

interface GiftButtonProps {
  promise: GardenPromise;
  dispatch: React.Dispatch<GardenAction>;
  /** Current user ID — stubbed until real auth is wired */
  currentUserId?: string;
}

export function GiftButton({ promise, dispatch, currentUserId = "local-user" }: GiftButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const { artifact, partner } = promise;

  // Only show if artifact exists, is giftable, and hasn't been gifted yet
  if (!artifact || !artifact.giftable || artifact.giftedTo !== null) return null;
  if (!partner || partner.inviteStatus !== "accepted") return null;

  async function handleGift(includeBody: boolean) {
    if (!artifact || !partner) return;
    setSending(true);

    const gift: GiftRecord = {
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      artifact_id: artifact.id,
      from_user: currentUserId,
      to_user: partner.partnerId,
      promise_domain: artifact.generatedFrom.domain,
      include_body: includeBody,
      promise_body: includeBody ? promise.body : null,
      gifted_at: new Date().toISOString(),
    };

    // Store to Supabase (no-op on stub)
    await supabase.from("gifts").insert(gift);

    // Mark artifact as gifted locally
    dispatch({
      type: "GIFT_ARTIFACT",
      promiseId: promise.id,
      toUserId: partner.partnerId,
      options: { includeBody },
    });

    setSending(false);
    setSent(true);
    setShowOptions(false);
  }

  if (sent) {
    return (
      <span className="text-xs text-green-700 font-medium">
        Gifted to {partner.partnerName}
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowOptions(true)}
        disabled={sending}
        className="text-xs text-purple-700 font-medium hover:text-purple-900 transition-colors disabled:opacity-50"
        aria-label={`Gift this artifact to ${partner.partnerName}`}
      >
        {sending ? "Sending..." : `Gift to ${partner.partnerName}`}
      </button>

      {showOptions && (
        <GiftOptions
          partnerName={partner.partnerName}
          onConfirm={handleGift}
          onCancel={() => setShowOptions(false)}
        />
      )}
    </>
  );
}
