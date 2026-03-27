"use client";

/**
 * GiftOptions — modal for choosing what to include in an artifact gift.
 *
 * What the recipient gets:
 *   - Artifact visual (always)
 *   - Domain label (always)
 *   - "Gifted by [name]" attribution (always)
 *   - Promise body (optional — giver chooses)
 *
 * What the recipient never gets:
 *   - Check-in history
 *   - Sub-promise details
 *   - Reflection notes
 *   - Dwell time or other stats (unless giver opts in)
 */

import { useState } from "react";

interface GiftOptionsProps {
  partnerName: string;
  onConfirm: (includeBody: boolean) => void;
  onCancel: () => void;
}

export function GiftOptions({ partnerName, onConfirm, onCancel }: GiftOptionsProps) {
  const [includeBody, setIncludeBody] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl" aria-hidden="true">🎁</span>
          <div>
            <h2 className="font-serif text-lg font-bold text-gray-900">
              Gift to {partnerName}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              A copy of this artifact — the original stays in your Collection.
            </p>
          </div>
        </div>

        {/* What's included */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Always included
          </p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span> Artifact visual
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span> Domain label
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span> &ldquo;Gifted by you&rdquo; attribution
            </li>
          </ul>
        </div>

        {/* Optional: include body */}
        <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={includeBody}
            onChange={(e) => setIncludeBody(e.target.checked)}
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">Include promise text</p>
            <p className="text-xs text-gray-500">
              Share the promise you made — &ldquo;Exercise 3x/week&rdquo;, etc.
            </p>
          </div>
        </label>

        {/* Note about what's NOT included */}
        <p className="text-xs text-gray-400 leading-relaxed">
          {partnerName} will not see your check-in history, sub-promises, reflection
          notes, or other personal details. The gift cannot be re-gifted.
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(includeBody)}
            className="flex-1 py-3 bg-purple-700 text-white rounded-xl font-medium text-sm hover:bg-purple-800 transition-colors"
          >
            Send gift
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-3 text-gray-500 rounded-xl text-sm hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
