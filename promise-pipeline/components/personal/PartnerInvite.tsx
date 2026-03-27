"use client";

/**
 * PartnerInvite — Invitation acceptance flow.
 *
 * Shown when a user receives an invite:
 * "[Name] wants you to tend a plant in your garden"
 */

import { useCallback } from "react";
import type { PartnerInvite as PartnerInviteType } from "@/lib/types/garden-phase2";

interface PartnerInviteProps {
  invite: PartnerInviteType;
  fromName: string;
  domain: string;
  onAccept: (inviteId: string) => void;
  onDecline: (inviteId: string) => void;
}

export function PartnerInvite({
  invite,
  fromName,
  domain,
  onAccept,
  onDecline,
}: PartnerInviteProps) {
  const handleAccept = useCallback(() => {
    onAccept(invite.id);
  }, [invite.id, onAccept]);

  const handleDecline = useCallback(() => {
    onDecline(invite.id);
  }, [invite.id, onDecline]);

  return (
    <div
      className="bg-white rounded-xl border border-green-200 p-5 max-w-sm mx-auto shadow-sm"
      role="dialog"
      aria-label={`Accountability partner invitation from ${fromName}`}
    >
      {/* Garden illustration */}
      <div className="flex justify-center mb-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ background: "linear-gradient(135deg, #d8f3dc, #95d5b2)" }}
          aria-hidden="true"
        >
          🌱
        </div>
      </div>

      <h3 className="text-center font-serif text-lg font-semibold text-gray-900 mb-1">
        Garden Invitation
      </h3>
      <p className="text-center text-sm text-gray-600 mb-4">
        <strong>{fromName}</strong> wants you to tend a plant in your garden.
      </p>

      <div className="bg-green-50 rounded-lg p-3 mb-4 text-center">
        <span className="text-xs font-medium text-green-800 uppercase tracking-wider">
          {domain} Garden
        </span>
        <p className="text-xs text-green-600 mt-1">
          You&rsquo;ll see their plant grow or wilt based on their progress.
          You can water it to confirm check-ins and send encouragement.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDecline}
          className="flex-1 py-2.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          className="flex-1 py-2.5 text-sm text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors font-medium"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
