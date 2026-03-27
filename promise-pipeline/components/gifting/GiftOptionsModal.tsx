"use client";

import { useState } from "react";
import type { GiftOptions } from "@/lib/types/phase3";

interface GiftOptionsModalProps {
  artifactId: string;
  onSend: (artifactId: string, toUserId: string, options: GiftOptions) => void;
  onClose: () => void;
  /** List of accountability partners the user can gift to */
  partners: { id: string; name: string }[];
}

export function GiftOptionsModal({ artifactId, onSend, onClose, partners }: GiftOptionsModalProps) {
  const [toUserId, setToUserId] = useState(partners[0]?.id ?? "");
  const [includeBody, setIncludeBody] = useState(false);
  const [includeDwellTime, setIncludeDwellTime] = useState(true);
  const [customMessage, setCustomMessage] = useState("");

  const canSend = toUserId.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
        role="dialog"
        aria-label="Gift artifact"
      >
        <h2 className="font-serif text-lg font-semibold mb-2">Gift This Artifact</h2>
        <p className="text-sm text-gray-500 mb-5">
          Send a copy of this artifact to an accountability partner.
          The original stays in your collection. Gifts are non-transferable — no marketplace.
        </p>

        <div className="space-y-4">
          {/* Recipient */}
          <div>
            <label htmlFor="gift-to" className="block text-sm font-medium text-gray-700 mb-1">
              Send to
            </label>
            {partners.length > 0 ? (
              <select
                id="gift-to"
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
              >
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-gray-400">
                No accountability partners found. Add a partner to a promise first.
              </p>
            )}
          </div>

          {/* Privacy controls */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What to include:
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={includeBody}
                  onChange={(e) => setIncludeBody(e.target.checked)}
                />
                Promise text (shows what you committed to)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={includeDwellTime}
                  onChange={(e) => setIncludeDwellTime(e.target.checked)}
                />
                Dwell time (how long you kept it)
              </label>
            </div>
          </div>

          {/* Optional message */}
          <div>
            <label htmlFor="gift-message" className="block text-sm font-medium text-gray-700 mb-1">
              Message (optional)
            </label>
            <textarea
              id="gift-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="Thanks for the accountability..."
              maxLength={200}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={() =>
              canSend &&
              onSend(artifactId, toUserId, {
                includeBody,
                includeDwellTime,
                customMessage: customMessage.trim() || undefined,
              })
            }
            disabled={!canSend}
            className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 disabled:opacity-50"
          >
            Send Gift
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
