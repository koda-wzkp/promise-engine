"use client";

import { useState } from "react";

interface JoinTeamFlowProps {
  onJoin: (teamId: string, name: string, role: string) => void;
  onClose: () => void;
}

export function JoinTeamFlow({ onJoin, onClose }: JoinTeamFlowProps) {
  const [teamId, setTeamId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const canSubmit = teamId.trim() && name.trim();

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
        role="dialog"
        aria-label="Join a team"
      >
        <h2 className="font-serif text-lg font-semibold mb-4">Join a Team</h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter the team ID shared by your team lead. Your personal promises stay private —
          only team promise status is shared.
        </p>

        <div className="space-y-3">
          <div>
            <label htmlFor="join-team-id" className="block text-sm font-medium text-gray-700 mb-1">
              Team ID
            </label>
            <input
              id="join-team-id"
              type="text"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g., team-abc123"
            />
          </div>

          <div>
            <label htmlFor="join-name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Display Name
            </label>
            <input
              id="join-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="How the team sees you"
            />
          </div>

          <div>
            <label htmlFor="join-role" className="block text-sm font-medium text-gray-700 mb-1">
              Role (optional)
            </label>
            <input
              id="join-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g., Designer, Engineer"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={() => canSubmit && onJoin(teamId.trim(), name.trim(), role.trim())}
            disabled={!canSubmit}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Team
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
