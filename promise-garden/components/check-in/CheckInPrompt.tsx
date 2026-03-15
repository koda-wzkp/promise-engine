"use client";

import { useState } from "react";
import type { PersonalPromise } from "@/lib/types/personal";
import type { CheckInResponse } from "@/lib/types/check-in";
import { domainColors } from "@/lib/utils/colors";
import { domainMeta } from "@/lib/types/personal";

interface CheckInPromptProps {
  promises: PersonalPromise[];
  onCheckIn: (promiseId: string, response: CheckInResponse, reflection?: string) => void;
  onComplete: () => void;
}

export default function CheckInPrompt({
  promises,
  onCheckIn,
  onComplete,
}: CheckInPromptProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reflection, setReflection] = useState("");
  const [responded, setResponded] = useState(false);

  if (promises.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-[var(--text-muted)]">No promises due today.</p>
      </div>
    );
  }

  const current = promises[currentIndex];
  const dc = domainColors[current.domain];
  const isLast = currentIndex === promises.length - 1;

  function handleResponse(response: CheckInResponse) {
    onCheckIn(current.id, response, reflection.trim() || undefined);
    setResponded(true);
  }

  function handleNext() {
    setReflection("");
    setResponded(false);
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Progress */}
      <div className="w-full max-w-sm mb-8">
        <div className="flex gap-1">
          {promises.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-colors"
              style={{
                backgroundColor: i <= currentIndex ? dc.text : "#e5e7eb",
              }}
            />
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
          {currentIndex + 1} of {promises.length}
        </p>
      </div>

      {/* Promise card */}
      <div className="w-full max-w-sm animate-fade-in" key={current.id}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Domain badge */}
          <span
            className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mb-3"
            style={{ color: dc.text, backgroundColor: dc.bg }}
          >
            {domainMeta[current.domain].label}
          </span>

          {/* Promise body */}
          <h2 className="text-xl font-semibold mb-6 leading-snug">
            {current.body}
          </h2>

          {!responded ? (
            <>
              {/* Response buttons */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => handleResponse("kept")}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-transparent hover:border-status-kept bg-status-keptBg transition-colors"
                  aria-label="Kept this promise"
                >
                  <span className="text-2xl text-status-kept">&#10003;</span>
                  <span className="text-sm font-medium text-status-kept">
                    Kept
                  </span>
                </button>
                <button
                  onClick={() => handleResponse("partial")}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-transparent hover:border-status-partial bg-status-partialBg transition-colors"
                  aria-label="Partially kept this promise"
                >
                  <span className="text-2xl text-status-partial">&#126;</span>
                  <span className="text-sm font-medium text-status-partial">
                    Partially
                  </span>
                </button>
                <button
                  onClick={() => handleResponse("missed")}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-transparent hover:border-status-missed bg-status-missedBg transition-colors"
                  aria-label="Missed this promise"
                >
                  <span className="text-2xl text-status-missed">&#10007;</span>
                  <span className="text-sm font-medium text-status-missed">
                    Missed
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Reflection input */}
              <div className="mb-4">
                <input
                  type="text"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Any thoughts?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-garden-green"
                  aria-label="Optional reflection"
                />
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 bg-garden-green text-white rounded-xl text-sm font-medium hover:bg-garden-greenLight transition-colors"
              >
                {isLast ? "Done" : "Next"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
