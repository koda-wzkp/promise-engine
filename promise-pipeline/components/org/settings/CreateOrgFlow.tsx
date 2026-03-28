"use client";

import { useState } from "react";
import type { Org } from "@/lib/types/org";
import type { CreateOrgInput } from "@/lib/garden/orgSync";
import { BILLING_ENABLED, ORG_PRICE_PER_USER_MONTH } from "@/lib/constants/billing";

/**
 * CreateOrgFlow — create an org, optionally adding an initial team.
 * Org tier: $29/user/month. Bypassed when BILLING_ENABLED = false.
 */
export function CreateOrgFlow({
  currentUser,
  currentTeamId,
  onCreateOrg,
  onCancel,
}: {
  currentUser: { id: string; name: string; email: string };
  currentTeamId?: string;
  onCreateOrg: (input: CreateOrgInput) => Promise<Org | null>;
  onCancel: () => void;
}) {
  const [orgName, setOrgName] = useState("");
  const [includeTeam, setIncludeTeam] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const org = await onCreateOrg({
        name: orgName.trim(),
        currentUser,
        initialTeamId: includeTeam && currentTeamId ? currentTeamId : undefined,
      });

      if (!org) throw new Error("Failed to create org");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create org");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-lg font-bold text-gray-900">Create an org</h3>
        <p className="text-sm text-gray-500 mt-1">
          Connect multiple teams under one org network. Track promises across teams
          and link to civic commitments.
        </p>
      </div>

      {/* Pricing notice */}
      <div className="bg-gray-50 rounded-xl border px-4 py-3 text-sm text-gray-700">
        <div className="flex items-center justify-between">
          <span className="font-medium">Org tier</span>
          <span className="font-bold text-gray-900">
            ${ORG_PRICE_PER_USER_MONTH}/user/month
          </span>
        </div>
        <ul className="mt-2 space-y-0.5 text-xs text-gray-500">
          <li>✓ Everything in Teams</li>
          <li>✓ Cross-team dependency map</li>
          <li>✓ Civic promise linking</li>
          <li>✓ REST API access + webhooks</li>
        </ul>
        {!BILLING_ENABLED && (
          <p className="mt-2 text-xs text-amber-700 font-medium">
            Payment gated — preview mode active.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Org name
          </label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Acme Corp, City of Gresham…"
            className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            autoFocus
            required
          />
        </div>

        {currentTeamId && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeTeam}
              onChange={(e) => setIncludeTeam(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">
              Add my current team to this org
            </span>
          </label>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!orgName.trim() || loading}
            className="flex-1 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating…" : "Create org"}
          </button>
        </div>
      </form>
    </div>
  );
}
