"use client";

/**
 * JoinTeamFlow — accepts an invite link and adds the user to a team.
 *
 * The invite token is parsed from the URL or entered manually.
 * On join, the user receives all current team promises as personal slots.
 */

import { useState } from "react";

interface JoinTeamFlowProps {
  /** Pre-filled token from URL param (e.g. /join/abc123) */
  inviteToken?: string;
  onJoin: (token: string) => Promise<{ teamName: string } | null>;
  onCancel: () => void;
}

export function JoinTeamFlow({ inviteToken = "", onJoin, onCancel }: JoinTeamFlowProps) {
  const [token, setToken] = useState(inviteToken);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    if (!token.trim()) return;
    setJoining(true);
    setError(null);

    const result = await onJoin(token.trim());
    setJoining(false);

    if (result) {
      setJoined(result.teamName);
    } else {
      setError("Invite link not found or expired. Check the link and try again.");
    }
  }

  if (joined) {
    return (
      <div className="space-y-4 text-center py-4">
        <p className="text-4xl" aria-hidden="true">🌿</p>
        <h2 className="font-serif text-xl font-bold text-gray-900">
          You joined {joined}
        </h2>
        <p className="text-sm text-gray-500">
          Team promises are now visible in your Team garden. Your personal
          plans remain private.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-xl font-bold text-gray-900">
          Join a team
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Enter the invite link or token your team lead shared with you.
        </p>
      </div>

      <div>
        <label htmlFor="invite-token" className="block text-sm font-medium text-gray-700 mb-1">
          Invite link or token
        </label>
        <input
          id="invite-token"
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="promise.pleco.dev/join/abc123 or just abc123"
          className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleJoin}
          disabled={!token.trim() || joining}
          className="flex-1 py-3 bg-green-700 text-white rounded-xl font-medium text-sm hover:bg-green-800 transition-colors disabled:opacity-50"
        >
          {joining ? "Joining..." : "Join team"}
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
