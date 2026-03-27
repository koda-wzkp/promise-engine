"use client";

import { useState } from "react";
import type { ContributionLevel } from "@/lib/types/phase3";

interface ContributionOptInProps {
  onEnable: (level: ContributionLevel) => void;
  onClose: () => void;
}

export function ContributionOptIn({ onEnable, onClose }: ContributionOptInProps) {
  const [level, setLevel] = useState<ContributionLevel>("C");

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6"
        role="dialog"
        aria-label="Contribute anonymously"
      >
        <h2 className="font-serif text-lg font-semibold mb-2">Contribute to the Community</h2>
        <p className="text-sm text-gray-500 mb-5">
          Help improve predictions for everyone by sharing anonymous, aggregate data.
          No promise text, no personal details — ever.
        </p>

        <div className="space-y-3 mb-5">
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              level === "C" ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="contribution-level"
              value="C"
              checked={level === "C"}
              onChange={() => setLevel("C")}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Level C — Aggregate</span>
              <p className="text-xs text-gray-500 mt-0.5">
                Monthly summary: promise count, fulfillment rate, domain mix,
                average dwell time. No individual promise data.
              </p>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              level === "A" ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="contribution-level"
              value="A"
              checked={level === "A"}
              onChange={() => setLevel("A")}
              className="mt-0.5"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Level A — Schema</span>
              <p className="text-xs text-gray-500 mt-0.5">
                Batched transition records (50+ at a time): domain, verification method,
                dwell time, status transition, k-regime. Five fields only.
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Requires 3+ months of Level C first and 50+ completed promises.
              </p>
            </div>
          </label>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-5">
          <h3 className="text-xs font-medium text-gray-700 mb-1">What you get back:</h3>
          <ul className="text-xs text-gray-500 space-y-0.5">
            <li>- Fulfillment predictions by domain and verification method</li>
            <li>- Personal benchmarks against community averages</li>
            <li>- Percentile rankings (how your patterns compare)</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEnable(level)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Enable Contribution
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
