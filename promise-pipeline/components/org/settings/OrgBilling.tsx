"use client";

import type { Org } from "@/lib/types/org";
import { BILLING_ENABLED, ORG_PRICE_PER_USER_MONTH } from "@/lib/constants/billing";

/**
 * OrgBilling — manage org-tier Stripe subscription.
 * Deferred behind BILLING_ENABLED flag for preview.
 */
export function OrgBilling({
  org,
  memberCount,
}: {
  org: Org;
  memberCount: number;
}) {
  const monthlyTotal = memberCount * ORG_PRICE_PER_USER_MONTH;

  if (!BILLING_ENABLED) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-sm text-gray-900">Billing</h3>
          <p className="text-xs text-gray-500 mt-0.5">Org tier subscription</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-medium">Preview mode — billing not active</p>
          <p className="text-xs mt-1 text-amber-700">
            Stripe billing will be enabled in a future release.
            When live: ${ORG_PRICE_PER_USER_MONTH}/user/month.
          </p>
        </div>

        <div className="bg-white rounded-xl border p-4 space-y-3">
          <h4 className="text-xs font-medium text-gray-700">Estimated cost</h4>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {memberCount} member{memberCount !== 1 ? "s" : ""} × ${ORG_PRICE_PER_USER_MONTH}/mo
            </span>
            <span className="font-bold text-gray-900">${monthlyTotal}/month</span>
          </div>
          <div className="text-xs text-gray-400">Billed monthly. Cancel anytime.</div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <h4 className="text-xs font-medium text-gray-700 mb-2">What's included</h4>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>✓ Everything in Teams tier</li>
            <li>✓ Org-level promise network</li>
            <li>✓ Cross-team dependency mapping</li>
            <li>✓ Civic promise linking + cascade</li>
            <li>✓ REST API access (1,000 req/day)</li>
            <li>✓ Webhook integrations</li>
          </ul>
        </div>
      </div>
    );
  }

  // Live billing — Stripe portal link
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-sm text-gray-900">Billing</h3>
        <p className="text-xs text-gray-500 mt-0.5">Org tier · {org.name}</p>
      </div>

      <div className="bg-white rounded-xl border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Org tier</p>
            <p className="text-xs text-gray-500">
              {memberCount} member{memberCount !== 1 ? "s" : ""}
            </p>
          </div>
          <p className="text-lg font-bold text-gray-900">${monthlyTotal}/mo</p>
        </div>
        {org.stripeSubscriptionId && (
          <p className="text-xs text-gray-400">
            Subscription: <code>{org.stripeSubscriptionId}</code>
          </p>
        )}
      </div>

      <a
        href="/api/billing/portal"
        className="block w-full py-2.5 text-center text-sm font-medium bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors"
      >
        Manage billing →
      </a>
    </div>
  );
}
