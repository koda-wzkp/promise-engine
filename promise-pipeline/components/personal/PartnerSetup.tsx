"use client";

/**
 * PartnerSetup — Add accountability partner flow.
 *
 * Enter partner's email/username, configure privacy controls,
 * and send an invitation. Auth is required for this feature.
 */

import { useState, useCallback } from "react";
import type { PartnerVisibility, GardenPromise } from "@/lib/types/garden-phase2";

interface PartnerSetupProps {
  promise: GardenPromise;
  onSetPartner: (
    promiseId: string,
    partnerEmail: string,
    visibility: PartnerVisibility
  ) => void;
  onCancel: () => void;
  /** Whether the current user is authenticated */
  isAuthenticated: boolean;
  /** Callback to trigger auth flow */
  onRequestAuth: () => void;
}

export function PartnerSetup({
  promise,
  onSetPartner,
  onCancel,
  isAuthenticated,
  onRequestAuth,
}: PartnerSetupProps) {
  const [email, setEmail] = useState("");
  const [visibility, setVisibility] = useState<PartnerVisibility>({
    showBody: false,
    showSubPromises: false,
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;

      if (!isAuthenticated) {
        onRequestAuth();
        return;
      }

      onSetPartner(promise.id, email.trim(), visibility);
    },
    [email, promise.id, visibility, isAuthenticated, onRequestAuth, onSetPartner]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border p-5 max-w-md mx-auto"
    >
      <h3 className="font-serif text-lg font-semibold text-gray-900 mb-1">
        Add Accountability Partner
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Invite someone to help tend your &ldquo;{promise.body}&rdquo; plant.
        They&rsquo;ll see it grow or wilt based on your progress.
      </p>

      {!isAuthenticated && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-amber-800">
            Accountability partners require an account. You&rsquo;ll be prompted
            to sign in when you send the invite.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="partner-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Partner&rsquo;s email
          </label>
          <input
            id="partner-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600 focus:border-transparent"
            placeholder="partner@example.com"
            required
          />
        </div>

        {/* Privacy controls */}
        <fieldset className="border rounded-lg p-3">
          <legend className="text-xs font-semibold text-gray-500 uppercase px-1">
            What can your partner see?
          </legend>
          <p className="text-xs text-gray-400 mb-3">
            By default, your partner only sees the domain and plant health.
          </p>

          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibility.showBody}
              onChange={(e) =>
                setVisibility((v) => ({ ...v, showBody: e.target.checked }))
              }
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              Show promise text
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibility.showSubPromises}
              onChange={(e) =>
                setVisibility((v) => ({
                  ...v,
                  showSubPromises: e.target.checked,
                }))
              }
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              Show sub-promises (roots)
            </span>
          </label>
        </fieldset>
      </div>

      <div className="flex gap-2 mt-5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-2 text-sm text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors font-medium"
        >
          Send Invite
        </button>
      </div>
    </form>
  );
}
