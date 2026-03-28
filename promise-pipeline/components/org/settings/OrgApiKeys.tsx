"use client";

import { useState } from "react";
import { generateApiKey, hashApiKey } from "@/lib/api/auth";
import { supabase } from "@/lib/supabase";

interface ApiKeyRow {
  id: string;
  label: string | null;
  preview: string;
  createdAt: string;
  lastUsedAt: string | null;
  rateLimitDaily: number;
}

/**
 * OrgApiKeys — create and manage API keys for org-tier API access.
 * Keys are shown once at creation. The hash is stored; plaintext is never persisted.
 */
export function OrgApiKeys({
  orgId,
  existingKeys,
  onKeysChange,
}: {
  orgId: string;
  existingKeys: ApiKeyRow[];
  onKeysChange?: () => void;
}) {
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKeyPlaintext, setNewKeyPlaintext] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const { key, preview } = generateApiKey();
      const keyHash = await hashApiKey(key);

      const { error: dbErr } = await supabase.from("api_keys").insert({
        org_id: orgId,
        key_hash: keyHash,
        label: newKeyLabel.trim() || null,
        rate_limit_daily: 1000,
      });

      if (dbErr) throw new Error(dbErr.message);

      setNewKeyPlaintext(key);
      setNewKeyLabel("");
      onKeysChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  async function handleCopy() {
    if (!newKeyPlaintext) return;
    await navigator.clipboard.writeText(newKeyPlaintext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDismissNewKey() {
    setNewKeyPlaintext(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-medium text-sm text-gray-900">API Keys</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Keys are prefixed <code className="bg-gray-100 px-1 rounded">pp_live_</code>.
          Rate limit: 1,000 requests/day. Contact us for higher limits.
        </p>
      </div>

      {/* Show newly created key once */}
      {newKeyPlaintext && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-green-800">
            Your new API key — copy it now. It won't be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white border rounded-lg px-3 py-2 font-mono overflow-x-auto">
              {newKeyPlaintext}
            </code>
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-xs bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button
            onClick={handleDismissNewKey}
            className="text-xs text-green-700 hover:underline"
          >
            I've saved it — dismiss
          </button>
        </div>
      )}

      {/* Create new key */}
      <div className="bg-white rounded-xl border p-4 space-y-3">
        <h4 className="text-xs font-medium text-gray-700">Create new key</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyLabel}
            onChange={(e) => setNewKeyLabel(e.target.value)}
            placeholder="Label (optional)"
            className="flex-1 border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-4 py-2 text-xs font-medium bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-40 transition-colors"
          >
            {creating ? "Creating…" : "Create"}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>

      {/* Existing keys */}
      {existingKeys.length > 0 && (
        <div className="bg-white rounded-xl border divide-y">
          {existingKeys.map((k) => (
            <div key={k.id} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">
                  {k.label ?? "Unlabeled key"}
                </p>
                <code className="text-xs text-gray-400 font-mono">{k.preview}</code>
              </div>
              <div className="text-right text-xs text-gray-400 flex-shrink-0">
                <p>Created {new Date(k.createdAt).toLocaleDateString()}</p>
                {k.lastUsedAt && (
                  <p>Used {new Date(k.lastUsedAt).toLocaleDateString()}</p>
                )}
                <p>{k.rateLimitDaily.toLocaleString()} req/day</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {existingKeys.length === 0 && !newKeyPlaintext && (
        <p className="text-xs text-gray-400 text-center py-4">No API keys yet.</p>
      )}
    </div>
  );
}
