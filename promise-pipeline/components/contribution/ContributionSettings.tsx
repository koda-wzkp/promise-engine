"use client";

import type { ContributionState, ContributionLevel } from "@/lib/types/phase3";

interface ContributionSettingsProps {
  contribution: ContributionState;
  onUpgrade: (level: ContributionLevel) => void;
  onDisable: () => void;
  onClose: () => void;
}

export function ContributionSettings({
  contribution,
  onUpgrade,
  onDisable,
  onClose,
}: ContributionSettingsProps) {
  const canUpgradeToA =
    contribution.level === "C" &&
    contribution.enabledAt &&
    monthsSince(contribution.enabledAt) >= 3;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
        role="dialog"
        aria-label="Contribution settings"
      >
        <h2 className="font-serif text-lg font-semibold mb-4">Contribution Settings</h2>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">
                Level {contribution.level}
              </span>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
            <p className="text-xs text-gray-500">
              {contribution.level === "C"
                ? "Monthly aggregate summaries"
                : "Batched transition records"}
            </p>
            {contribution.lastSentAt && (
              <p className="text-xs text-gray-400 mt-1">
                Last sent: {new Date(contribution.lastSentAt).toLocaleDateString()}
              </p>
            )}
            <p className="text-xs text-gray-400">
              Total batches: {contribution.batchesSent}
            </p>
          </div>

          {canUpgradeToA && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Level A Unlocked
              </p>
              <p className="text-xs text-blue-700 mb-2">
                You&apos;ve contributed for 3+ months. Upgrade to Level A for
                richer predictions and percentile benchmarks.
              </p>
              <button
                onClick={() => onUpgrade("A")}
                className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Upgrade to Level A
              </button>
            </div>
          )}

          <div className="pt-2 border-t">
            <h3 className="text-xs font-medium text-gray-700 mb-1">Data we send:</h3>
            {contribution.level === "C" ? (
              <ul className="text-xs text-gray-500 space-y-0.5">
                <li>- Promise count (total, not individual)</li>
                <li>- K-distribution (nesting depth histogram)</li>
                <li>- Fulfillment rate (single number)</li>
                <li>- Mean dwell time (single number)</li>
                <li>- Verification method mix (counts)</li>
                <li>- Domain mix (counts)</li>
              </ul>
            ) : (
              <ul className="text-xs text-gray-500 space-y-0.5">
                <li>- Domain (category only)</li>
                <li>- Verification method</li>
                <li>- Dwell time in days</li>
                <li>- Status transition (e.g., declared→verified)</li>
                <li>- K-regime (leaf/branch/root)</li>
              </ul>
            )}
            <p className="text-xs text-gray-400 mt-2">
              No promise text. No names. No dates. No user IDs.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
          >
            Done
          </button>
          <button
            onClick={onDisable}
            className="px-4 py-2 border text-sm rounded-lg text-red-600 hover:bg-red-50"
          >
            Stop Contributing
          </button>
        </div>
      </div>
    </div>
  );
}

function monthsSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return (
    (now.getFullYear() - then.getFullYear()) * 12 +
    (now.getMonth() - then.getMonth())
  );
}
