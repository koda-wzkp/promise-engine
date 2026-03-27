"use client";

import { useState } from "react";

interface CreateOrgFlowProps {
  existingTeams: { id: string; name: string }[];
  onCreate: (name: string, teamIds: string[]) => void;
  onClose: () => void;
}

export function CreateOrgFlow({ existingTeams, onCreate, onClose }: CreateOrgFlowProps) {
  const [name, setName] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const toggleTeam = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((t) => t !== teamId) : [...prev, teamId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
        role="dialog"
        aria-label="Create an organization"
      >
        <h2 className="font-serif text-lg font-semibold mb-2">Create Organization</h2>
        <p className="text-sm text-gray-500 mb-5">
          An org connects multiple teams. Org-level promises span teams and can link
          to external civic dependencies.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
            <input
              id="org-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="e.g., Acme Corp, Portland Climate Coalition"
            />
          </div>

          {existingTeams.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Teams
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto border rounded-lg p-2">
                {existingTeams.map((team) => (
                  <label key={team.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(team.id)}
                      onChange={() => toggleTeam(team.id)}
                    />
                    {team.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={() => name.trim() && onCreate(name.trim(), selectedTeams)}
            disabled={!name.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Create Organization
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
