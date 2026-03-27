"use client";

/**
 * WateringAction — Phase 2 Partner "Water" Interaction
 *
 * A visual confirmation that a partner has watered a shared plant.
 * Shows a brief animation and notification to the promiser.
 *
 * Watering = promisee-side verification confirmation
 * → shifts promise toward physics k regime
 */

import { useState, useEffect } from "react";

interface WateringActionProps {
  partnerName: string;
  domain: string;
  onDismiss: () => void;
}

export function WateringAction({
  partnerName,
  domain,
  onDismiss,
}: WateringActionProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slide in
    const showTimer = setTimeout(() => setVisible(true), 50);
    // Auto-dismiss after 4 seconds
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 px-4 py-3 flex items-center gap-3 max-w-sm">
        <span className="text-2xl" aria-hidden="true">💧</span>
        <div>
          <p className="text-sm font-medium text-gray-800">
            {partnerName} watered your plant
          </p>
          <p className="text-xs text-gray-500">
            Your {domain} promise was confirmed
          </p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="text-gray-400 hover:text-gray-600 p-1"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
