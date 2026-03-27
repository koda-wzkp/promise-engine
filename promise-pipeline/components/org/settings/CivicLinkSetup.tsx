"use client";

import { useState } from "react";
import type { ExternalDependency } from "@/lib/types/phase4";
import type { PromiseStatus } from "@/lib/types/promise";

interface CivicLinkSetupProps {
  promiseId: string;
  promiseBody: string;
  existingDeps: ExternalDependency[];
  onAddDep: (promiseId: string, dep: ExternalDependency) => void;
  onRemoveDep: (promiseId: string, depLabel: string) => void;
  onClose: () => void;
}

const AVAILABLE_DASHBOARDS = [
  { id: "hb2021", name: "Oregon HB 2021 — Clean Energy" },
  { id: "gresham", name: "Gresham Climate Action Plan" },
];

export function CivicLinkSetup({
  promiseId,
  promiseBody,
  existingDeps,
  onAddDep,
  onRemoveDep,
  onClose,
}: CivicLinkSetupProps) {
  const [depType, setDepType] = useState<ExternalDependency["type"]>("civic");
  const [dashboard, setDashboard] = useState("gresham");
  const [civicPromiseId, setCivicPromiseId] = useState("");
  const [label, setLabel] = useState("");

  const handleAdd = () => {
    if (!label.trim()) return;
    const dep: ExternalDependency = {
      type: depType,
      label: label.trim(),
      civicPromiseId: civicPromiseId.trim() || undefined,
      civicDashboard: depType === "civic" ? dashboard : undefined,
      status: "declared" as PromiseStatus,
    };
    onAddDep(promiseId, dep);
    setLabel("");
    setCivicPromiseId("");
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6"
        role="dialog"
        aria-label="Link civic dependency"
      >
        <h2 className="font-serif text-lg font-semibold mb-2">External Dependencies</h2>
        <p className="text-sm text-gray-500 mb-1">
          Link &ldquo;{promiseBody.slice(0, 60)}&rdquo; to external civic or regulatory promises.
        </p>
        <p className="text-xs text-gray-400 mb-5">
          When civic promise status changes, it cascades through your org network.
        </p>

        {/* Existing dependencies */}
        {existingDeps.length > 0 && (
          <div className="mb-4 space-y-1.5">
            <h3 className="text-xs font-medium text-gray-600">Current Links</h3>
            {existingDeps.map((dep, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700">{dep.label}</p>
                  <p className="text-[10px] text-gray-400">
                    {dep.type} · {dep.status}
                    {dep.civicDashboard && ` · ${dep.civicDashboard}`}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveDep(promiseId, dep.label)}
                  className="text-[10px] text-red-500 hover:text-red-700 ml-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new dependency */}
        <div className="space-y-3 bg-gray-50 rounded-lg p-3">
          <h3 className="text-xs font-medium text-gray-600">Add Link</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="dep-type" className="block text-xs text-gray-500 mb-1">Type</label>
              <select
                id="dep-type"
                value={depType}
                onChange={(e) => setDepType(e.target.value as ExternalDependency["type"])}
                className="w-full border rounded-lg px-2 py-1.5 text-sm bg-white"
              >
                <option value="civic">Civic</option>
                <option value="regulatory">Regulatory</option>
                <option value="vendor">Vendor</option>
                <option value="partner">Partner</option>
              </select>
            </div>

            {depType === "civic" && (
              <div>
                <label htmlFor="dep-dashboard" className="block text-xs text-gray-500 mb-1">Dashboard</label>
                <select
                  id="dep-dashboard"
                  value={dashboard}
                  onChange={(e) => setDashboard(e.target.value)}
                  className="w-full border rounded-lg px-2 py-1.5 text-sm bg-white"
                >
                  {AVAILABLE_DASHBOARDS.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="dep-label" className="block text-xs text-gray-500 mb-1">Label</label>
            <input
              id="dep-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-sm"
              placeholder="e.g., Gresham CAP UFT-04: EV charging infrastructure"
            />
          </div>

          {depType === "civic" && (
            <div>
              <label htmlFor="dep-civic-id" className="block text-xs text-gray-500 mb-1">
                Civic Promise ID (for auto-sync)
              </label>
              <input
                id="dep-civic-id"
                type="text"
                value={civicPromiseId}
                onChange={(e) => setCivicPromiseId(e.target.value)}
                className="w-full border rounded-lg px-2 py-1.5 text-sm"
                placeholder="e.g., GRE-UFT-04 or P001"
              />
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!label.trim()}
            className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Add Link
          </button>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
