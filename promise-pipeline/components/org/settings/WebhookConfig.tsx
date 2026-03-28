"use client";

import { useState } from "react";
import type { WebhookConfig as WebhookConfigType } from "@/lib/types/org";
import { supabase } from "@/lib/supabase";

const EVENT_LABELS: Record<NonNullable<WebhookConfigType["events"]>[number], string> = {
  status_change:  "Promise status changes",
  cascade:        "Cascade events",
  civic_update:   "Civic dependency updates",
  health_alert:   "Health threshold alerts",
};

/**
 * WebhookConfig — configure webhook endpoints for org-level events.
 * Supports status_change, cascade, civic_update, and health_alert events.
 */
export function WebhookConfig({
  orgId,
  webhooks,
  onWebhooksChange,
}: {
  orgId: string;
  webhooks: WebhookConfigType[];
  onWebhooksChange?: () => void;
}) {
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<WebhookConfigType["events"]>(["status_change"]);
  const [healthThreshold, setHealthThreshold] = useState<string>("70");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleEvent(ev: WebhookConfigType["events"][number]) {
    setEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
    );
  }

  async function handleSave() {
    if (!url.trim() || events.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const threshold = events.includes("health_alert") ? parseFloat(healthThreshold) / 100 : null;
      const { error: dbErr } = await supabase.from("webhooks").insert({
        org_id: orgId,
        url: url.trim(),
        events,
        health_threshold: threshold,
        active: true,
      });
      if (dbErr) throw new Error(dbErr.message);
      setUrl("");
      setEvents(["status_change"]);
      setHealthThreshold("70");
      onWebhooksChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save webhook");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(webhookId: string) {
    await supabase.from("webhooks").update({ active: false }).eq("id", webhookId);
    onWebhooksChange?.();
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-medium text-sm text-gray-900">Webhooks</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Receive HTTP POST notifications when org events occur.
        </p>
      </div>

      {/* Create webhook form */}
      <div className="bg-white rounded-xl border p-4 space-y-4">
        <h4 className="text-xs font-medium text-gray-700">Add webhook endpoint</h4>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Endpoint URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-app.com/webhooks/pleco"
            className="w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-2">Events</label>
          <div className="space-y-1.5">
            {(Object.keys(EVENT_LABELS) as WebhookConfigType["events"]).map((ev) => (
              <label key={ev} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={events.includes(ev)}
                  onChange={() => toggleEvent(ev)}
                  className="rounded"
                />
                <span className="text-xs text-gray-700">{EVENT_LABELS[ev]}</span>
              </label>
            ))}
          </div>
        </div>

        {events.includes("health_alert") && (
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Alert when health drops below (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={healthThreshold}
              onChange={(e) => setHealthThreshold(e.target.value)}
              className="w-24 border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          onClick={handleSave}
          disabled={!url.trim() || events.length === 0 || saving}
          className="px-4 py-2 text-xs font-medium bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-40 transition-colors"
        >
          {saving ? "Saving…" : "Save webhook"}
        </button>
      </div>

      {/* Existing webhooks */}
      {webhooks.length > 0 ? (
        <div className="bg-white rounded-xl border divide-y">
          {webhooks.map((wh) => (
            <div key={wh.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{wh.url}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {wh.events.join(", ")}
                    {wh.healthThreshold != null && ` · alert < ${Math.round(wh.healthThreshold * 100)}%`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded ${wh.active ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-400"}`}>
                    {wh.active ? "active" : "inactive"}
                  </span>
                  {wh.active && (
                    <button
                      onClick={() => handleDeactivate(wh.id)}
                      className="text-xs text-gray-400 hover:text-red-600"
                    >
                      Disable
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center py-4">No webhooks configured.</p>
      )}
    </div>
  );
}
