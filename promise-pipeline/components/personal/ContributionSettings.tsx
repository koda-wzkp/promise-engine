"use client";

/**
 * ContributionSettings — shown in the garden settings panel.
 * Lets the user:
 *   - Enable / disable contribution
 *   - Switch between Level C and Level A
 *   - See what data is being sent
 *   - Revoke contribution (plant fossilizes gracefully)
 */

import { useState } from "react";
import type { ContributionState } from "@/lib/types/contribution";
import type { GardenAction } from "@/lib/garden/gardenState";

interface ContributionSettingsProps {
  contribution: ContributionState;
  dispatch: React.Dispatch<GardenAction>;
}

export function ContributionSettings({ contribution, dispatch }: ContributionSettingsProps) {
  const [showLevelADetail, setShowLevelADetail] = useState(false);

  function handleEnable() {
    dispatch({ type: "ENABLE_CONTRIBUTION", level: "C" });
  }

  function handleRevoke() {
    dispatch({ type: "DISABLE_CONTRIBUTION" });
  }

  function handleUpgradeToA() {
    dispatch({ type: "SET_CONTRIBUTION_LEVEL", level: "A" });
    dispatch({ type: "MARK_OPT_UP_PROMPT_SHOWN" });
  }

  function handleDowngradeToC() {
    dispatch({ type: "SET_CONTRIBUTION_LEVEL", level: "C" });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif font-semibold text-gray-900 text-sm">
          Data contribution
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Anonymous monthly aggregates — no promise text, no names, no identity.
        </p>
      </div>

      {!contribution.enabled ? (
        /* Off state */
        <div className="rounded-xl border border-gray-200 p-4 space-y-3">
          <p className="text-sm text-gray-600">
            You are not currently contributing data. Opting in gives you access
            to predictions and benchmarks based on the collective dataset.
          </p>
          <button
            onClick={handleEnable}
            className="w-full py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
          >
            Enable contribution (Level C)
          </button>
        </div>
      ) : (
        /* On state */
        <div className="space-y-3">
          {/* Status */}
          <div className="flex items-center justify-between rounded-xl bg-green-50 border border-green-200 p-3">
            <div>
              <p className="text-sm font-medium text-green-900">
                Contributing — Level {contribution.level}
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                {contribution.sentBatchIds.length} batch{contribution.sentBatchIds.length !== 1 ? "es" : ""} sent
                {contribution.lastSentAt &&
                  ` · last ${new Date(contribution.lastSentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              </p>
            </div>
            <span className="text-xl" aria-hidden="true">🌿</span>
          </div>

          {/* Level toggle */}
          <div className="rounded-xl border border-gray-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Contribution level
            </p>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="contribution-level"
                checked={contribution.level === "C"}
                onChange={handleDowngradeToC}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Level C — Aggregate only</p>
                <p className="text-xs text-gray-500">
                  Monthly summary: promise counts, fulfillment rate, domain mix.
                  No individual promise data.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="contribution-level"
                checked={contribution.level === "A"}
                onChange={handleUpgradeToA}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Level A — Schema transitions</p>
                <p className="text-xs text-gray-500">
                  Per-transition: domain, verification method, dwell time, status change,
                  k-regime. Five fields. Batched in groups of 50+.
                </p>
                <button
                  onClick={() => setShowLevelADetail((v) => !v)}
                  className="text-xs text-green-700 underline mt-0.5"
                >
                  {showLevelADetail ? "Hide example" : "See example"}
                </button>

                {showLevelADetail && (
                  <div className="mt-2 bg-gray-50 rounded-lg p-2 font-mono text-xs text-gray-700">
                    <p>domain: health</p>
                    <p>verification: self-report</p>
                    <p>dwell_time: 14 days</p>
                    <p>transition: declared → verified</p>
                    <p>k_regime: ecological</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Revoke */}
          <div className="rounded-xl border border-red-100 p-4 space-y-2">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">
              Revoke contribution
            </p>
            <p className="text-xs text-gray-500">
              Your contribution plant will fossilize gracefully. No further data is sent.
              Previously contributed batches cannot be identified — no user ID was
              ever attached.
            </p>
            <button
              onClick={handleRevoke}
              className="text-xs text-red-600 font-medium underline hover:text-red-800 transition-colors"
            >
              Stop contributing and revoke access
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
