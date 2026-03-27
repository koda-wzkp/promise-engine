"use client";

/**
 * ContributionOptIn — shown once after 30+ days of garden use.
 * Explains exactly what gets shared and what the user receives in return.
 * Three choices: contribute, maybe later, learn more.
 */

import { useState } from "react";
import type { GardenAction } from "@/lib/garden/gardenState";

interface ContributionOptInProps {
  dispatch: React.Dispatch<GardenAction>;
  onDismiss: () => void;
}

export function ContributionOptIn({ dispatch, onDismiss }: ContributionOptInProps) {
  const [showDetail, setShowDetail] = useState(false);

  function handleContribute() {
    dispatch({ type: "ENABLE_CONTRIBUTION", level: "C" });
    dispatch({ type: "MARK_OPT_IN_PROMPT_SHOWN" });
    onDismiss();
  }

  function handleLater() {
    dispatch({ type: "MARK_OPT_IN_PROMPT_SHOWN" });
    onDismiss();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="text-3xl" aria-hidden="true">🌱</span>
          <div>
            <h2 className="font-serif text-xl font-bold text-gray-900">
              A month of tending
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Your garden has grown for 30 days.
            </p>
          </div>
        </div>

        {/* Pitch */}
        <p className="text-sm text-gray-700 leading-relaxed">
          Your data — anonymized and stripped of all personal details — could help
          calibrate Promise Garden for everyone. Better predictions. Shared benchmarks.
          A collective dataset that makes every garden smarter.
        </p>

        {/* What gets shared */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            What gets shared monthly
          </p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              Promise counts and fulfillment rates
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              Verification methods used (not the promise text)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              Domain mix (health, work, etc.)
            </li>
          </ul>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mt-3">
            Never shared
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">✗</span>
              Promise text or names
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">✗</span>
              Dates or any identifying information
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">✗</span>
              Your identity (no account needed)
            </li>
          </ul>
        </div>

        {/* What you get */}
        {!showDetail && (
          <div className="bg-green-50 rounded-xl p-4 space-y-1">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
              What you receive
            </p>
            <p className="text-sm text-green-800">
              Predictions based on thousands of similar commitments. Benchmarks showing
              how your patterns compare. Regime insights — when adding a check-in would
              shift a promise from composting to ecological.
            </p>
          </div>
        )}

        {showDetail && (
          <div className="bg-green-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
              Example predictions you would see
            </p>
            <p className="text-sm text-green-800 italic">
              &ldquo;Promises like yours (health, self-report) have a 62% fulfillment rate
              at 30 days based on similar commitments.&rdquo;
            </p>
            <p className="text-sm text-green-800 italic">
              &ldquo;Your work domain k is 0.9 — your verification setup is working.&rdquo;
            </p>
            <p className="text-sm text-green-800 italic">
              &ldquo;3 of your promises are in composting mode. Adding a check-in would
              shift them to ecological.&rdquo;
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleContribute}
            className="w-full py-3 bg-green-700 text-white rounded-xl font-medium text-sm hover:bg-green-800 transition-colors"
          >
            Contribute anonymously
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDetail((v) => !v)}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {showDetail ? "Hide details" : "Learn more"}
            </button>
            <button
              onClick={handleLater}
              className="flex-1 py-2.5 text-gray-500 rounded-xl text-sm hover:text-gray-700 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          You can change this at any time in garden settings.
        </p>
      </div>
    </div>
  );
}
