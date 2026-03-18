"use client";

/**
 * AccountPrompt
 *
 * Overlay card that nudges the user to create an account after 3 days of
 * garden activity. Positioned over the garden — the garden remains visible
 * behind it.
 *
 * Renders when: daysActive >= threshold && !accountCreated
 *
 * "Not yet" dismisses. Re-prompts at daysActive >= 10 (second prompt only).
 * After two dismissals the prompt never appears again.
 *
 * "Save my garden" is a stub — auth is not yet implemented.
 */

import { useEffect, useState } from "react";

interface AccountPromptProps {
  onSave: () => void;
  onDismiss: () => void;
}

export function AccountPrompt({ onSave, onDismiss }: AccountPromptProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Save your garden"
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm px-4"
        style={{
          opacity: visible ? 1 : 0,
          transform: `translate(-50%, calc(-50% + ${visible ? 0 : 8}px))`,
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div>
            <h2 className="font-serif text-lg font-semibold text-gray-900">
              Your garden is growing.
            </h2>
            <p className="font-sans text-sm text-gray-600 mt-1">
              Save it so you don&apos;t lose your progress.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onSave}
              className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-[#1a5f4a] text-white hover:bg-[#155240] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Save my garden
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="flex-1 py-2.5 text-sm text-gray-500 rounded-lg border border-gray-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Not yet
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
