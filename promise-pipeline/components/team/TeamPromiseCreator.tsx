"use client";

/**
 * TeamPromiseCreator — create a team promise and assign it to a member.
 *
 * When submitted:
 * 1. Promise is added to the team (via Supabase)
 * 2. A personal sub-promise slot is auto-created in the assignee's garden
 *    via the TEAM_PROMISE_RECEIVED action
 */

import { useState } from "react";
import type { GardenTeamMember, GardenTeamPromise } from "@/lib/types/gardenTeam";
import type { GardenAction } from "@/lib/garden/gardenState";
import type { AddTeamPromiseInput } from "@/lib/garden/teamSync";

const DOMAINS = ["work"];
const PRIORITIES = ["critical", "high", "normal", "low"] as const;

interface TeamPromiseCreatorProps {
  members: GardenTeamMember[];
  currentUserId: string;
  onAdd: (input: AddTeamPromiseInput) => Promise<GardenTeamPromise | null>;
  dispatch: React.Dispatch<GardenAction>;
  onClose: () => void;
}

export function TeamPromiseCreator({
  members,
  currentUserId,
  onAdd,
  dispatch,
  onClose,
}: TeamPromiseCreatorProps) {
  const [body, setBody] = useState("");
  const [domain, setDomain] = useState("work");
  const [assigneeId, setAssigneeId] = useState(currentUserId);
  const [priority, setPriority] = useState<"critical" | "high" | "normal" | "low">("normal");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!body.trim() || !assigneeId) return;
    setSubmitting(true);

    const result = await onAdd({
      body: body.trim(),
      domain,
      assigneeId,
      priority,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
    });

    if (result) {
      // Auto-create personal slot for the assignee
      // (In real app, this would be dispatched on the assignee's device via Supabase Realtime)
      // For now, if the current user is the assignee, create the slot locally
      if (assigneeId === currentUserId) {
        dispatch({ type: "TEAM_PROMISE_RECEIVED", teamPromise: result });
      }
    }

    setSubmitting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h2 className="font-serif text-lg font-bold text-gray-900">
            New team promise
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Promise
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What does the team commit to?"
            rows={2}
            className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {/* Domain + Priority row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Domain
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d} className="capitalize">
                  {d[0].toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p} className="capitalize">
                  {p[0].toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned to
          </label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}{m.id === currentUserId ? " (you)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Estimated hours (optional) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Estimated hours (optional)
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            placeholder="e.g. 8"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <p className="text-xs text-gray-400">
          The assignee will receive this promise as a personal slot in their garden.
          Their sub-promises and plans stay private.
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={!body.trim() || !assigneeId || submitting}
            className="flex-1 py-3 bg-green-700 text-white rounded-xl font-medium text-sm hover:bg-green-800 transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create promise"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 text-gray-500 rounded-xl text-sm hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
