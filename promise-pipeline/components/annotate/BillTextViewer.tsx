"use client";

import { useEffect, useRef } from "react";

interface BillTextViewerProps {
  text: string;
  sourceText: string | null;
  sourceRef: string | null;
}

export default function BillTextViewer({
  text,
  sourceText,
  sourceRef,
}: BillTextViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);

  // Find the source text position (case-insensitive substring search)
  const matchIndex = sourceText
    ? text.toLowerCase().indexOf(sourceText.toLowerCase())
    : -1;

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [sourceText]);

  if (!text) {
    return (
      <div className="h-full flex items-center justify-center text-[#4b5563] text-sm">
        No bill text loaded
      </div>
    );
  }

  // Render with highlight if source text is found
  if (matchIndex >= 0 && sourceText) {
    const before = text.slice(0, matchIndex);
    const match = text.slice(matchIndex, matchIndex + sourceText.length);
    const after = text.slice(matchIndex + sourceText.length);

    return (
      <div
        ref={containerRef}
        className="h-full overflow-y-auto p-4 font-mono text-xs leading-relaxed text-[#1f2937]"
      >
        <span>{before}</span>
        {sourceRef && (
          <span className="block mb-1 font-mono text-[10px] font-medium text-[#4b5563] bg-gray-100 inline-block px-1.5 py-0.5 rounded">
            {sourceRef}
          </span>
        )}
        <span
          ref={highlightRef}
          className="px-0.5 rounded"
          style={{ background: "#fffbeb", color: "#78350f" }}
        >
          {match}
        </span>
        <span>{after}</span>
      </div>
    );
  }

  // No match found
  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto p-4 font-mono text-xs leading-relaxed text-[#1f2937]"
    >
      {sourceText && (
        <div
          className="sticky top-0 mb-3 px-3 py-2 rounded-md text-xs font-sans"
          style={{ background: "#fffbeb", color: "#78350f" }}
          role="alert"
        >
          Source text not located in document — review manually
        </div>
      )}
      {text}
    </div>
  );
}
