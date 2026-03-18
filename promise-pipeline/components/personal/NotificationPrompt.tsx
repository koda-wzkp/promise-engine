"use client";

/**
 * NotificationPrompt
 *
 * Non-blocking toast that appears at the top of the garden after the user's
 * first check-in is completed. Offers to set a daily reminder time.
 *
 * Renders when: firstCheckInComplete === true && notificationTimeSet === false
 *
 * Auto-dismisses after 10 seconds if the user does not interact with it.
 *
 * Accessibility:
 *  - aria-live="polite" so screen readers announce it without interrupting
 *  - Buttons have descriptive labels
 */

import { useEffect, useRef, useState } from "react";

interface NotificationPromptProps {
  /** Called with the chosen time string, or null for "no thanks" */
  onSet: (time: string | null) => void;
  /** Same as onSet(null) — dismisses permanently */
  onDismiss: () => void;
}

export function NotificationPrompt({ onSet, onDismiss }: NotificationPromptProps) {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [time, setTime] = useState(() => {
    // Default to current hour, rounded to nearest hour
    const d = new Date();
    d.setMinutes(0, 0, 0);
    return d.toTimeString().slice(0, 5); // "HH:MM"
  });
  const [visible, setVisible] = useState(false);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(id);
  }, []);

  // Auto-dismiss after 10 seconds with no interaction
  useEffect(() => {
    autoRef.current = setTimeout(() => onDismiss(), 10_000);
    return () => {
      if (autoRef.current) clearTimeout(autoRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function clearAuto() {
    if (autoRef.current) {
      clearTimeout(autoRef.current);
      autoRef.current = null;
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-3"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? 0 : -8}px)`,
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 space-y-3">
        {!showTimePicker ? (
          <>
            <p className="font-sans text-sm text-gray-700">
              Want a reminder to check in tomorrow?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  clearAuto();
                  setShowTimePicker(true);
                }}
                className="flex-1 py-1.5 text-sm font-medium rounded-md bg-[#1a5f4a] text-white hover:bg-[#155240] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Set time
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAuto();
                  onDismiss();
                }}
                className="flex-1 py-1.5 text-sm text-gray-500 hover:text-gray-700 rounded-md border border-gray-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                No thanks
              </button>
            </div>
          </>
        ) : (
          <>
            <label
              htmlFor="pg-notif-time"
              className="block text-sm font-medium text-gray-700"
            >
              Remind me daily at:
            </label>
            <input
              id="pg-notif-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSet(time)}
                className="flex-1 py-1.5 text-sm font-medium rounded-md bg-[#1a5f4a] text-white hover:bg-[#155240] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => onDismiss()}
                className="flex-1 py-1.5 text-sm text-gray-500 rounded-md border border-gray-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
