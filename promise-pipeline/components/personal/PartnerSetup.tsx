"use client";

/**
 * PartnerSetup — Phase 2 Add Accountability Partner Flow
 *
 * "Add an accountability partner" on any promise.
 * Enter partner's email or username.
 * Partner receives invite; partner accepts → shared plant appears in their garden.
 *
 * Privacy controls per promise:
 *   showBody: partner sees the promise text (default: false)
 *   showSubPromises: partner sees children/roots (default: false)
 * Default: partner sees domain + status only (via plant health).
 */

import { useState, useCallback } from "react";
import type { PartnerVisibility, GardenPromise } from "@/lib/types/garden";

interface PartnerSetupProps {
  promise: GardenPromise;
  /** Whether the user has authenticated (required for partner features) */
  isAuthenticated: boolean;
  onSetPartner: (partnerId: string, visibility: PartnerVisibility) => void;
  onRemovePartner: () => void;
  onRequestAuth: () => void;
  onClose: () => void;
}

export function PartnerSetup({
  promise,
  isAuthenticated,
  onSetPartner,
  onRemovePartner,
  onRequestAuth,
  onClose,
}: PartnerSetupProps) {
  const [email, setEmail] = useState("");
  const [showBody, setShowBody] = useState(false);
  const [showSubPromises, setShowSubPromises] = useState(false);
  const [sent, setSent] = useState(false);

  const hasPartner = !!promise.partner;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;

      const partnerId = email.trim().toLowerCase();
      onSetPartner(partnerId, { showBody, showSubPromises });
      setSent(true);
    },
    [email, showBody, showSubPromises, onSetPartner]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Accountability partner"
        className="relative z-10 bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <h2 className="font-serif text-lg font-semibold text-gray-900">
              Accountability Partner
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Auth gate */}
          {!isAuthenticated && (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-gray-600">
                Accountability partners require an account so your partner
                can see your plant in their garden.
              </p>
              <button
                onClick={onRequestAuth}
                className="px-4 py-2 bg-[#1a5f4a] text-white rounded-lg text-sm font-medium hover:bg-[#155240]"
              >
                Create account
              </button>
              <p className="text-xs text-gray-400">
                Your promise data stays local. The account only enables
                the partner connection.
              </p>
            </div>
          )}

          {/* Current partner */}
          {isAuthenticated && hasPartner && promise.partner && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800">
                      {promise.partner.partnerName ?? promise.partner.partnerId}
                    </p>
                    <p className="text-xs text-purple-600">
                      {promise.partner.accepted ? "Connected" : "Invite pending"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-purple-500">
                    {promise.partner.visibility.showBody && "Sees promise text"}
                    {promise.partner.visibility.showBody && promise.partner.visibility.showSubPromises && " + "}
                    {promise.partner.visibility.showSubPromises && "Sees sub-promises"}
                    {!promise.partner.visibility.showBody && !promise.partner.visibility.showSubPromises && "Sees domain + status only"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onRemovePartner();
                  onClose();
                }}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                Remove partner
              </button>
            </div>
          )}

          {/* Invite form */}
          {isAuthenticated && !hasPartner && !sent && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600">
                Invite someone to tend a plant in their garden that reflects
                your promise health.
              </p>

              <div>
                <label
                  htmlFor="partner-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Partner&apos;s email
                </label>
                <input
                  id="partner-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  required
                />
              </div>

              {/* Privacy controls */}
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-gray-700">
                  What can your partner see?
                </legend>
                <p className="text-xs text-gray-400 mb-2">
                  By default, your partner only sees which domain the promise is in
                  and whether the plant is healthy.
                </p>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBody}
                    onChange={(e) => setShowBody(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Show promise text
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSubPromises}
                    onChange={(e) => setShowSubPromises(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Show sub-promises (root system)
                  </span>
                </label>
              </fieldset>

              <button
                type="submit"
                disabled={!email.trim()}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  email.trim()
                    ? "bg-[#1a5f4a] text-white hover:bg-[#155240]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Send invite
              </button>
            </form>
          )}

          {/* Sent confirmation */}
          {isAuthenticated && sent && (
            <div className="text-center py-4 space-y-2">
              <p className="text-2xl">🌱</p>
              <p className="text-sm font-medium text-gray-800">Invite sent!</p>
              <p className="text-xs text-gray-500">
                When {email} accepts, a shared plant will appear in their garden.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
