"use client";

import { useEffect, useState } from "react";
import type { GardenPromise } from "@/lib/types/personal";

interface CascadeAnimationProps {
  /** The promise whose dependency is struggling */
  affectedPromise: GardenPromise;
  /** The promise that caused the cascade */
  sourcePromise: GardenPromise;
  onDismiss: () => void;
}

export function CascadeAnimation({
  affectedPromise,
  sourcePromise,
  onDismiss,
}: CascadeAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 50);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 6000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onDismiss]);

  const affectedBody =
    affectedPromise.body.length > 48
      ? affectedPromise.body.slice(0, 48) + "…"
      : affectedPromise.body;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto z-50 pointer-events-auto"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 8}px)`,
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 shadow-lg flex gap-3 items-start">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-900 leading-snug">{affectedBody}</p>
          <p className="text-xs text-amber-700 mt-0.5">
            may be affected — your{" "}
            <span className="font-medium">{sourcePromise.domain}</span> promise is struggling
          </p>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
          className="text-amber-400 hover:text-amber-700 flex-shrink-0 mt-0.5 focus-visible:outline-2 focus-visible:outline-amber-600"
          aria-label="Dismiss"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
