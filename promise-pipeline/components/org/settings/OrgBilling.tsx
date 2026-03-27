"use client";

import type { Org } from "@/lib/types/phase4";

interface OrgBillingProps {
  org: Org;
  onManageBilling: () => void;
}

export function OrgBilling({ org, onManageBilling }: OrgBillingProps) {
  const isActive = org.subscriptionStatus === "active";

  return (
    <div className="bg-white rounded-xl border p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Billing</h3>

      <div className="space-y-4">
        {/* Current plan */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Org Tier</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isActive ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}>
              {org.subscriptionStatus ?? "No subscription"}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            $29/user/month · Includes org network, cross-team deps, civic linking, API, webhooks
          </p>
        </div>

        {/* Features included */}
        <div>
          <h4 className="text-xs font-medium text-gray-600 mb-2">Included Features</h4>
          <ul className="text-xs text-gray-500 space-y-1">
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">&#10003;</span>
              Everything in Teams tier
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">&#10003;</span>
              Org-level promise network
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">&#10003;</span>
              Cross-team dependency mapping
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">&#10003;</span>
              Civic/regulatory dependency linking
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">&#10003;</span>
              REST API access (1,000 requests/day)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">&#10003;</span>
              Webhook integrations
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-500">&#10003;</span>
              Org cascade simulator
            </li>
          </ul>
        </div>

        {/* Usage */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">
            {org.teams.length} team{org.teams.length !== 1 ? "s" : ""} ·{" "}
            {org.orgPromises.length} org promise{org.orgPromises.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={onManageBilling}
          className="w-full text-sm px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Manage Billing
        </button>
      </div>
    </div>
  );
}
