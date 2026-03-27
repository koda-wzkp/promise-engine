"use client";

import { useEffect, useState } from "react";

interface WateringActionProps {
  promiseeBody: string;
  partnerName: string;
  onDismiss: () => void;
}

export function WateringAction({ promiseeBody, partnerName, onDismiss }: WateringActionProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 50);
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 3500);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [onDismiss]);

  const body = promiseeBody.length > 48 ? promiseeBody.slice(0, 48) + "…" : promiseeBody;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto z-50 pointer-events-none"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 8}px)`,
        transition: "opacity 0.25s ease, transform 0.25s ease",
      }}
    >
      <div className="bg-white border border-green-200 rounded-xl px-4 py-3 shadow-lg">
        <p className="text-sm font-medium text-green-800">Watered.</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {partnerName} confirmed: {body}
        </p>
      </div>
    </div>
  );
}
