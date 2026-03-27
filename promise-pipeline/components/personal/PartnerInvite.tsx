"use client";

/**
 * PartnerInvite — Phase 2 Invitation Acceptance Flow
 *
 * Shown when someone invites you to be their accountability partner.
 * "[Name] wants you to tend a plant in your garden"
 * Accept → shared plant appears in your garden.
 */

import { useCallback } from "react";
import type { PersonalDomain } from "@/lib/types/personal";
import type { PartnerVisibility } from "@/lib/types/garden";

interface PartnerInviteProps {
  inviterName: string;
  domain: PersonalDomain;
  /** What you'll be able to see */
  visibility: PartnerVisibility;
  onAccept: () => void;
  onDecline: () => void;
}

const DOMAIN_EMOJI: Record<PersonalDomain, string> = {
  health: "🍎",
  work: "🌳",
  relationships: "🌸",
  creative: "🌿",
  financial: "🌲",
};

const DOMAIN_LABELS: Record<PersonalDomain, string> = {
  health: "Health",
  work: "Work",
  relationships: "Relationships",
  creative: "Creative",
  financial: "Financial",
};

export function PartnerInvite({
  inviterName,
  domain,
  visibility,
  onAccept,
  onDecline,
}: PartnerInviteProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onDecline}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Partner invitation"
        className="relative z-10 bg-white rounded-xl w-full max-w-sm shadow-lg"
      >
        <div className="p-6 text-center space-y-4">
          {/* Plant icon */}
          <div className="text-4xl">{DOMAIN_EMOJI[domain]}</div>

          <div>
            <h2 className="font-serif text-lg font-semibold text-gray-900">
              {inviterName} wants you to tend a plant
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              A {DOMAIN_LABELS[domain].toLowerCase()} plant will appear in
              a shared section of your garden.
            </p>
          </div>

          {/* What you'll see */}
          <div className="text-left bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
            <p className="font-medium text-gray-700">You&apos;ll be able to see:</p>
            <ul className="list-disc list-inside">
              <li>Plant health (domain + status)</li>
              {visibility.showBody && <li>Promise text</li>}
              {visibility.showSubPromises && <li>Sub-promises (root system)</li>}
            </ul>
            <p className="font-medium text-gray-700 mt-2">You can:</p>
            <ul className="list-disc list-inside">
              <li>Water the plant (confirm check-in)</li>
              <li>Send encouragement</li>
              <li>Get notified if the plant starts wilting</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Decline
            </button>
            <button
              onClick={onAccept}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-[#1a5f4a] text-white hover:bg-[#155240]"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
