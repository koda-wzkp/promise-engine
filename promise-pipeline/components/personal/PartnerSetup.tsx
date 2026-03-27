"use client";

import { useState } from "react";
import type { GardenPromise, AccountabilityPartner, PartnerVisibility } from "@/lib/types/personal";

interface PartnerSetupProps {
  promise: GardenPromise;
  onSave: (promiseId: string, partner: AccountabilityPartner) => void;
  onRemove: (promiseId: string) => void;
  onClose: () => void;
}

export function PartnerSetup({ promise, onSave, onRemove, onClose }: PartnerSetupProps) {
  const existing = promise.partner;

  const [email, setEmail] = useState(existing?.partnerEmail ?? "");
  const [name, setName] = useState(existing?.partnerName ?? "");
  const [visibility, setVisibility] = useState<PartnerVisibility>(
    existing?.visibility ?? { showBody: false, showSubPromises: false }
  );
  const [inviteSent, setInviteSent] = useState(false);

  function handleSend() {
    if (!email.trim()) return;

    const partner: AccountabilityPartner = {
      partnerId: existing?.partnerId ?? crypto.randomUUID(),
      partnerEmail: email.trim(),
      partnerName: name.trim() || email.trim().split("@")[0],
      inviteStatus: "pending",
      inviteToken: existing?.inviteToken ?? crypto.randomUUID().replace(/-/g, "").slice(0, 16),
      visibility,
      invitedAt: new Date().toISOString(),
      acceptedAt: null,
    };

    onSave(promise.id, partner);
    setInviteSent(true);
  }

  const inviteUrl = existing?.inviteToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/personal?invite=${existing.inviteToken}`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.3)" }}
      aria-modal="true"
      role="dialog"
      aria-label="Accountability partner settings"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b flex items-center justify-between">
          <h2 className="font-serif font-semibold text-gray-900">Accountability partner</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-gray-400">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {existing && existing.inviteStatus !== "declined" && (
            <div className={`rounded-lg px-3 py-2 text-sm ${existing.inviteStatus === "accepted" ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
              {existing.inviteStatus === "accepted"
                ? `${existing.partnerName} is tending your garden.`
                : `Invite sent to ${existing.partnerEmail} — awaiting response.`}
            </div>
          )}

          {!inviteSent && (
            <>
              <div>
                <label htmlFor="partner-email" className="text-sm font-medium text-gray-700 mb-1 block">
                  Partner&apos;s email
                </label>
                <input
                  id="partner-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <label htmlFor="partner-name" className="text-sm font-medium text-gray-700 mb-1 block">
                  Their name (optional)
                </label>
                <input
                  id="partner-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">What can they see?</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibility.showBody}
                      onChange={(e) => setVisibility((v) => ({ ...v, showBody: e.target.checked }))}
                      className="accent-green-700 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Promise text</span>
                    <span className="text-xs text-gray-400 ml-auto">off = domain + health only</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibility.showSubPromises}
                      onChange={(e) => setVisibility((v) => ({ ...v, showSubPromises: e.target.checked }))}
                      className="accent-green-700 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Sub-promises (roots)</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {inviteSent && inviteUrl && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Send this link to your partner:</p>
              <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-700 break-all font-mono">
                {inviteUrl}
              </div>
              <button
                onClick={() => navigator.clipboard?.writeText(inviteUrl)}
                className="w-full py-2 text-sm text-green-700 border border-green-200 rounded-xl hover:bg-green-50 focus-visible:outline-2 focus-visible:outline-green-600"
              >
                Copy link
              </button>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-2">
          {existing && (
            <button
              onClick={() => { onRemove(promise.id); onClose(); }}
              className="py-2.5 px-4 text-sm text-red-500 border border-red-200 rounded-xl hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-400"
            >
              Remove
            </button>
          )}
          {!inviteSent ? (
            <button
              onClick={handleSend}
              disabled={!email.trim()}
              className="flex-1 py-2.5 text-sm font-semibold bg-green-700 text-white rounded-xl disabled:opacity-40 hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-green-600"
            >
              {existing ? "Update" : "Send invite"}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold bg-green-700 text-white rounded-xl hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-green-600"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
