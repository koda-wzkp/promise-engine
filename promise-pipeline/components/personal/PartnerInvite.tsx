"use client";

interface PartnerInviteProps {
  inviterName: string;
  domain: string;
  token: string;
  onAccept: () => void;
  onDecline: () => void;
}

export function PartnerInvite({ inviterName, domain, onAccept, onDecline }: PartnerInviteProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      aria-modal="true"
      role="dialog"
      aria-label="Partnership invitation"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-gray-900">
            You&apos;re invited to tend a garden
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-medium text-gray-900">{inviterName}</span> wants you to be an accountability partner for their{" "}
            <span className="font-medium text-gray-900 capitalize">{domain}</span> promise.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
          <p>As a partner, a shared plant will appear in your garden. You can water it to confirm progress, and you&apos;ll be notified if it starts wilting.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 py-2.5 text-sm text-gray-500 border rounded-xl hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-gray-400"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-2.5 text-sm font-semibold bg-green-700 text-white rounded-xl hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-green-600"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
