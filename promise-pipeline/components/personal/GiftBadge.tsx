"use client";

/**
 * GiftBadge — "Gifted by [name]" label on received artifacts in the Collection.
 */

interface GiftBadgeProps {
  fromName: string;
  receivedAt: string;
}

export function GiftBadge({ fromName, receivedAt }: GiftBadgeProps) {
  const date = new Date(receivedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200"
      title={`Gifted by ${fromName} on ${date}`}
    >
      <span aria-hidden="true">🎁</span>
      <span>Gifted by {fromName}</span>
    </span>
  );
}
