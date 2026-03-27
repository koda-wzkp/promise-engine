"use client";

import { useState } from "react";
import type { WebhookConfig, WebhookEvent } from "@/lib/types/phase4";

interface WebhookSettingsProps {
  webhooks: WebhookConfig[];
  onAdd: (url: string, events: WebhookEvent[], healthThreshold?: number) => void;
  onRemove: (webhookId: string) => void;
  onToggle: (webhookId: string, active: boolean) => void;
}

const EVENT_LABELS: Record<WebhookEvent, string> = {
  status_change: "Promise status changes",
  cascade: "Cascade events",
  civic_update: "Civic dependency updates",
  health_alert: "Health threshold alerts",
};

export function WebhookSettings({ webhooks, onAdd, onRemove, onToggle }: WebhookSettingsProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<WebhookEvent[]>(["status_change"]);
  const [threshold, setThreshold] = useState("");

  const toggleEvent = (event: WebhookEvent) => {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const handleCreate = () => {
    if (!url.trim() || events.length === 0) return;
    onAdd(
      url.trim(),
      events,
      events.includes("health_alert") && threshold ? parseFloat(threshold) : undefined
    );
    setUrl("");
    setEvents(["status_change"]);
    setThreshold("");
    setShowCreate(false);
  };

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Webhooks</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="text-xs px-3 py-1 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Add Webhook
        </button>
      </div>

      {showCreate && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-3">
          <div>
            <label htmlFor="webhook-url" className="block text-xs font-medium text-gray-600 mb-1">
              Endpoint URL
            </label>
            <input
              id="webhook-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-sm"
              placeholder="https://your-app.com/webhooks/promise"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Events</label>
            <div className="space-y-1">
              {(Object.keys(EVENT_LABELS) as WebhookEvent[]).map((event) => (
                <label key={event} className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={events.includes(event)}
                    onChange={() => toggleEvent(event)}
                  />
                  {EVENT_LABELS[event]}
                </label>
              ))}
            </div>
          </div>

          {events.includes("health_alert") && (
            <div>
              <label htmlFor="webhook-threshold" className="block text-xs font-medium text-gray-600 mb-1">
                Health Threshold (0-100)
              </label>
              <input
                id="webhook-threshold"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-32 border rounded-lg px-2 py-1 text-sm"
                min="0"
                max="100"
                placeholder="50"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!url.trim() || events.length === 0}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="text-xs px-3 py-1 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {webhooks.length === 0 ? (
        <p className="text-xs text-gray-400">No webhooks configured.</p>
      ) : (
        <div className="space-y-2">
          {webhooks.map((wh) => (
            <div key={wh.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate font-mono">{wh.url}</p>
                <p className="text-[10px] text-gray-400">
                  {wh.events.map((e) => EVENT_LABELS[e]).join(", ")}
                  {wh.healthThreshold !== undefined && ` · Alert < ${wh.healthThreshold}`}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <button
                  onClick={() => onToggle(wh.id, !wh.active)}
                  className={`text-[10px] px-2 py-0.5 rounded ${
                    wh.active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {wh.active ? "Active" : "Paused"}
                </button>
                <button
                  onClick={() => onRemove(wh.id)}
                  className="text-[10px] px-2 py-0.5 text-red-600 border border-red-200 rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
