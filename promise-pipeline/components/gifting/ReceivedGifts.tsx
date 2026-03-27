"use client";

import type { ReceivedGift } from "@/lib/types/phase3";

interface ReceivedGiftsProps {
  gifts: ReceivedGift[];
}

const MATERIAL_COLORS: Record<string, string> = {
  organic: "from-green-400 to-emerald-600",
  crystalline: "from-blue-400 to-indigo-600",
  metallic: "from-gray-400 to-slate-600",
};

/**
 * Gallery view of received gift artifacts.
 */
export function ReceivedGifts({ gifts }: ReceivedGiftsProps) {
  if (gifts.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-xl border">
        <p className="text-gray-500 text-sm">No gifts received yet.</p>
        <p className="text-gray-400 text-xs mt-1">
          Gifts appear here when accountability partners send them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Received Gifts</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {gifts.map((gift) => (
          <div
            key={gift.id}
            className="bg-white rounded-xl border p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-3">
              {/* Artifact visual */}
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                  MATERIAL_COLORS[gift.artifact.material] ?? MATERIAL_COLORS.organic
                } flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-white text-lg">&#9830;</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-900 capitalize">
                    {gift.promiseDomain}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {gift.artifact.material}
                  </span>
                </div>

                {gift.body && (
                  <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                    &ldquo;{gift.body}&rdquo;
                  </p>
                )}

                {gift.dwellDays !== undefined && (
                  <p className="text-[10px] text-gray-400">
                    Kept for {gift.dwellDays} day{gift.dwellDays !== 1 ? "s" : ""}
                  </p>
                )}

                {gift.customMessage && (
                  <p className="text-xs text-gray-500 mt-1.5 italic">
                    &ldquo;{gift.customMessage}&rdquo;
                  </p>
                )}

                <p className="text-[10px] text-gray-400 mt-1">
                  From {gift.fromUserName ?? "someone"} · {new Date(gift.giftedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
