"use client";

/**
 * CreateTeamFlow — guides the user through creating a new team.
 *
 * Steps:
 *   1. Name the team
 *   2. Payment gate (bypassed when BILLING_ENABLED=false)
 *   3. Team created — invite link generated
 *
 * The flow is intentionally minimal. Teams require auth to be meaningful;
 * without real Supabase, this creates a local stub for UI development.
 */

import { useState } from "react";
import { BILLING_ENABLED, TEAM_PRICE_PER_USER_MONTH } from "@/lib/constants/billing";
import type { CreateTeamInput } from "@/lib/garden/teamSync";

interface CreateTeamFlowProps {
  currentUser: { id: string; name: string; email: string };
  onCreateTeam: (input: CreateTeamInput) => Promise<unknown>;
  onCancel: () => void;
}

export function CreateTeamFlow({ currentUser, onCreateTeam, onCancel }: CreateTeamFlowProps) {
  const [teamName, setTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [inviteLink] = useState(() => `https://promise.pleco.dev/join/${Math.random().toString(36).slice(2, 10)}`);

  async function handleCreate() {
    if (!teamName.trim()) return;
    setCreating(true);

    await onCreateTeam({ name: teamName.trim(), currentUser });

    setCreating(false);
    setCreated(true);
  }

  if (created) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl" aria-hidden="true">🎉</span>
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">
              {teamName} created
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Share this link to invite team members.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Invite link
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white border rounded px-3 py-2 text-gray-700 truncate">
              {inviteLink}
            </code>
            <button
              onClick={() => navigator.clipboard?.writeText(inviteLink)}
              className="text-xs text-green-700 font-medium hover:text-green-900 px-3 py-2 bg-white border rounded whitespace-nowrap"
            >
              Copy
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Team members who join will be able to see shared team promises. Their
          personal sub-promises remain private.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-xl font-bold text-gray-900">
          Create a team
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Share a garden with your team. Promises are visible together; personal
          plans stay private.
        </p>
      </div>

      {/* Team name */}
      <div>
        <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-1">
          Team name
        </label>
        <input
          id="team-name"
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="e.g. Product team, Accountability group"
          className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
      </div>

      {/* Pricing notice */}
      {BILLING_ENABLED ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-900">
            Teams require a subscription
          </p>
          <p className="text-xs text-amber-700 mt-1">
            ${TEAM_PRICE_PER_USER_MONTH}/user/month · Billed monthly · Cancel anytime
          </p>
          <p className="text-xs text-amber-600 mt-1">
            You will be taken to Stripe Checkout to complete setup.
          </p>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-700">
            Teams are free during this preview period.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleCreate}
          disabled={!teamName.trim() || creating}
          className="flex-1 py-3 bg-green-700 text-white rounded-xl font-medium text-sm hover:bg-green-800 transition-colors disabled:opacity-50"
        >
          {creating ? "Creating..." : BILLING_ENABLED ? "Continue to payment" : "Create team"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-3 text-gray-500 rounded-xl text-sm hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
