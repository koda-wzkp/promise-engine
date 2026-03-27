"use client";

/**
 * WateringAction — Partner "water" interaction.
 *
 * When a partner waters a plant, it registers as a check-in confirmation
 * (promisee-side verification → shifts promise to physics k regime).
 *
 * Includes a brief animation and optional encouragement message.
 */

import { useState, useCallback } from "react";

interface WateringActionProps {
  promiseId: string;
  domain: string;
  onWater: (promiseId: string, message?: string) => void;
  onCancel: () => void;
}

export function WateringAction({
  promiseId,
  domain,
  onWater,
  onCancel,
}: WateringActionProps) {
  const [message, setMessage] = useState("");
  const [watered, setWatered] = useState(false);

  const handleWater = useCallback(() => {
    setWatered(true);
    onWater(promiseId, message.trim() || undefined);
  }, [promiseId, message, onWater]);

  if (watered) {
    return (
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-5 max-w-xs mx-auto text-center">
        <div className="text-3xl mb-2" aria-hidden="true">
          💧
        </div>
        <p className="text-sm font-medium text-blue-800">Plant watered!</p>
        <p className="text-xs text-blue-600 mt-1">
          Your partner will know you confirmed their check-in.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-5 max-w-xs mx-auto">
      <h3 className="font-serif text-base font-semibold text-gray-900 mb-1 text-center">
        Water This Plant
      </h3>
      <p className="text-xs text-gray-500 mb-4 text-center">
        Confirm your partner&rsquo;s {domain} check-in and optionally add a
        note of encouragement.
      </p>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
        rows={2}
        placeholder="Add a note (optional)"
        aria-label="Encouragement message"
      />

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleWater}
          className="flex-1 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Water
        </button>
      </div>
    </div>
  );
}
