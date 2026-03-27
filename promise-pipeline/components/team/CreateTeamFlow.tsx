"use client";

import { useState } from "react";

interface CreateTeamFlowProps {
  onCreate: (name: string) => void;
  onClose: () => void;
}

export function CreateTeamFlow({ onCreate, onClose }: CreateTeamFlowProps) {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
        role="dialog"
        aria-label="Create a team"
      >
        <h2 className="font-serif text-lg font-semibold mb-4">Create a Team</h2>
        <p className="text-sm text-gray-500 mb-4">
          Start a team garden where members can share commitments.
          Team promises flow down to personal gardens, but personal
          sub-promises and details stay private.
        </p>

        <div>
          <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-1">
            Team Name
          </label>
          <input
            id="team-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="e.g., Design Team, Q2 Sprint"
          />
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={() => name.trim() && onCreate(name.trim())}
            disabled={!name.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Team
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
